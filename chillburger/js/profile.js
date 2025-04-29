async function fetchData(url, formData) {
    try {
        const response = await fetch(url, {
            method: "POST",
            body: formData
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error.message);
        return null;
    }
}

async function uploadProfile() {
    const url = "api/api-profile.php";
    const formData = new FormData();
    const json = await fetchData(url, formData);

    if (json && json.success && json.userData) {
        console.log("Dati profilo ricevuti:", json.userData);
        displayProfileData(json.userData);
        await loadUserOrders(json.userData.username);
    } else {
        console.error("Impossibile caricare i dati del profilo.");
    }
}

function displayProfileData(userData) {
    const nomeElement = document.getElementById('profile-nome');
    const cognomeElement = document.getElementById('profile-cognome');
    const usernameElement = document.getElementById('profile-username');

    if (nomeElement) nomeElement.textContent = userData.nome || 'N/D';
    if (cognomeElement) cognomeElement.textContent = userData.cognome || 'N/D';
    if (usernameElement) usernameElement.textContent = userData.username || 'N/D';
}

async function loadUserOrders($username) {
    try {
        const response = await fetch(`api/get-orders.php?username=${$username}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const orders = await response.json();
        
        const ordersList = document.getElementById('orders-list');
        if (!ordersList) return;

        if (orders.length === 0) {
            ordersList.innerHTML = '<p class="text-center">Nessun ordine trovato</p>';
            return;
        }

        ordersList.innerHTML = ''; // Clear existing content
        orders.forEach(order => {
            const orderElement = document.createElement('div');
            orderElement.className = 'list-group-item';
            orderElement.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="mb-1">Ordine del ${order.data} alle ${order.ora}</h5>
                        <p class="mb-1">Stato: ${order.descrizione}</p>
                    </div>
                </div>
            `;
            ordersList.appendChild(orderElement);
        });
    } catch (error) {
        console.error('Error loading orders:', error);
        const ordersList = document.getElementById('orders-list');
        if (ordersList) {
            ordersList.innerHTML = '<p class="text-center text-danger">Errore nel caricamento degli ordini</p>';
        }
    }
}

async function logout() {
    const url = "api/api-login.php";
    const formData = new FormData();
    formData.append('action', 'logout');
    const json = await fetchData(url, formData);

    if (json && json["logoutresult"]) {
        window.location.href = 'index.php';
    } else {
        alert("Errore durante il logout");
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    // Load profile data and orders
    await uploadProfile();

    // Add logout button handler
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
});