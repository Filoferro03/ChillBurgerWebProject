// Script di gestione CRUD prodotti e ingredienti – ora usa i dati reali dal backendAdd commentMore actions

/* === STATE === */
let ingredients = [];
let products    = [];
let nextId      = 1;

/* === HELPERS === */
const $ = (sel, root = document) => root.querySelector(sel);
const createEl = (tag, cls = '', html = '') => {
  const el = document.createElement(tag);
  if (cls)  el.className = cls;
  if (html) el.innerHTML = html;
  return el;
};

/* === DATA LOADING === */
async function loadInitialData () {
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

    // TODO
    // Se esiste un endpoint dedicato agli ingredienti, decommenta questo blocco:
    // const resIng = await fetch('api/api-ingredients.php');
    // if (resIng.ok) ingredients = await resIng.json();

    renderIngredientSelect();
    renderProducts();
  } catch (err) {
    console.error(err);
  }
}

/* === RENDERING === */
function renderIngredientSelect () {
  const container = $('#ingredient-select');
  if (!container) return;
  container.innerHTML = '';
  ingredients.forEach(ing => {
    const label = createEl('label', 'flex items-center space-x-1');
    const input = createEl('input');
    input.type  = 'checkbox';
    input.value = ing;
    label.appendChild(input);
    label.appendChild(createEl('span', '', ing));
    container.appendChild(label);
  });
}

function createProductCard (prod) {
  const card = createEl('div', 'card');
  const img  = createEl('img');
  img.src    = prod.image;
  img.alt    = prod.nome;
  card.appendChild(img);

  const body = createEl('div', 'card-body');
  body.appendChild(createEl('h3', 'text-lg font-semibold mb-1', prod.nome));
  body.appendChild(createEl('p',  'text-sm text-gray-600 mb-2', '€ ' + Number(prod.prezzo).toFixed(2)));
  body.appendChild(createEl('p',  'text-sm', prod.descrizione));
  card.appendChild(body);

  const actions = createEl('div', 'card-actions');
  const editBtn = createEl('button', 'btn-primary', 'Modifica');
  const delBtn  = createEl('button', 'bg-red-600 text-white rounded-lg px-3 py-2 hover:bg-red-700 transition', 'Elimina');
  editBtn.addEventListener('click', () => openEditModal(prod.idcategoria));
  delBtn .addEventListener('click', () => openDeleteModal(prod.idcategoria));
  actions.appendChild(editBtn);
  actions.appendChild(delBtn);
  card.appendChild(actions);

  return card;
}

function renderProducts () {
  const list = $('#product-list');
  if (!list) return;
  list.innerHTML = '';
  products.forEach(p => list.appendChild(createProductCard(p)));
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
      description: fd.get('description').trim(),
      prezzo: parseFloat(fd.get('prezzo')),
      image: '#', // gestire upload lato server
      ingredients: [...document.querySelectorAll('#ingredient-select input:checked')].map(i => i.value)
    };

    try {
      await fetch('api/api-manager-menu.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newProduct)
      });
      products.push(newProduct);
      renderProducts();
      e.target.reset();
      $('#image-preview').classList.add('hidden');
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
    preview.classList.remove('hidden');
  });

}

/* === MODALI === */
function closeModal () { $('#modal-overlay').classList.add('hidden'); }

function openEditModal (idcategoria) {
  const prod = products.find(p => p.idcategoria === idcategoria);
  const overlay = $('#modal-overlay');
  const box = $('#modal-box');
  box.innerHTML = '';
  box.appendChild(createEl('h2', 'text-xl font-semibold mb-4', 'Modifica prodotto'));

  const nameIn  = createEl('input', 'input-field mb-2');
  nameIn.value  = prod.nome;
  const descIn  = createEl('textarea', 'input-field mb-2');
  descIn.value  = prod.description;
  const priceIn = createEl('input', 'input-field mb-2');
  priceIn.type  = 'number';
  priceIn.step  = '0.01';
  priceIn.value = prod.prezzo;

  const save   = createEl('button', 'btn-primary mr-2', 'Salva');
  const cancel = createEl('button', 'bg-gray-300 px-4 py-2 rounded', 'Annulla');

  box.appendChild(nameIn);
  box.appendChild(descIn);
  box.appendChild(priceIn);
  box.appendChild(save);
  box.appendChild(cancel);

  save.addEventListener('click', async () => {
    prod.nome        = nameIn.value.trim();
    prod.description = descIn.value.trim();
    prod.prezzo       = parseFloat(priceIn.value);

    try {
      await fetch('api/api-manager-menu.php?idcategoria=' + prod.idcategoria, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(prod)
      });
      renderProducts();
      closeModal();

    } catch (err) { console.error(err); }
  });
  cancel.addEventListener('click', closeModal);
  overlay.classList.remove('hidden');
}

function openDeleteModal (idcategoria) {
  const overlay = $('#modal-overlay');
  const box = $('#modal-box');
  box.innerHTML = '';
  box.appendChild(createEl('p', 'mb-4', 'Sei sicuro di voler eliminare questo prodotto?'));
  const confirm = createEl('button', 'btn-primary mr-2', 'Conferma');
  const cancel  = createEl('button', 'bg-gray-300 px-4 py-2 rounded', 'Annulla');
  box.appendChild(confirm);
  box.appendChild(cancel);

  confirm.addEventListener('click', async () => {
    try {
      await fetch('api/api-manager-menu.php?id=' + idcategoria, {method:'DELETE'});
      products = products.filter(p => p.idcategoria !== idcategoria);
      renderProducts();
      closeModal();

    } catch (err) { console.error(err); }
  });
  cancel.addEventListener('click', closeModal);
  overlay.classList.remove('hidden');
}

/* === BOOTSTRAP === */
window.addEventListener('DOMContentLoaded', loadInitialData);