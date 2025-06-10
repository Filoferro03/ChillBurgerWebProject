// Array per tracciare le modifiche attive da salvare
let modifiche = [];
// Array per tracciare le modifiche da cancellare (ingredienti da rimuovere)
let modifiche2 = [];

/**
 * Aggiunge o rimuove un ingrediente dalla lista delle modifiche.
 * Se è già presente, lo sposta in modifiche2 per indicare la rimozione.
 * Se non è presente, lo aggiunge alla lista delle modifiche.
 *
 * @param {number} idIngrediente - ID dell'ingrediente
 * @param {number} idPersonalizzazione - ID della personalizzazione
 * @param {string} azione - Tipo di modifica ("aggiunto" o "rimosso")
 */
function modifyIngredientQuantity(idIngrediente, idPersonalizzazione, azione) {
  if (!idIngrediente || !idPersonalizzazione || !azione) {
    console.warn("Dati incompleti per la modifica.");
    return;
  }

  // Trova l'indice nella lista modifiche
  const index = modifiche.findIndex(
    (m) =>
      m.idpersonalizzazione === idPersonalizzazione &&
      m.idingrediente === idIngrediente
  );

  if (index !== -1) {
    // Rimozione della modifica esistente
    const existing = modifiche[index];
    modifiche.splice(index, 1);

    // Aggiungi solo una volta a modifiche2 per la rimozione dal DB
    const alreadyMarked = modifiche2.some(
      (m) =>
        m.idpersonalizzazione === idPersonalizzazione &&
        m.idingrediente === idIngrediente
    );

    if (!alreadyMarked && existing.azione !== azione) {
      modifiche2.push({
        idpersonalizzazione: idPersonalizzazione,
        idingrediente: idIngrediente,
      });
    }
  } else {
    // Aggiunta della nuova modifica
    modifiche.push({
      idpersonalizzazione: idPersonalizzazione,
      idingrediente: idIngrediente,
      azione: azione,
    });

    // Se era presente in modifiche2 perché precedentemente rimosso, annulla
    modifiche2 = modifiche2.filter(
      (m) =>
        !(
          m.idpersonalizzazione === idPersonalizzazione &&
          m.idingrediente === idIngrediente
        )
    );
  }

  console.log("Modifiche attive:", modifiche);
  console.log("Da rimuovere dal DB:", modifiche2);
}

/**
 * Verifica se un ingrediente è già presente nella personalizzazione.
 * Serve per determinare se va mostrato come già aggiunto o meno.
 *
 * @param {number} idingrediente - ID dell'ingrediente
 * @param {Array} personalization - Lista delle personalizzazioni
 * @returns {boolean}
 */
function checkQuantityState(idingrediente, personalization) {
  const list = personalization;
  for (let i = 0; i < list.length; i++) {
    if (list[i]?.idingrediente === idingrediente) {
      return true;
    }
  }
  return false;
}

/**
 * Restituisce l'azione associata a un ingrediente nella personalizzazione ("aggiunto" o "rimosso")
 *
 * @param {number} idingrediente
 * @param {Array} personalization
 * @returns {string}
 */
function setQuantity(idingrediente, personalization) {
  const list = personalization;
  for (let i = 0; i < list.length; i++) {
    if (list[i]?.idingrediente === idingrediente) {
      return list[i]["azione"];
    }
  }
  return "";
}

/**
 * Esegue una richiesta POST e restituisce i dati JSON.
 *
 * @param {string} url - Endpoint API
 * @param {FormData} formData - Dati da inviare
 * @returns {Promise<any>}
 */
async function fetchData(url, formData) {
  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
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

/**
 * Genera l’HTML per la lista degli ingredienti e i pulsanti di modifica quantità.
 *
 * @param {Array} ingredients - Lista degli ingredienti del prodotto
 * @param {Array} product - Dati del prodotto (nome, ecc.)
 * @param {Array} personalization - Dati di personalizzazione già esistenti
 * @returns {string} - HTML da inserire nella pagina
 */
function generateIngredients(ingredients, product, personalization) {
  let result = "";
  modifiche =
    personalization[0]["idingrediente"] !== null ? personalization : [];

  console.log("stato iniziale modifiche: ", modifiche);
  const idPersonalization = getPersonalizationID();

  const section = document.querySelector("#burger-name");

  // Creo un elemento h2
  const h2 = document.createElement("h2");
  h2.className = "display-4 custom-title text-center mb-3";

  const span = document.createElement("span");
  span.className = "txt";
  span.textContent = product?.[0]?.nome || "Prodotto";

  h2.appendChild(span);

  // Aggiungo il <h2> come primo figlio della section
  section.insertBefore(h2, section.firstChild);

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    result += `<p class="text-muted text-center">Il panino non ha ingredienti</p>`;
    return result;
  }

  for (let i = 0; i < ingredients.length; i++) {
    const ing = ingredients[i];
    const essenziale = ing["essenziale"];
    const isFirst = i === 0;
    const borderClass = isFirst
      ? "border border-dark"
      : "border border-dark border-top-0";
    const idIngrediente = ing.idingrediente;
    let quantita = ing.quantita;
    let azione;

    if (checkQuantityState(idIngrediente, personalization)) {
      azione = setQuantity(idIngrediente, personalization);
      quantita = azione === "rimosso" ? 0 : 2;
    }

    // Se è essenziale, disabilitiamo i bottoni e aggiungiamo tooltip
    const disabledAttr = essenziale ? "disabled" : "";
    const tooltip = essenziale
      ? "title='Ingrediente essenziale, non modificabile'"
      : "";

    result += `
        <div class="col-12 ${borderClass}">
            <div class="d-flex flex-row justify-content-between align-items-center p-2 md:p-3" ${tooltip}>
                <img src="${ing.image}" alt="${
      ing.nome
    }" class="rounded-4 img-responsive">
                <p class="fs-5" style="max-width: 100px; white-space: normal; word-wrap: break-word; overflow-wrap: break-word;">${
                  ing.nome ?? "Nome mancante"
                }</p>
                <p>${ing.sovrapprezzo}€</p>
                <p class="quantita m-2">${quantita}</p>
                <div class="d-flex flex-row">
                    <button type="button" class="btn p-1 p-md-3 md:m-1" 
                        onclick="
                            if(!this.disabled){
                                let p = this.parentNode.parentNode.querySelector('.quantita');
                                let plus = this.parentNode.querySelector('.btn-plus');
                                let val = parseInt(p.innerText);
                                if (val > 0) {
                                    p.innerText = val - 1;
                                    plus.disabled = false;
                                }
                                if (parseInt(p.innerText) === 0) this.disabled = true;
                                modifyIngredientQuantity(${idIngrediente}, ${idPersonalization}, 'rimosso');
                            }
                        "
                        ${quantita === 0 ? "disabled" : ""} ${disabledAttr}
                        ${tooltip}
                    >
                        <span class="fa-solid fa-circle-minus icon"></span>
                    </button>
                    <button type="button" class="btn p-1 p-md-3 md:m-1 btn-plus" 
                        onclick="
                            if(!this.disabled){
                                let p = this.parentNode.parentNode.querySelector('.quantita');
                                let minus = this.parentNode.querySelector('button:not(.btn-plus)');
                                let val = parseInt(p.innerText);
                                if (val < 2) {
                                    p.innerText = val + 1;
                                    minus.disabled = false;
                                }
                                if (parseInt(p.innerText) === 2) this.disabled = true;
                                modifyIngredientQuantity(${idIngrediente}, ${idPersonalization}, 'aggiunto');
                            }
                        "
                        ${quantita === 2 ? "disabled" : ""} ${disabledAttr}
                        ${tooltip}
                    >
                        <span class="fa-solid fa-circle-plus icon"></span>
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

/**
 * Estrae l’ID del prodotto dagli URL parameters (GET).
 * @returns {string|null}
 */
function getPersonalizationID() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
  //.then(() => { window.location.href = 'cart.php'; });
}

/**
 * Richiama l’API per rimuovere un ingrediente da una personalizzazione nel DB.
 *
 * @param {number} idpersonalizzazione
 * @param {number} idingrediente
 */
async function deleteIngredient(idpersonalizzazione, idingrediente) {
  const url = "api/api-edit-burger.php";
  const formData = new FormData();
  formData.append("action", "deleteIngredient");
  formData.append("idpersonalizzazione", idpersonalizzazione);
  formData.append("idingrediente", idingrediente);
  await fetchData(url, formData);
}

/**
 * Salva tutte le modifiche e rimuove gli ingredienti marcati per la cancellazione.
 *
 * @param {Array} modifiche - Lista modifiche da salvare
 */
async function sendModifiche(modifiche) {
  const url = "api/api-edit-burger.php";
  console.log("Salvataggio modifiche:", modifiche);
  console.log("Salvataggio modifiche2:", modifiche2);

  for (let i = 0; i < modifiche.length; i++) {
    const mod = modifiche[i];
    console.log("i-esimo el", mod);
    const formData = new FormData();
    formData.append("action", "modify");
    formData.append("idpersonalizzazione", getPersonalizationID());
    formData.append("idingrediente", mod.idingrediente);
    formData.append("act", mod.azione);

    await fetchData(url, formData);
  }

  for (let i = 0; i < modifiche2.length; i++) {
    const m = modifiche2[i];
    await deleteIngredient(m.idpersonalizzazione, m.idingrediente);
  }
}

/**
 * Carica dal server i dati del prodotto selezionato (ingredienti, personalizzazione, ecc.)
 * e genera l’HTML da inserire nella pagina.
 */
async function getIngredientsData() {
  const url = "api/api-edit-burger.php";
  const formData = new FormData();
  formData.append("id", getPersonalizationID());
  formData.append("action", "getIngredients");

  const json = await fetchData(url, formData);
  console.log("il mio json: ", json);

  if (json && json.ingredients && json.product && json.personalization) {
    const html = generateIngredients(
      json.ingredients,
      json.product,
      json.personalization
    );
    document.querySelector("#ingredients-container").innerHTML = html;
  } else {
    console.error("Dati non validi o incompleti ricevuti:", json);
    alert("Errore nel caricamento degli ingredienti.");
  }
}

// Esegue il caricamento iniziale all'avvio della pagina
getIngredientsData();
