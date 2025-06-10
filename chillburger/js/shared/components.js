function createPaginationComponent(currentPage, totalPages, onPageClick, visiblePages = 5) {
    if (totalPages <= 1) {
        return null; 
    }

    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Navigazione pagine'); 
    const ul = document.createElement('ul');
    ul.className = 'pagination justify-content-center';

    const createPageItem = (pageNumber, label, isEnabled, isActive, ariaLabel, isEllipsis = false) => {
        const li = document.createElement('li');
        li.className = `page-item ${!isEnabled && !isEllipsis ? 'disabled' : ''} ${isActive ? 'active' : ''}`;

        if (isEllipsis) {
            const span = document.createElement('span');
            span.className = 'page-link';
            span.innerHTML = '...';
            span.setAttribute('aria-hidden', 'true');
            li.appendChild(span);
        } else {
            const a = document.createElement('a');
            a.className = 'page-link';
            a.innerHTML = (typeof label === 'number') ? label : `<span aria-hidden="true">${label}</span>`;


            if (ariaLabel) {
                a.setAttribute('aria-label', ariaLabel);
                if (isActive) a.setAttribute('aria-current', 'page');
            }

            if (isEnabled) {
                a.href = '#'; 
                a.addEventListener('click', (event) => {
                    event.preventDefault();
                    if (currentPage !== pageNumber) { 
                        onPageClick(pageNumber);
                    }
                });
            } else {
                a.setAttribute('tabindex', '-1');
                a.setAttribute('aria-disabled', 'true');
            }
            li.appendChild(a);
        }
        return li;
    };

    const createEllipsisItem = () => createPageItem(0, '...', false, false, undefined, true);

    ul.appendChild(createPageItem(
        currentPage - 1,
        '&laquo;', 
        currentPage > 1,
        false,
        'Precedente'
    ));

    if (totalPages <= visiblePages) {
        for (let i = 1; i <= totalPages; i++) {
            ul.appendChild(createPageItem(i, i, true, i === currentPage, `Vai a pagina ${i}`));
        }
    } else {
        const halfVisible = Math.floor((visiblePages - 2) / 2); 
        let startPage, endPage;

        if (currentPage <= halfVisible + 1) {
             startPage = 1;
             endPage = Math.min(visiblePages - 1, totalPages); 
        } else if (currentPage >= totalPages - halfVisible) {
            endPage = totalPages;
             startPage = Math.max(totalPages - (visiblePages - 2), 1); 
        } else {
             startPage = currentPage - halfVisible;
             endPage = currentPage + halfVisible;
        }

        ul.appendChild(createPageItem(1, 1, true, 1 === currentPage, `Vai a pagina 1`));

        if (startPage > 2) {
            ul.appendChild(createEllipsisItem());
        }

        const firstPageToShow = Math.max(2, startPage);
        const lastPageToShow = Math.min(totalPages - 1, endPage);

        for (let i = firstPageToShow; i <= lastPageToShow; i++) {
             ul.appendChild(createPageItem(i, i, true, i === currentPage, `Vai a pagina ${i}`));
        }

        if (endPage < totalPages - 1) {
            ul.appendChild(createEllipsisItem());
        }

        if (totalPages > 1) {
            ul.appendChild(createPageItem(totalPages, totalPages, true, totalPages === currentPage, `Vai a pagina ${totalPages}`));
        }
    }

    ul.appendChild(createPageItem(
        currentPage + 1,
        '&raquo;', 
        currentPage < totalPages,
        false,
        'Successivo'
    ));

    nav.appendChild(ul);
    return nav;
}