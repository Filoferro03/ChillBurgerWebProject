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
        console.log("tutto ok");
        return await response.json();
    } catch (error) {
        console.log(error.message);
        console.log("sbagliato");

    }
}

async function getProductsInCart() {
    const url = "api/api-cart.php";
    const formData = new FormData();
    formData.append("action", "getProducts");

    const products = await fetchData(url, formData);
    console.log(products);

    if (products) {
        let div = document.querySelector("#cart-elements");
        if (products.length === 0) {
            div.innerHTML = `<p>Nessun prodotto presente nel carrello</p>`;
        } else {
            let result = "";
            for (let i = 0; i < products.length; i++) {
                const product = products[i];
                result += `
                <div class="d-flex flex-row align-items-center justify-content-between col-12 border-bottom border-dark mb-2">
                    <div class="d-flex flex-column align-items-center col-3 m-1">
                        <img src="${product.image}" class="col-10 m-2" alt="${product.nome}">
                    </div>
                    <div class="d-flex w-100 h-100 flex-column justify-content-between p-1">
                        <div class="d-flex flex-column w-100">
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="d-flex flex-column">
                                    <p class="fs-3">${product.nome}</p>
                                </div>
                                <div>
                                    <p class="fs-3">${product.prezzo}€</p>
                                </div>
                            </div>
                            ${product.idcategoria == 1 ? `
                                <div class="d-flex flex-column">
                                    <p>Ingredienti Panino</p>
                                    <div>
                                        <a href="./edit-burger.php?id=${product.idprodotto}">
                                            <button class="btn btn-success w-10" data-id="${product.idprodotto}">Modifica</button>
                                        </a>
                                    </div>
                                </div>` : ""}
                        </div>
                        <div class="d-flex justify-content-end pb-3">
                            <button class="btn btn-danger" data-id="${product.idprodotto}">Rimuovi</button>
                        </div>
                    </div>
                </div>
                `;
            }

            // Blocco finale: SubTotale, Spedizione, Totale, Paga
            result += `
            <div class="d-flex flex-column w-100 mt-5">
                <div class="d-flex justify-content-between">
                    <p class="fs-3">SubTotale</p>
                    <p class="fs-3">Prezzo</p>
                </div>

                <div class="d-flex justify-content-between border-bottom border-dark mt-2">
                    <p class="fs-3">Spedizione</p>
                    <p class="fs-3">Prezzo</p>
                </div>

                <div class="d-flex justify-content-between mt-2">
                    <p class="fs-3">Totale</p>
                    <p class="fs-3">Prezzo</p>
                </div>

                <div class="d-flex flex-column align-items-center mt-5">
                    <button class="btn btn-lg bg-white">Vai al Checkout</button>
                </div>
            </div>
            `;

            div.innerHTML += result;
        }
    }
}


async function init() {
    await getProductsInCart();
    document.querySelectorAll('.btn-danger').forEach(btn => {
        btn.addEventListener('click', () => {
            const url = 'api/api-cart.php';
            const formData = new FormData();
            formData.append('action', 'removeProd');
            formData.append('idprodotto', btn.getAttribute("data-id"));
            fetchData(url, formData);
            init();
            window.location.reload();
        });
    });
    
}

init();