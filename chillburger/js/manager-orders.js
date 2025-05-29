/**
 * Manager Orders JavaScript
 * Gestisce le chiamate API per recuperare e visualizzare gli ordini
 */

// Standardized fetchData function
async function fetchData(url, formData) {
    try {
        const response = await fetch(url, {
            method: "POST",
            body: formData
        });
        if (!response.ok) {
            // Throw an error with the status for better debugging
            throw new Error(`Errore HTTP: ${response.status} - ${response.statusText}`);
        }
        const data = await response.json();
        if (data.success === false) { // Check for a 'success: false' in the JSON response
            throw new Error(data.error || "Errore sconosciuto dal server.");
        }
        return data.data; // Return the 'data' payload from the API response
    } catch (error) {
        console.error("Errore durante la fetch:", error.message);
        // Re-throw or handle as needed, typically a UI update indicating failure
        throw error; // Re-throw to allow calling functions to catch and handle
    }
}

let currentOrderIdToUpdate = null; // Variabile globale per tenere traccia dell'ID dell'ordine da aggiornare
let currentOrderStatusId = null; // Variabile globale per tenere traccia del nuovo stato ID

document.addEventListener('DOMContentLoaded', function() {
    // Carica gli ordini attivi e lo storico all'avvio della pagina
    loadActiveOrders(1);
    loadOrderHistory(1);

    // Listener per il bottone di conferma nel modale
    const confirmUpdateBtn = document.getElementById('confirmUpdateStatusBtn');
    if (confirmUpdateBtn) {
        confirmUpdateBtn.addEventListener('click', async () => {
            if (currentOrderIdToUpdate && currentOrderStatusId) {
                // Chiudi il modale
                const modal = bootstrap.Modal.getInstance(document.getElementById('confirmStatusModal'));
                if (modal) modal.hide();

                // Chiamata all'API per aggiornare lo stato
                await updateOrderStatus(currentOrderIdToUpdate, currentOrderStatusId);

                // Reset delle variabili globali
                currentOrderIdToUpdate = null;
                currentOrderStatusId = null;
            }
        });
    }
});

/**
 * Funzione per aggiornare lo stato dell'ordine tramite API.
 * @param {number} orderId L'ID dell'ordine.
 */
async function updateOrderStatus(orderId) {
    const url = 'api/api-orders.php';
    const formData = new FormData();
    formData.append('action', 'update'); 
    formData.append('idordine', orderId);

    try {
        await fetchData(url, formData);
        loadActiveOrders(1); // Ricarica la prima pagina degli ordini attivi
    } catch (error) {
        console.error('Errore nell\'aggiornamento dello stato:', error);
    }
}


/**
 * Carica gli ordini attivi dal database
 */
async function loadActiveOrders(page = 1, perPage = 4) { // Added pagination parameters
    const ordersGrid = document.getElementById('ordersGrid');
    const paginationContainer = document.getElementById('activeOrdersPagination');
    if (!ordersGrid || !paginationContainer) {
        console.error("Elemento 'ordersGrid' o 'activeOrdersPagination' non trovato.");
        return;
    }

    // Mostra un indicatore di caricamento
    ordersGrid.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Caricamento ordini attuali...</span></div></div>';
    paginationContainer.innerHTML = ''; // Clear existing pagination

    // Prepara i dati per la richiesta
    const url = 'api/api-orders.php';
    const formData = new FormData();
    formData.append('action', 'getActiveOrders');
    formData.append('page', page); // Pass current page
    formData.append('perPage', perPage); // Pass items per page

    try {
        const responseData = await fetchData(url, formData); // responseData now contains { orders, currentPage, totalPages }
        const activeOrders = responseData.orders;
        const currentPage = responseData.currentPage;
        const totalPages = responseData.totalPages;

        displayActiveOrders(activeOrders);

        // Create and append pagination component
        const paginationElement = createPaginationComponent(
            currentPage,
            totalPages,
            (newPage) => loadActiveOrders(newPage, perPage) // Callback function for page click
        );
        if (paginationElement) {
            paginationContainer.appendChild(paginationElement);
        }

    } catch (error) {
        console.error('Errore nel caricamento degli ordini attivi:', error);
        ordersGrid.innerHTML = '<div class="col-12 text-center text-danger">Errore nel caricamento degli ordini attivi: ' + error.message + '</div>';
        paginationContainer.innerHTML = ''; // Clear pagination on error
    }
}
/**
 * Carica lo storico degli ordini dal database
 */
async function loadOrderHistory(page = 1, perPage = 4) { // Added pagination parameters
    const historyGrid = document.getElementById('historyGrid');
    const paginationContainer = document.getElementById('historyOrdersPagination');
    if (!historyGrid || !paginationContainer) {
        console.error("Elemento 'historyGrid' o 'historyOrdersPagination' non trovato.");
        return;
    }

    // Mostra un indicatore di caricamento
    historyGrid.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Caricamento storico ordini...</span></div></div>';
    paginationContainer.innerHTML = ''; // Clear existing pagination

    // Prepara i dati per la richiesta
    const url = 'api/api-orders.php';
    const formData = new FormData();
    formData.append('action', 'getOrderHistory');
    formData.append('page', page); // Pass current page
    formData.append('perPage', perPage); // Pass items per page

    try {
        const responseData = await fetchData(url, formData); // responseData now contains { orders, currentPage, totalPages }
        const orderHistory = responseData.orders;
        const currentPage = responseData.currentPage;
        const totalPages = responseData.totalPages;

        displayOrderHistory(orderHistory);

        // Create and append pagination component
        const paginationElement = createPaginationComponent(
            currentPage,
            totalPages,
            (newPage) => loadOrderHistory(newPage, perPage) // Callback function for page click
        );
        if (paginationElement) {
            paginationContainer.appendChild(paginationElement);
        }

    } catch (error) {
        console.error('Errore nel caricamento dello storico ordini:', error);
        historyGrid.innerHTML = '<div class="col-12 text-center text-danger">Errore nel caricamento dello storico ordini: ' + error.message + '</div>';
        paginationContainer.innerHTML = ''; // Clear pagination on error
    }
}
function displayActiveOrders(orders) {
    const ordersGrid = document.getElementById('ordersGrid');

    if (!orders || orders.length === 0) {
        ordersGrid.innerHTML = '<div class="col-12 text-center">Nessun ordine attivo al momento</div>';
        return;
    }

    let html = '';

    orders.forEach(order => {
        const orderDate = new Date(order.data_ordine + ' ' + order.orario);
        const formattedDate = orderDate.toLocaleDateString('it-IT');
        const formattedTime = orderDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        const formattedPrice = parseFloat(order.prezzo_totale).toFixed(2).replace('.', ',') + ' €';

        let nextStatusId, nextStatusText, nextStatus;
        let buttonClass = "order-button";

        switch (order.stato) {
            case 'In attesa':
                nextStatusId = 2;
                nextStatusText = 'Metti In Preparazione';
                nextStatus = 'In preparazione';
                break;
            case 'In preparazione':
                nextStatusId = 3;
                nextStatusText = 'Metti In Consegna';
                nextStatus = 'In consegna';
                break;
            case 'In consegna':
                nextStatusId = 4;
                nextStatusText = 'Segna Come Consegnato';
                nextStatus = 'Consegnato';
                break;
            default:
                nextStatusId = null;
                nextStatusText = '';
                nextStatus = '';
                buttonClass = "";
                break;
        }

        // --- INIZIO MODIFICA CLASSI COLONNA CARD ---
        html += `
        <div class="col-12 col-sm-6 col-lg-4 col-xl-3 mb-4"> 
            <div class="card text-center shadow-sm h-100 hover-up">
                <a href="manager_order_details.php?id=${order.idordine}" class="text-decoration-none d-flex flex-column h-100" style="color:inherit;">
                    <img src="./resources/ChillBurgerLogo.png" class="card-img-top" alt="Order #${order.idordine}" style="max-height: 150px; object-fit: contain; margin-top: 10px;">
                    <div class="card-body d-flex flex-column">
                        <p class="card-title fs-3">Ordine #${order.idordine}</p>
                        <p class="card-text small text-muted">${formattedDate} - ${formattedTime}</p>
                        <p class="card-text small text-muted">Stato: ${order.stato}</p>
                        <div class="mt-auto"> {/* Per spingere il footer in basso */}
                            <span class="fw-bold d-block mt-2">${formattedPrice}</span> 
                        </div>
                    </div>
                </a>`;
        // --- FINE MODIFICA CLASSI COLONNA CARD ---

        if (nextStatusId !== null) {
            // --- INIZIO MODIFICA BOTTONE ---
            html += `<div class="px-2 pb-3 pt-1">
                        <button type="button"
                                class="btn btn-sm ${buttonClass} w-100 update-status-btn"
                                data-order-id="${order.idordine}"
                                data-next-status-id="${nextStatusId}"
                                data-next-status-text="${nextStatusText}"
                                data-next-status="${nextStatus}"
                                data-bs-toggle="modal"
                                data-bs-target="#confirmStatusModal">
                            ${nextStatusText}
                        </button>
                     </div>`;
        } else {
             html += `<div class="pb-1"></div>`;
        }

        html += `</div></div>`;
    });

    ordersGrid.innerHTML = html;
    addUpdateStatusButtonListeners();
}

/**
 * Visualizza lo storico degli ordini nella griglia
 * @param {Array} orders - Array di ordini completati
 */
function displayOrderHistory(orders) {
    const historyGrid = document.getElementById('historyGrid');

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

        html += `
        <div class="col-12 col-sm-6 col-lg-4 col-xl-3 mb-4"> 
            <a href="manager_order_details.php?id=${order.idordine}" class="text-decoration-none" style="color:inherit;">
                <div class="card h-100 text-center shadow-sm hover-up"> 
                    <img src="./resources/ChillBurgerLogo.png" class="card-img-top" alt="Order #${order.idordine}" style="max-height: 150px; object-fit: contain; margin-top: 10px;"> 
                    <div class="card-body d-flex flex-column">
                        <p class="card-title fs-3">Ordine #${order.idordine}</p>
                        <p class="card-text small text-muted">${formattedDate} - ${formattedTime}</p>
                        <div class="mt-auto">
                           <span class="fw-bold d-block mt-2">${formattedPrice}</span>
                        </div>
                    </div>
                </div>
            </a>
        </div>
        `;
    });

    historyGrid.innerHTML = html;
}

/**
 * Aggiunge event listener ai bottoni di aggiornamento stato.
 * Chiamato dopo che le card degli ordini attivi sono state renderizzate.
 */
function addUpdateStatusButtonListeners() {
    document.querySelectorAll('.update-status-btn').forEach(button => {
        button.addEventListener('click', function() {
            currentOrderIdToUpdate = this.dataset.orderId;
            currentOrderStatusId = this.dataset.nextStatusId;
            const nextStatus = this.dataset.nextStatus;

            // Popola il modale con i dati dell'ordine
            document.getElementById('modalOrderId').textContent = currentOrderIdToUpdate;
            document.getElementById('modalNewStatus').textContent = nextStatus;
        });
    });
}