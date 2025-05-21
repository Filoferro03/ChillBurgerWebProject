let currentOrderIdToConfirm = null;

async function fetchData(url, formData) {
    try {
        const response = await fetch(url, { method: "POST", body: formData });
        if (!response.ok) { throw new Error(`Response status: ${response.status}`); }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Errore fetchData:", error.message);
        return null;
    }
}


// --- Funzione per caricare i dati profilo e la prima pagina ordini ---
async function loadProfileData() { 
    const url = "api/api-profile.php";
    const formData = new FormData();
    const json = await fetchData(url, formData);

    if (json && json.success && json.userData) {
        displayProfileData(json.userData);
        // Carica la PRIMA PAGINA degli ordini dopo aver caricato il profilo
        await loadUserOrders(1);
    } else {
        console.error("Impossibile caricare i dati del profilo.");
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

    if (nomeElement) nomeElement.textContent = userData.nome || 'N/D';
    if (cognomeElement) cognomeElement.textContent = userData.cognome || 'N/D';
    if (usernameElement) usernameElement.textContent = userData.username || 'N/D';
}

function generateOrdersHTML(orders) {
    let result = "";
    orders.forEach(order => {
        result += `
            <div class="list-group-item mb-3 mt-2 d-flex justify-content-between align-items-center">
                <div>
                    <h4> Ordine #${order.idordine}</h4>
                    <small>${formatDateFromTimestamp(order.timestamp_ordine)} - ${formatTimeFromTimestamp(order.timestamp_ordine)}</small><br>
                </div>
                <p><strong>Stato:</strong><br> ${order.stato}<p>
                <a href="order-view.php?idordine=${order.idordine}" class="order-button btn">Dettagli</a>`;
            if (order.stato == "Consegnato") {
                result += `
                    <button type="button" id="${order.idordine}" class="btn order-button" data-bs-toggle="modal" data-bs-target="#stateModal">Conferma</button>
                `;
            }
            result += '</div>';
    });
    return result;
}


let currentOrdersPage = 1; // Tiene traccia della pagina corrente

async function loadUserOrders(page = 1) {
    currentOrdersPage = page;

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
            ordersList.innerHTML = generateOrdersHTML(orders);

            // Crea e aggiungi il componente di paginazione
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

async function updateOrderStatus(idOrdine) {
    const url = "api/api-orders.php";
    const formData = new FormData();
    formData.append('action', 'confirm');
    formData.append('idordine', idOrdine);
    const json = await fetchData(url, formData); 

    if (json && json.success) {
        console.log("Stato dell'ordine aggiornato con successo");
        return true;
    } else {
        console.error("Aggiornamento stato ordine fallito");
        return false;
    }
}



// --- Listener DOMContentLoaded (Chiama loadProfileData all'avvio) ---
document.addEventListener('DOMContentLoaded', async function() {
    await loadProfileData(); // Carica profilo e prima pagina ordini

    const logoutButton = document.getElementById('confirm-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    } else {
         console.warn("Bottone logout non trovato.");
    }

    const ordersListContainer = document.getElementById('orders-list');

    if (ordersListContainer) {
        ordersListContainer.addEventListener('click', function(event) {
            const targetButton = event.target.closest('button[data-bs-toggle="modal"][data-bs-target="#stateModal"]');
            if (targetButton) {
                currentOrderIdToConfirm = targetButton.getAttribute('id');
            }
        });
    }

    const confirmStateButton = document.getElementById('confirm-state-button');
    if (confirmStateButton) {
        confirmStateButton.addEventListener('click', async () => {
            if (currentOrderIdToConfirm) {
                const success = await updateOrderStatus(currentOrderIdToConfirm);
                if (success) {
                    // Close the stateModal
                    const stateModalElement = document.getElementById('stateModal');
                    const stateModal = bootstrap.Modal.getInstance(stateModalElement);
                    if (stateModal) {
                        stateModal.hide();
                    }
                    await loadUserOrders(currentOrdersPage);
                }
            } else {
                console.error("Nessun ID ordine da confermare trovato (stateModal).");
            }
        });
    }

    /*const confirmReviewButton = document.getElementById('confirm-review-button');
    if (confirmReviewButton) {
        confirmReviewButton.addEventListener('click', () => {
            if (!currentOrderIdToReview) {
                alert("Errore: ID ordine non specificato per la recensione."); // Questo è un errore di sistema
                return;
            }

            if (validateReviewForm()) { // Chiama la funzione di validazione
                // Se la validazione passa, prendi i valori e invia
                const title = document.getElementById('review-title').value.trim();
                const rating = document.getElementById('review-rating').value;
                const comment = document.getElementById('review-textarea').value.trim();
                submitReview(currentOrderIdToReview, title, rating, comment);
            }
            // Se validateReviewForm() ritorna false, non fa nulla,
            // i messaggi di errore sono già mostrati e il modale rimane aperto.
        });
    }

    const cancelReviewButton = document.getElementById('cancel-review-button');
    if (cancelReviewButton) {
        cancelReviewButton.addEventListener('click', async () => {
            await loadUserOrders(currentOrdersPage);
            // Assicurati che i campi di errore siano puliti quando il modale viene chiuso con "No, grazie"
            document.getElementById('reviewForm').reset();
            document.getElementById('review-title').classList.remove('is-invalid');
            document.getElementById('review-rating').classList.remove('is-invalid');
            document.getElementById('review-title-error').textContent = '';
            document.getElementById('review-rating-error').textContent = '';
        });
    }*/
});