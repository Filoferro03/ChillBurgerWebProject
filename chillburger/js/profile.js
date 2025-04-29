// js/profile.js

// --- Assicurati che fetchData sia definita qui ---
async function fetchData(url, formData) {
    try {
        const response = await fetch(url, { method: "POST", body: formData });
        if (!response.ok) { throw new Error(`Response status: ${response.status}`); }
        const data = await response.json();
         // Aggiungiamo un controllo più robusto sulla risposta per API che non ritornano 'success'
         // (come l'API ordini che ora ritorna direttamente l'array o un errore)
        if (response.url.includes('api-orders.php') && !Array.isArray(data)) {
            // Se ci aspettiamo un array di ordini ma non lo riceviamo
            // Potrebbe essere un errore JSON restituito dall'API PHP, loggiamolo
            console.warn("Risposta API ordini non è un array:", data);
            // Decidi se lanciare errore o restituire array vuoto in base a come gestisci errori API
        }
        return data;
    } catch (error) {
        console.error("Errore fetchData:", error.message);
        // È importante restituire null o lanciare errore per gestione a monte
        return null;
    }
}


// --- Funzione per caricare i dati profilo e la prima pagina ordini ---
async function loadProfileData() { // Rinominata da uploadProfile
    console.log("Caricamento profilo...");
    const url = "api/api-profile.php"; // Assicurati sia l'URL corretto per l'API profilo
    const formData = new FormData();
    // Potrebbe non servire FormData per l'API profilo se usa la sessione
    const json = await fetchData(url, formData);

    if (json && json.success && json.userData) {
        console.log("Dati profilo ricevuti:", json.userData);
        displayProfileData(json.userData);
        // Carica la PRIMA PAGINA degli ordini dopo aver caricato il profilo
        await loadUserOrders(1);
    } else {
        console.error("Impossibile caricare i dati del profilo.");
        // Qui dovresti chiamare displayProfileError se l'hai definita
        // displayProfileError(json?.error || "Errore caricamento profilo");
        // Nascondi o mostra messaggio errore per ordini se il profilo fallisce?
        const ordersList = document.getElementById('orders-list');
        const paginationContainer = document.getElementById('orders-pagination');
        if(ordersList) ordersList.innerHTML = '<p class="text-center text-muted">Caricare prima il profilo.</p>';
        if(paginationContainer) paginationContainer.innerHTML = '';

    }
}

// --- Funzione per visualizzare i dati del profilo (invariata rispetto a prima) ---
function displayProfileData(userData) {
    const nomeElement = document.getElementById('profile-nome');
    const cognomeElement = document.getElementById('profile-cognome');
    const usernameElement = document.getElementById('profile-username');
    // Aggiungi altri campi se necessario (es. tipo utente)
    // const tipoElement = document.getElementById('profile-tipo');

    if (nomeElement) nomeElement.textContent = userData.nome || 'N/D';
    if (cognomeElement) cognomeElement.textContent = userData.cognome || 'N/D';
    if (usernameElement) usernameElement.textContent = userData.username || 'N/D';
    // if (tipoElement) tipoElement.textContent = userData.tipo || 'N/D';
}


// --- Funzione AGGIORNATA per caricare gli ordini con paginazione ---
let currentOrdersPage = 1; // Tiene traccia della pagina corrente

async function loadUserOrders(page = 1) {
    currentOrdersPage = page;
    console.log(`Caricamento ordini - Pagina: ${page}`);

    const ordersList = document.getElementById('orders-list');
    const paginationContainer = document.getElementById('orders-pagination');

    if (!ordersList || !paginationContainer) {
        console.error("Elementi 'orders-list' o 'orders-pagination' non trovati.");
        return;
    }

    // Mostra caricamento
    ordersList.innerHTML = '<p class="text-center">Caricamento ordini...</p>';
    paginationContainer.innerHTML = '';

    try {
        const url = "api/api-orders.php"; // URL API ordini
        const formData = new FormData();
        formData.append('action', 'getByUser'); // Azione richiesta dall'API
        formData.append('page', page); // Numero di pagina da caricare

        // 'responseJson' conterrà {success: true, data: {orders: [], currentPage: X, totalPages: Y}}
        const responseJson = await fetchData(url, formData);

        // Verifica robusta della risposta
        if (!responseJson || responseJson.success !== true || !responseJson.data || !Array.isArray(responseJson.data.orders)) {
             // Lancia errore se la struttura non è quella attesa
            throw new Error(responseJson?.error || 'Risposta API ordini non valida o fallita.');
        }

        const ordersData = responseJson.data;
        const orders = ordersData.orders;

        ordersList.innerHTML = ''; // Pulisci caricamento/lista precedente

        if (orders.length === 0 && ordersData.currentPage === 1) {
            ordersList.innerHTML = '<p class="text-center">Nessun ordine trovato</p>';
        } else if (orders.length === 0 && ordersData.currentPage > 1) {
            ordersList.innerHTML = '<p class="text-center">Nessun ordine trovato per questa pagina.</p>';
             // Mostra comunque la paginazione per tornare indietro
            const paginationElement = createPaginationComponent(
                ordersData.currentPage,
                ordersData.totalPages,
                loadUserOrders // Passa la funzione stessa come callback
            );
            if (paginationElement) {
                paginationContainer.appendChild(paginationElement);
            }
        } else {
             // Mostra gli ordini trovati
             orders.forEach(order => {
                 const orderElement = document.createElement('div');
                 orderElement.className = 'list-group-item';
                 // HTML per visualizzare l'ordine (da personalizzare con dati reali)
                 orderElement.innerHTML = `
                     <div class="d-flex justify-content-between align-items-center">
                         <div>
                             <h5 class="mb-1">Ordine #${order.idordine || 'N/D'}</h5>
                             <small>Data: ${order.data || 'N/D'} - Ora: ${order.ora || 'N/D'}</small>
                             <p class="mb-1 small">Stato: ${order.stato || 'TODO'}</p> </div>
                         <div>
                              </div>
                     </div>
                 `;
                 ordersList.appendChild(orderElement);
             });

             // Crea e aggiungi il componente di paginazione
             // Assicurati che createPaginationComponent sia disponibile (da js/components.js)
             const paginationElement = createPaginationComponent(
                 ordersData.currentPage,
                 ordersData.totalPages,
                 loadUserOrders // Passa la funzione stessa come callback
             );
             if (paginationElement) {
                 paginationContainer.appendChild(paginationElement);
             }
        }

    } catch (error) {
        console.error('Errore caricamento ordini:', error);
        ordersList.innerHTML = `<p class="text-center text-danger">Errore nel caricamento degli ordini: ${error.message}</p>`;
        paginationContainer.innerHTML = ''; // Pulisci paginazione in caso di errore
    }
}


// --- Funzione Logout (invariata) ---
async function logout() {
    const url = "api/api-login.php";
    const formData = new FormData();
    formData.append('action', 'logout');
    const json = await fetchData(url, formData); // Usa fetchData aggiornata

    if (json && json["logoutresult"]) {
        window.location.href = 'index.php';
    } else {
        console.error("Logout fallito o risposta non valida dall'API.");
        alert("Errore durante il logout. Riprova.");
    }
}


// --- Listener DOMContentLoaded (Chiama loadProfileData all'avvio) ---
document.addEventListener('DOMContentLoaded', async function() {
    await loadProfileData(); // Carica profilo e prima pagina ordini

    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    } else {
         console.warn("Bottone logout non trovato.");
    }
});