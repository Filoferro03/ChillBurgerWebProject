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



async function getProductsInCart() {
    const url = "api/api-cart.php";
    const formData = new FormData();
    formData.append("action", "getProducts");

    const json = await fetchData(url, formData);
    console.log("json: ", json);

    const products = json.products || [];
    const personalizations = json.personalizations || [];

    const div = document.querySelector("#cart-elements");

    // Controllo se entrambi sono vuoti
    if (products.length === 0 && personalizations.length === 0) {
        div.innerHTML = `<p>Nessun prodotto presente nel carrello</p>`;
        return;
    }

    console.log("Prodotti caricati con successo:", products);

    let subTotal = 0;
    let result = "";

    // Prodotti standard
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const quantita = product.quantita;
        const price = product.prezzo;
        subTotal += Number(price) * quantita;

        result += `
        <div class="d-flex flex-column flex-md-row align-items-center justify-content-md-between col-12 border-bottom border-dark mb-2">
            <div class="d-flex flex-column align-items-center col-8 col-md-3 m-1">
                <img src="${product.image}" class="col-10 m-2" alt="${product.nome}">
            </div>
            <div class="d-flex w-100 h-100 flex-column justify-content-between p-1">
                <div class="d-flex flex-column w-100">
                    <div class="d-flex flex-column flex-md-row justify-content-md-between align-items-center">
                        <div class="d-flex flex-column">
                            <p class="fs-3">${product.nome}</p>
                        </div>
                        <div>
                            <p class="fs-3">${(price * quantita).toFixed(2)}€</p>
                        </div>
                        <div>
                            <p class="fs-3">Quantita: ${quantita}</p>
                        </div>
                    </div>
                </div>
                <div class="d-none d-md-flex justify-content-end pb-3">
                    <button class="btn btn-danger" data-id="${product.idprodotto} data-type="product"">Rimuovi</button>
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

        for (let j = 0; j < quantita; j++) {
            result += `
            <div class="d-flex flex-column flex-md-row align-items-center justify-content-md-between col-12 border-bottom border-dark mb-2">
                <div class="d-flex flex-column align-items-center col-8 col-md-3 m-1">
                    <img src="${personalization.image}" class="col-10 m-2" alt="${personalization.nomeprodotto}">
                </div>
                <div class="d-flex w-100 h-100 flex-column justify-content-between p-1">
                    <div class="d-flex flex-column w-100">
                        <div class="d-flex flex-column flex-md-row justify-content-md-between align-items-center">
                            <div class="d-flex flex-column">
                                <p class="fs-3">${personalization.nomeprodotto}</p>
                            </div>
                            <div>
                                <p class="fs-3">${price}€</p>
                            </div>
                            <div>
                                <p class="fs-3">Quantita: 1</p>
                            </div>
                        </div>
                        <div class="d-flex justify-content-between d-md-none mt-2">
                            <a href="./edit-burger.php?id=${personalization.idpersonalizzazione}">
                                <button class="btn btn-success w-10" data-id="${personalization.idpersonalizzazione}">Modifica</button>
                            </a>
                            <button class="btn btn-danger" data-id="${personalization.idpersonalizzazione}">Rimuovi</button>
                        </div>
                        <div class="d-none d-md-block mt-2">
                            <a href="./edit-burger.php?id=${personalization.idpersonalizzazione}">
                                <button class="btn btn-success w-10" data-id="${personalization.idpersonalizzazione}">Modifica</button>
                            </a>
                        </div>
                    </div>
                    <div class="d-none d-md-flex justify-content-end pb-3">
                        <button class="btn btn-danger" data-id="${personalization.idpersonalizzazione} data-type="personalization" ">Rimuovi</button>
                    </div>
                </div>
            </div>`;
        }
    }

    // Totale
    result += `
        <div class="d-flex flex-column w-100 mt-5">
            <div class="d-flex justify-content-between">
                <p class="fs-3">SubTotale</p>
                <p class="fs-3">${subTotal.toFixed(2)}€</p>
            </div>
            <div class="d-flex justify-content-between border-bottom border-dark mt-2">
                <p class="fs-3">Spedizione</p>
                <p class="fs-3">2,50€</p>
            </div>
            <div class="d-flex justify-content-between mt-2">
                <p class="fs-3">Totale</p>
                <p class="fs-3">${(subTotal + 2.50).toFixed(2)}€</p>
            </div>
            <div class="d-flex flex-column align-items-center mt-5">
                <button class="btn btn-lg bg-white">Vai al Checkout</button>
            </div>
        </div>
    `;

    div.innerHTML = result;
}






async function getPersonalization(idprodotto) {
    const url = "api/api-edit-burger.php";
    const formData = new FormData();
    formData.append("action", "getPersonalization");
    formData.append("id", idprodotto);
    const json = await fetchData(url, formData);
    console.log("la mia personalizzazione:",json);
    return json;


}


async function init() {
    await getProductsInCart();

    document.querySelectorAll('.btn-danger').forEach(btn => {
        btn.addEventListener('click', async () => {
            const url = 'api/api-cart.php';
            const formData = new FormData();
            const id = btn.getAttribute("data-id");
            const type = btn.getAttribute("data-type");
    
            if (type === "product") {
                formData.append('action', 'removeProd');
                formData.append('idprodotto', id);
            } else if (type === "personalization") {
                formData.append('action', 'removePers');
                formData.append('idpersonalizzazione', id);
            } else {
                console.error("Tipo non riconosciuto");
                return;
            }
    
            const response = await fetchData(url, formData);
    
            if (response && response.success) {
                console.log("Elemento rimosso con successo:", response);
                init();
                window.location.reload();
            } else {
                console.error("Errore nella rimozione:", response || "Risposta non valida");
                alert("Errore nel rimuovere l'elemento.");
            }
        });
    });
    
    

}

init();