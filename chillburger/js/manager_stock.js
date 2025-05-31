document.addEventListener('DOMContentLoaded', () => {
  const LOW_STOCK_THRESHOLD = 10;
  let allProducts = [];
  let currentFiltered = [];
  let currentPage     = 1;
  const PRODUCTS_PER_PAGE = 10;
  const qtyModal      = new bootstrap.Modal(document.getElementById('qtyModal'));
  const modalTitle    = document.getElementById('modalProductName');
  const qtyInput      = document.getElementById('qtyInput');
  const incrementBtn  = document.getElementById('incrementBtn');
  const decrementBtn  = document.getElementById('decrementBtn');
  const saveQtyBtn    = document.getElementById('saveQtyBtn');

  let currentId, currentType;

  qtyInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();   // blocca eventuali submit di form
      saveQtyBtn.click();   // richiama la logica già presente
    }
  });


  async function fetchData(url, formData) {
    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData
      });
      if (!response.ok) {
        throw new Error(`Errore HTTP: ${response.status}`);
      }
      const json = await response.json();
      if (!json.success) {
        throw new Error(json.error || "Errore sconosciuto dal server.");
      }
      return json.data;  // { ingredients: [...], drinks: [...] }
    } catch (error) {
      console.error("Errore durante la fetch:", error.message);
      return null;
    }
  }

  async function updateIngredientStock(idingrediente, quantita) {
    const url = 'api/api-manager-stock.php';
    const formData = new FormData();
    formData.append('action', 'updateingredientquantity');
    formData.append('idingrediente', idingrediente);
    formData.append('quantita', quantita);  // ⬅️ corretto

    // TODO all'inizio era 1000
    await fetchData(url, formData);
    setTimeout(getProductsStock, 5);
  }

  async function updateDrinkStock(idprodotto, quantita) {
    const url = 'api/api-manager-stock.php';
    const formData = new FormData();
    formData.append('action', 'updatedrinkquantity');
    formData.append('idprodotto', idprodotto);
    formData.append('quantita', quantita);  // ⬅️ corretto

    await fetchData(url, formData);
    // TODO all'inizio era 1000
    setTimeout(getProductsStock, 5);
  }

  const IMG_DIR = "/ChillBurgerWebProject/chillburger/resources/ingredients";

  function statusClass(q) {
    return q === 0 ? "text-danger"
        : q <= LOW_STOCK_THRESHOLD ? "text-warning"
        :          "text-success";
  }
  function statusLabel(q) {
    return q === 0 ? "Esaurito"
        : q <= LOW_STOCK_THRESHOLD ? "Bassa Scorta"
        :          "In Magazzino";
  }

  function generateProducts(products) {
    const tbody = document.getElementById("stock-table");
    if (!tbody) return;
    tbody.innerHTML = "";

    products.forEach(p => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="py-3 px-4">
          <div class="d-flex align-items-center">
            <img class="rounded-circle object-fit-cover me-3" style="width:40px;height:40px"
                src="${IMG_DIR}/${p.image}" alt="${p.nome}">
            <div>
              <div class="fw-medium text-dark">${p.nome}</div>
              <div class="small text-secondary">${p.categoria}</div>
            </div>
          </div>
        </td>
        <td class="py-3 px-4 text-dark fw-bold">${p.giacenza}</td>
        <td class="py-3 px-4 fw-bold ${statusClass(p.giacenza)}">
          ${statusLabel(p.giacenza)}
        </td>
        <td class="py-3 px-4">
          <button class="btn btn-sm btn-outline-success me-2 btn-plus"
                  data-id="${p.idprodotto}" data-type="${p.tipo}">+</button>
          <button class="btn btn-sm btn-outline-danger btn-minus"
                  data-id="${p.idprodotto}" data-type="${p.tipo}">−</button>
        </td>
        <td class="py-3 px-4">
          <a href="#" class="changeQty" data-id="${p.idprodotto}"
          data-type="${p.tipo}" data-name="${p.nome}"
          data-qty="${p.giacenza}">Modifica Quantità</a>
        </td>`;

      // '+' → +1
      tr.querySelector('.btn-plus').addEventListener('click', async e => {
        e.preventDefault();
        const { id, type } = e.currentTarget.dataset;
        if (type === "bevanda") await updateDrinkStock(id, -1);
        else                await updateIngredientStock(id, -1);
      });

      // '−' → -1
      tr.querySelector('.btn-minus').addEventListener('click', async e => {
        e.preventDefault();
        const { id, type } = e.currentTarget.dataset;
        if (type === "bevanda") await updateDrinkStock(id, +1);
        else                await updateIngredientStock(id, +1);
      });

      // “Modifica Quantità” prompt esistente
      tr.querySelector('.changeQty').addEventListener('click', e => {
        e.preventDefault();
        const link = e.currentTarget;
        currentId   = link.dataset.id;
        currentType = link.dataset.type;
        const name  = link.dataset.name;
        const qty   = parseInt(link.dataset.qty, 10);
      
        modalTitle.textContent = name;
        qtyInput.value         = qty;
      
        qtyModal.show();
      });

      
      

      tbody.appendChild(tr);
    });
  }


  function updateSummaryCards(products) {
    const total     = products.length;
    const outStock  = products.filter(p => p.giacenza === 0).length;
    const lowStock  = products.filter(p => p.giacenza > 0 && p.giacenza <= LOW_STOCK_THRESHOLD).length;
    const inStock   = products.filter(p => p.giacenza > LOW_STOCK_THRESHOLD).length;

    document.getElementById('card-total').textContent    = total;
    document.getElementById('card-outstock').textContent = outStock;
    document.getElementById('card-lowstock').textContent = lowStock;
    document.getElementById('card-instock').textContent  = inStock;
  }

  incrementBtn.addEventListener('click', () => {
    qtyInput.value = parseInt(qtyInput.value,10) + 1;
  });
  decrementBtn.addEventListener('click', () => {
    if (qtyInput.value > 0) {
      qtyInput.value = parseInt(qtyInput.value,10) - 1;
    }
  });

  saveQtyBtn.addEventListener('click', async () => {
    const newQty = parseInt(qtyInput.value, 10);
    qtyModal.hide();

    // Calcola delta rispetto a giacenza
    const oldQty = parseInt(document
      .querySelector(`.changeQty[data-id="${currentId}"]`)
      .dataset.qty, 10);
    const delta = newQty - oldQty;

    if (!delta) return;

    // Ottimistic UI update (opzionale)
    const tr = document.querySelector(`.changeQty[data-id="${currentId}"]`)
                  .closest('tr');
    const qtyCell   = tr.querySelector('td:nth-child(2)');
    const statusTd  = tr.querySelector('td:nth-child(3)');
    qtyCell.textContent = newQty;
    statusTd.textContent = statusLabel(newQty);
    statusTd.className   = `py-3 px-4 fw-bold ${statusClass(newQty)}`;

    // Aggiorna il data-qty del link
    tr.querySelector(`.changeQty[data-id="${currentId}"]`)
      .dataset.qty = newQty;

    // Chiamata al server
    if (currentType === 'bevanda') {
      await updateDrinkStock(currentId, -delta);
    } else {
      await updateIngredientStock(currentId, -delta);
    }
  });

  async function getProductsStock() {
    const url = "api/api-manager-stock.php";
    const formData = new FormData();
    formData.append("action", "getallproducts");

    const data = await fetchData(url, formData);
    console.log("prodotti:" , data);
    if (!data) return;

    // Estrazione e mappatura ingredienti
    const ingredients = (data.ingredients || []).map(i => ({
      idprodotto: i.idingrediente,
      nome:       i.nome,
      categoria:  "Ingrediente",
      image:      i.image,
      giacenza:   i.giacenza,
      tipo:       "ingrediente"
    }));

    // Estrazione e mappatura bevande
    const drinks = (data.drinks || []).map(d => ({
      idprodotto: d.idprodotto,
      nome:       d.nome,
      categoria:  "Bevanda",
      image:      d.image,
      giacenza:   d.disponibilita,
      tipo:       "bevanda"
    }));

    // Unione in un unico array
    const products = [...ingredients, ...drinks];
    allProducts = products; 

    console.log("products array unito:", products, Array.isArray(products));  // dovrebbe essere true

    updateSummaryCards(allProducts);
    applyFilters();
  }

  // Prende il <select>
  const categoryFilter = document.getElementById('category-filter');
  const statusFilter   = document.getElementById('status-filter');

  // listener
  categoryFilter.addEventListener('change', applyFilters);
  statusFilter.addEventListener('change', applyFilters);

  function applyFilters() {
    const cat  = categoryFilter.value;
    const stat = statusFilter.value;
    let filtered = allProducts;

    if (cat) {
      filtered = filtered.filter(p => p.tipo === cat);
    }
    if (stat === "out-stock") {
      filtered = filtered.filter(p => p.giacenza === 0);
    } else if (stat === "low-stock") {
      filtered = filtered.filter(p => p.giacenza > 0 && p.giacenza <= LOW_STOCK_THRESHOLD);
    } else if (stat === "in-stock") {
      filtered = filtered.filter(p => p.giacenza > LOW_STOCK_THRESHOLD);
    }

    currentPage = 1;
    displayPage(filtered);
  }

  function displayPage(products) {
    // aggiorna l’array filtrato
    currentFiltered = products;
    // calcola gli indici
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const end   = start + PRODUCTS_PER_PAGE;
    // mostra solo il sotto‐insieme
    generateProducts(products.slice(start, end));
    // aggiorna la barra di navigazione
    setupPager(products.length);
  }

  function setupPager(totalItems) {
    const pager = document.getElementById('pager');
    pager.innerHTML = ''; 
    const totalPages = Math.ceil(totalItems / PRODUCTS_PER_PAGE);
    const ul = document.createElement('ul');
    ul.className = 'pagination mb-0';

    // PREV
    const prev = document.createElement('li');
    prev.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prev.innerHTML = `<a class="page-link" href="#">«</a>`;
    prev.addEventListener('click', e => {
      e.preventDefault();
      if (currentPage > 1) {
        currentPage--;
        displayPage(currentFiltered);
      }
    });
    ul.append(prev);

    // NUMERI
    for (let i = 1; i <= totalPages; i++) {
      const li = document.createElement('li');
      li.className = `page-item ${i === currentPage ? 'active' : ''}`;
      li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
      li.addEventListener('click', e => {
        e.preventDefault();
        currentPage = i;
        displayPage(currentFiltered);
      });
      ul.append(li);
    }

    // NEXT
    const next = document.createElement('li');
    next.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    next.innerHTML = `<a class="page-link" href="#">»</a>`;
    next.addEventListener('click', e => {
      e.preventDefault();
      if (currentPage < totalPages) {
        currentPage++;
        displayPage(currentFiltered);
      }
    });
    ul.append(next);

    pager.appendChild(ul);
  }


  // Avvio
  getProductsStock();
});
