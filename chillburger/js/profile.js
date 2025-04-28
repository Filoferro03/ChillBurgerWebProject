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
        return null;
        console.error(error.message);
    }
}


async function logout() {
    const url = "api/api-login.php";
    const formData = new FormData();
    formData.append('action', 'logout');
    const json = await fetchData(url, formData);
    console.log(json);

    if (json && json["logoutresult"]) {
        window.location.href = 'index.php';
    } else {
        alert("Errore durante il logout:");
    }
}


document.addEventListener('DOMContentLoaded', (event) => {
    // Seleziona il bottone tramite il suo ID
    const logoutButton = document.getElementById('logout-button');

    // Verifica che il bottone esista prima di aggiungere l'listener
    if (logoutButton) {
        // Aggiungi l'event listener per il click
        logoutButton.addEventListener('click', () => {
            // Chiama la funzione logout quando il bottone viene cliccato
            logout();
        });
    } else {
        console.error("Elemento con ID 'logout-button' non trovato.");
    }
});