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
        console.log(error.message);
    }
}

async function loadOrderDetails() {
    const orderDetailsContainer = document.getElementById('orderDetailsContainer');
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('idordine');

    if (!orderId) {
        orderDetailsContainer.innerHTML = "<p class='text-center text-danger'>ID ordine non trovato nell'URL.</p>";
        return;
    }

    // L'action viene mandata via POST con formData, idordine via GET nell'URL
    const apiUrl = `api/api-orders.php?idordine=${orderId}`;
    const formData = new FormData();
    formData.append('action', 'getDetails');

    const json = await fetchData(apiUrl, formData); // fetchData invia formData come body della POST
    if (json && json.success && json.data) {
        const orderData = json.data;
        orderDetailsContainer.innerHTML = displayOrderDetails(orderData);
    } else {
        orderDetailsContainer.innerHTML = `<p class='text-center text-danger'>Errore nel caricamento dei dettagli dell'ordine: ${json?.error || 'Dati non disponibili.'}</p>`;
    }
}

/**
 * Genera l'HTML per visualizzare i dettagli di un ordine.
 * @param {object} data - L'oggetto contenente i dettagli dell'ordine,
 * che dovrebbe avere le proprietà: orderCustom, orderStock, totalPrice.
 * @returns {string} Una stringa HTML che rappresenta i dettagli dell'ordine.
 */
function displayOrderDetails(data) {
    let result = "";

    // ---- SEZIONE PRODOTTI PERSONALIZZATI ----
    result += `<h3 class="mb-3">Prodotti Personalizzati</h3>`;
    if (data.orderCustom && data.orderCustom.length > 0) {
        // Nota: La query SQL per 'orderCustom' come discussa precedentemente,
        // restituirà una riga per ogni *modifica di ingrediente* all'interno di un prodotto personalizzato.
        // Se un prodotto personalizzato ha più modifiche, apparirà più volte con dettagli diversi per ciascuna modifica.
        // Per un raggruppamento più avanzato (mostrare un prodotto personalizzato una volta con tutte le sue modifiche),
        // sarebbe necessario un pre-processing dei dati 'data.orderCustom' qui in JavaScript.
        // La versione seguente mostra una riga per ogni voce ricevuta da 'orderCustom'.

        data.orderCustom.forEach(customElement => {
            const productName = customElement.nome_prodotto || 'Nome Prodotto N/D';
            const ingredientName = customElement.nome_ingrediente || 'Ingrediente N/D';
            const action = customElement.azione || 'Azione N/D'; // es. 'aggiunto', 'rimosso'
            const productQuantity = customElement.quantita !== undefined ? customElement.quantita : 'N/D';
            const productPrice = customElement.prezzo !== undefined ? parseFloat(customElement.prezzo).toFixed(2) : 'N/D';

            result += `
                <div class="card mb-3 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">${productName} (Personalizzato)</h5>
                        <p class="card-text mb-1">
                            <strong>Modifica:</strong> ${ingredientName} (${action})
                        </p>
                        <p class="card-text mb-1">
                            <strong>Quantità del Prodotto Base:</strong> ${productQuantity}
                        </p>
                        <p class="card-text">
                            <strong>Prezzo (per questo prodotto personalizzato):</strong> €${productPrice}
                        </p>
                    </div>
                </div>`;
        });
    } else {
        result += '<p class="text-muted">Nessun prodotto personalizzato in questo ordine.</p>';
    }

    // ---- SEZIONE PRODOTTI STANDARD ----
    if (data.orderStock && data.orderStock.length > 0) {
        data.orderStock.forEach(stockElement => {
            const productName = stockElement.nome || 'Nome Prodotto N/D';
            const quantity = stockElement.quantita !== undefined ? stockElement.quantita : 'N/D';
            const price = stockElement.prezzo !== undefined ? parseFloat(stockElement.prezzo).toFixed(2) : 'N/D';

            result += `
                <div class="card mb-3 shadow-sm">
                    <div class="card-body d-flex flex-row justify-content-between align-items-center">
                        <h5 class="card-title">${productName}</h5>
                        <p class="card-text mb-1">
                            <strong>Quantità:</strong> ${quantity}
                        </p>
                        <p class="card-text">
                            € ${price}
                        </p>
                    </div>
                </div>`;
        });
    }

    // ---- PREZZO TOTALE ----
    if (data.totalPrice !== undefined && data.totalPrice !== null) {
        const totalPriceFormatted = parseFloat(data.totalPrice).toFixed(2);
        result += `
            <div class="text-end mt-4">
                <h4><strong>Totale Ordine: €${totalPriceFormatted}</strong></h4>
            </div>`;
    } else {
        result += '<p class="text-muted mt-4 text-end">Prezzo totale non disponibile.</p>';
    }

    return result;
}

// Assicurati che la funzione fetchData e loadOrderDetails siano definite come discusso precedentemente.
// Esempio di come `loadOrderDetails` dovrebbe essere (come da suggerimento precedente):

async function fetchData(url, formData) { // formData è opzionale se non è una POST con body
    try {
        const options = formData ? { method: "POST", body: formData } : { method: "GET" };
        const response = await fetch(url, options);
        if (!response.ok) {
            // Prova a leggere un messaggio di errore JSON dal corpo della risposta, se presente
            let errorMsg = `Response status: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData && errorData.error) {
                    errorMsg = errorData.error;
                }
            } catch (e) {
                // Nessun corpo JSON o non è JSON, usa il messaggio di stato
            }
            throw new Error(errorMsg);
        }
        return await response.json();
    } catch (error) {
        console.error("Errore fetchData:", error.message); // Logga l'errore
        // Restituisci un oggetto che simula una risposta fallita dall'API per una gestione più semplice
        return { success: false, error: error.message, data: null };
    }
}


async function loadOrderDetails() {
    const orderDetailsContainer = document.getElementById('orderDetailsContainer');
    if (!orderDetailsContainer) {
        console.error("Elemento 'orderDetailsContainer' non trovato nel DOM.");
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('idordine');

    if (!orderId) {
        orderDetailsContainer.innerHTML = "<p class='text-center text-danger'>ID ordine non trovato nell'URL.</p>";
        return;
    }

    orderDetailsContainer.innerHTML = "<p class='text-center'>Caricamento dettagli ordine...</p>";

    // L'action viene mandata via POST con formData, idordine via GET nell'URL
    const apiUrl = `api/api-orders.php?idordine=${orderId}`; // idordine via GET
    const formData = new FormData();
    formData.append('action', 'getDetails'); // action via POST

    const json = await fetchData(apiUrl, formData);

    if (json && json.success && json.data) {
        orderDetailsContainer.innerHTML = displayOrderDetails(json.data);
    } else {
        // Usa il messaggio di errore dall'API se disponibile, altrimenti un messaggio generico
        const errorMessage = json && json.error ? json.error : 'Dati non disponibili o si è verificato un errore.';
        orderDetailsContainer.innerHTML = `<p class='text-center text-danger'>Errore nel caricamento dei dettagli dell'ordine: ${errorMessage}</p>`;
    }
}

// Chiamata per caricare i dettagli dell'ordine quando il DOM è pronto
document.addEventListener('DOMContentLoaded', loadOrderDetails);