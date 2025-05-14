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
        return await response.json();
    } catch (error) {
        console.log(error.message);
    }
}

async function getProductsInCart() {
    const url = 'api/api-cart.php';
    const formData = new FormData();
    formData.append('action', 'getProducts');

    const products = await fetchData(url, formData);
    console.log(products);

    if(products) {
        let div = document.querySelector("main section div");
        if(products.length == 0) {
            div.innerHTML = `<p>Nessun prodotto presente nel carrello</p>`
        } else {
            console.log(div);
            let result = "";
            let cartTotal=0.0;
            for(let i=0; i<products.length; i++) {
                let totalProduct = products[i]["quantity"]*products[i]["price"];
                cartTotal += totalProduct;
                let html = `<div class="row text-center mx-2 my-2 p-3 cartElement">
                    <div class='col-12 col-md-6'>
                        <h3>${products[i]["name"]}</h3>
                        <img src="./upload/${products[i]["image"]}" class="border rounded homeImage" alt="${products[i]["name"]}">
                    </div>
                    <div class = "col-12 col-md-6 align-items-center">
                        <p class='mb-1 text-black'>Pezzi: ${products[i]["quantity"]}</p>
                        <p class="fw-bold mb-1 text-black">${totalProduct}</p>
                        <button class="btn btn-danger" data-id="${products[i]["idproduct"]}">Rimuovi</button>
                    </div>
                </div>`;
                console.log(result);
                result += html;
            }
            result += `<div class="d-grid gap-2 mx-2 p-3 d-flex justify-content-end text-light">
                <h3>Prezzo totale: ${cartTotal}</h3>
            </div>
            <div class="d-grid gap-2 mx-2 p-3 d-flex justify-content-end text-light">
            <span class="icons"><strong class="fa-brands fa-apple-pay fa-lg fa-fw"></strong></span>
            <span class="icons"><strong class="fa-brands fa-cc-paypal fa-lg fa-fw"></strong></span>
            <span class="icons"><strong class="fa-brands fa-cc-visa fa-lg fa-fw"></strong></span>
            <span class="icons"><strong class="fa-brands fa-google-pay fa-lg fa-fw"></strong></span>
            <button class='submit btn btn-large btn-dark' >Vai al Checkout</button>
            </div>`
            div.innerHTML = result ;
            const checkoutButton = document.querySelector("main > section > div > div:last-child button")
            console.log(checkoutButton);
            checkoutButton.addEventListener("click", function() {
                window.location.href = "./checkout.php";
            });
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
            formData.append('id', btn.getAttribute("data-id"));

            fetchData(url, formData);
            init();
        });
    });
    
}

init();