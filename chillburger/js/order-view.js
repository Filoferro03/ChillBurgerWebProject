let currentOrderIdToReview = null;
let currentReviewData = null;

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


/**
 * Genera l'HTML per visualizzare i dettagli di un ordine.
 * @param {object} data - L'oggetto contenente i dettagli dell'ordine,
 * che dovrebbe avere le proprietà: orderCustom, orderStock, totalPrice.
 * @returns {string} Una stringa HTML che rappresenta i dettagli dell'ordine.
 */
function displayOrderDetails(data) {
    let result = "";

    // ---- SEZIONE PRODOTTI PERSONALIZZATI ----
    if (data.orderCustom && data.orderCustom.length > 0) {
        // 1. Raggruppa le modifiche per idpersonalizzazione (che idealmente identifica un prodotto personalizzato unico nell'ordine)
        const customProductsMap = new Map();

        data.orderCustom.forEach(item => {

            if (!customProductsMap.has(item.idpersonalizzazione)) {
                customProductsMap.set(item.idpersonalizzazione, {
                    idpersonalizzazione: item.idpersonalizzazione,
                    productName: item.nomeprodotto || 'Nome Prodotto N/D',
                    productQuantity: item.quantita !== undefined ? item.quantita : 'N/D', // Quantità del prodotto personalizzato
                    productPrice: item.prezzo !== undefined ? parseFloat(item.prezzo).toFixed(2) : 'N/D', // Prezzo totale della personalizzazione
                    modifiche: [] // Array per le modifiche ingredienti
                });
            }
            // Aggiungi la modifica specifica a questo prodotto personalizzato
            customProductsMap.get(item.idpersonalizzazione).modifiche.push({
                ingredientName: item.nomeingrediente || '',
                action: item.azione || ''
            });
        });

        // 2. Itera sulla mappa dei prodotti personalizzati raggruppati e genera l'HTML
        customProductsMap.forEach(customProduct => {
            result += `
                <div class="card shadow-sm">
                    <div class="card-body d-flex flex-row justify-content-between align-items-center">
                        <div class="d-flex flex-column w-25">
                        <h5 class="card-title">${customProduct.productName}</h5>`;

            if (customProduct.modifiche.length > 0 && customProduct.modifiche[0].ingredientName != '') {
                result += `<ul class="list-unstyled ms-3">`;
            }

            if (customProduct.modifiche.length > 0 && customProduct.modifiche[0].ingredientName != '') {
                customProduct.modifiche.forEach(mod => {

                    let prefix = '';
                    let actionText = mod.action; // Testo dell'azione da visualizzare (es. 'aggiunto', 'rimosso')

                    if (mod.action === 'aggiunto') {
                        prefix = '+ ';
                    } else if (mod.action === 'rimosso') {
                        prefix = '- ';
                    }
                    result += `<li>${prefix}${mod.ingredientName}</li>`;
                });
                result += `
                        </ul>
                        </div>
                        <p class="card-text m-0">
                            <strong>Quantità:</strong> ${customProduct.productQuantity}
                        </p>
                        <p class="card-text">
                            €${customProduct.productPrice}
                        </p>
                    </div>
                </div>`;
            } else {
                result += `</div>
                        <p class="card-text mb-1">
                            <strong>Quantità:</strong> ${customProduct.productQuantity}
                        </p>
                        <p class="card-text">
                            € ${customProduct.productPrice}
                        </p>
                    </div>
                </div>`;
            }
        });
    }

    // ---- SEZIONE PRODOTTI STANDARD ----
    if (data.orderStock && data.orderStock.length > 0) {
        data.orderStock.forEach(stockElement => {
            const productName = stockElement.nome || 'Nome Prodotto N/D';
            const quantity = stockElement.quantita !== undefined ? stockElement.quantita : 'N/D';
            const price = stockElement.prezzo !== undefined ? parseFloat(stockElement.prezzo).toFixed(2) : 'N/D';

            result += `
                <div class="card shadow-sm">
                    <div class="card-body d-flex flex-row justify-content-between align-items-center">
                        <h5 class="card-title w-25">${productName}</h5>
                        <p class="card-text mb-1">
                            <strong>Quantità:</strong> ${quantity}
                        </p>
                        <p class="card-text">
                            € ${price}
                        </p>
                    </div>
                </div>`;
        });
    }

    result += `<div class="card-body d-flex flex-row justify-content-between align-items-center">
                        <h5 class="card-title w-25">Spedizione:</h5>
                        <p class="card-text mb-1">
                        </p>
                        <p class="card-text">
                            € 2.50
                        </p>
                    </div>
                `;

    // ---- PREZZO TOTALE ----
    if (data.totalPrice !== undefined && data.totalPrice !== null) {
        const totalPriceFormatted = parseFloat(data.totalPrice).toFixed(2);
        result += `
            <div class="text-end mt-4">
                <h4><strong>Totale: €${totalPriceFormatted}</strong></h4>
            </div>`;
    } else {
        result += '<p class="text-muted mt-4 text-end">Prezzo totale non disponibile.</p>';
    }

    return result;
}

async function loadOrderDetails() {
    const orderDetailsContainer = document.getElementById('orderDetailsContainer');
    if (!orderDetailsContainer) {
        console.error("Elemento 'orderDetailsContainer' non trovato nel DOM.");
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('idordine');

    currentOrderIdToReview = orderId;

    if (!orderId) {
        orderDetailsContainer.innerHTML = "<p class='text-center text-danger'>ID ordine non trovato nell'URL.</p>";
        return;
    }

    orderDetailsContainer.innerHTML = "<p class='text-center'>Caricamento dettagli ordine...</p>";

    // L'action viene mandata via POST con formData, idordine via GET nell'URL
    const apiUrl = `api/api-orders.php?idordine=${orderId}`; // idordine via GET
    const formData = new FormData();
    formData.append('action', 'getDetails'); // action via POST

    const json = await fetchData(apiUrl, formData);

    if (json && json.success && json.data) {
        orderDetailsContainer.innerHTML = displayOrderDetails(json.data);
    } else {
        // Usa il messaggio di errore dall'API se disponibile, altrimenti un messaggio generico
        const errorMessage = json && json.error ? json.error : 'Dati non disponibili o si è verificato un errore.';
        orderDetailsContainer.innerHTML = `<p class='text-center text-danger'>Errore nel caricamento dei dettagli dell'ordine: ${errorMessage}</p>`;
    }

    await getReview(orderId);
}

async function getReview(orderid) {
    const url = "api/api-reviews.php";
    const formData = new FormData();
    formData.append('action', 'getbyorder');
    formData.append('idordine', orderid);

    const json = await fetchData(url, formData);

    const reviewContainer = document.getElementById('reviewContainer');

    if (json.success) {
        const reviewData = json.data[0];
        currentReviewData = reviewData;
        reviewContainer.innerHTML += `<div class = "d-flex justify-content-between mt-2 ms-3 me-5"> 
                        <h3 class="card-title">${reviewData.titolo}</h3>
                        <p class="star-rating">${generateStarRating(reviewData.voto)}</p> 
                    </div>
                    <p class="card-text mt-2 text-start ps-3 pe-3">${reviewData.commento}</p>
                    <div class= "d-flex justify-content-evenly w-50 m-auto">
                        <button class="btn order-button my-2 mx-auto edit-review-button" id="editReviewButton" data-bs-toggle="modal" data-bs-target="#reviewModal">Modifica</button>
                        <button class="btn btn-danger my-2 mx-auto" id="cancelReviewButton" data-bs-toggle="modal" data-bs-target="#deleteModal">Elimina</button>
                    </div>`;
    } else {
        reviewContainer.innerHTML += `<p class="text-center mt-2">Non hai ancora lasciato nessuna recensione per questo ordine...</p>
        <button class="btn order-button my-2 mx-auto" id="addReviewButton" data-bs-toggle="modal" data-bs-target="#reviewModal">Lascia una Recensione</button>`;
    }

} 

async function submitReview(orderId, title, rating, comment, action) {
    const url = "api/api-reviews.php";
    const formData = new FormData();
    formData.append('action', action);
    formData.append('idordine', orderId);
    formData.append('review_title', title);
    formData.append('review_rating', rating);
    formData.append('review_comment', comment);

    try {
        const json = await fetchData(url, formData);

        if (json && json.success) {
            const reviewModalElement = document.getElementById('reviewModal');
            const reviewModal = bootstrap.Modal.getInstance(reviewModalElement);
            if (reviewModal) {
                reviewModal.hide();
            }
            document.getElementById('reviewForm').reset(); // Reset form fields
            window.location.reload(); // Ricarica la pagina dopo aver inviato la recensione
        } else {
            alert("Errore nell'invio della recensione: " + (result.error || "Dettagli non disponibili."));
        }
    } catch (error) {
        console.error("Errore invio recensione:", error);
        alert("Errore durante l'invio della recensione.");
    } 
}

function validateReviewForm() {
    let isValid = true;
    const titleInput = document.getElementById('review-title');
    const ratingInput = document.getElementById('review-rating');

    const titleError = document.getElementById('review-title-error');
    const ratingError = document.getElementById('review-rating-error');

    // Reset stati di errore
    titleInput.classList.remove('is-invalid');
    ratingInput.classList.remove('is-invalid');
    titleError.textContent = '';
    ratingError.textContent = '';

    // Validazione Titolo
    if (!titleInput.value.trim()) {
        titleInput.classList.add('is-invalid');
        titleError.textContent = 'Il titolo è obbligatorio.';
        isValid = false;
    }

    // Validazione Voto
    const ratingValue = parseInt(ratingInput.value, 10);
    if (!ratingInput.value || isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
        ratingInput.classList.add('is-invalid');
        ratingError.textContent = 'Il voto deve essere un numero tra 1 e 5.';
        isValid = false;
    }

    return isValid;
}

async function deleteReview (orderId) {
    const api = "api/api-reviews.php";
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('idordine', orderId);

    try {
        const json = await fetchData(api, formData);
        if (json && json.success) {
            window.location.reload(); // Ricarica la pagina dopo aver cancellato la recensione
        } else {
            alert("Errore nella cancellazione della recensione: " + (result.error || "Dettagli non disponibili."));
        }
    } catch (error) {
        console.error("Errore nella cancellazione della recensione:", error);
        alert("Errore durante la cancellazione della recensione.");
    }
}

// Chiamata per caricare i dettagli dell'ordine quando il DOM è pronto
document.addEventListener('DOMContentLoaded', async function () {
    await loadOrderDetails(); // Carica i dettagli dell'ordine quando il DOM è pronto

    let action = 'submit'; // Default action, will be updated based on button clicked

    const reviewModalP = document.querySelector('#reviewModal .modal-body p'); // Target the <p> tag in modal body
    const confirmButtonText = document.getElementById('confirm-review-button');
    const reviewForm = document.getElementById('reviewForm');
    const titleInput = document.getElementById('review-title');
    const ratingInput = document.getElementById('review-rating');
    const textareaInput = document.getElementById('review-textarea');
    const titleError = document.getElementById('review-title-error');
    const ratingError = document.getElementById('review-rating-error');


    // Function to clear validation and reset form for "Add"
    function setupModalForAdd() {
        action = 'submit';
        if (reviewForm) reviewForm.reset();
        if (titleInput) titleInput.classList.remove('is-invalid');
        if (ratingInput) ratingInput.classList.remove('is-invalid');
        if (titleError) titleError.textContent = '';
        if (ratingError) ratingError.textContent = '';
        if (reviewModalP) reviewModalP.textContent = 'Lascia una recensione per questo ordine:'; //
        if (confirmButtonText) confirmButtonText.textContent = 'Inserisci';
    }

    // Function to clear validation and populate form for "Edit"
    function setupModalForEdit() {
        action = 'update';
        if (currentReviewData) {
            if (titleInput) titleInput.value = currentReviewData.titolo || '';
            if (ratingInput) ratingInput.value = currentReviewData.voto || '';
            if (textareaInput) textareaInput.value = currentReviewData.commento || '';

            if (titleInput) titleInput.classList.remove('is-invalid');
            if (ratingInput) ratingInput.classList.remove('is-invalid');
            if (titleError) titleError.textContent = '';
            if (ratingError) ratingError.textContent = '';

            if (reviewModalP) reviewModalP.textContent = 'Modifica la tua recensione:';
            if (confirmButtonText) confirmButtonText.textContent = 'Aggiorna';
        } else {
            console.error("Dati della recensione non disponibili per la modifica. Reimpostazione per l'aggiunta.");
            setupModalForAdd(); // Fallback to add mode
        }
    }

   const reviewContainer = document.getElementById('reviewContainer');
    if (reviewContainer) {
        reviewContainer.addEventListener('click', (event) => {
            if (event.target.matches('#addReviewButton')) {
                setupModalForAdd();
            } else if (event.target.matches('.edit-review-button')) {
                setupModalForEdit();
            }
        });
    }


    const confirmReviewButton = document.getElementById('confirm-review-button');
    if (confirmReviewButton) {
        confirmReviewButton.addEventListener('click', () => {
            if (!currentOrderIdToReview) {
                alert("Errore: ID ordine non specificato per la recensione."); // Questo è un errore di sistema
                return;
            }

            if (validateReviewForm()) { // Chiama la funzione di validazione
                // Se la validazione passa, prendi i valori e invia
                const title = document.getElementById('review-title').value.trim();
                const rating = document.getElementById('review-rating').value;
                const comment = document.getElementById('review-textarea').value.trim();
                submitReview(currentOrderIdToReview, title, rating, comment, action);
            }
        });
    }

    const cancelReviewModalButton = document.getElementById('cancel-review-button'); // "No, grazie" button in review modal
    if (cancelReviewModalButton) {
        cancelReviewModalButton.addEventListener('click', () => {
            if (reviewForm) reviewForm.reset();
            if (titleInput) titleInput.classList.remove('is-invalid');
            if (ratingInput) ratingInput.classList.remove('is-invalid');
            if (titleError) titleError.textContent = '';
            if (ratingError) ratingError.textContent = '';
            // Reset modal text to default (add) if needed, or leave as is until next open trigger
             if (reviewModalP) reviewModalP.textContent = 'Lascia una recensione per questo ordine:';
             if (confirmButtonText) confirmButtonText.textContent = 'Inserisci';
        });
    }

    const deleteButton = document.getElementById('delete-button');
    if (deleteButton) {
        deleteButton.addEventListener('click', async () => {
            deleteReview(currentOrderIdToReview);
        }
    )};
});

 