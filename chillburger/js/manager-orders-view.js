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
                ingredientName: item.nomeingrediente || '',
                action: item.azione || ''
            });
        });

        customProductsMap.forEach(customProduct => {
            result += `
                <div class="card shadow-sm mb-3">
                    <div class="card-body d-flex flex-column flex-md-row justify-content-md-between align-items-md-center text-center text-md-start">
                        <div class="w-100 w-md-50 mb-2 mb-md-0">
                            <p class="card-title">${customProduct.productName}</p>`;

            if (customProduct.modifiche.length > 0 && customProduct.modifiche[0].ingredientName != '') {
                result += `<ul class="list-unstyled ms-md-3 small">`;
                customProduct.modifiche.forEach(mod => {
                    let prefix = '';
                    if (mod.action === 'aggiunto') prefix = '+ ';
                    else if (mod.action === 'rimosso') prefix = '- ';
                    result += `<li>${prefix}${mod.ingredientName}</li>`;
                });
                result += `</ul>`;
            }
            result += `</div>
                        <div class="d-flex flex-column align-items-center align-items-md-end w-100 w-md-auto mt-2 mt-md-0">
                            <p class="card-text m-0 mb-1"> 
                                <strong>Q.tà:</strong> ${customProduct.productQuantity}
                            </p>
                            <p class="card-text m-0 fw-bold">
                                €${customProduct.productPrice}
                            </p>
                        </div>
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
                <div class="card shadow-sm mb-3">
                    <div class="card-body d-flex flex-column flex-md-row justify-content-md-between align-items-md-center text-center text-md-start">
                        <p class="card-title w-100 w-md-50 mb-2 mb-md-0">${productName}</p>
                        <div class="d-flex flex-column align-items-center align-items-md-end w-100 w-md-auto mt-2 mt-md-0"> 
                            <p class="card-text m-0 mb-1">
                                <strong>Q.tà:</strong> ${quantity}
                            </p>
                            <p class="card-text m-0 fw-bold">
                                € ${price}
                            </p>
                        </div>
                    </div>
                </div>`;
        });
    }

    // Spedizione e Totale
    result += `<div class="mt-3 pt-2 border-top">
                    <div class="d-flex justify-content-between align-items-center">
                        <p class="card-title mb-0 ms-3">Spedizione:</p>
                        <p class="card-text mb-0 fw-bold">
                            € 2.50
                        </p>
                    </div>
                </div>`;

    if (data.totalPrice !== undefined && data.totalPrice !== null) {
        const totalPriceFormatted = parseFloat(data.totalPrice).toFixed(2);
        result += `
            <div class="text-end mt-3 pt-3 border-top">
                <p><strong>Totale: €${totalPriceFormatted}</strong></p>
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
    const orderId = urlParams.get('id');

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

loadOrderDetails();