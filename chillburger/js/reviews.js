let currentPage = 1; // Pagina corrente
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
        
    const fullStarsCount = rating;
    for (let i = 0; i < fullStarsCount; i++) {
        stars += fullStar;
    }
    
    // Add empty stars to fill up to 5
    const emptyStarsCount = maxStars - fullStarsCount;
    for (let i = 0; i < emptyStarsCount; i++) {
        stars += emptyStar;
    }
    
    return stars;
}

/**
 * Genera HTML per le recensioni
 * @param {Array} reviews - Array di recensioni
 * @returns {string} HTML delle recensioni
 */
function generateReviews(reviews) {
    let result = "";

    for (let i=0; i<reviews.length; i++){
        let review =`
                <div class="list-group-item mb-3 ms-4">
                    <h3>${reviews[i]["titolo"]}</h3>
                    <p class="star-rating">${generateStarRating(reviews[i]["voto"])}</p>
                    <p>${reviews[i]["commento"]}</p>
                </div>`;
        result += review;
    }
    
    return result;
}

/**
 * Genera i controlli di paginazione
 * @param {number} totalPages - Numero totale di pagine
 */
function generatePagination(totalPages) {
    // Se c'è solo una pagina, non mostrare la paginazione
    if (totalPages <= 1) {
        document.getElementById('reviewsPagination').innerHTML = '';
        return;
    }

    let paginationHTML = '';

    // Pulsante "Precedente"
    paginationHTML += `
        <button class="btn btn-outline-dark mx-1 ${currentPage === 1 ? 'disabled' : ''}"
                ${currentPage === 1 ? 'disabled' : ''} onclick="currentPage--; loadReviews();">
            &laquo; Precedente
        </button>
    `;

    // Numeri di pagina
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <button class="btn mx-1 ${i === currentPage ? 'btn-dark disabled' : 'btn-outline-dark'}"
                    onclick="currentPage = ${i}; loadReviews();">
                ${i}
            </button>
        `;
    }

    // Pulsante "Successivo"
    paginationHTML += `
        <button class="btn btn-outline-dark mx-1 ${currentPage === totalPages ? 'disabled' : ''}"
                ${currentPage === totalPages ? 'disabled' : ''} onclick="currentPage++; loadReviews();">
            Successivo &raquo;
        </button>
    `;

    document.getElementById('reviewsPagination').innerHTML = paginationHTML;
}
/**
 * Carica le recensioni dalla API e le visualizza
 */
async function loadReviews() {
    try {
        // Aggiungiamo il parametro page alla richiesta
        const response = await fetch(`api/get-reviews.php?page=${currentPage}`);
        if (!response.ok) {
            throw new Error('Errore nella richiesta: ' + response.status);
        }
        const data = await response.json();
        
        // Estrai le recensioni e il conteggio totale
        const reviews = data.reviews  // Supporta sia il nuovo formato che quello vecchio
        const totalPages = data.totalPages;
        
        // Genera l'HTML delle recensioni
        const reviewsHTML = generateReviews(reviews);
        
        // Inserisce le recensioni nel DOM
        document.getElementById('reviewsList').innerHTML = reviewsHTML;
        
        // Se non ci sono recensioni, mostra un messaggio
        if (reviews.length === 0) {
            document.getElementById('reviewsList').innerHTML = 
                '<div class="list-group-item">Nessuna recensione disponibile.</div>';
        }
        
        // Genera la paginazione
        generatePagination(totalPages);
        
    } catch (error) {
        console.error('Errore nel caricamento delle recensioni:', error.message);
        document.getElementById('reviewsList').innerHTML = 
            '<div class="list-group-item text-danger">Errore nel caricamento delle recensioni.</div>';
    }
}

loadReviews();