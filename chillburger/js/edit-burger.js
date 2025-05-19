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
        modifiche.splice(index, 1);
    } else {
        modifiche.push({
            idpersonalizzazione: idPersonalizzazione,
            idingrediente: idIngrediente,
            azione: azione
        });
    }

    console.log("Modifiche aggiornate:", modifiche);
}

function checkQuantityState(idingrediente, personalization) {
    const list = personalization?.[0] || [];
    for (let i = 0; i < list.length; i++) {
        if (list[i]?.idingrediente === idingrediente) {
            return true;
        }
    }
    return false;
}

function setQuantity(idingrediente, personalization) {
    const list = personalization?.[0] || [];
    for (let i = 0; i < list.length; i++) {
        if (list[i]?.idingrediente === idingrediente) {
            return list[i]["azione"];
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
            throw new Error(`Errore nella richiesta: ${response.status}`);
        }

        const data = await response.json();
        if (data?.error) {
            throw new Error(data.error);
        }

        return data;

    } catch (error) {
        console.error("Errore in fetchData:", error.message);
        alert("Si è verificato un errore nella comunicazione col server.");
    }
}

function generateIngredients(ingredients, product, personalization) {
    let result = "";

    if (Array.isArray(personalization?.[0]) && personalization[0].length > 0) {
        modifiche = personalization[0];
        console.log("Modifiche iniziali:", modifiche);
    }

    const idPersonalization = personalization?.[0]?.[0]?.idpersonalizzazione || 0;
    result += `<div class="d-flex flex-row justify-content-center m-5"><p class="text-black fs-1">${product?.[0]?.nome || "Prodotto"}</p></div>`;

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
        result += `<p class="text-muted text-center">Il panino non ha ingredienti</p>`;
        return result;
    }

    for (let i = 0; i < ingredients.length; i++) {
        const ing = ingredients[i];
        const isFirst = i === 0;
        const borderClass = isFirst ? "border border-dark" : "border border-dark border-top-0";
        const idIngrediente = ing.idingrediente;
        let quantita = ing.quantita;
        let azione;

        if (checkQuantityState(idIngrediente, personalization)) {
            azione = setQuantity(idIngrediente, personalization);
            quantita = azione === "rimosso" ? 0 : 2;
        }

        result += `
        <div class="${borderClass}">
            <div class="d-flex flex-row justify-content-between align-items-center p-2 md:p-3">
                <img src="${ing.image}" alt="${ing.nome}" class="img-responsive">
                <p>${ing.nome ?? "Nome mancante"}</p>
                <p>${ing.sovrapprezzo}€</p>
                <p class="quantita m-2">${quantita}</p>
                <div class="d-flex flex-row w-[10%]">
                    <button type="button" class="btn m-1"
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
    }

    result += `
        <div class="w-100 d-flex justify-content-center mt-3 p-2">
            <button class="btn btn-secondary fs-5" onclick="sendModifiche(modifiche).then(() => { window.location.href = 'cart.php'; });">Salva</button>
        </div>
    `;

    return result;
}

function getProductID() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

async function deleteIngredient(idpersonalizzazione, idingrediente) {
    const url = "api/api-edit-burger.php";
    const formData = new FormData();
    formData.append("action", "deleteIngredient");
    formData.append("idpersonalizzazione", idpersonalizzazione);
    formData.append("idingrediente", idingrediente);
    await fetchData(url, formData);
}

async function sendModifiche(modifiche) {
    const url = "api/api-edit-burger.php";
    console.log("Salvataggio modifiche:", modifiche);

    for (let i = 0; i < modifiche.length; i++) {
        const mod = modifiche[i];
        const formData = new FormData();
        formData.append("action", "modify");
        formData.append("idpersonalizzazione", mod.idpersonalizzazione);
        formData.append("idingrediente", mod.idingrediente);
        formData.append("act", mod.azione);

        await fetchData(url, formData);
    }

    for (let i = 0; i < modifiche2.length; i++) {
        const m = modifiche2[i];
        await deleteIngredient(m.idpersonalizzazione, m.idingrediente);
    }
}

async function getIngredientsData() {
    const url = "api/api-edit-burger.php";
    const formData = new FormData();
    formData.append("id", getProductID());
    formData.append("action", "getIngredients");

    const json = await fetchData(url, formData);

    if (json && json.ingredients && json.product && json.personalization) {
        const html = generateIngredients(json.ingredients, json.product, json.personalization);
        document.querySelector("#ingredients-container").innerHTML = html;
    } else {
        console.error("Dati non validi o incompleti ricevuti:", json);
        alert("Errore nel caricamento degli ingredienti.");
    }
}

getIngredientsData();
