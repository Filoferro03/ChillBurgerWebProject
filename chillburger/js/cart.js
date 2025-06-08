// Helper function to make fetch requests
async function fetchData(url, formData) {
  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Errore nel fetch:", error.message);
    return null; // Ritorna null in caso di errore di rete/fetch
  }
}

// Funzione per modificare la quantità (aggiungere o rimuovere)
async function modifyQuantity(id, type, quantity) {
  const url = "api/api-cart.php";
  const formData = new FormData();
  
  const action = type === 'product' ? 'modifyProdQuantity' : 'modifyPersQuantity';
  const idName = type === 'product' ? 'idprodotto' : 'idpersonalizzazione';

  formData.append("action", action);
  formData.append(idName, id);
  formData.append("quantita", quantity);

  await fetchData(url, formData);
  await init(); // Ricarica tutto il carrello per aggiornare stato e totali
}

// Funzione per rimuovere un elemento (prodotto o personalizzazione)
async function removeItem(id, type) {
    const formData = new FormData();
    formData.append("action", type === "product" ? "removeProd" : "removePers");
    formData.append(type === "product" ? "idprodotto" : "idpersonalizzazione", id);

    const response = await fetchData("api/api-cart.php", formData);

    const modalEl = document.getElementById("confirmDeleteModal");
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance.hide();
    
    if (response && response.success) {
      await init(); // Ricarica il carrello dopo la rimozione
    } else {
      alert("Errore nel rimuovere l'elemento.");
    }
}

// Aggiunge i listener per i pulsanti di rimozione
function setupRemoveButtons() {
    document.querySelectorAll(".btn-remove").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-id");
            const type = btn.getAttribute("data-type");

            const modal = new bootstrap.Modal(document.getElementById("confirmDeleteModal"));
            modal.show();

            const confirmBtn = document.getElementById("confirmDeleteBtn");
            // Sostituisce il bottone per evitare listener multipli
            const newConfirmBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

            newConfirmBtn.addEventListener("click", () => removeItem(id, type));
        });
    });
}

// Genera l'HTML per i prodotti e il riepilogo
function generateCartHTML(products, personalizations, order) {
    let itemsHtml = "";
    
    // Genera HTML per prodotti standard
    products.forEach(product => {
        const totalProductPrice = (product.prezzo * product.quantita).toFixed(2);
        itemsHtml += `
            <div class="d-flex flex-column flex-md-row align-items-center justify-content-md-between col-12 border-bottom border-dark mb-2">
                <div class="d-flex flex-column align-items-center col-8 col-md-3 m-1">
                    <a href="menu.php#${product.idprodotto}"><img src="${product.image}" class="col-10 m-2 rounded-3" alt="${product.nome}"></a>
                </div>
                <div class="d-flex w-100 h-100 flex-column justify-content-between p-1">
                    <div class="d-flex flex-column w-100 m-1">
                        <div class="d-flex flex-column flex-md-row justify-content-md-between align-items-center">
                            <p class="fs-3">${product.nome}</p>
                            <p class="fs-3">${totalProductPrice}€</p>
                            <div class="d-flex flex-row justify-content-between align-items-center">
                                <button type="button" class="btn p-1 p-md-3 md:m-1" onclick="modifyQuantity(${product.idprodotto}, 'product', -1)"><span class="fa-solid fa-circle-minus icon" aria-hidden="true"></span></button>
                                <p class="fs-3 mx-2"><span class="quantita">${product.quantita}</span></p>
                                <button type="button" class="btn p-1 p-md-3 md:m-1" onclick="modifyQuantity(${product.idprodotto}, 'product', 1)"><span class="fa-solid fa-circle-plus icon" aria-hidden="true"></span></button>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex justify-content-center justify-content-md-end pb-3">
                        <button class="btn btn-danger btn-remove" data-id="${product.idprodotto}" data-type="product">Rimuovi</button>
                    </div>
                </div>
            </div>`;
    });

    // Genera HTML per prodotti personalizzati
    personalizations.forEach(pers => {
        const totalPersPrice = (pers.prezzo * pers.quantita).toFixed(2);
        itemsHtml += `
            <div class="d-flex flex-column flex-md-row align-items-center justify-content-md-between col-12 border-bottom border-dark mb-2">
                <div class="d-flex flex-column align-items-center col-8 col-md-3 m-1">
                    <a href="burger-details.php?id=${pers.idprodotto}"><img src="${pers.image}" class="col-10 m-2 rounded-3" alt="${pers.nomeprodotto}"></a>
                </div>
                <div class="d-flex w-100 h-100 flex-column justify-content-between p-1">
                    <div class="d-flex flex-column w-100">
                        <div class="d-flex flex-column flex-md-row justify-content-md-between align-items-center">
                            <p class="fs-3">${pers.nomeprodotto}</p>
                            <p class="fs-3">${totalPersPrice}€</p>
                            <div class="d-flex flex-row justify-content-between align-items-center">
                                <button type="button" class="btn p-1 p-md-3 md:m-1" onclick="modifyQuantity(${pers.idpersonalizzazione}, 'personalization', -1)"><span class="fa-solid fa-circle-minus icon" aria-hidden="true"></span></button>
                                <p class="fs-3 mx-2"><span class="quantita">${pers.quantita}</span></p>
                                <button type="button" class="btn p-1 p-md-3 md:m-1" onclick="modifyQuantity(${pers.idpersonalizzazione}, 'personalization', 1)"><span class="fa-solid fa-circle-plus icon" aria-hidden="true"></span></button>
                            </div>
                        </div>
                        <div class="mt-2">
                            <a href="./edit-burger.php?id=${pers.idpersonalizzazione}"><button class="btn btn-success">Modifica</button></a>
                        </div>
                    </div>
                    <div class="d-flex justify-content-end pb-3 pt-2">
                        <button class="btn btn-danger btn-remove" data-id="${pers.idpersonalizzazione}" data-type="personalization">Rimuovi</button>
                    </div>
                </div>
            </div>`;
    });

    // Genera HTML per il riepilogo
    const subTotal = (order[0].prezzo_totale > 0) ? (order[0].prezzo_totale - 2.5).toFixed(2) : "0.00";
    const total = (order[0].prezzo_totale > 0) ? order[0].prezzo_totale : "0.00";
    let summaryHtml = `
        <div class="d-flex justify-content-between">
            <p class="fs-3">SubTotale</p>
            <p class="fs-3">${subTotal}€</p>
        </div>
        <div class="d-flex justify-content-between border-bottom border-dark mt-2">
            <p class="fs-3">Spedizione</p>
            <p class="fs-3">2,50€</p>
        </div>
        <div class="d-flex justify-content-between mt-2">
            <p class="fs-3">Totale</p>
            <p class="fs-3">${total}€</p>
        </div>`;

    return { itemsHtml, summaryHtml };
}

// Funzione principale di inizializzazione
async function init() {
    // Seleziona i container
    const cartItemsContainer = document.querySelector("#cart-elements");
    const summaryDetailsContainer = document.querySelector("#summary-details");
    const checkoutBtn = document.getElementById("checkoutBtn");
    const alertContainer = document.getElementById("availability-alert");

    // 1. Fetch dei dati del carrello (prodotti e ordine)
    const cartDataUrl = "api/api-cart.php";
    const cartDataForm = new FormData();
    cartDataForm.append("action", "getProducts");
    const cartJson = await fetchData(cartDataUrl, cartDataForm);

    const orderDataUrl = "api/api-cart.php";
    const orderDataForm = new FormData();
    orderDataForm.append("action", "getCartPrice");
    const orderJson = await fetchData(orderDataUrl, orderDataForm);

    // Gestione carrello vuoto
    if (!cartJson || (!cartJson.products?.length && !cartJson.personalizations?.length)) {
        cartItemsContainer.innerHTML = `<p class="text-center">Nessun prodotto presente nel carrello</p>`;
        summaryDetailsContainer.innerHTML = "";
        checkoutBtn.disabled = true;
        alertContainer.style.display = 'none';
        return;
    }
    
    // 2. Genera e visualizza l'HTML del carrello
    const { itemsHtml, summaryHtml } = generateCartHTML(cartJson.products, cartJson.personalizations, orderJson.order);
    cartItemsContainer.innerHTML = itemsHtml;
    summaryDetailsContainer.innerHTML = summaryHtml;
    setupRemoveButtons();

    // 3. Esegui il controllo di disponibilità
    const availabilityApiUrl = 'api/api-orders.php';
    const availabilityFormData = new FormData();
    availabilityFormData.append('action', 'check_availability');
    const availabilityResponse = await fetchData(availabilityApiUrl, availabilityFormData);

    // 4. Abilita/Disabilita il pulsante di checkout e mostra avvisi
    if (availabilityResponse && availabilityResponse.success) {
        // Disponibile
        alertContainer.style.display = 'none';
        checkoutBtn.disabled = false;
        checkoutBtn.classList.remove("disabled", "btn-secondary");
        checkoutBtn.classList.add("bg-white");
        checkoutBtn.onclick = () => { window.location.href = './checkout.php'; };
    } else {
        // Non disponibile
        let errorMessage = '<strong>Checkout non disponibile.</strong> Alcuni articoli non sono disponibili: ';
        if (availabilityResponse && availabilityResponse.unavailable_items?.length) {
            errorMessage += availabilityResponse.unavailable_items.map(item => item.name).join(', ') + '. Rimuovi o modifica gli articoli per procedere.';
        } else {
            errorMessage = availabilityResponse?.error || 'Errore durante la verifica della disponibilità. Riprova.';
        }
        alertContainer.innerHTML = errorMessage;
        alertContainer.style.display = 'block';
        checkoutBtn.disabled = true;
        checkoutBtn.classList.add("disabled", "btn-secondary");
        checkoutBtn.classList.remove("bg-white");
    }
}

// Avvia la funzione all'avvio della pagina
init();