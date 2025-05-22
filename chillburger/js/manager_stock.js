document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/api-manager-stock-main.php')
      .then(r => r.json())
      .then(data => {
        if (!data.success) {
          alert('Errore nel caricamento prodotti');
          return;
        }
  
        const inStockGrid = document.getElementById('ordersGrid');
        const outStockGrid = document.getElementById('historyGrid');
  
        // Funzione per creare il markup bootstrap di una card prodotto
        function createProductCard(p) {
          const div = document.createElement('div');
          div.className = 'col-6 col-md-4 col-lg-3';
  
          div.innerHTML = `
            <a href="product-details.php?id=${p.idprodotto}" class="text-decoration-none">
              <div class="card h-100 text-center shadow-sm hover-up">
                <img src="./resources/products/${p.image}" class="card-img-top" alt="${p.nome}">
                <div class="card-body">
                  <h5 class="card-title">${p.nome}</h5>
                  <p class="card-text small text-muted">
                    Prezzo: €${Number(p.prezzo).toFixed(2)}<br>
                    Disponibilità: ${p.disponibilita > 0 ? p.disponibilita + ' unità' : '<span class="text-danger fw-bold">Esaurito</span>'}
                  </p>
                </div>
              </div>
            </a>
          `;
          return div;
        }
  
        // Popola prodotti in stock
        inStockGrid.innerHTML = '';
        data.inStock.forEach(p => {
          inStockGrid.appendChild(createProductCard(p));
        });
  
        // Popola prodotti out of stock
        outStockGrid.innerHTML = '';
        data.outStock.forEach(p => {
          outStockGrid.appendChild(createProductCard(p));
        });
      })
      .catch(() => {
        alert('Errore nella comunicazione con il server');
      });
  });
  