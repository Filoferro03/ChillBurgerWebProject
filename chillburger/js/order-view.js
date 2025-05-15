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
    if (data.orderCustom && data.orderCustom.length > 0) {
        // 1. Raggruppa le modifiche per idpersonalizzazione (che idealmente identifica un prodotto personalizzato unico nell'ordine)
        const customProductsMap = new Map();

        data.orderCustom.forEach(item => {

            if (!customProductsMap.has(item.idpersonalizzazione)) {
                customProductsMap.set(item.idpersonalizzazione, {
                    idpersonalizzazione: item.idpersonalizzazione,
                    productName: item.nomeprodotto || 'Nome Prodotto N/D',
                    productQuantity: item.quantita !== undefined ? item.quantita : 'N/D', // Quantità del prodotto personalizzato
                    productPrice: item.prezzo !== undefined ? parseFloat(item.prezzo).toFixed(2) : 'N/D', // Prezzo totale della personalizzazione
                    modifiche: [] // Array per le modifiche ingredienti
                });
            }
            // Aggiungi la modifica specifica a questo prodotto personalizzato
            customProductsMap.get(item.idpersonalizzazione).modifiche.push({
                ingredientName: item.nomeingrediente || 'Ingrediente N/D',
                action: item.azione || 'Azione N/D'
            });
        });

        // 2. Itera sulla mappa dei prodotti personalizzati raggruppati e genera l'HTML
        customProductsMap.forEach(customProduct => {
            result += `
                <div class="card shadow-sm">
                    <div class="card-body d-flex flex-row justify-content-between align-items-center">
                        <div class="d-flex flex-column w-25">
                        <h5 class="card-title">${customProduct.productName}</h5>
                        <ul class="list-unstyled ms-3">`;

            if (customProduct.modifiche.length > 0) {
                customProduct.modifiche.forEach(mod => {
                    let prefix = '';
                    let actionText = mod.action; // Testo dell'azione da visualizzare (es. 'aggiunto', 'rimosso')

                    if (mod.action === 'aggiunto') {
                        prefix = '+ ';
                        // Potresti voler rendere il testo più user-friendly, es:
                        // actionText = 'Aggiunto'; 
                    } else if (mod.action === 'rimosso') {
                        prefix = '- ';
                        // actionText = 'Rimosso';
                    }
                    // Se ci fossero altre azioni, potresti aggiungere altri else if

                    // Visualizza il prefisso, il nome dell'ingrediente e l'azione originale tra parentesi
                    // Oppure solo prefisso e nome ingrediente se preferisci non ripetere l'azione
                    result += `<li>${prefix}${mod.ingredientName}</li>`;
                    // Se vuoi anche il testo dell'azione (es. "+ Bacon (aggiunto)"):
                    // result += `<li>${prefix}${mod.ingredientName} (${actionText})</li>`;
                });
            } 

            result += `
                        </ul>
                        </div>
                        <p class="card-text m-0">
                            <strong>Quantità:</strong> ${customProduct.productQuantity}
                        </p>
                        <p class="card-text">
                            €${customProduct.productPrice}
                        </p>
                    </div>
                </div>`;
        });

    }

    // ---- SEZIONE PRODOTTI STANDARD ----
    if (data.orderStock && data.orderStock.length > 0) {
        data.orderStock.forEach(stockElement => {
            const productName = stockElement.nome || 'Nome Prodotto N/D';
            const quantity = stockElement.quantita !== undefined ? stockElement.quantita : 'N/D';
            const price = stockElement.prezzo !== undefined ? parseFloat(stockElement.prezzo).toFixed(2) : 'N/D';

            result += `
                <div class="card shadow-sm">
                    <div class="card-body d-flex flex-row justify-content-between align-items-center">
                        <h5 class="card-title w-25">${productName}</h5>
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
                <h4><strong>Totale: €${totalPriceFormatted}</strong></h4>
            </div>`;
    } else {
        result += '<p class="text-muted mt-4 text-end">Prezzo totale non disponibile.</p>';
    }

    return result;
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