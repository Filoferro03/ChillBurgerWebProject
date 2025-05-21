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

    const products = await fetchData(url, formData);
    if (!products) {
        console.error("Nessun prodotto trovato o errore nella risposta");
        return;
    }

    console.log("Prodotti caricati con successo:", products);

    let subTotal = 0;
    const div = document.querySelector("#cart-elements");

    if (products.length === 0) {
        div.innerHTML = `<p>Nessun prodotto presente nel carrello</p>`;
        return;
    }

    let result = "";

    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        const quantita = product.quantita;
        console.log("quantita del prodotto", product.nome, " è : ", quantita);

        let price = 0;
        if (product.idcategoria === 1) {
            const personalization = await getPersonalization(product.idprodotto);
            console.log("la mia personalizzazione:", personalization);
            price = personalization?.[0]?.prezzo ?? product.prezzo;
        } else {
            price = product.prezzo;
        }

        subTotal += Number(price) * quantita;


        if (product.idcategoria === 1 && quantita > 1) {
            for (let i = 0; i < quantita; i++) {
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
                                    <p class="fs-3">${price}€</p>
                                </div>
                                <div>
                                    <p class="fs-3">Quantita: 1</p>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between d-md-none mt-2">
                                <a href="./edit-burger.php?id=${product.idprodotto}">
                                    <button class="btn btn-success w-10" data-id="${product.idprodotto}">Modifica</button>
                                </a>
                                <button class="btn btn-danger" data-id="${product.idprodotto}">Rimuovi</button>
                            </div>
                            <div class="d-none d-md-block mt-2">
                                <a href="./edit-burger.php?id=${product.idprodotto}">
                                    <button class="btn btn-success w-10" data-id="${product.idprodotto}">Modifica</button>
                                </a>
                            </div>
                        </div>
                        <div class="d-none d-md-flex justify-content-end pb-3">
                            <button class="btn btn-danger" data-id="${product.idprodotto}">Rimuovi</button>
                        </div>
                    </div>
                </div>`;
            }
        } else {
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
                        ${product.idcategoria === 1 ? `
                            <div class="d-flex justify-content-between d-md-none mt-2">
                                <a href="./edit-burger.php?id=${product.idprodotto}">
                                    <button class="btn btn-success w-10" data-id="${product.idprodotto}">Modifica</button>
                                </a>
                                <button class="btn btn-danger" data-id="${product.idprodotto}">Rimuovi</button>
                            </div>
                            <div class="d-none d-md-block mt-2">
                                <a href="./edit-burger.php?id=${product.idprodotto}">
                                    <button class="btn btn-success w-10" data-id="${product.idprodotto}">Modifica</button>
                                </a>
                            </div>
                        ` : ""}
                    </div>
                    <div class="d-none d-md-flex justify-content-end pb-3">
                        <button class="btn btn-danger" data-id="${product.idprodotto}">Rimuovi</button>
                    </div>
                </div>
            </div>`;
        }
        
    }

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
            formData.append('action', 'removeProd');
            formData.append('idprodotto', btn.getAttribute("data-id"));
    
            const response = await fetchData(url, formData);
    
            if (response && response.success) {
                console.log("Prodotto rimosso con successo:", response);
                init();
                window.location.reload();
            } else {
                console.error("Errore nella rimozione del prodotto:", response || "Risposta non valida");
                alert("Errore nel rimuovere il prodotto.");
            }
        });
    });
    

}

init();