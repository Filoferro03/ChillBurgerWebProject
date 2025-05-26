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

function generateBurgerDetails(product) {
    let result = "";

    // Genera la stringa con tutti i nomi degli ingredienti
    let ingredientiText = "";
    if (product.ingredienti && product.ingredienti.length > 0) {
        for (let i = 0; i < product.ingredienti.length; i++) {
            ingredientiText += product.ingredienti[i];
            if (i < product.ingredienti.length - 1) {
                ingredientiText += ", ";
            }
        }
    } else {
        ingredientiText = "Ingredienti non disponibili";
    }

    result += `
    <section class="container py-5">
        <h2 class="display-4 custom-title text-center mb-3">
            <span class="txt">${product.nome}</span>
        </h2>

        <img src="${product.image}" alt="Panino Generico"
            class="img-product-details rounded-4 mt-5 w-100">

        <div id="details-container" class="d-flex flex-column align-items-center m-3 p-3">
            <p class="text-center"><strong>INGREDIENTI:</strong><br>${ingredientiText}</p>
        </div>
    </section>`;

    return result;
}




async function getBurgerDetailsData(){
    const url = "api/api-burger-details.php";

    const queryString = window.location.search;

    const urlParams = new URLSearchParams(queryString);

    const id = urlParams.get('id');
    console.log(id);
    const formData = new FormData();
    formData.append('idprodotto', id);
    const json = await fetchData(url, formData);
    console.log(json);
    const burgerDetails = generateBurgerDetails(json);
    const main = document.querySelector('#burger-details');
    main.innerHTML += burgerDetails;
    
}

getBurgerDetailsData();