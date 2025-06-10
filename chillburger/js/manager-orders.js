/**
 * Manager Orders JavaScript
 * Gestisce le chiamate API per recuperare e visualizzare gli ordini
 */

// Definisci l'ID dello stato "Annullato per Stock" come costante JS
// DEVE corrispondere all'ID nel database e in PHP (es. 6)
const ID_STATO_ANNULLATO_PER_STOCK_JS = 6; // Assicurati che sia l'ID corretto

async function fetchData(url, formData) {
    try {
        const response = await fetch(url, {
            method: "POST",
            body: formData
        });
        if (!response.ok) {
            const errorText = await response.text(); // Leggi il corpo dell'errore se presente
            console.error("Fetch error response text:", errorText);
            throw new Error(`Errore HTTP: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        return data; 
    } catch (error) {
        console.error("Errore durante la fetch:", error.message);
        // Rilancia l'errore così può essere gestito dal chiamante
        throw error; 
    }
}


let currentOrderIdToUpdate = null; 

async function updateOrderStatusAPI(orderId) {
    const url = 'api/api-orders.php';
    const formData = new FormData();
    formData.append('action', 'update');
    formData.append('idordine', orderId);
    // La chiamata a fetchData restituisce la promise con la risposta JSON completa
    return fetchData(url, formData); 
}


document.addEventListener('DOMContentLoaded', function() {
    loadActiveOrders(1);
    loadOrderHistory(1);

    const confirmUpdateBtn = document.getElementById('confirmUpdateStatusBtn');
    if (confirmUpdateBtn) {
        confirmUpdateBtn.addEventListener('click', async () => {
            if (currentOrderIdToUpdate) {
                const modalElement = document.getElementById('confirmStatusModal');
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) {
                    modal.hide();
                }

                try {
                    const apiResponse = await updateOrderStatusAPI(currentOrderIdToUpdate);

                    if (apiResponse && apiResponse.success) {
                        // Se l'aggiornamento ha avuto successo, o se l'ordine è stato annullato con successo
                        if (apiResponse.new_status_id === ID_STATO_ANNULLATO_PER_STOCK_JS) {
                            alert(`L'ordine #${currentOrderIdToUpdate} è stato annullato automaticamente a causa di stock insufficiente.`);
                        } else if (apiResponse.message) {
                            // toast/notifica più discreta invece di un alert per i successi standard
                            // alert(apiResponse.message); 
                        }
                        // Ricarica entrambe le liste per riflettere i cambiamenti
                        loadActiveOrders(1);
                        loadOrderHistory(1); 
                    } else {
                        // L'API ha restituito success: false
                        alert('Errore durante l\'aggiornamento: ' + (apiResponse ? apiResponse.error : 'Risposta non valida dall\'API.'));
                    }
                } catch (error) {
                    // Errore a livello di fetch (rete, HTTP error non 2xx, JSON malformato, ecc.)
                    alert('Errore di comunicazione durante l\'aggiornamento dello stato: ' + error.message);
                }
                currentOrderIdToUpdate = null;
            }
        });
    }
});

async function loadActiveOrders(page = 1, perPage = 4) {
    const ordersGrid = document.getElementById('ordersGrid');
    const paginationContainer = document.getElementById('activeOrdersPagination');
    if (!ordersGrid || !paginationContainer) return;

    ordersGrid.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Caricamento...</span></div></div>';
    paginationContainer.innerHTML = '';

    const url = 'api/api-orders.php';
    const formData = new FormData();
    formData.append('action', 'getActiveOrders');
    formData.append('page', page);
    formData.append('perPage', perPage);

    try {
        const apiResponse = await fetchData(url, formData);
        if (!apiResponse.success || !apiResponse.data) {
            throw new Error(apiResponse.error || "Dati ordini attivi non validi.");
        }
        const responseData = apiResponse.data;
        displayActiveOrders(responseData.orders);

        const paginationElement = createPaginationComponent(
            responseData.currentPage,
            responseData.totalPages,
            (newPage) => loadActiveOrders(newPage, perPage)
        );
        if (paginationElement) {
            paginationContainer.appendChild(paginationElement);
        }
    } catch (error) {
        console.error('Errore nel caricamento degli ordini attivi:', error);
        ordersGrid.innerHTML = `<div class="col-12 text-center text-danger">Errore nel caricamento degli ordini attivi: ${error.message}</div>`;
        paginationContainer.innerHTML = '';
    }
}

async function loadOrderHistory(page = 1, perPage = 4) {
    const historyGrid = document.getElementById('historyGrid');
    const paginationContainer = document.getElementById('historyOrdersPagination');
     if (!historyGrid || !paginationContainer) return;

    historyGrid.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Caricamento...</span></div></div>';
    paginationContainer.innerHTML = '';
    
    const url = 'api/api-orders.php';
    const formData = new FormData();
    formData.append('action', 'getOrderHistory');
    formData.append('page', page);
    formData.append('perPage', perPage);

    try {
        const apiResponse = await fetchData(url, formData);
        if (!apiResponse.success || !apiResponse.data) {
            throw new Error(apiResponse.error || "Dati storico ordini non validi.");
        }
        const responseData = apiResponse.data;
        // Assicurati che responseData.orders esista
        displayOrderHistory(responseData.orders || []); 

        const paginationElement = createPaginationComponent(
            responseData.currentPage,
            responseData.totalPages,
            (newPage) => loadOrderHistory(newPage, perPage)
        );
        if (paginationElement) {
            paginationContainer.appendChild(paginationElement);
        }
    } catch (error) {
        console.error('Errore nel caricamento dello storico ordini:', error);
        historyGrid.innerHTML = `<div class="col-12 text-center text-danger">Errore nel caricamento dello storico: ${error.message}</div>`;
        paginationContainer.innerHTML = '';
    }
}

function displayActiveOrders(orders) {
    const ordersGrid = document.getElementById('ordersGrid');
    if (!ordersGrid) return;

    if (!orders || orders.length === 0) {
        ordersGrid.innerHTML = '<div class="col-12 text-center">Nessun ordine attivo al momento</div>';
        return;
    }

    let html = '';
    orders.forEach(order => {
        // Se getActiveOrders è stato modificato per escludere ID_STATO_ANNULLATO_PER_STOCK_JS,
        // questo controllo diventa una sicurezza aggiuntiva.
        const isCancelledByStock = order.idstato_attuale === ID_STATO_ANNULLATO_PER_STOCK_JS;
        
        const orderDate = new Date(order.data_ordine + ' ' + order.orario);
        const formattedDate = orderDate.toLocaleDateString('it-IT');
        const formattedTime = orderDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        const formattedPrice = parseFloat(order.prezzo_totale).toFixed(2).replace('.', ',') + ' €';

        let buttonHtmlContent = '';
        let cardSpecificClass = "";

        if (isCancelledByStock) {
            // Questo non dovrebbe accadere se l'API li esclude da "active orders"
            buttonHtmlContent = `<button type="button" class="btn btn-sm btn-outline-danger w-100" disabled>Annullato (Stock)</button>`;
            cardSpecificClass = "border-danger order-cancelled-visual";
        } else {
            let nextStatusTextBtn = '';
            let buttonClassBtn = "order-button";
            let buttonDisabledBtn = "";
            let modalTarget = 'data-bs-target="#confirmStatusModal" data-bs-toggle="modal"';

            // Determina il testo e l'azione del bottone per gli stati avanzabili
            switch (order.stato) { 
                case 'In attesa':
                    nextStatusTextBtn = 'Metti In Preparazione';
                    break;
                case 'In preparazione':
                    nextStatusTextBtn = 'Metti In Consegna';
                    break;
                case 'In consegna':
                    nextStatusTextBtn = 'Segna Come Consegnato';
                    break;
                default: // Stati come 'Consegnato', 'Confermato' o altri non avanzabili qui
                    nextStatusTextBtn = order.stato; // Mostra lo stato attuale
                    buttonClassBtn = "btn-secondary";
                    buttonDisabledBtn = "disabled";
                    modalTarget = ""; // Non aprire modale per stati non azionabili
                    break;
            }
            buttonHtmlContent = `
                <button type="button"
                        class="btn btn-sm ${buttonClassBtn} w-100 update-status-btn"
                        data-order-id="${order.idordine}"
                        data-next-status-text="${nextStatusTextBtn}" 
                        ${modalTarget}
                        ${buttonDisabledBtn}>
                    ${nextStatusTextBtn}
                </button>`;
        }
        
        html += `
        <div class="col-12 col-sm-6 col-lg-4 col-xl-3 mb-4"> 
            <div class="card text-center shadow-sm h-100 hover-up ${cardSpecificClass}">
                <a href="order-details.php?id=${order.idordine}" class="text-decoration-none d-flex flex-column h-100" style="color:inherit;">
                    <img src="./resources/ChillBurgerLogo.png" class="card-img-top" alt="Order #${order.idordine}" style="max-height: 150px; object-fit: contain; margin-top: 10px;">
                    <div class="card-body d-flex flex-column">
                        <p class="card-title fs-3">Ordine #${order.idordine}</p>
                        <p class="card-text small text-muted">${formattedDate} - ${formattedTime}</p>
                        <p class="card-text small ${isCancelledByStock ? 'text-danger fw-bold' : 'text-muted'}">Stato: ${order.stato}</p>
                        <div class="mt-auto"> 
                            <span class="fw-bold d-block mt-2">${formattedPrice}</span> 
                        </div>
                    </div>
                </a>
                ${buttonHtmlContent ? `<div class="px-2 pb-3 pt-1">${buttonHtmlContent}</div>` : '<div class="pb-1" style="height: 40px;"></div>'}
            </div>
        </div>`;
    });
    ordersGrid.innerHTML = html;
    addUpdateStatusButtonListeners();
}

function displayOrderHistory(orders) {
    const historyGrid = document.getElementById('historyGrid');
    if (!historyGrid) return;

    if (!orders || orders.length === 0) {
        historyGrid.innerHTML = '<div class="col-12 text-center">Nessun ordine nello storico</div>';
        return;
    }

    let html = '';
    orders.forEach(order => {
        const orderDate = new Date(order.data_ordine + ' ' + order.orario);
        const formattedDate = orderDate.toLocaleDateString('it-IT');
        const formattedTime = orderDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        const formattedPrice = parseFloat(order.prezzo_totale).toFixed(2).replace('.', ',') + ' €';
        
        // Assumendo che getOrderHistoryPaginated ora ritorni order.idstato_attuale
        const isCancelledByStock = order.idstato_attuale === ID_STATO_ANNULLATO_PER_STOCK_JS;
        const cardSpecificClass = isCancelledByStock ? 'border-danger order-cancelled-visual' : '';
        const statusTextClass = isCancelledByStock ? 'text-danger fw-bold' : 'text-muted';

        html += `
        <div class="col-12 col-sm-6 col-lg-4 col-xl-3 mb-4"> 
            <a href="order-details.php?id=${order.idordine}" class="text-decoration-none" style="color:inherit;">
                <div class="card h-100 text-center shadow-sm hover-up ${cardSpecificClass}"> 
                    <img src="./resources/ChillBurgerLogo.png" class="card-img-top" alt="Order #${order.idordine}" style="max-height: 150px; object-fit: contain; margin-top: 10px;"> 
                    <div class="card-body d-flex flex-column">
                        <p class="card-title fs-3">Ordine #${order.idordine}</p>
                        <p class="card-text small text-muted">${formattedDate} - ${formattedTime}</p>
                        <p class="card-text small ${statusTextClass}">Stato: ${order.stato}</p>
                        <div class="mt-auto">
                           <span class="fw-bold d-block mt-2">${formattedPrice}</span>
                        </div>
                    </div>
                    ${isCancelledByStock ? '<div class="card-footer bg-transparent border-0 p-1 pt-0"><small class="text-danger fst-italic">Annullato per stock</small></div>' : ''}
                </div>
            </a>
        </div>`;
    });
    historyGrid.innerHTML = html;
}

function addUpdateStatusButtonListeners() {
    document.querySelectorAll('.update-status-btn').forEach(button => {
        if (button.hasAttribute('disabled')) return;

        button.addEventListener('click', function() {
            currentOrderIdToUpdate = this.dataset.orderId;
            const nextStatusForModal = this.dataset.nextStatusText;

            const modalOrderIdElem = document.getElementById('modalOrderId');
            const modalNewStatusElem = document.getElementById('modalNewStatus');
            
            if(modalOrderIdElem) modalOrderIdElem.textContent = currentOrderIdToUpdate;
            if(modalNewStatusElem) modalNewStatusElem.textContent = nextStatusForModal || 'Prossimo Stato';
        });
    });
}