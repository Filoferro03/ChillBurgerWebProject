
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

function generateIngredients(ingredients,product) {
    let result = "";

    result += `<div class="d-flex fle-row justify-content-center m-5" ><p class="text-black fs-1">${product[0]["nome"]}</p></div>`

    if (ingredients.length === 0) {
        result += `<p class="text-muted text-center">Il panino non ha ingredienti</p>`;
    } else {
        for (let i = 0; i < ingredients.length; i++) {
            const isFirst = i === 0;
            const borderClass = isFirst ? "border border-dark" : "border border-dark border-top-0";
            const idIngrediente = ingredients[i]["idingrediente"];

            let ingredient = `
            <div class="${borderClass}">
                <div class="d-flex flex-row justify-content-between align-items-center p-2 md:p-3 ">
                <img src="${ingredients[i]["image"]}" alt="${ingredients[i]["nome"]}" class="img-responsive">
                    <p>${ingredients[i]["nome"] ?? "Nome mancante"}</p>
                    <p>${ingredients[i]["sovrapprezzo"]}€</p>
                    <p>${ingredients[i]["quantita"]}</p>
                    <div class="d-flex flex-row w-[10%] ">
                        <button type="button" class="btn m-1" data-id="${idIngrediente}" aria-label="Sottrai">
                            <i class="fa-solid fa-circle-minus icon"></i>
                        </button>
                        <button type="button" class="btn m-1" data-id="${idIngrediente}" aria-label="Aggiungi">
                            <i class="fa-solid fa-circle-plus icon"></i>
                        </button>
                    </div>
                </div>
            </div>`;
            
            result += ingredient;
        } 
    }

    return result;
}



async function getIngredientsData(){
    const url = "api/api-edit-burger.php";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("response status: " + response.status);
        }

        const json = await response.json();
        console.log("ingredienti:", json.ingredients);  
        console.log("prodotto:", json.product);         

        const ingredientsHTML = generateIngredients(json.ingredients,json.product); 
        const main = document.querySelector("#ingredients-container");
        main.innerHTML = ingredientsHTML;

        

    } catch (error) {
        console.log(error.message);
    }
}

getIngredientsData();
