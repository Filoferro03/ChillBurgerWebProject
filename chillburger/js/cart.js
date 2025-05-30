// Helper function to make fetch requests
async function fetchData(url, formData) {
    try {
        const response = await fetch(url, {
            method: "POST",
            body: formData
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        console.log("fetch completato correttamente");
        return await response.json();
    } catch (error) {
        console.log(error.message);
        console.log("errore nel fetch");

    }
}

async function modifyQuantity(idprodotto,quantity){
    const url = 'api/api-cart.php';
    const formData = new FormData();
    formData.append("action", "modifyProdQuantity");
    formData.append("idprodotto",idprodotto);
    formData.append("quantita",quantity);

    const json = await fetchData(url, formData);
    console.log(json);

    await init();
    
}

async function removeProductFromCart(idprodotto, quantita = 1) {
    // Use negative quantity to decrease
    await modifyQuantity(idprodotto, -quantita);
}  

async function getTotalCartQuantity(){
    const url = 'api/api-cart.php';
    const formData = new FormData;
    formData.append('action','getCartTotalQuantity');
    const json = await fetchData(url,formData);
    console.log("quantita carrello: ",json);
    return json;
}

async function modifyPersonalizationQuantity(idpersonalizzazione,quantity){
    const url = 'api/api-cart.php';
    const formData = new FormData();
    formData.append("action", "modifyPersQuantity");
    formData.append("idpersonalizzazione",idpersonalizzazione);
    formData.append("quantita",quantity);

    const json = await fetchData(url, formData);
    console.log(json);

    await init();
    
}



async function getProductsInCart(order) {
    const url = "api/api-cart.php";
    const formData = new FormData();
    formData.append("action", "getProducts");

    const json = await fetchData(url, formData);
    console.log("json: ", json);
    console.log("prezzo ordine", order[0].prezzo_totale);

    const products = json.products || [];
    const personalizations = json.personalizations || [];

    const div = document.querySelector("#cart-elements");

    if (products.length === 0 && personalizations.length === 0) {
        div.innerHTML = `<p class="text-center">Nessun prodotto presente nel carrello</p>`;
        return;
    }

    let subTotal = 0;
    let result = "";

    // Prodotti standard
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const quantita = product.quantita;
        const price = product.prezzo;
        subTotal += Number(price) * quantita;

        const disableMinus = quantita === 0 ? "disabled" : "";
        const disableRemove = quantita > 0 ? "disabled" : "";

        result += `
            <div class="d-flex flex-column flex-md-row align-items-center justify-content-md-between col-12 border-bottom border-dark mb-2">
                <div class="d-flex flex-column align-items-center col-8 col-md-3 m-1">
                <img src="${product.image}" class="col-10 m-2 rounded-3" alt="${product.nome}">
                </div>
                <div class="d-flex w-100 h-100 flex-column justify-content-between p-1">
                    <div class="d-flex flex-column w-100 m-1">
                        <div class="d-flex flex-column flex-md-row justify-content-md-between align-items-center">
                            <div class="d-flex flex-column align-items-center">
                                <p class="fs-3">${product.nome}</p>
                            </div>
                            <div class="d-flex align-items-center">
                                <p class="fs-3">${(price * quantita).toFixed(2)}€</p>
                            </div>
                            <div class="d-flex flex-column justify-content-center align-items-center">
                                <div class="d-flex flex-row justify-content-between">
                                    <button type="button" class="btn p-1 p-md-3 md:m-1" ${disableMinus}
                                        onclick="modifyQuantity(${product.idprodotto}, -1)">
                                        <span class="fa-solid fa-circle-minus icon" aria-hidden="true"></span>
                                    </button>
                                    <p class="fs-3"><span class="quantita">${quantita}</span></p>
                                    <button type="button" class="btn p-1 p-md-3 md:m-1 btn-plus" 
                                        onclick="modifyQuantity(${product.idprodotto}, 1)">
                                        <span class="fa-solid fa-circle-plus icon" aria-hidden="true"></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex justify-content-center justify-content-md-end pb-3">
                        <button class="btn btn-danger btn-remove" data-id="${product.idprodotto}" data-type="product" ${disableRemove}>
                            Rimuovi
                        </button>
                    </div>
                </div>
            </div>`;
    }

    // Personalizzazioni
    for (let i = 0; i < personalizations.length; i++) {
        const personalization = personalizations[i];
        const price = personalization.prezzo;
        const quantita = personalization.quantita;
        subTotal += Number(price) * quantita;
        const disableMinusPers = quantita === 0 ? "disabled" : "";
        const disableRemovePers = quantita > 0 ? "disabled" : "";

result += `
    <div class="d-flex flex-column flex-md-row align-items-center justify-content-md-between col-12 border-bottom border-dark mb-2">
        <div class="d-flex flex-column align-items-center col-8 col-md-3 m-1">
            <img  src="${personalization.image}" class="col-10 m-2 rounded-3" alt="${personalization.nomeprodotto}">
        </div>
        <div class="d-flex w-100 h-100 flex-column justify-content-between p-1">
            <div class="d-flex flex-column w-100">
                <div class="d-flex flex-column flex-md-row justify-content-md-between align-items-center">
                    <div class="d-flex flex-column align-items-center">
                        <p class="fs-3">${personalization.nomeprodotto}</p>
                    </div>
                    <div class="d-flex align-items-center">
                        <p class="fs-3">${(price * quantita).toFixed(2)}€</p>
                    </div>
                    <div class="d-flex flex-column align-items-center">
                        <div class="d-flex flex-row justify-content-between align-items-center">
                            <button type="button" class="btn p-1 p-md-3 md:m-1" ${disableMinusPers}
                                onclick="modifyPersonalizationQuantity(${personalization.idpersonalizzazione}, -1)">
                                <span class="fa-solid fa-circle-minus icon" aria-hidden="true"></span>
                            </button>
                            <p class="fs-3"><span class="quantita">${quantita}</span></p>
                            <button type="button" class="btn p-1 p-md-3 md:m-1"
                                onclick="modifyPersonalizationQuantity(${personalization.idpersonalizzazione}, 1)">
                                <span class="fa-solid fa-circle-plus icon" aria-hidden="true"></span>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="d-flex justify-content-between d-lg-none mt-2">
                    <a href="./edit-burger.php?id=${personalization.idpersonalizzazione}">
                        <button class="btn btn-success w-10" data-id="${personalization.idpersonalizzazione}" ${disableMinusPers}>Modifica</button>
                    </a>
                    <button class="btn btn-danger btn-remove" data-id="${personalization.idpersonalizzazione}" data-type="personalization" ${disableRemovePers}>
                        Rimuovi
                    </button>
                </div>
                <div class="d-none d-lg-block mt-2">
                    <a href="./edit-burger.php?id=${personalization.idpersonalizzazione}">
                        <button class="btn btn-success w-10" data-id="${personalization.idpersonalizzazione}" ${disableMinusPers}>Modifica</button>
                    </a>
                </div>
            </div>
            <div class="d-none d-lg-flex justify-content-end pb-3">
                <button class="btn btn-danger btn-remove" data-id="${personalization.idpersonalizzazione}" data-type="personalization" ${disableRemovePers}>
                    Rimuovi
                </button>
            </div>
        </div>
    </div>`;
    }

    // Totale
    result += `
        <div class="d-flex flex-column w-100 mt-5">
            <div class="d-flex justify-content-between">
                <p class="fs-3">SubTotale</p>
                <p class="fs-3">${(order[0].prezzo_totale - 2.50).toFixed(2)}€</p>
            </div>
            <div class="d-flex justify-content-between border-bottom border-dark mt-2">
                <p class="fs-3">Spedizione</p>
                <p class="fs-3">2,50€</p>
            </div>
            <div class="d-flex justify-content-between mt-2">
                <p class="fs-3">Totale</p>
                <p class="fs-3">${order[0].prezzo_totale}€</p>
            </div>
            <div class="d-flex flex-column align-items-center mt-5">
                <button id="checkoutBtn" class="btn btn-lg bg-white">Vai al Checkout</button>
            </div>
        </div>
        
        <!-- Modal Conferma Rimozione -->
<div class="modal fade" id="confirmDeleteModal" tabindex="-1" aria-labelledby="confirmDeleteLabel" >
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="confirmDeleteLabel">Conferma Rimozione</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Chiudi"></button>
      </div>
      <div class="modal-body">
        Sei sicuro di voler rimuovere questo prodotto dal carrello?
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-danger" data-bs-dismiss="modal">No</button>
        <button type="button" class="btn btn-success" id="confirmDeleteBtn">Sì</button>
      </div>
    </div>
  </div>
</div>
`;

    div.innerHTML = result;
}


async function init() {
    const url = "api/api-cart.php";
    const formData = new FormData();
    formData.append("action", "getCartPrice");

    const json = await fetchData(url, formData);
    console.log("idordine: ",json.order);

    await getProductsInCart(json.order);
    const quantityData = await getTotalCartQuantity();
    const checkoutBtn = document.getElementById('checkoutBtn');

// Verifica se il valore è 0 e disabilita il bottone
if (checkoutBtn) {
    // Verifica se il valore è 0 e disabilita il bottone
    if (quantityData == 0 || quantityData === "0") {
        checkoutBtn.disabled = true;
        checkoutBtn.classList.add("disabled", "btn-secondary");
        checkoutBtn.classList.remove("bg-white");
    } else {
        checkoutBtn.addEventListener("click", () => {
            window.location.href = "./checkout.php";
        });
    }
}

    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute("data-id");
            const type = btn.getAttribute("data-type");
    
            // Mostra il modale
            const modal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
            modal.show();
    
            // Clona il bottone per rimuovere eventuali vecchi event listener
            const oldBtn = document.getElementById("confirmDeleteBtn");
            const newBtn = oldBtn.cloneNode(true);
            oldBtn.parentNode.replaceChild(newBtn, oldBtn);
    
            // Aggiungi nuovo event listener pulito
            newBtn.addEventListener("click", async () => {
                const formData = new FormData();
                formData.append('action', type === "product" ? 'removeProd' : 'removePers');
                formData.append(type === "product" ? 'idprodotto' : 'idpersonalizzazione', id);
    
                const response = await fetchData('api/api-cart.php', formData);
    
                if (response && response.success) {
                    console.log("Elemento rimosso con successo:", response);
                    const modalEl = document.getElementById('confirmDeleteModal');
                    const modalInstance = bootstrap.Modal.getInstance(modalEl);
                    modalInstance.hide();
                    await init();
                } else {
                    alert("Errore nel rimuovere l'elemento.");
                }
            });
        });
    });

}

init();