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

function displayOrderItemsOnly(data) {
    let result = "";

    if (data.orderCustom && data.orderCustom.length > 0) {
        const customProductsMap = new Map();
        data.orderCustom.forEach(item => {
            if (!customProductsMap.has(item.idpersonalizzazione)) {
                customProductsMap.set(item.idpersonalizzazione, {
                    idpersonalizzazione: item.idpersonalizzazione,
                    idprodotto: item.idprodotto || '', // Add the standard product ID
                    productName: item.nomeprodotto || 'Prodotto Personalizzato N/D',
                    productQuantity: item.quantita !== undefined ? item.quantita : 'N/D',
                    modifiche: []
                });
            }
            if (item.nomeingrediente) {
                customProductsMap.get(item.idpersonalizzazione).modifiche.push({
                    ingredientName: item.nomeingrediente || '',
                    action: item.azione || ''
                });
            }
        });

        customProductsMap.forEach(customProduct => {
            result += `<div class="mb-2">
                           <p class="fs-5 fw-bold mb-0"><a href="burger-details.php?id=${customProduct.idprodotto}" style="color: inherit; text-decoration: none;">${customProduct.productName}</a> (Q.tà: ${customProduct.productQuantity})</p>`;
            if (customProduct.modifiche.length > 0 && customProduct.modifiche[0].ingredientName) {
                result += `<ul class="list-unstyled ms-3 small">`;
                customProduct.modifiche.forEach(mod => {
                    let prefix = mod.action === 'aggiunto' ? '+ ' : (mod.action === 'rimosso' ? '- ' : '');
                    result += `<li><span class="math-inline">${prefix}</span>${mod.ingredientName}</li>`;
                });
                result += `</ul>`;
            }
            result += `</div><hr class="my-2">`;
        });
    }

    if (data.orderStock && data.orderStock.length > 0) {
        data.orderStock.forEach(stockElement => {
            const productName = stockElement.nome || 'Prodotto N/D';
            const quantity = stockElement.quantita !== undefined ? stockElement.quantita : 'N/D';
            result += `<div class="mb-2">
                           <p class="fs-5 fw-bold mb-0"><a href="menu.php#${stockElement.idprodotto || ''}" style="color: inherit; text-decoration: none;">${productName}</a> (Q.tà: ${quantity})</p>
                       </div><hr class="my-2">`;
        });
    }

    if (result.endsWith('<hr class="my-2">')) {
        result = result.substring(0, result.lastIndexOf('<hr class="my-2">'));
    }

    return result || "<p class='text-center text-muted'>Nessun articolo da mostrare.</p>";
}

async function loadOrderItems() {
    const orderItemsContainer = document.getElementById('orderItemsContainer');
    if (!orderItemsContainer) return;

    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('idordine');

    if (!orderId) {
        orderItemsContainer.innerHTML = "<p class='text-center text-danger'>ID ordine non specificato.</p>";
        return;
    }

    const apiUrl = `api/api-orders.php?idordine=${orderId}`;
    const formData = new FormData();
    formData.append('action', 'getDetails'); 

    const json = await fetchData(apiUrl, formData); 

    if (json && json.success && json.data) {
        orderItemsContainer.innerHTML = displayOrderItemsOnly(json.data);
    } else {
        orderItemsContainer.innerHTML = "<p class='text-center text-danger'>Impossibile caricare gli articoli dell'ordine.</p>";
    }
}

document.addEventListener('DOMContentLoaded', loadOrderItems);