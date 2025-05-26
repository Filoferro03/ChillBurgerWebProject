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

document.addEventListener('DOMContentLoaded', function() {
    // Carica gli ordini attivi e lo storico all'avvio della pagina
    loadActiveOrders();
    loadOrderHistory();
});

/**
 * Carica gli ordini attivi dal database
 */
async function loadActiveOrders() {
    const ordersGrid = document.getElementById('ordersGrid');
    if (!ordersGrid) {
        console.error("Elemento 'ordersGrid' non trovato.");
        return;
    }

    // Mostra un indicatore di caricamento
    ordersGrid.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Caricamento ordini attuali...</span></div></div>';

    // Prepara i dati per la richiesta
    const url = 'api/api-orders.php';
    const formData = new FormData();
    formData.append('action', 'getActiveOrders');

    try {
        const activeOrders = await fetchData(url, formData); // Use the standardized fetchData

        displayActiveOrders(activeOrders);
    } catch (error) {
        console.error('Errore nel caricamento degli ordini attivi:', error);
        ordersGrid.innerHTML = '<div class="col-12 text-center text-danger">Errore nel caricamento degli ordini attivi: ' + error.message + '</div>';
    }
}

/**
 * Carica lo storico degli ordini dal database
 */
async function loadOrderHistory() {
    const historyGrid = document.getElementById('historyGrid');
    if (!historyGrid) {
        console.error("Elemento 'historyGrid' non trovato.");
        return;
    }

    // Mostra un indicatore di caricamento
    historyGrid.innerHTML = '<div class="col-12 text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Caricamento storico ordini...</span></div></div>';

    // Prepara i dati per la richiesta
    const url = 'api/api-orders.php';
    const formData = new FormData();
    formData.append('action', 'getOrderHistory');

    try {
        const orderHistory = await fetchData(url, formData); // Use the standardized fetchData

        displayOrderHistory(orderHistory);
    } catch (error) {
        console.error('Errore nel caricamento dello storico ordini:', error);
        historyGrid.innerHTML = '<div class="col-12 text-center text-danger">Errore nel caricamento dello storico ordini: ' + error.message + '</div>';
    }
}

/**
 * Visualizza gli ordini attivi nella griglia
 * @param {Array} orders - Array di ordini attivi
 */
function displayActiveOrders(orders) {
    const ordersGrid = document.getElementById('ordersGrid');

    if (!orders || orders.length === 0) {
        ordersGrid.innerHTML = '<div class="col-12 text-center">Nessun ordine attivo al momento</div>';
        return;
    }

    let html = '';

    orders.forEach(order => {
        // Formatta la data e l'ora
        const orderDate = new Date(order.data_ordine + ' ' + order.orario);
        const formattedDate = orderDate.toLocaleDateString('it-IT');
        const formattedTime = orderDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

        // Formatta il prezzo
        const formattedPrice = parseFloat(order.prezzo_totale).toFixed(2).replace('.', ',') + ' €';

        html += `
        <div class="col-6 col-md-4 col-lg-3">
            <a href="manager_order_details.php?id=${order.idordine}" class="text-decoration-none">
                <div class="card h-100 text-center shadow-sm hover-up">
                    <img src="./resources/ChillBurgerLogo.png" class="card-img-top" alt="Order #${order.idordine}">
                    <div class="card-body">
                        <h5 class="card-title">Order #${order.idordine}</h5>
                        <p class="card-text small text-muted">${formattedDate} - ${formattedTime}</p>
                        <p class="card-text small text-muted">Stato: ${order.stato}</p>
                    </div>
                    <div class="card-footer bg-white border-0">
                        <span class="fw-bold text-primary">${formattedPrice}</span>
                    </div>
                </div>
            </a>
        </div>
        `;
    });

    ordersGrid.innerHTML = html;
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
        // Formatta la data e l'ora
        const orderDate = new Date(order.data_ordine + ' ' + order.orario);
        const formattedDate = orderDate.toLocaleDateString('it-IT');
        const formattedTime = orderDate.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

        // Formatta il prezzo
        const formattedPrice = parseFloat(order.prezzo_totale).toFixed(2).replace('.', ',') + ' €';

        html += `
        <div class="col-6 col-md-4 col-lg-3">
            <a href="manager_order_details.php?id=${order.idordine}" class="text-decoration-none">
                <div class="card h-100 text-center shadow-sm hover-up">
                    <img src="./resources/ChillBurgerLogo.png" class="card-img-top" alt="Order #${order.idordine}">
                    <div class="card-body">
                        <h5 class="card-title">Ordine #${order.idordine}</h5>
                        <p class="card-text small text-muted">${formattedDate} - ${formattedTime}</p>
                    </div>
                    <div class="card-footer bg-white border-0">
                        <span class="fw-bold text-primary">${formattedPrice}</span>
                    </div>
                </div>
            </a>
        </div>
        `;
    });

    historyGrid.innerHTML = html;
}