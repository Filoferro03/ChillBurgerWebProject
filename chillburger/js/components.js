// js/components.js

/**
 * Crea e restituisce l'elemento DOM del componente di paginazione.
 * @param {number} currentPage - La pagina attualmente attiva.
 * @param {number} totalPages - Il numero totale di pagine.
 * @param {function} onPageClick - La funzione da chiamare quando si clicca su un link di pagina (riceve il numero di pagina come argomento).
 * @returns {HTMLElement|null} L'elemento NAV della paginazione o null se non necessaria.
 */
function createPaginationComponent(currentPage, totalPages, onPageClick) {
    if (totalPages <= 1) {
        return null; // Non serve paginazione per 1 o meno pagine
    }

    // Crea gli elementi base
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Navigazione'); // Etichetta generica, può essere sovrascritta se necessario

    const ul = document.createElement('ul');
    ul.className = 'pagination justify-content-center'; // Classi Bootstrap

    // Funzione helper per creare un singolo item di paginazione (link o disabilitato)
    const createPageItem = (pageNumber, label, isEnabled, isActive, ariaLabel) => {
        const li = document.createElement('li');
        li.className = `page-item ${!isEnabled ? 'disabled' : ''} ${isActive ? 'active' : ''}`;

        const a = document.createElement('a');
        a.className = 'page-link';
        a.href = '#';
        a.innerHTML = `<span aria-hidden="true">${label}</span>`; // Uso sicuro di innerHTML con label controllati
        if (ariaLabel) {
            a.setAttribute('aria-label', ariaLabel);
            if(isActive) a.setAttribute('aria-current', 'page');
        }

        if (isEnabled) {
            a.addEventListener('click', (event) => {
                event.preventDefault();
                onPageClick(pageNumber); // Chiama la callback
            });
        } else {
            a.setAttribute('tabindex', '-1');
            a.setAttribute('aria-disabled', 'true');
        }

        li.appendChild(a);
        return li;
    };

    // --- Costruzione dei Pulsanti ---

    // Pulsante "Precedente"
    ul.appendChild(createPageItem(
        currentPage - 1,
        '&laquo;',
        currentPage > 1,
        false,
        'Precedente'
    ));

    // Pulsanti Pagina Numerati (Logica Semplificata)
    // TODO: Implementare logica "..." per molte pagine, se necessario
    for (let i = 1; i <= totalPages; i++) {
        ul.appendChild(createPageItem(
            i,
            i,
            true,
            i === currentPage,
            `Vai a pagina ${i}`
        ));
    }

    // Pulsante "Successivo"
    ul.appendChild(createPageItem(
        currentPage + 1,
        '&raquo;',
        currentPage < totalPages,
        false,
        'Successivo'
    ));

    nav.appendChild(ul);
    return nav; // Ritorna l'elemento <nav> completo
}

