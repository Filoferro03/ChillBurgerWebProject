(() => {
  // === helpers isolati ===
  const $ = (s, r = document) => r.querySelector(s);
  const createEl = (t, c = '', h = '') =>
    Object.assign(document.createElement(t), { className: c, innerHTML: h });

  /* === STATE === */
  let ingredients = [];
  let products    = [];
  let nextId      = 1;

  /* === DATA LOADING === */
  async function loadInitialData() {
    try {
      // Recupera prodotti e categorie dal backend pubblico
      const resMenu = await fetch('api/api-menu.php');
      if (!resMenu.ok) throw new Error('Impossibile caricare i prodotti (' + resMenu.status + ')');
      const menuJson = await resMenu.json();
      products       = menuJson.products ?? [];
      nextId         = products.length ? Math.max(...products.map(p => p.idcategoria)) + 1 : 1;

      // Ricava l'elenco ingredienti unico dai prodotti oppure recuperalo da un endpoint dedicato
      const allIngs = new Set();
      products.forEach(p => (p.ingredients || []).forEach(i => allIngs.add(i)));
      ingredients = [...allIngs];

      // TODO: se esiste un endpoint dedicato agli ingredienti, decommenta questo blocco:
      // const resIng = await fetch('api/api-ingredients.php');
      // if (resIng.ok) ingredients = await resIng.json();

      renderIngredientSelect();
      renderProducts();
    } catch (err) {
      console.error(err);
    }
  }

  /* === RENDERING === */
  function renderIngredientSelect() {
    const container = $('#ingredient-select');
    if (!container) return;
    container.innerHTML = '';

    ingredients.forEach(ing => {
      // Ogni checkbox per l'ingrediente
      const label = createEl('label', 'form-check form-check-inline align-items-center');
      const input = createEl('input', 'form-check-input me-1');
      input.type  = 'checkbox';
      input.value = ing;
      label.appendChild(input);
      label.appendChild(createEl('span', '', ing));
      container.appendChild(label);
    });
  }

  function createProductCard(prod) {
    // Card wrapper
    const card = createEl('div', 'card h-100');

    // Immagine (se presente)
    const img = createEl('img', 'card-img-top');
    img.src = prod.image;
    img.alt = prod.nome;
    card.appendChild(img);

    // Corpo della card
    const body = createEl('div', 'card-body');
    body.appendChild(createEl('h5', 'card-title mb-1', prod.nome));
    body.appendChild(createEl('p', 'card-text text-muted mb-2', '€ ' + Number(prod.prezzo).toFixed(2)));

    card.appendChild(body);

    // Azioni (Modifica / Elimina)
    const actions = createEl('div', 'card-body pt-0 d-flex justify-content-end gap-2');
    const editBtn = createEl('button', 'btn btn-primary', 'Modifica');
    const delBtn  = createEl('button', 'btn btn-danger', 'Elimina');
    editBtn.addEventListener('click', () => openEditModal(prod.idcategoria));
    delBtn.addEventListener('click',  () => openDeleteModal(prod.idcategoria));
    actions.appendChild(editBtn);
    actions.appendChild(delBtn);
    card.appendChild(actions);

    return card;
  }

  function renderProducts() {
    const list = $('#product-list');
    if (!list) return;
    list.innerHTML = '';
    products.forEach(p => {
      const wrapper = createEl('div', 'col');
      wrapper.appendChild(createProductCard(p));
      list.appendChild(wrapper);
    });
  }

  /* === AGGIUNTA === */
  const addForm = $('#add-product-form');
  if (addForm) {
    addForm.addEventListener('submit', async e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const newProduct = {
        idcategoria: nextId++,
        nome: fd.get('nome').trim(),
        prezzo: parseFloat(fd.get('prezzo')),
        image: '#', // gestire upload lato server
        ingredients: [...document.querySelectorAll('#ingredient-select input:checked')].map(i => i.value)
      };

      try {
        await fetch('api/api-manager-menu.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProduct)
        });
        products.push(newProduct);
        renderProducts();
        e.target.reset();
        $('#image-preview').classList.add('d-none');
      } catch (err) {
        console.error(err);
      }
    });
  }

  const imageInput = $('#image');
  if (imageInput) {
    imageInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const preview = $('#image-preview');
      preview.src = URL.createObjectURL(file);
      preview.classList.remove('d-none');
    });
  }

  /* === MODALI === */
  function closeModal() {
    $('#modal-overlay').classList.add('d-none');
  }

  function openEditModal(idcategoria) {
    const prod = products.find(p => p.idcategoria === idcategoria);
    const overlay = $('#modal-overlay');
    const box = $('#modal-box');
    box.innerHTML = '';

    // Titolo modale
    box.appendChild(createEl('h4', 'mb-4', 'Modifica prodotto'));

    // Input Nome
    const nameIn = createEl('input', 'form-control mb-2');
    nameIn.value = prod.nome;

    // Input Prezzo
    const priceIn = createEl('input', 'form-control mb-2');
    priceIn.type  = 'number';
    priceIn.step  = '0.01';
    priceIn.value = prod.prezzo;

    // Pulsanti Salva / Annulla
    const save   = createEl('button', 'btn btn-primary me-2', 'Salva');
    const cancel = createEl('button', 'btn btn-secondary', 'Annulla');

    box.appendChild(nameIn);
    box.appendChild(priceIn);
    box.appendChild(save);
    box.appendChild(cancel);

    save.addEventListener('click', async () => {
      prod.nome        = nameIn.value.trim();
      prod.prezzo      = parseFloat(priceIn.value);

      try {
        await fetch('api/api-manager-menu.php?idcategoria=' + prod.idcategoria, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(prod)
        });
        renderProducts();
        closeModal();
      } catch (err) {
        console.error(err);
      }
    });

    cancel.addEventListener('click', closeModal);
    overlay.classList.remove('d-none');
  }

  function openDeleteModal(idcategoria) {
    const overlay = $('#modal-overlay');
    const box = $('#modal-box');
    box.innerHTML = '';

    box.appendChild(createEl('p', 'mb-4', 'Sei sicuro di voler eliminare questo prodotto?'));

    const confirmBtn = createEl('button', 'btn btn-danger me-2', 'Conferma');
    const cancelBtn  = createEl('button', 'btn btn-secondary', 'Annulla');
    box.appendChild(confirmBtn);
    box.appendChild(cancelBtn);

    confirmBtn.addEventListener('click', async () => {
      try {
        await fetch('api/api-manager-menu.php?id=' + idcategoria, { method: 'DELETE' });
        products = products.filter(p => p.idcategoria !== idcategoria);
        renderProducts();
        closeModal();
      } catch (err) {
        console.error(err);
      }
    });

    cancelBtn.addEventListener('click', closeModal);
    overlay.classList.remove('d-none');
  }

  /* === BOOTSTRAP INIT === */
  window.addEventListener('DOMContentLoaded', loadInitialData);
})();
