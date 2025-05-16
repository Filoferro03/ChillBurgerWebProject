
let modifiche = [];
let modifiche2 = [];

function modifyIngredientQuantity(idIngrediente, idPersonalizzazione, azione) {
    const index = modifiche.findIndex(m =>
        m.idpersonalizzazione === idPersonalizzazione &&
        m.idingrediente === idIngrediente
    );

    if (index !== -1) {
        modifiche2.push({
            idpersonalizzazione: idPersonalizzazione,
            idingrediente: idIngrediente,
        });
        modifiche.splice(index, 1); // Rimuove l'oggetto esistente
    } else {
        modifiche.push({
            idpersonalizzazione: idPersonalizzazione,
            idingrediente: idIngrediente,
            azione: azione
        });
    }

    console.log(modifiche);
}

function checkQuantityState(idingrediente,personalization){
    for(i=0;i < personalization[0].length; i++){
        if(personalization[0][i]["idingrediente"] === idingrediente){
            return true;
        }
    }
    return false;
}

function setQuantity(idingrediente,personalization){
    for(i=0;i < personalization[0].length; i++){
        if(personalization[0][i]["idingrediente"] === idingrediente){
            return personalization[0][i]["azione"];
        }
    }
    return "";
}


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

function generateIngredients(ingredients, product, personalization) {
    let result = "";

    if(personalization[0].length > 0){
        modifiche = personalization[0];
        console.log("modifiche aggiornate: ",modifiche);
    }

    const idPersonalization = personalization[0][0]["idpersonalizzazione"];
    result += `<div class="d-flex flex-row justify-content-center m-5"><p class="text-black fs-1">${product[0]["nome"]}</p></div>`;

    if (ingredients.length === 0) {
        result += `<p class="text-muted text-center">Il panino non ha ingredienti</p>`;
    } else {
        for (let i = 0; i < ingredients.length; i++) {
            const isFirst = i === 0;
            const borderClass = isFirst ? "border border-dark" : "border border-dark border-top-0";
            const idIngrediente = ingredients[i]["idingrediente"];
            let quantita = ingredients[i]["quantita"];
            let azione;

            if(checkQuantityState(idIngrediente,personalization)){
                azione = setQuantity(idIngrediente,personalization);
                if(azione === "rimosso"){
                    quantita = 0;
                }else{
                    quantita = 2;
                }
            } else {
                 quantita = ingredients[i]["quantita"];
            }

            let ingredient = `
            <div class="${borderClass}">
                <div class="d-flex flex-row justify-content-between align-items-center p-2 md:p-3 ">
                    <img src="${ingredients[i]["image"]}" alt="${ingredients[i]["nome"]}" class="img-responsive">
                    <p>${ingredients[i]["nome"] ?? "Nome mancante"}</p>
                    <p>${ingredients[i]["sovrapprezzo"]}€</p>
                    <p class="quantita m-2">${quantita}</p>
                    <div class="d-flex flex-row w-[10%]">
                        <button type="button" class="btn m-1"
                            data-id="${idIngrediente}"
                            onclick="
                                let p = this.parentNode.parentNode.querySelector('.quantita');
                                let plus = this.parentNode.querySelector('.btn-plus');
                                let val = parseInt(p.innerText);
                                if (val > 0) {
                                    p.innerText = val - 1;
                                    plus.disabled = false;
                                }
                                if (parseInt(p.innerText) === 0) this.disabled = true;
                                modifyIngredientQuantity(${idIngrediente}, ${idPersonalization}, 'rimosso');
                            "
                            ${quantita === 0 ? 'disabled' : ''}
                        >
                            <i class="fa-solid fa-circle-minus icon"></i>
                        </button>

                        <button type="button" class="btn m-1 btn-plus"
                            data-id="${idIngrediente}"
                            onclick="
                                let p = this.parentNode.parentNode.querySelector('.quantita');
                                let minus = this.parentNode.querySelector('button:not(.btn-plus)');
                                let val = parseInt(p.innerText);
                                if (val < 2) {
                                    p.innerText = val + 1;
                                    minus.disabled = false;
                                }
                                if (parseInt(p.innerText) === 2) this.disabled = true;
                                modifyIngredientQuantity(${idIngrediente}, ${idPersonalization}, 'aggiunto');
                            "
                            ${quantita === 2 ? 'disabled' : ''}
                        >
                            <i class="fa-solid fa-circle-plus icon"></i>
                        </button>
                    </div>
                </div>
            </div>`;
            
            result += ingredient;
        } 
        result += `<div class="w-100 d-flex justify-content-center mt-3 p-2">
                        <button class="btn btn-secondary fs-5" onclick="sendModifiche(modifiche).then(() => { window.location.href = 'cart.php'; });">Salva</button>
                   </div>`;
    }

    return result;
}





function getProductID() {
    // Ottieni la query string (tutto ciò che c'è dopo il ? nell'URL)
    const queryString = window.location.search;

    // Crea un oggetto URLSearchParams per analizzare i parametri della query
    const urlParams = new URLSearchParams(queryString);

    // Recupera il parametro 'id'
    const id = urlParams.get('id');

    return id
}

async function deleteIngredient(idpersonalizzazione,idingrediente){
    const url = "api/api-edit-burger.php";
    const formData = new FormData();
    formData.append("action", "deleteIngredient");
    formData.append("idpersonalizzazione", idpersonalizzazione);
    formData.append("idingrediente", idingrediente);
    const json = await fetchData(url, formData);
    console.log("cancellato ingrediente, idpers e iding", idpersonalizzazione, idingrediente);

}

async function sendModifiche(modifiche) {
    const url = "api/api-edit-burger.php";
    console.log("le modifiche che devono essere salvate:", modifiche);

    for (let i = 0; i < modifiche.length; i++) {
        const mod = modifiche[i];
        const formData = new FormData();
        formData.append("action", "modify");
        formData.append("idpersonalizzazione", mod.idpersonalizzazione);
        formData.append("idingrediente", mod.idingrediente);
        formData.append("act", mod.azione);

        const json = await fetchData(url, formData);
        console.log(json);
    }

    console.log("len di modifiche: ", modifiche);

    for(let i = 0; i < modifiche2.length; i++){
        deleteIngredient(modifiche2[i].idpersonalizzazione,modifiche2[i].idingrediente);
    }
}




async function getIngredientsData(){
    
    const url = "api/api-edit-burger.php";
    const formData = new FormData();
    formData.append("id", getProductID());
    formData.append("action","getIngredients");

    const json = await fetchData(url, formData);
    console.log(json);
    const ingredients = generateIngredients(json.ingredients,json.product,json.personalization);
    const main = document.querySelector("#ingredients-container");
    main.innerHTML = ingredients;
    
}

getIngredientsData();
