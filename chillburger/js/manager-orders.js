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
    loadActiveOrders(1);
    loadOrderHistory(1);
});

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
                        <h5 class="card-title">Ordine #${order.idordine}</h5>
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