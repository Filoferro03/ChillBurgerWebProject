// js/reviews.js

// Mantieni la variabile per la pagina corrente delle recensioni
let currentReviewsPage = 1;

/**
 * Genera HTML per la visualizzazione delle stelle di valutazione
 * @param {number} rating - Valutazione da 0 a 5
 * @returns {string} HTML delle stelle
 */
function generateStarRating(rating) {
    const fullStar = '<i class="fas fa-star"></i>';
    const emptyStar = '<i class="far fa-star"></i>';
    let stars = '';
    const maxStars = 5;
    const fullStarsCount = Math.round(rating); // Arrotonda per gestire mezzi voti se necessario
    for (let i = 0; i < fullStarsCount; i++) {
        stars += fullStar;
    }
    const emptyStarsCount = maxStars - fullStarsCount;
    for (let i = 0; i < emptyStarsCount; i++) {
        stars += emptyStar;
    }
    return stars;
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
    console.log(`Caricamento recensioni - Pagina: ${page}`);

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
        // Chiama l'API per ottenere le recensioni per la pagina specificata
        // Nota: l'API get-reviews.php usa GET, non serve fetchData qui
        const response = await fetch(`api/get-reviews.php?page=${page}`);
        if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status}`);
        }
        const data = await response.json();

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

// Chiamata iniziale per caricare la prima pagina di recensioni
// Assicurati che questo venga eseguito dopo che il DOM è pronto
// Puoi metterlo dentro un listener DOMContentLoaded se questo script viene caricato nell'head,
// o lasciarlo così se viene caricato alla fine del body.
// Per coerenza con profile.js, usiamo DOMContentLoaded:
document.addEventListener('DOMContentLoaded', () => {
     // Verifica se siamo sulla pagina delle recensioni controllando l'esistenza dei contenitori
     if (document.getElementById('reviewsList') && document.getElementById('reviewsPagination')) {
         loadReviews(1); // Carica la prima pagina
     }
});