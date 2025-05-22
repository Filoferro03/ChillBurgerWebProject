let currentReviewsPage = 1;

async function fetchData(url, formData) {
    try {
        const response = await fetch(url, { method: "POST", body: formData });
        if (!response.ok) { throw new Error(`Response status: ${response.status}`); }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Errore fetchData:", error.message);
        return null;
    }
}

/**
 * Genera HTML per le singole recensioni
 * @param {Array} reviews - Array di recensioni
 * @returns {string} HTML delle recensioni
 */
function generateReviewsHTML(reviews) { // Rinominata per chiarezza
    let result = "";
    reviews.forEach(review => {
        result += `
            <div class="list-group-item mb-3 ms-4">
                <h3>${review.titolo || 'Recensione'}</h3>
                <p class="star-rating">${generateStarRating(review.voto)}</p>
                <p>${review.commento || ''}</p>
                <small class="text-muted">${formatDateFromTimestamp(review.timestamp_recensione) || 'N/D'} - ${formatTimeFromTimestamp(review.timestamp_recensione)}</small>
            </div>`;
    });
    return result;
}

/**
 * Carica le recensioni dalla API e le visualizza, usando il componente di paginazione.
 */
async function loadReviews(page = 1) { // Accetta la pagina come argomento
    currentReviewsPage = page; // Aggiorna la pagina corrente

    // Seleziona i contenitori nel DOM
    const reviewsListContainer = document.getElementById('reviewsList');
    const paginationContainer = document.getElementById('reviewsPagination'); // Contenitore per la paginazione

    if (!reviewsListContainer || !paginationContainer) {
        console.error("Elementi 'reviewsList' o 'reviewsPagination' non trovati.");
        return;
    }

    // Opzionale: mostra un indicatore di caricamento
    reviewsListContainer.innerHTML = '<p class="text-center">Caricamento recensioni...</p>';
    paginationContainer.innerHTML = ''; // Pulisci paginazione durante il caricamento

    try {
        const url = 'api/api-reviews.php';
        const formData = new FormData();
        formData.append('action', 'getall');
        formData.append('page', page); // Passa la pagina come parametro
        const json = await fetchData(url, formData);
        const data = json.data;

        if (!data) {
            throw new Error("Risposta API non valida.");
        }

        // Verifica la risposta
        if (data && data.reviews && typeof data.currentPage !== 'undefined' && typeof data.totalPages !== 'undefined') {

            // Mostra le recensioni
            if (data.reviews.length > 0) {
                reviewsListContainer.innerHTML = generateReviewsHTML(data.reviews);
            } else if (data.currentPage === 1) {
                reviewsListContainer.innerHTML = '<div class="list-group-item text-center">Nessuna recensione disponibile.</div>';
            } else {
                reviewsListContainer.innerHTML = '<div class="list-group-item text-center">Nessuna recensione trovata per questa pagina.</div>';
            }

            // Usa il componente per creare la paginazione
            const paginationElement = createPaginationComponent(
                data.currentPage,
                data.totalPages,
                (newPage) => { // Funzione callback per il click sulla pagina
                    loadReviews(newPage); // Ricarica le recensioni per la nuova pagina
                }
            );

            // Aggiungi la paginazione al DOM (se necessario)
            if (paginationElement) {
                paginationContainer.appendChild(paginationElement);
            }

        } else {
             throw new Error("Formato risposta API non valido.");
        }

    } catch (error) {
        console.error('Errore nel caricamento delle recensioni:', error);
        reviewsListContainer.innerHTML = `<div class="list-group-item text-danger text-center">Errore nel caricamento delle recensioni: ${error.message}</div>`;
        paginationContainer.innerHTML = ''; // Assicurati che la paginazione sia vuota in caso di errore
    }
}

document.addEventListener('DOMContentLoaded', () => {
     // Verifica se siamo sulla pagina delle recensioni controllando l'esistenza dei contenitori
     if (document.getElementById('reviewsList') && document.getElementById('reviewsPagination')) {
         loadReviews(1); // Carica la prima pagina
     }
});