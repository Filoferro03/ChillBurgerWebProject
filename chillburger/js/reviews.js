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

function generateReviewsHTML(reviews) { 
    let result = "";
    reviews.forEach(review => {
        result += `
            <div class="list-group-item mb-3 my-2">
                <h3>${review.titolo || 'Recensione'}</h3>
                <p>${review.nome} ${review.cognome} </p>
                <p class="star-rating">${generateStarRating(review.voto)}</p>
                <p>${review.commento || ''}</p>
                <div class="d-flex justify-content-between align-items-center mt-2">
                    <small class="text-muted">${formatDateFromTimestamp(review.timestamp_recensione) || 'N/D'} - ${formatTimeFromTimestamp(review.timestamp_recensione)}</small>
                    ${review.idordine ?
                        `<a href="public-order-items.php?idordine=${review.idordine}" class="btn btn-sm order-button" style="background-color: #7f5539; color: white;">Vedi Ordine</a>`
                        : ''
                    }
                </div>
            </div>`;
    });
    return result;
}

async function loadReviews(page = 1) { 
    currentReviewsPage = page; 

    const reviewsListContainer = document.getElementById('reviewsList');
    const paginationContainer = document.getElementById('reviewsPagination'); 

    if (!reviewsListContainer || !paginationContainer) {
        console.error("Elementi 'reviewsList' o 'reviewsPagination' non trovati.");
        return;
    }

    reviewsListContainer.innerHTML = '<p class="text-center">Caricamento recensioni...</p>';
    paginationContainer.innerHTML = '';

    try {
        const url = 'api/api-reviews.php';
        const formData = new FormData();
        formData.append('action', 'getall');
        formData.append('page', page); 
        const json = await fetchData(url, formData);
        const data = json.data;

        if (!data) {
            throw new Error("Risposta API non valida.");
        }

        if (data && data.reviews && typeof data.currentPage !== 'undefined' && typeof data.totalPages !== 'undefined') {

            if (data.reviews.length > 0) {
                reviewsListContainer.innerHTML = generateReviewsHTML(data.reviews);
            } else if (data.currentPage === 1) {
                reviewsListContainer.innerHTML = '<div class="list-group-item text-center">Nessuna recensione disponibile.</div>';
            } else {
                reviewsListContainer.innerHTML = '<div class="list-group-item text-center">Nessuna recensione trovata per questa pagina.</div>';
            }

            const paginationElement = createPaginationComponent(
                data.currentPage,
                data.totalPages,
                (newPage) => {
                    loadReviews(newPage); 
                }
            );

            if (paginationElement) {
                paginationContainer.appendChild(paginationElement);
            }

        } else {
             throw new Error("Formato risposta API non valido.");
        }

    } catch (error) {
        console.error('Errore nel caricamento delle recensioni:', error);
        reviewsListContainer.innerHTML = `<div class="list-group-item text-danger text-center">Errore nel caricamento delle recensioni: ${error.message}</div>`;
        paginationContainer.innerHTML = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
     if (document.getElementById('reviewsList') && document.getElementById('reviewsPagination')) {
         loadReviews(1); 
     }
});