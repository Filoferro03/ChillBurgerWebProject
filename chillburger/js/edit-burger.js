
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

function generateIngredients(ingredients) {
    let result = "";

    if (ingredients.length === 0) {
        result += `<p class="text-muted text-center">Il panino non ha ingredienti</p>`;
    } else {
        for (let i = 0; i < ingredients.length; i++) {
            const isLast = i === ingredients.length - 1;
            const borderClass = isLast ? "" : "border-bottom border-dark";
            const idIngrediente = ingredients[i]["idingrediente"];

            let ingredient = `
            <div class="${borderClass}">
                <div class="d-flex flex-row justify-content-between align-items-center p-2 md:p-3 ">
                <img src="${ingredients[i]["image"]}" alt="${ingredients[i]["nome"]}" class="img-responsive">
                    <p>${ingredients[i]["nome"] ?? "Nome mancante"}</p>
                    <p>${ingredients[i]["sovrapprezzo"]}€</p>
                    <p>${ingredients[i]["quantita"]}</p>
                    <div class="d-flex flex-row w-[10%] ">
                        <button type="button" class="btn m-1" aria-label="Sottrai">
                            <i class="fa-solid fa-circle-minus md:fa-2x"></i>
                        </button>
                        <button type="button" class="btn m-1" aria-label="Aggiungi">
                            <i class="fa-solid fa-circle-plus md:fa-2x"></i>
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
        if(!response.ok){
            throw new Error("response status: ",response.status);
        }
        const json = await response.json();
        console.log("lista ingredienti", json);
        const ingredients = generateIngredients(json);
        const main = document.querySelector("#ingredients-container");
        main.innerHTML = ingredients;
    } catch(error) {
        console.log(error.message);
    }
}

getIngredientsData();
