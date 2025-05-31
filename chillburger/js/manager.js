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

async function loadAdminProfileData() {
    const url = "api/api-profile.php"; // API per ottenere i dati del profilo
    const formData = new FormData(); 
    try {
        const response = await fetchData(url, formData);

        if (response && response.success && response.userData) {
            displayAdminProfileData(response.userData);
        } else {
            console.error("Impossibile caricare i dati del profilo admin.", response ? response.error : 'Risposta non valida');
            // Aggiorna l'interfaccia per mostrare un errore, se necessario
            const nomeElement = document.getElementById('profile-nome');
            const cognomeElement = document.getElementById('profile-cognome');
            const usernameElement = document.getElementById('profile-username');
            if (nomeElement) nomeElement.textContent = 'Errore';
            if (cognomeElement) cognomeElement.textContent = 'Errore';
            if (usernameElement) usernameElement.textContent = 'Errore';
        }
    } catch (error) {
        console.error("Errore durante il caricamento dei dati del profilo admin:", error);
    }
}

/**
 * Visualizza i dati del profilo dell'admin negli elementi HTML appropriati.
 * @param {object} userData - L'oggetto contenente i dati dell'utente.
 */
function displayAdminProfileData(userData) {
    const nomeElement = document.getElementById('profile-nome');
    const cognomeElement = document.getElementById('profile-cognome');
    const usernameElement = document.getElementById('profile-username');

    if (nomeElement) nomeElement.textContent = userData.nome || 'N/D';
    if (cognomeElement) cognomeElement.textContent = userData.cognome || 'N/D';
    if (usernameElement) usernameElement.textContent = userData.username || 'N/D';
}

/**
 * Gestisce il processo di logout per l'admin.
 */
async function adminLogout() {
    const url = "api/api-login.php"; // API per il logout
    const formData = new FormData();
    formData.append('action', 'logout');

    try {
        const response = await fetchData(url, formData);

        if (response && response.logoutresult) { // 'logoutresult' è la chiave usata in api-login.php
            window.location.href = 'index.php'; // Reindirizza alla homepage o alla pagina di login
        } else {
            console.error("Logout fallito o risposta non valida dall'API.", response ? response.error : 'Risposta non valida');
            alert("Errore durante il logout. Riprova.");
        }
    } catch (error) {
        console.error("Errore durante il logout dell'admin:", error);
        alert("Errore critico durante il logout. Riprova.");
    }
}

// Event listener che si attivano quando il DOM è completamente caricato
document.addEventListener('DOMContentLoaded', function() {
    // Carica i dati del profilo dell'admin
    loadAdminProfileData();

    const confirmLogoutButton = document.getElementById('confirm-button'); // ID del bottone di conferma nel modale
    if (confirmLogoutButton) {
        confirmLogoutButton.addEventListener('click', adminLogout);
    } else {
        console.warn("Bottone di conferma logout ('confirm-button') nel modale non trovato.");
    }
});

