// TODO
/*
* Bisogna gestire la discrepanza tra idcategoria e descrizione.
* quale va inserita dall'utente? 
* idcategoria è un numero, descrizione è una stringa.
*/

(() => {
  // === HELPERS ===
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const createEl = (tag, className = '', innerHTML = '') =>
    Object.assign(document.createElement(tag), { className, innerHTML });

  // === STATE ===
  let ingredients = [];
  let products = [];
  let nextId = 1;

  // === API ENDPOINTS ===
  const API_MENU = 'api/api-menu.php';

  // === DATA LOADING ===
  async function loadInitialData() {
    try {
      const res = await fetch(API_MENU);
      if (!res.ok) throw new Error(`Impossibile caricare i prodotti (${res.status})`);

      const { products: prods = [] } = await res.json();
      products = prods;
      nextId = prods.length ? Math.max(...prods.map(p => p.idcategoria)) + 1 : 1;

      // Ricava l’elenco unico di ingredienti dai prodotti
      const allIngs = new Set();
      products.forEach(p => (p.ingredients || []).forEach(i => allIngs.add(i)));
      ingredients = [...allIngs];

      // Se esiste un endpoint dedicato, si può sostituire il blocco precedente:
      // const resIng = await fetch('api/api-ingredients.php');
      // if (resIng.ok) ingredients = await resIng.json();

      renderIngredientSelect();
      renderProducts();
    } catch (err) {
      console.error(err);
    }
  }

  // === RENDERING ===
  function renderIngredientSelect() {
    const container = $('#ingredient-select');
    if (!container) return;
    container.innerHTML = '';

    ingredients.forEach(({ idingrediente, nome }) => {
      const label = createEl('label', 'form-check form-check-inline align-items-center');
      const input = createEl('input', 'form-check-input me-1');
      input.type = 'checkbox';
      input.value = idingrediente; // ID dell’ingrediente
      label.append(input, createEl('span', '', nome));
      container.appendChild(label);
    });
  }

  function createProductCard(prod) {
    const card = createEl('div', 'card h-100');

    // Immagine
    const img = createEl('img', 'card-img-top');
    img.src = prod.image;
    img.alt = prod.nome;
    card.append(img);

    // Corpo della card
    const body = createEl('div', 'card-body');
    body.append(
      createEl('h5', 'card-title mb-1', prod.nome),
      createEl('p', 'card-text text-muted mb-2', `€ ${Number(prod.prezzo).toFixed(2)}`),
      createEl('p', 'card-text', prod.descrizione)
    );
    card.append(body);

    // Pulsanti Modifica / Elimina
    const actions = createEl('div', 'card-body pt-0 d-flex justify-content-end gap-2');
    const editBtn = createEl('button', 'btn btn-primary', 'Modifica');
    const delBtn = createEl('button', 'btn btn-danger', 'Elimina');
    editBtn.addEventListener('click', () => openEditModal(prod.idprodotto));
    delBtn.addEventListener('click', () => openDeleteModal(prod.idprodotto));
    actions.append(editBtn, delBtn);
    card.append(actions);

    return card;
  }

  function renderProducts() {
    const list = $('#product-list');
    if (!list) return;
    list.innerHTML = '';
    products.forEach(p => {
      const col = createEl('div', 'col');
      col.appendChild(createProductCard(p));
      list.appendChild(col);
    });
  }

  // === AGGIUNTA PRODOTTO ===
  const addForm = $('#add-product-form');
  if (addForm) {
    addForm.addEventListener('submit', async e => {
      e.preventDefault();
      const fd = new FormData(e.target);

      // Ingredienti selezionati → array di ID
      const selectedIngs = $$('#ingredient-select input:checked').map(i => parseInt(i.value, 10));
      fd.append('ingredients', JSON.stringify(selectedIngs));

      try {
        const res = await fetch(API_MANAGER, { method: 'POST', body: fd });
        if (!res.ok) {
          const errJson = await res.json().catch(() => null);
          console.error('API-error payload:', errJson);
          throw new Error(`Errore creazione prodotto (${res.status})`);
        }
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Errore sconosciuto');

        products.push(json.product);
        renderProducts();
        e.target.reset();
        $('#image-preview')?.classList.add('d-none');
      } catch (err) {
        console.error(err);
        alert(`Creazione fallita: ${err.message}`);
      }
    });
  }

  // Anteprima immagine
  $('#image')?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const preview = $('#image-preview');
    preview.src = URL.createObjectURL(file);
    preview.classList.remove('d-none');
  });

  // === MODALI ===
  function closeModal() {
    $('#modal-overlay')?.classList.add('d-none');
  }

  function openEditModal(idprodotto) {
    const prod = products.find(p => p.idprodotto === idprodotto);
    if (!prod) return;

    const overlay = $('#modal-overlay');
    const box = $('#modal-box');
    box.innerHTML = '';

    box.appendChild(createEl('h4', 'mb-4', 'Modifica prodotto'));

    // Input Nome
    const nameIn = createEl('input', 'form-control mb-2');
    nameIn.value = prod.nome;

    // Input Prezzo
    const priceIn = createEl('input', 'form-control mb-2');
    priceIn.type = 'number';
    priceIn.step = '0.01';
    priceIn.value = prod.prezzo;

    // Input Descrizione
    const descIn = createEl('textarea', 'form-control mb-2');
    descIn.value = prod.descrizione;

    // Pulsanti Salva / Annulla
    const saveBtn = createEl('button', 'btn btn-primary me-2', 'Salva');
    const cancelBtn = createEl('button', 'btn btn-secondary', 'Annulla');

    box.append(nameIn, priceIn, descIn, saveBtn, cancelBtn);

    saveBtn.addEventListener('click', async () => {
      prod.nome = nameIn.value.trim();
      prod.prezzo = parseFloat(priceIn.value);
      prod.descrizione = descIn.value.trim();

      try {
        await fetch(`${API_MANAGER}?idprodotto=${prod.idprodotto}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Credentials': 'same-origin'
          },
          body: JSON.stringify(prod)
        });
        renderProducts();
        closeModal();
      } catch (err) {
        console.error(err);
      }
    });

    cancelBtn.addEventListener('click', closeModal);
    overlay.classList.remove('d-none');
  }

  function openDeleteModal(idprodotto) {
    const overlay = $('#modal-overlay');
    const box = $('#modal-box');
    box.innerHTML = '';

    box.appendChild(createEl('p', 'mb-4', 'Sei sicuro di voler eliminare questo prodotto?'));

    const confirmBtn = createEl('button', 'btn btn-danger me-2', 'Conferma');
    const cancelBtn = createEl('button', 'btn btn-secondary', 'Annulla');
    box.append(confirmBtn, cancelBtn);

    confirmBtn.addEventListener('click', async () => {
      try {
        await fetch(`${API_MANAGER}?id=${idprodotto}`, { method: 'DELETE' });
        products = products.filter(p => p.idprodotto !== idprodotto);
        renderProducts();
        closeModal();
      } catch (err) {
        console.error(err);
      }
    });

    cancelBtn.addEventListener('click', closeModal);
    overlay.classList.remove('d-none');
  }

  // === BOOTSTRAP INIT ===
  window.addEventListener('DOMContentLoaded', loadInitialData);
})();
