// chillburger/js/manager_menu.js
(() => {
  // === HELPERS ===
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const createEl = (tag, attributes = {}, innerHTML = '') => {
    const el = document.createElement(tag);
    for (const key in attributes) {
      el.setAttribute(key, attributes[key]);
    }
    if (innerHTML) el.innerHTML = innerHTML;
    return el;
  };

  // === STATE ===
  let allAvailableIngredients = [];
  let allAvailableCategories = [];
  let productsToList = [];
  let paniniCategoryId = null;

  // === API ENDPOINTS ===
  const API_MENU_PAGE_DATA = 'api/api-menu.php'; // Per prodotti e categorie lista
  const API_STOCK_DATA = 'api/api-manager-stock.php'; // Per tutti gli ingredienti disponibili
  const API_MANAGER_PRODUCT_HANDLER = 'api/api-manager-menu.php'; // Per CRUD prodotti

  // === GENERIC FETCH FUNCTION ===
  async function fetchData(url, options = {}) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        let errorMsg = `Errore HTTP: ${response.status} - ${response.statusText}`;
        try {
            const errData = await response.json();
            errorMsg = errData.error || errorMsg;
        } catch (e) { /* Ignore if response is not JSON */ }
        throw new Error(errorMsg);
      }
      // Controlla se il Content-Type è JSON prima di tentare il parsing
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
          return await response.json();
      } else {
          // Se non è JSON, potrebbe essere testo semplice (es. per messaggi di successo semplici)
          // o un errore inaspettato. Per ora, restituiamo il testo.
          // Considera di gestire diversamente se ti aspetti sempre JSON.
          return await response.text(); 
      }
    } catch (error) {
      console.error(`Errore durante il fetch da ${url}:`, error);
      throw error; // Rilancia per gestione a livello superiore
    }
  }


  // === DATA LOADING ===
  async function loadInitialData() {
    try {
      // 1. Carica prodotti e categorie per la visualizzazione della lista
      const menuPageJson = await fetchData(API_MENU_PAGE_DATA);

      productsToList = menuPageJson.products || [];
      allAvailableCategories = menuPageJson.categories || [];

      const paniniCat = allAvailableCategories.find(cat => cat.descrizione.toLowerCase() === 'panini');
      if (paniniCat) {
        paniniCategoryId = parseInt(paniniCat.idcategoria, 10);
      } else {
        console.warn('Attenzione: Categoria "Panini" non trovata. La selezione degli ingredienti potrebbe non funzionare come previsto.');
      }

      // 2. Carica tutti gli ingredienti disponibili
      const ingredientsFormData = new FormData();
      ingredientsFormData.append('action', 'getallproducts');
      const ingredientsJson = await fetchData(API_STOCK_DATA, {
        method: 'POST',
        body: ingredientsFormData
      });

      if (ingredientsJson.success && ingredientsJson.data && ingredientsJson.data.ingredients) {
        allAvailableIngredients = ingredientsJson.data.ingredients.map(ing => ({
          idingrediente: parseInt(ing.idingrediente, 10),
          nome: ing.nome
        }));
      } else {
        throw new Error(ingredientsJson.error || 'Errore caricamento ingredienti da API_STOCK_DATA');
      }

      // 3. Renderizza
      renderProducts();
      renderCategorySelect('#category'); // Per form aggiunta
      renderIngredientSelect('#ingredient-select'); // Per form aggiunta

      // 4. Event listener per select categoria (form aggiunta)
      const categorySelectElement = $('#category');
      if (categorySelectElement) {
        categorySelectElement.addEventListener('change', handleCategoryChangeForAddForm);
      }

      // 5. Stato iniziale ingredienti (form aggiunta)
      updateIngredientSelectUI(false, false, '#ingredient-select');

    } catch (err) {
      console.error("Errore in loadInitialData:", err);
      const productListEl = $('#product-list');
      if (productListEl) productListEl.innerHTML = `<p class="text-danger">Errore caricamento dati: ${err.message}</p>`;
      const categoryEl = $('#category');
      if (categoryEl) categoryEl.innerHTML = '<option value="" disabled>Errore caricamento categorie</option>';
      updateIngredientSelectUI(false, true, '#ingredient-select');
    }
  }

  // === RENDERING FUNCTIONS ===
  function renderProducts() {
    const listContainer = $('#product-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';
    if (productsToList.length === 0) {
      listContainer.innerHTML = '<p class="text-muted">Nessun prodotto da visualizzare.</p>';
      return;
    }
    productsToList.forEach(product => {
      const col = createEl('div', { class: 'col' });
      col.appendChild(createProductCard(product));
      listContainer.appendChild(col);
    });
  }

  function createProductCard(product) {
    const card = createEl('div', { class: 'card h-100 shadow-sm' });
    const img = createEl('img', { class: 'card-img-top' });
    
    // product.image dovrebbe essere già il path corretto, es: "./resources/products/xyz.png"
    img.src = product.image || './resources/placeholder.png'; // Fallback a placeholder
    img.alt = product.nome;
    img.style.height = '180px';
    img.style.objectFit = 'cover';
    card.append(img);

    const body = createEl('div', { class: 'card-body d-flex flex-column' });
    body.append(createEl('h5', { class: 'card-title mb-1' }, product.nome));
    body.append(createEl('p', { class: 'card-text text-muted mb-2' }, `€ ${Number(product.prezzo).toFixed(2)}`));

    const categoryObj = allAvailableCategories.find(c => c.idcategoria == (product.idcategoria || product.categoria));
    if (categoryObj) {
      body.append(createEl('p', { class: 'card-text small text-info' }, `Categoria: ${categoryObj.descrizione}`));
    }

    const footer = createEl('div', { class: 'mt-auto' });
    const actions = createEl('div', { class: 'card-body pt-0 d-flex justify-content-end gap-2' });
    const editBtn = createEl('button', { class: 'btn btn-sm btn-primary' }, 'Modifica');
    const delBtn = createEl('button', { class: 'btn btn-sm btn-danger' }, 'Elimina');

    editBtn.addEventListener('click', () => openEditModal(product.idprodotto));
    delBtn.addEventListener('click', () => openDeleteModal(product.idprodotto));

    actions.append(editBtn, delBtn);
    footer.append(actions);
    body.append(footer);
    card.append(body);
    return card;
  }

  function renderCategorySelect(selectElementSelector, selectedValue = null) {
    const selectElement = $(selectElementSelector);
    if (!selectElement) {
      console.warn(`[renderCategorySelect for ${selectElementSelector}] Elemento select NON TROVATO.`);
      return;
    }

    selectElement.innerHTML = '<option value="" disabled>Seleziona una categoria...</option>';

    if (allAvailableCategories.length === 0) {
      selectElement.innerHTML = '<option value="" disabled>Nessuna categoria trovata.</option>';
      return;
    }

    allAvailableCategories.forEach(category => {
      const option = createEl('option', {}, category.descrizione);
      option.value = category.idcategoria;
      if (selectedValue && category.idcategoria == selectedValue) {
        option.selected = true;
      }
      selectElement.appendChild(option);
    });

    if (selectedValue) {
      selectElement.value = selectedValue;
    } else {
       selectElement.value = ""; // Assicura che il placeholder sia selezionato se non c'è un selectedValue
    }
  }

  function renderIngredientSelect(containerSelector, selectedIngredientIds = new Set()) {
    const container = $(containerSelector);
    if (!container) {
      console.warn(`Contenitore ingredienti non trovato: ${containerSelector}`);
      return;
    }
    container.innerHTML = '';

    if (allAvailableIngredients.length > 0) {
      allAvailableIngredients.forEach(({ idingrediente, nome }) => {
        const label = createEl('label', { class: 'form-check form-check-inline align-items-center' });
        const input = createEl('input', { class: 'form-check-input me-1' });
        input.type = 'checkbox';
        input.value = idingrediente;
        input.name = containerSelector === '#ingredient-select' ? 'ingredient_options_add' : 'ingredient_options_edit';
        input.disabled = true;
        if (selectedIngredientIds.has(idingrediente)) {
          input.checked = true;
        }
        label.append(input, createEl('span', { class: 'form-check-label' }, nome));
        container.appendChild(label);
      });
    } else {
        container.innerHTML = '<p class="text-muted small m-0">Nessun ingrediente definito nel sistema.</p>';
    }
  }

  function updateIngredientSelectUI(enable, errorLoadingIngredientsGlobal = false, containerSelector) {
    const ingredientContainer = $(containerSelector);
    if (!ingredientContainer) return;

    const ingredientCheckboxes = $$(`${containerSelector} input[type="checkbox"]`);

    if (errorLoadingIngredientsGlobal) {
      ingredientContainer.innerHTML = '<p class="text-danger small m-0">Errore nel caricamento generale degli ingredienti.</p>';
      ingredientContainer.style.opacity = '1';
      ingredientContainer.style.pointerEvents = 'none';
      return;
    }
    
    const needsRepopulation = ingredientCheckboxes.length === 0 && allAvailableIngredients.length > 0;


    if (enable) {
      if (allAvailableIngredients.length > 0) {
        if (needsRepopulation) { // Se non ci sono checkbox ma ci sono ingredienti, renderizza
            renderIngredientSelect(containerSelector, new Set()); // Renderizza con nessun checkbox selezionato di default
        }
        // Ora abilita tutte le checkbox (appena renderizzate o già esistenti)
        $$(`${containerSelector} input[type="checkbox"]`).forEach(checkbox => checkbox.disabled = false);
        
        ingredientContainer.style.opacity = '1';
        ingredientContainer.style.pointerEvents = 'auto';
        
        const placeholder = ingredientContainer.querySelector('p.text-muted.small');
        if (placeholder && ingredientContainer.querySelectorAll('input[type="checkbox"]').length > 0) {
            placeholder.remove();
        }
      } else {
        ingredientContainer.innerHTML = '<p class="text-muted small m-0">Nessun ingrediente disponibile per la configurazione dei panini.</p>';
        ingredientContainer.style.opacity = '1';
        ingredientContainer.style.pointerEvents = 'none';
      }
    } else { // disable
      $$(`${containerSelector} input[type="checkbox"]`).forEach(checkbox => {
        checkbox.disabled = true;
        // Non deselezionare, potrebbero essere pre-selezionate per la modifica
      });
      ingredientContainer.style.opacity = '0.5';
      ingredientContainer.style.pointerEvents = 'none';

      if (allAvailableIngredients.length === 0 && !errorLoadingIngredientsGlobal) {
        ingredientContainer.innerHTML = '<p class="text-muted small m-0">Nessun ingrediente definito nel sistema.</p>';
        ingredientContainer.style.opacity = '1';
      } else if (!errorLoadingIngredientsGlobal && (ingredientCheckboxes.length === 0 && !needsRepopulation)) {
         // Se non ci sono checkbox e non c'era bisogno di popolarle (perché allAvailableIngredients è vuoto)
         // oppure se le checkbox ci sono ma la categoria non è panini
        ingredientContainer.innerHTML = '<p class="text-muted small m-0">Seleziona la categoria "Panini" per abilitare la scelta ingredienti.</p>';
        ingredientContainer.style.opacity = '1';
      }
    }
  }
  
  function handleCategoryChangeForAddForm(event) {
    const selectedCategoryId = parseInt(event.target.value, 10);
    const isPanini = paniniCategoryId !== null && selectedCategoryId === paniniCategoryId;
    updateIngredientSelectUI(isPanini, false, '#ingredient-select');
    if (!isPanini) { // Se non è panini, pulisci le checkbox degli ingredienti
        $$('#ingredient-select input[type="checkbox"]:checked').forEach(cb => cb.checked = false);
    }
  }

  const addForm = $('#add-product-form');
  if (addForm) {
    addForm.addEventListener('submit', async e => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const selectedCategoryIdFromForm = parseInt(formData.get('category'), 10);
      let selectedIngsArray = [];

      if (paniniCategoryId !== null && selectedCategoryIdFromForm === paniniCategoryId) {
        selectedIngsArray = $$('#ingredient-select input[type="checkbox"]:checked')
          .map(i => parseInt(i.value, 10));
      }
      formData.set('ingredients', JSON.stringify(selectedIngsArray));
      // Aggiungiamo un'azione per distinguerla dall'update se usiamo lo stesso endpoint POST
      formData.append('action', 'add');


      try {
        const jsonResponse = await fetchData(API_MANAGER_PRODUCT_HANDLER, { method: 'POST', body: formData });

        if (!jsonResponse.success) throw new Error(jsonResponse.error || 'Errore sconosciuto dal server');

        await loadInitialData();
        e.target.reset();
        const imagePreview = $('#image-preview');
        if (imagePreview) {
            imagePreview.classList.add('d-none');
            imagePreview.src = '';
        }
        updateIngredientSelectUI(false, false, '#ingredient-select');
        alert('Prodotto aggiunto con successo!');
      } catch (err) {
        console.error("Errore invio form aggiunta:", err);
        alert(`Creazione fallita: ${err.message}`);
      }
    });
  }

  const mainImageInput = $('#image');
  if (mainImageInput) {
    mainImageInput.addEventListener('change', e => {
      const file = e.target.files[0];
      const preview = $('#image-preview');
      if (!preview) return;
      if (!file) {
        preview.classList.add('d-none');
        preview.src = '';
        return;
      }
      preview.src = URL.createObjectURL(file);
      preview.classList.remove('d-none');
      preview.onload = () => URL.revokeObjectURL(preview.src);
    });
  }

  function closeModal() {
    const modalOverlay = $('#modal-overlay');
    if (modalOverlay) modalOverlay.classList.add('d-none');
    const modalBox = $('#modal-box');
    if (modalBox) modalBox.innerHTML = '';
  }

  async function openEditModal(productId) {
    let productDetails;
    try {
        // Chiamata API per ottenere i dettagli completi del prodotto, inclusi gli ingredienti associati
        // Assumiamo che API_MANAGER_PRODUCT_HANDLER gestisca GET con action=getProduct&idprodotto=ID
        const response = await fetchData(`${API_MANAGER_PRODUCT_HANDLER}?action=getProduct&idprodotto=${productId}`);
        if (!response.success || !response.data) {
            throw new Error(response.error || "Dati prodotto non trovati per la modifica.");
        }
        productDetails = response.data;
    } catch (err) {
        alert(`Errore nel caricamento dei dati del prodotto: ${err.message}`);
        return;
    }

    const modalOverlay = $('#modal-overlay');
    const modalBox = $('#modal-box');
    if (!modalOverlay || !modalBox) return;
    modalBox.innerHTML = '';

    modalBox.append(createEl('h4', { class: 'mb-4 fw-bold' }, 'Modifica Prodotto'));
    const form = createEl('form', { id: 'edit-product-form' });

    // Campo Nome
    const nameFormGroup = createEl('div', { class: 'mb-3' });
    nameFormGroup.append(createEl('label', { class: 'form-label', for: 'edit-name' }, 'Nome Prodotto'));
    const nameInput = createEl('input', { class: 'form-control', type: 'text', id: 'edit-name', name: 'name' });
    nameInput.value = productDetails.nome;
    nameFormGroup.append(nameInput);
    form.append(nameFormGroup);

    // Campo Prezzo
    const priceFormGroup = createEl('div', { class: 'mb-3' });
    priceFormGroup.append(createEl('label', { class: 'form-label', for: 'edit-price' }, 'Prezzo (€)'));
    const priceInput = createEl('input', { class: 'form-control', type: 'number', step: '0.01', min: '0', id: 'edit-price', name: 'price' });
    priceInput.value = productDetails.prezzo;
    priceFormGroup.append(priceInput);
    form.append(priceFormGroup);

    // Campo Categoria (Select)
    const categoryFormGroup = createEl('div', { class: 'mb-3' });
    categoryFormGroup.append(createEl('label', { class: 'form-label', for: 'edit-category-select' }, 'Categoria'));
    const categorySelect = createEl('select', { class: 'form-select', id: 'edit-category-select', name: 'category' });
    categoryFormGroup.append(categorySelect);
    form.append(categoryFormGroup);
    renderCategorySelect('#edit-category-select', productDetails.idcategoria); // Popola e seleziona

    // Campo Ingredienti (Checkboxes)
    const ingredientsOuterContainer = createEl('div', { class: 'mb-3', id: 'edit-ingredients-container' });
    ingredientsOuterContainer.append(createEl('label', { class: 'form-label' }, 'Ingredienti'));
    const ingredientsCheckboxesDiv = createEl('div', { class: 'd-flex flex-wrap gap-2 border p-2 rounded', id: 'edit-ingredient-select' });
    ingredientsCheckboxesDiv.style.maxHeight = '150px';
    ingredientsCheckboxesDiv.style.overflowY = 'auto';
    ingredientsOuterContainer.append(ingredientsCheckboxesDiv);
    form.append(ingredientsOuterContainer);

    // Popola ingredienti e gestisci UI iniziale
    const currentProductIngredientIds = new Set((productDetails.ingredients || []).map(id => parseInt(id, 10)));
    renderIngredientSelect('#edit-ingredient-select', currentProductIngredientIds);
    
    const isPaniniInitially = paniniCategoryId && parseInt(productDetails.idcategoria, 10) === paniniCategoryId;
    updateIngredientSelectUI(isPaniniInitially, false, '#edit-ingredient-select');
    if(isPaniniInitially){ // Assicura che i checkbox siano checkati se la categoria è panini
        $$('#edit-ingredient-select input[type="checkbox"]').forEach(cb => {
            if (currentProductIngredientIds.has(parseInt(cb.value))) {
                cb.checked = true;
            }
        });
    }


    categorySelect.addEventListener('change', () => {
      const selectedCatId = parseInt(categorySelect.value, 10);
      const isPanini = paniniCategoryId && selectedCatId === paniniCategoryId;
      updateIngredientSelectUI(isPanini, false, '#edit-ingredient-select');
      if (!isPanini) { // Se non è panini, pulisci le checkbox degli ingredienti
        $$('#edit-ingredient-select input[type="checkbox"]:checked').forEach(cb => cb.checked = false);
      } else { // Se è panini, ri-checka quelli che erano selezionati per questo prodotto se esistono
         $$('#edit-ingredient-select input[type="checkbox"]').forEach(cb => {
            if (currentProductIngredientIds.has(parseInt(cb.value))) {
                cb.checked = true;
            }
        });
      }
    });
    
    // TODO: Aggiungere input per file immagine se si vuole permettere la modifica dell'immagine.
    // Se si aggiunge, il submit dovrà usare FormData.

    modalBox.append(form);

    const footerActions = createEl('div', { class: 'mt-4 d-flex justify-content-end' });
    const saveBtn = createEl('button', { class: 'btn btn-primary me-2' }, 'Salva Modifiche');
    const cancelBtn = createEl('button', { class: 'btn btn-secondary' }, 'Annulla');
    footerActions.append(saveBtn, cancelBtn);
    modalBox.append(footerActions);

    saveBtn.addEventListener('click', async () => {
      const updatedName = nameInput.value.trim();
      const updatedPrice = parseFloat(priceInput.value);
      const updatedCategoryId = parseInt(categorySelect.value, 10);
      let updatedIngredientsArray = [];

      if (paniniCategoryId && updatedCategoryId === paniniCategoryId) {
        updatedIngredientsArray = $$('#edit-ingredient-select input[type="checkbox"]:checked').map(cb => parseInt(cb.value));
      }

      if (!updatedName || updatedPrice < 0 || isNaN(updatedPrice) || !updatedCategoryId) {
        alert('Nome, prezzo valido e categoria sono obbligatori.');
        return;
      }

      // Per l'aggiornamento, invieremo i dati come FormData via POST con un campo action=update
      // Questo è più semplice se in futuro si volesse aggiungere la modifica dell'immagine.
      const updateFormData = new FormData();
      updateFormData.append('action', 'update');
      updateFormData.append('idprodotto', productId);
      updateFormData.append('name', updatedName);
      updateFormData.append('price', updatedPrice);
      updateFormData.append('category', updatedCategoryId);
      updateFormData.append('ingredients', JSON.stringify(updatedIngredientsArray));
      // Se ci fosse un input file per l'immagine:
      // const imageFile = $('#edit-image-input').files[0];
      // if (imageFile) updateFormData.append('image', imageFile);

      try {
        const jsonResponse = await fetchData(API_MANAGER_PRODUCT_HANDLER, {
          method: 'POST', // Usiamo POST per semplicità con FormData
          body: updateFormData
        });

        if (!jsonResponse.success) {
          throw new Error(jsonResponse.error || `Errore aggiornamento prodotto`);
        }
        alert('Prodotto aggiornato con successo!');
        closeModal();
        await loadInitialData();
      } catch (err) {
        console.error('Errore salvataggio modifiche:', err);
        alert(`Salvataggio fallito: ${err.message}`);
      }
    });

    cancelBtn.addEventListener('click', closeModal);
    modalOverlay.classList.remove('d-none');
  }

  async function openDeleteModal(productId) {
    const product = productsToList.find(p => p.idprodotto == productId);
    if (!product) {
      alert('Errore: prodotto non trovato per eliminazione.');
      return;
    }

    const modalOverlay = $('#modal-overlay');
    const modalBox = $('#modal-box');
    if (!modalOverlay || !modalBox) return;
    modalBox.innerHTML = '';

    modalBox.append(createEl('h4', { class: 'mb-3 fw-bold' }, 'Conferma Eliminazione'));
    modalBox.append(createEl('p', {}, `Sei sicuro di voler eliminare il prodotto "${product.nome}"?`));
    modalBox.append(createEl('p', { class: 'text-danger small' }, 'Questa azione è irreversibile.'));

    const footerActions = createEl('div', { class: 'mt-4 d-flex justify-content-end' });
    const confirmBtn = createEl('button', { class: 'btn btn-danger me-2' }, 'Elimina');
    const cancelBtn = createEl('button', { class: 'btn btn-secondary' }, 'Annulla');
    footerActions.append(confirmBtn, cancelBtn);
    modalBox.append(footerActions);

    confirmBtn.addEventListener('click', async () => {
      try {
        // L'API per DELETE dovrebbe prendere idprodotto come parametro GET
        const jsonResponse = await fetchData(`${API_MANAGER_PRODUCT_HANDLER}?idprodotto=${productId}&action=delete`, {
          method: 'DELETE'
        });

        if (!jsonResponse.success) {
          throw new Error(jsonResponse.error || `Errore eliminazione`);
        }
        alert('Prodotto eliminato con successo!');
        closeModal();
        await loadInitialData();
      } catch (err) {
        console.error('Errore eliminazione:', err);
        alert(`Eliminazione fallita: ${err.message}`);
      }
    });

    cancelBtn.addEventListener('click', closeModal);
    modalOverlay.classList.remove('d-none');
  }

  // Esegui al caricamento del DOM
  window.addEventListener('DOMContentLoaded', () => {
     setTimeout(loadInitialData, 0); // Assicura che il DOM sia completamente pronto
  });
})();