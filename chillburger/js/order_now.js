document.addEventListener('DOMContentLoaded', () => {
    const menuGrid = document.getElementById('menuGrid');
    const filterButtons = document.querySelectorAll('.btn-filter');
    let prodotti = [];
  
    // Crea card prodotto bootstrap
    function createCard(p) {
      return `
        <div class="col-6 col-md-4 col-lg-3 menu-item" data-category="${p.categoria.toLowerCase()}">
          <div class="card h-100 text-center shadow-sm hover-up">
            <img src="./resources/products/${p.image}" class="card-img-top" alt="${p.nome}">
            <div class="card-body">
              <h5 class="card-title">${p.nome}</h5>
              <p class="card-text small text-muted">€${Number(p.prezzo).toFixed(2)}</p>
            </div>
          </div>
        </div>
      `;
    }
  
    // Mostra i prodotti filtrati
    function showProducts(category) {
      let html = '';
      prodotti.forEach(p => {
        if (category === 'all' || p.categoria.toLowerCase() === category) {
          html += createCard(p);
        }
      });
      menuGrid.innerHTML = html;
    }
  
    // Gestione click filtri
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        showProducts(btn.dataset.category);
      });
    });
  
    // Carica dati da API
    fetch('/api/api-order-now.php')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          prodotti = data.data;
          showProducts('all');
        } else {
          menuGrid.innerHTML = '<p class="text-center text-danger">Errore nel caricamento prodotti.</p>';
        }
      })
      .catch(() => {
        menuGrid.innerHTML = '<p class="text-center text-danger">Errore di comunicazione con il server.</p>';
      });
  });
  