(() => {
  // === HELPERS ===
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const createEl = (tag, attrs = {}, html = "") => {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    if (html) el.innerHTML = html;
    return el;
  };

  // === STATE ===
  let allAvailableIngredients = [];
  let allAvailableCategories = [];
  let productsToList = [];
  let paniniCategoryId = null;

  // === API ENDPOINTS ===
  const API_MENU_PAGE_DATA = "api/api-menu.php"; // prodotti + categorie
  const API_STOCK_DATA = "api/api-manager-stock.php"; // ingredienti
  const API_MANAGER_PRODUCT_HANDLER = "api/api-manager-menu.php"; // CRUD prodotti

  // === GENERIC FETCH ===
  async function fetchData(url, options = {}) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        let msg = `Errore HTTP ${response.status}`;
        try {
          msg = (await response.json()).error || msg;
        } catch (_) {}
        throw new Error(msg);
      }
      const ct = response.headers.get("content-type") || "";
      return ct.includes("application/json") ? response.json() : response.text();
    } catch (err) {
      console.error(`fetch ${url}:`, err);
      throw err;
    }
  }

  // === DATA LOADING ===
  async function loadInitialData() {
    try {
      // 1. prodotti + categorie
      const menuJson = await fetchData(API_MENU_PAGE_DATA);
      productsToList = menuJson.products || [];
      allAvailableCategories = menuJson.categories || [];
      const paniniCat = allAvailableCategories.find(
        (c) => c.descrizione.toLowerCase() === "panini"
      );
      paniniCategoryId = paniniCat ? Number(paniniCat.idcategoria) : null;

      // 2. ingredienti
      const fd = new FormData();
      fd.append("action", "getallproducts");
      const ingJson = await fetchData(API_STOCK_DATA, { method: "POST", body: fd });
      if (!ingJson.success) throw new Error(ingJson.error || "Errore ingredienti");
      allAvailableIngredients = ingJson.data.ingredients.map((i) => ({
        idingrediente: Number(i.idingrediente),
        nome: i.nome,
      }));

      // 3. render UI
      renderFilterButtons();
      renderProducts();
      setupFiltering();
    } catch (err) {
      console.error("loadInitialData:", err);
      const listEl = $("#product-list");
      if (listEl) listEl.innerHTML = `<p class="text-danger">${err.message}</p>`;
    }
  }

  // === RENDER FILTER BUTTONS ===
  function renderFilterButtons() {
    const cont = $("#filter-group");
    if (!cont) return;
    cont.innerHTML = "";

    // "Tutti"
    cont.appendChild(
      createEl(
        "button",
        {
          class: "btn btn-filter active",
          "data-category": "all",
          type: "button",
        },
        "Tutti"
      )
    );

    allAvailableCategories.forEach((cat) => {
      const slug = cat.descrizione.toLowerCase();
      cont.appendChild(
        createEl(
          "button",
          {
            class: "btn btn-filter",
            "data-category": slug,
            type: "button",
          },
          cat.descrizione
        )
      );
    });
  }

  // === RENDER PRODUCTS ===
  function renderProducts() {
    const list = $("#product-list");
    if (!list) return;
    list.innerHTML = "";

    if (!productsToList.length) {
      list.innerHTML = "<p class='text-muted'>Nessun prodotto da visualizzare.</p>";
      return;
    }

    productsToList.forEach((prod) => {
      const col = createEl("div", { class: "col menu-item" });
      const card = createProductCard(prod);
      const cat = allAvailableCategories.find(
        (c) => c.idcategoria == (prod.idcategoria || prod.categoria)
      );
      col.dataset.category = (cat ? cat.descrizione : "unk").toLowerCase();
      col.appendChild(card);
      list.appendChild(col);
    });
  }

  // === PRODUCT CARD ===
  function createProductCard(product) {
    const card = createEl("div", { class: "card h-100 shadow-sm" });

    // Immagine
    const img = createEl("img", {
      class: "card-img-top",
      src: product.image || "./resources/placeholder.png",
      alt: product.nome,
    });
    img.style.height = "180px";
    img.style.objectFit = "cover";
    card.appendChild(img);

    // Corpo della card
    const body = createEl("div", { class: "card-body d-flex flex-column" });
    body.appendChild(createEl("p", { class: "card-title mb-1" }, product.nome));
    body.appendChild(
      createEl(
        "p",
        { class: "card-text text-muted mb-2" },
        `€ ${Number(product.prezzo).toFixed(2)}`
      )
    );

    // Testo della categoria, se esiste
    const catObj = allAvailableCategories.find(
      (c) => c.idcategoria == (product.idcategoria || product.categoria)
    );
    if (catObj) {
      body.appendChild(
        createEl(
          "p",
          { class: "card-text small text-info" },
          `Categoria: ${catObj.descrizione}`
        )
      );
    }

    // Container per i pulsanti di azione
    const actions = createEl("div", {
      class: "mt-auto card-body pt-0 d-flex justify-content-end gap-2",
    });

    // Pulsante MODIFICA (sempre presente)
    const btnEdit = createEl("button", { class: "btn btn-sm btn-primary" }, "Modifica");
    btnEdit.addEventListener("click", () => {
      const catId = product.idcategoria || product.categoria;      // compatibilità vecchi nomi
      if (paniniCategoryId !== null && Number(catId) === paniniCategoryId) {
        // ➜ redirect a pagina dedicata
        window.location.href = `manager_edit_burger.php?id=${product.idprodotto}`;
      } else {
        // ➜ continua con la modale
        openEditModal(product.idprodotto);
      }
    });
    actions.append(btnEdit);


    // Pulsante ELIMINA
    const btnDel = createEl("button", { class: "btn btn-sm btn-danger" }, "Elimina");
    btnDel.addEventListener("click", () => openDeleteModal(product.idprodotto));
    actions.append(btnDel);

    body.appendChild(actions);
    card.appendChild(body);
    return card;
  }

  // === FILTER HANDLER ===
  function setupFiltering() {
    const buttons = $$(".btn-filter");
    const items = $$(".menu-item");
    if (!buttons.length) return;

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const cat = btn.dataset.category;
        items.forEach((it) => {
          it.style.display =
            cat === "all" || it.dataset.category === cat ? "" : "none";
        });
      });
    });
  }

  function renderCategorySelect(selectElementSelector, selectedValue = null) {
    const selectElement = $(selectElementSelector);
    if (!selectElement) {
      console.warn(
        `[renderCategorySelect for ${selectElementSelector}] Elemento select NON TROVATO.`
      );
      return;
    }

    selectElement.innerHTML = '<option value="" disabled>Seleziona una categoria...</option>';
    if (allAvailableCategories.length === 0) {
      selectElement.innerHTML =
        '<option value="" disabled>Nessuna categoria trovata.</option>';
      return;
    }

    allAvailableCategories.forEach((category) => {
      const option = createEl("option", {}, category.descrizione);
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

    container.innerHTML = "";
    if (allAvailableIngredients.length > 0) {
      allAvailableIngredients.forEach(({ idingrediente, nome }) => {
        const label = createEl("label", {
          class: "form-check form-check-inline align-items-center",
        });
        const input = createEl("input", { class: "form-check-input me-1" });
        input.type = "checkbox";
        input.value = idingrediente;
        input.name =
          containerSelector === "#ingredient-select"
            ? "ingredient_options_add"
            : "ingredient_options_edit";
        input.disabled = true;
        if (selectedIngredientIds.has(idingrediente)) {
          input.checked = true;
        }
        label.append(input, createEl("span", { class: "form-check-label" }, nome));
        container.appendChild(label);
      });
    } else {
      container.innerHTML =
        '<p class="text-muted small m-0">Nessun ingrediente definito nel sistema.</p>';
    }
  }

  function updateIngredientSelectUI(
    enable,
    errorLoadingIngredientsGlobal = false,
    containerSelector
  ) {
    const ingredientContainer = $(containerSelector);
    if (!ingredientContainer) return;
    const ingredientCheckboxes = $$(
      `${containerSelector} input[type="checkbox"]`
    );

    if (errorLoadingIngredientsGlobal) {
      ingredientContainer.innerHTML =
        '<p class="text-danger small m-0">Errore nel caricamento generale degli ingredienti.</p>';
      ingredientContainer.style.opacity = "1";
      ingredientContainer.style.pointerEvents = "none";
      return;
    }

    const needsRepopulation =
      ingredientCheckboxes.length === 0 && allAvailableIngredients.length > 0;

    if (enable) {
      if (allAvailableIngredients.length > 0) {
        if (needsRepopulation) {
          // Se non ci sono checkbox ma ci sono ingredienti, renderizza
          renderIngredientSelect(containerSelector, new Set()); // Renderizza con nessun checkbox selezionato di default
        }
        // Ora abilita tutte le checkbox (appena renderizzate o già esistenti)
        $$(`${containerSelector} input[type="checkbox"]`).forEach(
          (checkbox) => (checkbox.disabled = false)
        );
        ingredientContainer.style.opacity = "1";
        ingredientContainer.style.pointerEvents = "auto";
        const placeholder = ingredientContainer.querySelector(
          "p.text-muted.small"
        );
        if (
          placeholder &&
          ingredientContainer.querySelectorAll("input[type=\"checkbox\"]")
            .length > 0
        ) {
          placeholder.remove();
        }
      } else {
        ingredientContainer.innerHTML =
          '<p class="text-muted small m-0">Nessun ingrediente disponibile per la configurazione dei panini.</p>';
        ingredientContainer.style.opacity = "1";
        ingredientContainer.style.pointerEvents = "none";
      }
    } else {
      // disable
      $$(`${containerSelector} input[type="checkbox"]`).forEach((checkbox) => {
        checkbox.disabled = true;
        // Non deselezionare, potrebbero essere pre-selezionate per la modifica
      });
      ingredientContainer.style.opacity = "0.5";
      ingredientContainer.style.pointerEvents = "none";

      if (allAvailableIngredients.length === 0 && !errorLoadingIngredientsGlobal) {
        ingredientContainer.innerHTML =
          '<p class="text-muted small m-0">Nessun ingrediente definito nel sistema.</p>';
        ingredientContainer.style.opacity = "1";
      } else if (
        !errorLoadingIngredientsGlobal &&
        (ingredientCheckboxes.length === 0 && !needsRepopulation)
      ) {
        // Se non ci sono checkbox e non c'era bisogno di popolarle (perché allAvailableIngredients è vuoto)
        // oppure se le checkbox ci sono ma la categoria non è panini
        ingredientContainer.innerHTML =
          '<p class="text-muted small m-0">Seleziona la categoria "Panini" per abilitare la scelta ingredienti.</p>';
        ingredientContainer.style.opacity = "1";
      }
    }
  }





  function closeModal() {
    const modalOverlay = $("#modal-overlay");
    if (modalOverlay) modalOverlay.classList.add("d-none");
    const modalBox = $("#modal-box");
    if (modalBox) modalBox.innerHTML = "";
  }

  async function openEditModal(productId) {
    // Se è un panino, rimanda alla pagina e interrompi
    const paninoCheck = productsToList.find(p => p.idprodotto == productId);
    const isPaniniCategory = paninoCheck && Number(paninoCheck.idcategoria || paninoCheck.categoria) === paniniCategoryId;

    if (isPaniniCategory) {
      window.location.href = `manager_edit_burger.php?id=${productId}`;
      return;
    }

    let productDetails;
    try {
      const response = await fetchData(
        `${API_MANAGER_PRODUCT_HANDLER}?action=getProduct&idprodotto=${productId}`
      );
      if (!response.success || !response.data) {
        throw new Error(response.error || "Dati prodotto non trovati per la modifica.");
      }
      productDetails = response.data;
    } catch (err) {
      showFlash(`Errore caricamento: ${err.message}`, "danger");
      return;
    }

    const modalOverlay = $("#modal-overlay");
    const modalBox = $("#modal-box");
    if (!modalOverlay || !modalBox) return;
    modalBox.innerHTML = "";
    modalBox.append(createEl("p", { class: "mb-4 fw-bold" }, "Modifica Prodotto"));

    const form = createEl("form", { id: "edit-product-form", enctype: "multipart/form-data" });

    // Campo Nome
    const nameFormGroup = createEl("div", { class: "mb-3" });
    nameFormGroup.append(createEl("label", { class: "form-label", for: "edit-name" }, "Nome Prodotto"));
    const nameInput = createEl("input", {
      class: "form-control",
      type: "text",
      id: "edit-name",
      name: "name",
      value: productDetails.nome,
    });
    nameFormGroup.append(nameInput);
    form.append(nameFormGroup);

    // Campo Prezzo
    const priceFormGroup = createEl("div", { class: "mb-3" });
    priceFormGroup.append(createEl("label", { class: "form-label", for: "edit-price" }, "Prezzo (€)"));
    const priceInput = createEl("input", {
      class: "form-control",
      type: "number",
      step: "0.01",
      min: "0",
      id: "edit-price",
      name: "price",
      value: productDetails.prezzo,
    });
    priceFormGroup.append(priceInput);
    form.append(priceFormGroup);

    // Campo Categoria (nascosto)
    const categoryHidden = createEl("input", {
      type: "hidden",
      id: "edit-category-id",
      name: "category",
      value: productDetails.idcategoria,
    });
    form.append(categoryHidden);

    // Campo Disponibilità (solo per non-panini)
    const availabilityFormGroup = createEl("div", { class: "mb-3", id: "edit-availability-container" });
    availabilityFormGroup.style.display = isPaniniCategory ? "none" : "block";
    availabilityFormGroup.append(createEl("label", { class: "form-label", for: "edit-availability" }, "Disponibilità"));
    const availabilityInput = createEl("input", {
      class: "form-control",
      type: "number",
      min: "0",
      id: "edit-availability",
      name: "availability",
      value: productDetails.disponibilita ?? '0',
    });
    availabilityFormGroup.append(availabilityInput);
    form.append(availabilityFormGroup);

    // Campo Immagine
    const imageFormGroup = createEl("div", { class: "mb-3" });
    imageFormGroup.append(createEl("label", { class: "form-label", for: "edit-image" }, "Cambia Immagine (opzionale)"));
    const imageInput = createEl("input", {
      class: "form-control",
      type: "file",
      id: "edit-image",
      name: "image",
      accept: "image/*",
    });
    imageFormGroup.append(imageInput);

    // Anteprima Immagine
    const currentImagePreview = createEl("img", {
      src: productDetails.image,
      alt: "Immagine attuale",
      class: "img-thumbnail mt-2",
      style: "max-height: 100px;",
    });
    const newImagePreviewContainer = createEl("div", { id: "edit-new-image-preview-container", class: "mt-2" });
    imageFormGroup.append(currentImagePreview, newImagePreviewContainer);
    form.append(imageFormGroup);

    imageInput.addEventListener("change", (e) => {
      newImagePreviewContainer.innerHTML = "";
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = function(event) {
          const newImg = createEl("img", {
            src: event.target.result,
            alt: "Anteprima nuova immagine",
            class: "img-thumbnail",
            style: "max-height: 100px;",
          });
          newImagePreviewContainer.appendChild(newImg);
          currentImagePreview.style.display = 'none';
        };
        reader.readAsDataURL(e.target.files[0]);
      } else {
        currentImagePreview.style.display = 'block';
      }
    });

    modalBox.append(form);

    const footerActions = createEl("div", { class: "mt-4 d-flex justify-content-end" });
    const saveBtn = createEl("button", { class: "btn btn-primary me-2" }, "Salva Modifiche");
    const cancelBtn = createEl("button", { class: "btn btn-secondary" }, "Annulla");
    footerActions.append(saveBtn, cancelBtn);
    modalBox.append(footerActions);

    saveBtn.addEventListener("click", async () => {
      const updatedName = nameInput.value.trim();
      const updatedPrice = parseFloat(priceInput.value);
      const updatedCategoryId = parseInt(categoryHidden.value, 10);
      const updatedAvailability = isPaniniCategory ? null : parseInt(availabilityInput.value, 10);
      const imageFile = imageInput.files[0];
      const updatedIngredientsArray = []; // Vuoto per non-panini

      if (!updatedName || updatedPrice < 0 || isNaN(updatedPrice) || !updatedCategoryId || (updatedAvailability !== null && (isNaN(updatedAvailability) || updatedAvailability < 0))) {
        showFlash("Nome, prezzo, categoria e disponibilità validi sono obbligatori.", "warning");
        return;
      }

      const updateFormData = new FormData();
      updateFormData.append("action", "update");
      updateFormData.append("idprodotto", productId);
      updateFormData.append("name", updatedName);
      updateFormData.append("price", updatedPrice);
      updateFormData.append("category", updatedCategoryId);
      updateFormData.append("ingredients", JSON.stringify(updatedIngredientsArray)); // Invia array vuoto

      if (updatedAvailability !== null) {
        updateFormData.append("availability", updatedAvailability);
      }
      if (imageFile) {
        updateFormData.append("image", imageFile);
      }

      try {
        const jsonResponse = await fetchData(API_MANAGER_PRODUCT_HANDLER, {
          method: "POST",
          body: updateFormData,
        });
        if (!jsonResponse.success) {
          throw new Error(jsonResponse.error || `Errore aggiornamento prodotto`);
        }
        showFlash("Prodotto aggiornato con successo!", "success");
        closeModal();
        await loadInitialData();
      } catch (err) {
        console.error("Errore salvataggio modifiche:", err);
        showFlash(`Salvataggio fallito: ${err.message}`, "danger");
      }
    });

    cancelBtn.addEventListener("click", closeModal);
    modalOverlay.classList.remove("d-none");
  }

  async function openDeleteModal(productId) {
    const product = productsToList.find((p) => p.idprodotto == productId);
    if (!product) {
      showFlash("Prodotto non trovato", "warning");
      return;
    }

    const modalOverlay = $("#modal-overlay");
    const modalBox = $("#modal-box");
    if (!modalOverlay || !modalBox) return;

    modalBox.innerHTML = "";
    modalBox.append(
      createEl("p", { class: "mb-3 fw-bold" }, "Conferma Eliminazione")
    );
    modalBox.append(
      createEl("p", {}, `Sei sicuro di voler eliminare il prodotto "${product.nome}"?`)
    );
    modalBox.append(
      createEl("p", { class: "text-danger small" }, "Questa azione è irreversibile.")
    );

    const footerActions = createEl("div", { class: "mt-4 d-flex justify-content-end" });
    const confirmBtn = createEl("button", { class: "btn btn-danger me-2" }, "Elimina");
    const cancelBtn = createEl("button", { class: "btn btn-secondary" }, "Annulla");
    footerActions.append(confirmBtn, cancelBtn);
    modalBox.append(footerActions);

    confirmBtn.addEventListener("click", async () => {
      try {
        // L'API per DELETE dovrebbe prendere idprodotto come parametro GET
        const jsonResponse = await fetchData(
          `${API_MANAGER_PRODUCT_HANDLER}?idprodotto=${productId}&action=delete`,
          {
            method: "DELETE",
          }
        );
        if (!jsonResponse.success) {
          throw new Error(jsonResponse.error || `Errore eliminazione`);
        }
        showFlash("Prodotto eliminato con successo!", "success");
        closeModal();
        await loadInitialData();
      } catch (err) {
        console.error("Errore eliminazione:", err);
        showFlash(`Eliminazione fallita: ${err.message}`, "danger");
      }
    });

    cancelBtn.addEventListener("click", closeModal);
    modalOverlay.classList.remove("d-none");
  }

  // === FLASH MESSAGE HELPER ============================================
  function showFlash(html, variant = "success", ms = 1500) {
    const overlay = document.createElement("div");
    overlay.className = "flash-overlay";
    overlay.innerHTML = `
      <div class="card shadow flash-card text-center">
        <div class="flash-body py-4 px-5 fw-bold ${
            variant === "success" ? "text-success"
          : variant === "danger"  ? "text-danger"
          : variant === "warning" ? "text-warning"
          : "text-info"}">
          ${html}
        </div>
        <button class="btn-close position-absolute top-0 end-0 m-3"></button>
      </div>`;
    document.body.append(overlay);

    const close = () => overlay.remove();
    overlay.querySelector(".btn-close").addEventListener("click", close);
    setTimeout(close, ms);
  }


  // === NUOVO PRODOTTO BUTTON ===
  function setupNewProductButton() {
    const btnNewProduct = $("#btn-new-product");
    if (btnNewProduct) {
      btnNewProduct.addEventListener("click", () => {
        window.location.href = "manager_edit_burger.php";
      });
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      loadInitialData();
      setupNewProductButton();
    }, 0); // Assicura che il DOM sia completamente pronto
  });
})();