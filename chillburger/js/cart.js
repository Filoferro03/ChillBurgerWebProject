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
                
            }
            
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

//init();