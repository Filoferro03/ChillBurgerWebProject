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

function displayOrderDetails(data) {
    let result = "";

    if (data.orderCustom && data.orderCustom.length > 0) {
        const customProductsMap = new Map();

        data.orderCustom.forEach(item => {

            if (!customProductsMap.has(item.idpersonalizzazione)) {
                customProductsMap.set(item.idpersonalizzazione, {
                    idpersonalizzazione: item.idpersonalizzazione,
                    idprodotto: item.idprodotto || '',
                    productName: item.nomeprodotto || 'Nome Prodotto N/D',
                    productQuantity: item.quantita !== undefined ? item.quantita : 'N/D',
                    productPrice: item.prezzo !== undefined ? parseFloat(item.prezzo).toFixed(2) : 'N/D', 
                    modifiche: [] 
                });
            }
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
                            <p class="card-title fw-bold"><a href="burger-details.php?id=${customProduct.idprodotto}" style="color: inherit; text-decoration: none;">${customProduct.productName}</a></p>`;

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
                                Q.tà: ${customProduct.productQuantity}
                            </p>
                            <p class="card-text m-0">
                                €${customProduct.productPrice}
                            </p>
                        </div>
                    </div>
                </div>`;
        });
    }

    if (data.orderStock && data.orderStock.length > 0) {
        data.orderStock.forEach(stockElement => {
            const productName = stockElement.nome || 'Nome Prodotto N/D';
            const quantity = stockElement.quantita !== undefined ? stockElement.quantita : 'N/D';
            const price = stockElement.prezzo !== undefined ? parseFloat(stockElement.prezzo).toFixed(2) : 'N/D';

            result += `
                <div class="card shadow-sm mb-3">
                    <div class="card-body d-flex flex-column flex-md-row justify-content-md-between align-items-md-center text-center text-md-start">
                        <p class="card-title w-100 w-md-50 mb-2 mb-md-0 fw-bold"><a href="menu.php#${stockElement.idprodotto || ''}" style="color: inherit; text-decoration: none;">${productName}</a></p>
                        <div class="d-flex flex-column align-items-center align-items-md-end w-100 w-md-auto mt-2 mt-md-0"> 
                            <p class="card-text m-0 mb-1">
                                Q.tà: ${quantity}
                            </p>
                            <p class="card-text m-0 ">
                                € ${price}
                            </p>
                        </div>
                    </div>
                </div>`;
        });
    }

    result += `<div class="mt-3 pt-2 border-top">
                    <div class="d-flex justify-content-between align-items-center">
                        <p class="card-title mb-0 ms-3">Spedizione:</p>
                        <p class="card-text mb-0 ">
                            € 2.50
                        </p>
                    </div>
                </div>`;

    if (data.totalPrice !== undefined && data.totalPrice !== null) {
        const totalPriceFormatted = parseFloat(data.totalPrice).toFixed(2);
        result += `
            <div class="text-end mt-3 pt-3 border-top">
                <p>Totale: €${totalPriceFormatted}</p>
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

    const apiUrl = `api/api-orders.php?idordine=${orderId}`; 
    const formData = new FormData();
    formData.append('action', 'getDetails'); 
    const json = await fetchData(apiUrl, formData);

    if (json && json.success && json.data) {
        orderDetailsContainer.innerHTML = displayOrderDetails(json.data);
    } else {
        const errorMessage = json && json.error ? json.error : 'Dati non disponibili o si è verificato un errore.';
        orderDetailsContainer.innerHTML = `<p class='text-center text-danger'>Errore nel caricamento dei dettagli dell'ordine: ${errorMessage}</p>`;
    }
}

loadOrderDetails();