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
        return null;
    }
}

function createProductCard(p) {
    const div = document.createElement('div');
    div.className = 'col-6 col-md-4 col-lg-3 menu-item';
    div.dataset.category = (p.idcategoria || '').toLowerCase();

    div.innerHTML = `
        <div class="card h-100 text-center shadow-sm hover-up">
            <img src="${p.image}" class="card-img-top" alt="${p.nome}">
            <div class="card-body">
                <h5 class="card-title">${p.nome}</h5>
                <p class="card-text small text-muted"></p>
            </div>
            <div class="card-footer bg-white border-0">
                <div class="d-block mb-3">
                    <span class="fw-bold text-primary">${parseFloat(p.prezzo).toFixed(2).replace('.', ',')} €</span>
                </div>
                <div class="d-flex justify-content-between">
                    <button class="btn btn-outline-success btn-sm btn-add" data-id="${p.idprodotto}">+ Aggiungi</button>
                    <button class="btn btn-outline-danger btn-sm btn-remove" data-id="${p.idprodotto}">− Rimuovi</button>
                </div>
            </div>
        </div>
    `;
    return div;
}

async function renderProducts(idcategoria = null) {
    const container = document.getElementById('menuGrid');
    container.innerHTML = '';

    const url = '/chillburger/api/api-menu.php'; // usa percorso completo e corretto
    const formData = new FormData();

    // Se vuoi filtrare per categoria lato API, aggiungi idcategoria nel formData
    if (idcategoria !== null) {
        formData.append('idcategoria', idcategoria);
    }

    const json = await fetchData(url, formData);

    if (json && json.data) {
        let productsToRender = json.data;

        // Se vuoi filtrare lato client (alternativa a inviare idcategoria lato server)
        if (idcategoria !== null) {
            productsToRender = productsToRender.filter(p => p.idcategoria == idcategoria);
        }

        // Aggiungi ogni prodotto al container
        productsToRender.forEach(p => {
            const card = createProductCard(p);
            container.appendChild(card);
        });
    } else {
        container.innerHTML = '<p>Nessun prodotto disponibile</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderProducts();

    // Qui puoi aggiungere i listener per i bottoni filtro categoria e aggiungi/rimuovi
});
