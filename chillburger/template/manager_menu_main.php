<?php
/**
 * manager_menu_main.php
 * Pagina di gestione menu per il manager.
 * Simula CRUD sui prodotti con JavaScript; integra Tailwind CSS per UI moderna.
 * NOTE: sostituire gli array JS con chiamate AJAX alle API (api/api-menu.php, api/api-edit-burger.php, ecc.)
 *       quando si collega ad un database reale.
 */
require_once __DIR__ . '/../bootstrap.php'; // inizializza sessione e costanti di progetto
// TODO: controllare che l'utente sia autenticato come manager.
?>
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gestione Menu | ChillBurger</title>
  <!-- Tailwind via CDN (solo per prototipo; in produzione usare build dedicata) -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Feather Icons per icone azioni -->
  <script src="https://unpkg.com/feather-icons"></script>
</head>
<body class="bg-gray-100 text-gray-800 min-h-screen flex flex-col">
  <header class="bg-white shadow sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
      <h1 class="text-2xl font-bold tracking-wide">Gestione Menu</h1>
      <!-- Placeholder: eventuale menù utente / logout -->
    </div>
  </header>

  <main class="flex-1 max-w-7xl mx-auto w-full p-6 space-y-10">
    <!-- Sezione Aggiunta Prodotto -->
    <section id="add-product" class="bg-white p-6 rounded-2xl shadow">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-semibold">Aggiungi nuovo prodotto</h2>
        <button id="open-category-modal" class="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800">
          <i data-feather="plus-circle" class="w-4 h-4"></i>
          Nuova categoria ingrediente
        </button>
      </div>
      <form id="add-product-form" class="grid gap-4 md:grid-cols-2">
        <div class="space-y-1">
          <label for="new-name" class="block text-sm font-medium">Nome prodotto</label>
          <input type="text" id="new-name" class="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500" required>
        </div>
        <div class="space-y-1 md:col-span-2">
          <label for="new-description" class="block text-sm font-medium">Descrizione</label>
          <textarea id="new-description" rows="3" class="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500" required></textarea>
        </div>
        <div class="space-y-1">
          <label for="new-price" class="block text-sm font-medium">Prezzo (€)</label>
          <input type="number" step="0.01" id="new-price" class="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500" required>
        </div>
        <div class="space-y-1">
          <label for="new-image" class="block text-sm font-medium">Immagine</label>
          <input type="file" id="new-image" accept="image/*" class="w-full file:mr-2 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:cursor-pointer" required>
          <img id="new-image-preview" src="#" alt="Anteprima" class="mt-2 h-24 w-24 object-cover rounded hidden">
        </div>
        <div class="space-y-1 md:col-span-2">
          <label for="new-ingredients" class="block text-sm font-medium">Ingredienti (Ctrl/Cmd + click per selezione multipla)</label>
          <select id="new-ingredients" multiple class="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 h-32"></select>
        </div>
        <div class="md:col-span-2 flex justify-end">
          <button type="submit" class="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition">Aggiungi Prodotto</button>
        </div>
      </form>
    </section>

    <!-- Sezione Lista Prodotti -->
    <section id="product-section" class="space-y-4">
      <h2 class="text-xl font-semibold">Prodotti attuali</h2>
      <div id="product-list" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"></div>
    </section>
  </main>

  <!-- Modal conferma eliminazione -->
  <div id="delete-modal" class="fixed inset-0 bg-black/50 hidden items-center justify-center z-40">
    <div class="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full">
      <h3 class="text-lg font-semibold mb-2">Conferma eliminazione</h3>
      <p class="mb-6">Sei sicuro di voler eliminare "<span id="delete-product-name" class="font-semibold"></span>"?</p>
      <div class="flex justify-end gap-2">
        <button id="delete-cancel" class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Annulla</button>
        <button id="delete-confirm" class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Elimina</button>
      </div>
    </div>
  </div>

  <!-- Modal nuova categoria -->
  <div id="category-modal" class="fixed inset-0 bg-black/50 hidden items-center justify-center z-40">
    <div class="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full">
      <h3 class="text-lg font-semibold mb-4">Aggiungi nuova categoria ingrediente</h3>
      <form id="add-category-form" class="space-y-4">
        <div class="space-y-1">
          <label for="category-name" class="block text-sm font-medium">Nome categoria</label>
          <input type="text" id="category-name" class="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500" required>
        </div>
        <div class="flex justify-end gap-2">
          <button type="button" id="category-cancel" class="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Annulla</button>
          <button type="submit" class="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700">Aggiungi</button>
        </div>
      </form>
    </div>
  </div>

  <footer class="bg-white shadow mt-auto">
    <div class="max-w-7xl mx-auto px-4 py-4 text-center text-sm">© <?php echo date('Y'); ?> ChillBurger – Pannello Manager</div>
  </footer>

  <script>
  /***** DATI SIMULATI *****/
  // Array di ingredienti simulati "dal database"
  let ingredients = [
    { id: 1, name: 'Pane', category: 'Pane' },
    { id: 2, name: 'Hamburger di Manzo', category: 'Carne' },
    { id: 3, name: 'Cheddar', category: 'Formaggi' },
    { id: 4, name: 'Bacon', category: 'Carne' },
    { id: 5, name: 'Insalata', category: 'Verdure' },
    { id: 6, name: 'Pomodori', category: 'Verdure' },
  ];

  // Array di prodotti simulati
  let products = [
    {
      id: 1,
      name: 'Bacon Cheeseburger',
      description: 'Burger di manzo con bacon croccante e formaggio cheddar fuso.',
      price: 8.50,
      ingredients: [2, 3, 4, 1], // id ingredienti
      image: 'resources/products/bacon-cheeseburger.png'
    },
    {
      id: 2,
      name: 'Green Garden',
      description: 'Burger vegetariano con verdure fresche e salsa allo yogurt.',
      price: 7.00,
      ingredients: [5, 6, 1],
      image: 'resources/products/green-garden.png'
    }
  ];

  /***** UTILITY FUNCTIONS *****/
  const $ = selector => document.querySelector(selector);
  const $$ = selector => document.querySelectorAll(selector);

  // Popola la select ingredienti nel form aggiunta
  function populateIngredientSelect() {
    const select = $('#new-ingredients');
    select.innerHTML = '';
    ingredients.forEach(ing => {
      const option = document.createElement('option');
      option.value = ing.id;
      option.textContent = `${ing.name} (${ing.category})`;
      select.appendChild(option);
    });
  }

  // Renderizza lista prodotti
  function renderProducts() {
    const list = $('#product-list');
    list.innerHTML = '';
    if (products.length === 0) {
      list.innerHTML = '<p class="col-span-full text-center text-gray-500">Nessun prodotto disponibile.</p>';
      return;
    }
    products.forEach(prod => {
      const card = document.createElement('div');
      card.className = 'bg-white rounded-2xl shadow hover:shadow-lg transition relative flex flex-col';
      card.innerHTML = `
        <img src="${prod.image}" alt="${prod.name}" class="h-40 w-full object-cover rounded-t-2xl">
        <div class="p-4 flex-1 flex flex-col gap-2">
          <h3 class="text-lg font-semibold">${prod.name}</h3>
          <p class="text-sm text-gray-600 flex-1">${prod.description}</p>
          <span class="font-medium text-indigo-600">€ ${prod.price.toFixed(2)}</span>
          <div class="flex gap-2 mt-2">
            <button class="edit-btn inline-flex items-center justify-center w-9 h-9 rounded-lg bg-amber-100 hover:bg-amber-200" data-id="${prod.id}" title="Modifica">
              <i data-feather="edit-2" class="w-4 h-4 text-amber-700"></i>
            </button>
            <button class="delete-btn inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-100 hover:bg-red-200" data-id="${prod.id}" data-name="${prod.name}" title="Elimina">
              <i data-feather="trash-2" class="w-4 h-4 text-red-700"></i>
            </button>
          </div>
        </div>`;
      list.appendChild(card);
    });
    feather.replace();
  }

  // Salva nuovo prodotto dall'apposito form
  $('#add-product-form').addEventListener('submit', e => {
    e.preventDefault();
    const newProd = {
      id: Date.now(),
      name: $('#new-name').value,
      description: $('#new-description').value,
      price: parseFloat($('#new-price').value),
      ingredients: Array.from($('#new-ingredients').selectedOptions).map(o => parseInt(o.value)),
      image: $('#new-image-preview').src // In produzione, si caricherebbe il file e si salverebbe il path restituito dal server
    };
    products.push(newProd);
    renderProducts();
    e.target.reset();
    $('#new-image-preview').classList.add('hidden');
  });

  // Anteprima immagine caricata
  $('#new-image').addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        $('#new-image-preview').src = ev.target.result;
        $('#new-image-preview').classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    }
  });

  // Delegazione eventi per Edit / Delete
  $('#product-list').addEventListener('click', e => {
    const editBtn = e.target.closest('.edit-btn');
    const deleteBtn = e.target.closest('.delete-btn');
    if (editBtn) {
      const id = parseInt(editBtn.dataset.id);
      openEditForm(id, editBtn.closest('div.bg-white'));
    }
    if (deleteBtn) {
      const id = parseInt(deleteBtn.dataset.id);
      const name = deleteBtn.dataset.name;
      openDeleteModal(id, name);
    }
  });

  // Apertura modale eliminazione
  function openDeleteModal(id, name) {
    $('#delete-product-name').textContent = name;
    $('#delete-modal').classList.remove('hidden');
    const confirmHandler = () => {
      products = products.filter(p => p.id !== id);
      renderProducts();
      closeDeleteModal();
    };
    $('#delete-confirm').onclick = confirmHandler;
  }
  function closeDeleteModal() {
    $('#delete-modal').classList.add('hidden');
  }
  $('#delete-cancel').addEventListener('click', closeDeleteModal);

  // Apertura form modifica inline
  function openEditForm(id, card) {
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    // Costruisci form di modifica
    card.innerHTML = `
      <form class="flex flex-col gap-4 p-4 flex-1">
        <div class="space-y-1">
          <label class="text-sm font-medium">Nome prodotto</label>
          <input type="text" class="w-full rounded-lg border-gray-300" value="${prod.name}" required>
        </div>
        <div class="space-y-1 flex-1">
          <label class="text-sm font-medium">Descrizione</label>
          <textarea class="w-full rounded-lg border-gray-300" rows="3" required>${prod.description}</textarea>
        </div>
        <div class="space-y-1">
          <label class="text-sm font-medium">Prezzo (€)</label>
          <input type="number" step="0.01" class="w-full rounded-lg border-gray-300" value="${prod.price}" required>
        </div>
        <div class="space-y-1">
          <label class="text-sm font-medium">Immagine</label>
          <input type="file" accept="image/*" class="w-full file:mr-2 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:cursor-pointer">
          <img src="${prod.image}" alt="Anteprima" class="mt-2 h-24 w-24 object-cover rounded">
        </div>
        <div class="space-y-1">
          <label class="text-sm font-medium">Ingredienti</label>
          <select multiple class="w-full rounded-lg border-gray-300 h-32">
            ${ingredients.map(ing => `<option value="${ing.id}" ${prod.ingredients.includes(ing.id) ? 'selected' : ''}>${ing.name} (${ing.category})</option>`).join('')}
          </select>
        </div>
        <div class="flex justify-end gap-2 mt-auto">
          <button type="button" class="cancel-edit px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Annulla</button>
          <button type="submit" class="save-edit px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">Salva</button>
        </div>
      </form>`;

    // Gestore submit modifica
    const form = card.querySelector('form');
    form.addEventListener('submit', ev => {
      ev.preventDefault();
      const [nameInput, descInput, priceInput, fileInput, select] = form.elements;
      prod.name = nameInput.value;
      prod.description = descInput.value;
      prod.price = parseFloat(priceInput.value);
      prod.ingredients = Array.from(select.selectedOptions).map(o => parseInt(o.value));
      if (fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = ev2 => {
          prod.image = ev2.target.result;
          renderProducts();
        };
        reader.readAsDataURL(fileInput.files[0]);
      } else {
        renderProducts();
      }
    });

    // Gestore annulla modifica
    card.querySelector('.cancel-edit').addEventListener('click', renderProducts);
  }

  /***** Gestione modale categoria ingrediente *****/
  $('#open-category-modal').addEventListener('click', () => {
    $('#category-modal').classList.remove('hidden');
    $('#category-name').focus();
  });
  $('#category-cancel').addEventListener('click', () => {
    $('#category-modal').classList.add('hidden');
  });
  $('#add-category-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#category-name').value.trim();
    if (name && !ingredients.find(ing => ing.category === name)) {
      // In un contesto reale, qui si invierebbe una richiesta POST per salvare la nuova categoria
      ingredients.push({ id: Date.now(), name: name + ' placeholder', category: name });
      populateIngredientSelect();
    }
    $('#category-modal').classList.add('hidden');
    e.target.reset();
  });

  /***** INIT *****/
  populateIngredientSelect();
  renderProducts();
  </script>
</body>
</html>
