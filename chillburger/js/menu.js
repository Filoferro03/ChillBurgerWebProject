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


function generateProducts(products, idcategoria) {
    let result = "";

    for (let i = 0; i < products.length; i++) {
        if (products[i]["idcategoria"] !== idcategoria) continue;

        const nome = products[i]["nome"] ?? "Nome mancante";
        const imgSrc = products[i]["image"] ?? "./resources/menu/stock.jpg";
        const prezzo = products[i]["prezzo"] ?? "Prezzo mancante";
        const altText = nome;

        // Se categoria = 1, wrappo immagine in <a>
        const imgTag = idcategoria === 1
            ? `<a href="#"><img src="${imgSrc}" class="menu-img-responsive" alt="${altText}"></a>`
            : `<img src="${imgSrc}" class="menu-img-responsive" alt="${altText}">`;

        let product = `
        <div class="col-12 col-md-4 mb-5 d-flex flex-column align-items-center h-auto">
            ${imgTag}
            <p>${nome}</p>
            <p>${prezzo}€</p>
        </div>`;

        result += product;
    }

    return result;
}



async function getProductsData(){
    const url = "api/api-menu.php";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("response status: " + response.status);
        }

        const json = await response.json();
        console.log("prodotti:", json.products);         

        const appetizersHTML = generateProducts(json.products,3); 
        const appetizersDiv = document.querySelector("#appetizers");
        appetizersDiv.innerHTML += appetizersHTML;

        const burgersHTML = generateProducts(json.products,1);
        const burgersDiv = document.querySelector("#burgers");
        burgersDiv.innerHTML += burgersHTML;

        const deepFriedHTML = generateProducts(json.products,2);
        const deepFriedDiv = document.querySelector("#deepFried");
        deepFriedDiv.innerHTML += deepFriedHTML;

        const drinksHTML = generateProducts(json.products,4);
        const drinksDiv = document.querySelector("#drinks");
        drinksDiv.innerHTML += drinksHTML;

        const dessertsHTML = generateProducts(json.products,5);
        const dessertsDiv = document.querySelector("#desserts");
        dessertsDiv.innerHTML += dessertsHTML;

        

    } catch (error) {
        console.log(error.message);
    }
}

getProductsData();
