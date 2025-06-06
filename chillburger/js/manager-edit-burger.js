// chillburger/js/manager-edit-burger.js
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
  let paniniCategoryId = null;
  let isEditMode = false;
  let currentProductId = null;

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

  // === TOAST NOTIFICATIONS ===
  function showToast(title, message, type = 'info') {
    const toast = $("#toast-message");
    const toastTitle = $("#toast-title");
    const toastBody = $("#toast-body");
    
    if (toast && toastTitle && toastBody) {
      toastTitle.textContent = title;
      toastBody.textContent = message;
      
      // Remove existing classes and add new one
      toast.className = `toast ${type === 'error' ? 'bg-danger text-white' : type === 'success' ? 'bg-success text-white' : ''}`;
      
      // Show toast using Bootstrap
      const bsToast = new bootstrap.Toast(toast);
      bsToast.show();
    }
  }

  // === INITIALIZATION ===
  async function initializePage() {
    try {
      // Check if we're in edit mode
      const urlParams = new URLSearchParams(window.location.search);
      currentProductId = urlParams.get('id');
      isEditMode = !!currentProductId;

      // Update page title and button text
      const pageTitle = $("#page-title");
      const submitText = $("#submit-text");
      
      if (isEditMode) {
        if (pageTitle) pageTitle.textContent = "Modifica Prodotto";
        if (submitText) submitText.textContent = "Salva Modifiche";
      }

      // Load initial data
      await loadInitialData();
      
      // Setup form handlers
      setupFormHandlers();
      
      // If edit mode, load product data
      if (isEditMode) {
        await loadProductData(currentProductId);
      }

    } catch (err) {
      console.error("initializePage:", err);
      showToast("Errore", "Errore durante l'inizializzazione della pagina", "error");
    }
  }

  // === DATA LOADING ===
  async function loadInitialData() {
    try {
      // 1. Load categories
      const menuJson = await fetchData(API_MENU_PAGE_DATA);
      allAvailableCategories = menuJson.categories || [];
      const paniniCat = allAvailableCategories.find(
        (c) => c.descrizione.toLowerCase() === "panini"
      );
      paniniCategoryId = paniniCat ? Number(paniniCat.idcategoria) : null;

      // 2. Load ingredients
      const fd = new FormData();
      fd.append("action", "getallproducts");
      const ingJson = await fetchData(API_STOCK_DATA, { method: "POST", body: fd });
      if (!ingJson.success) throw new Error(ingJson.error || "Errore ingredienti");
      allAvailableIngredients = ingJson.data.ingredients.map((i) => ({
        idingrediente: Number(i.idingrediente),
        nome: i.nome,
      }));

      // 3. Render UI
      renderCategorySelect();
      renderIngredientsSection();

    } catch (err) {
      console.error("loadInitialData:", err);
      showToast("Errore", "Errore durante il caricamento dei dati", "error");
    }
  }

  // === LOAD PRODUCT DATA FOR EDIT ===
  async function loadProductData(productId) {
    try {
      const response = await fetchData(`${API_MANAGER_PRODUCT_HANDLER}?action=getProduct&idprodotto=${productId}`);
      
      if (!response.success) {
        throw new Error(response.error || "Prodotto non trovato");
      }

      const product = response.data;
      
      // Fill form fields
      $("#product-id").value = product.idprodotto;
      $("#product-name").value = product.nome;
      $("#product-price").value = product.prezzo;
      
      // Set category (disabled for edit)
      const categorySelect = $("#product-category");
      if (categorySelect) {
        categorySelect.value = product.idcategoria;
        categorySelect.disabled = true;
        $("#category-help-text").style.display = "block";
      }

      // Show current image (disabled for edit)
      if (product.image) {
        const currentImageContainer = $("#current-image-container");
        const currentImage = $("#current-image");
        if (currentImageContainer && currentImage) {
          currentImage.src = product.image;
          currentImageContainer.style.display = "block";
        }
      }
      
      // Disable image upload for edit
      const imageInput = $("#product-image");
      if (imageInput) {
        imageInput.disabled = true;
        $("#image-help-text").style.display = "block";
      }

      // Handle category-specific fields
      const isPanini = paniniCategoryId && Number(product.idcategoria) === paniniCategoryId;
      
      if (isPanini) {
        // For panini: show ingredients, hide availability, hide image field
        showIngredientsSection();
        hideAvailabilitySection();
        hideImageSection();
        
        if (product.ingredients && Array.isArray(product.ingredients)) {
          selectIngredients(product.ingredients);
        }
      } else {
        // For non-panini: hide ingredients, show availability, show image info
        hideIngredientsSection();
        showAvailabilitySection();
        
        // Set availability value if available
        if (typeof product.disponibilita !== 'undefined') {
          const availabilityInput = $("#product-availability");
          if (availabilityInput) {
            availabilityInput.value = product.disponibilita;
          }
        }
      }

    } catch (err) {
      console.error("loadProductData:", err);
      showToast("Errore", "Errore durante il caricamento del prodotto", "error");
    }
  }

  // === RENDER CATEGORY SELECT ===
  function renderCategorySelect() {
    const selectElement = $("#product-category");
    if (!selectElement) return;

    selectElement.innerHTML = '<option value="" disabled selected>Seleziona una categoria...</option>';
    
    if (allAvailableCategories.length === 0) {
      selectElement.innerHTML = '<option value="" disabled>Nessuna categoria trovata.</option>';
      return;
    }

    allAvailableCategories.forEach((category) => {
      const option = createEl("option", {}, category.descrizione);
      option.value = category.idcategoria;
      selectElement.appendChild(option);
    });
  }

  // === RENDER INGREDIENTS SECTION ===
  function renderIngredientsSection() {
    const container = $("#ingredients-list");
    if (!container) return;

    container.innerHTML = "";
    
    if (allAvailableIngredients.length > 0) {
      allAvailableIngredients.forEach(({ idingrediente, nome }) => {
        const label = createEl("label", {
          class: "form-check form-check-inline align-items-center me-3 mb-2",
        });
        
        const input = createEl("input", { 
          class: "form-check-input me-1",
          type: "checkbox",
          value: idingrediente,
          name: "ingredients"
        });
        
        const span = createEl("span", { class: "form-check-label" }, nome);
        
        label.append(input, span);
        container.appendChild(label);
      });
      
      $("#ingredients-loading").style.display = "none";
    } else {
      $("#ingredients-loading").style.display = "none";
      $("#ingredients-error").style.display = "block";
    }
  }

  // === SHOW/HIDE INGREDIENTS SECTION ===
  function showIngredientsSection() {
    const section = $("#ingredients-section");
    if (section) {
      section.style.display = "block";
    }
  }

  function hideIngredientsSection() {
    const section = $("#ingredients-section");
    if (section) {
      section.style.display = "none";
    }
  }

  // === SHOW/HIDE AVAILABILITY SECTION ===
  function showAvailabilitySection() {
    const section = $("#availability-section");
    if (section) {
      section.style.display = "block";
      // Make availability required for non-panini products
      const availabilityInput = $("#product-availability");
      if (availabilityInput) {
        availabilityInput.required = true;
        // Set default value if empty (only for new products)
        if (!isEditMode && !availabilityInput.value) {
          availabilityInput.value = "1";
        }
      }
    }
  }

  function hideAvailabilitySection() {
    const section = $("#availability-section");
    if (section) {
      section.style.display = "none";
      // Remove required attribute when hidden
      const availabilityInput = $("#product-availability");
      if (availabilityInput) {
        availabilityInput.required = false;
      }
    }
  }

  // === SHOW/HIDE IMAGE SECTION ===
  function hideImageSection() {
    const imageInput = $("#product-image");
    const imageHelpText = $("#image-help-text");
    const currentImageContainer = $("#current-image-container");
    
    if (imageInput) {
      imageInput.style.display = "none";
      imageInput.required = false;
    }
    if (imageHelpText) {
      imageHelpText.style.display = "none";
    }
    if (currentImageContainer) {
      currentImageContainer.style.display = "none";
    }
  }

  // === SELECT INGREDIENTS ===
  function selectIngredients(ingredientIds) {
    const checkboxes = $$('#ingredients-list input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.checked = ingredientIds.includes(Number(checkbox.value));
    });
  }

  // === FORM HANDLERS ===
  function setupFormHandlers() {
    // Category change handler
    const categorySelect = $("#product-category");
    if (categorySelect) {
      categorySelect.addEventListener("change", handleCategoryChange);
    }

    // Image preview handler
    const imageInput = $("#product-image");
    if (imageInput) {
      imageInput.addEventListener("change", handleImagePreview);
    }

    // Form submit handler
    const form = $("#product-form");
    if (form) {
      form.addEventListener("submit", handleFormSubmit);
    }

    // Cancel button handler
    const cancelBtn = $("#btn-cancel");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        window.location.href = "manager_menu.php";
      });
    }
  }

  // === CATEGORY CHANGE HANDLER ===
  function handleCategoryChange(event) {
    const selectedCategoryId = parseInt(event.target.value, 10);
    const isPanini = paniniCategoryId !== null && selectedCategoryId === paniniCategoryId;
    
    if (isPanini) {
      // For panini: show ingredients, hide availability
      showIngredientsSection();
      hideAvailabilitySection();
    } else {
      // For non-panini: hide ingredients, show availability
      hideIngredientsSection();
      showAvailabilitySection();
      
      // Clear ingredient selections
      const checkboxes = $$('#ingredients-list input[type="checkbox"]:checked');
      checkboxes.forEach(cb => cb.checked = false);
    }
  }

  // === IMAGE PREVIEW HANDLER ===
  function handleImagePreview(event) {
    const file = event.target.files[0];
    const previewContainer = $("#image-preview-container");
    const preview = $("#image-preview");
    
    if (file && previewContainer && preview) {
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.src = e.target.result;
        previewContainer.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else if (previewContainer) {
      previewContainer.style.display = "none";
    }
  }

  // === FORM SUBMIT HANDLER ===
  async function handleFormSubmit(event) {
    event.preventDefault();
    
    const submitBtn = $("#btn-submit");
    const submitText = $("#submit-text");
    const submitLoading = $("#submit-loading");
    
    // Show loading state
    if (submitBtn) submitBtn.disabled = true;
    if (submitText) submitText.style.display = "none";
    if (submitLoading) submitLoading.style.display = "inline-block";

    try {
      const formData = new FormData();
      
      // Basic fields
      formData.append("name", $("#product-name").value);
      formData.append("price", $("#product-price").value);
      formData.append("category", $("#product-category").value);
      
      // Add availability for non-panini products
      const selectedCategoryId = parseInt($("#product-category").value, 10);
      const isPanini = paniniCategoryId !== null && selectedCategoryId === paniniCategoryId;
      
      if (!isPanini) {
        const availabilityInput = $("#product-availability");
        const availability = parseInt(availabilityInput.value, 10);
        
        // Validate availability
        if (isNaN(availability) || availability < 0) {
          throw new Error("La disponibilità deve essere un numero intero positivo o zero");
        }
        
        formData.append("availability", availability);
      }
      
      // Handle ingredients
      const selectedIngredients = [];
      const checkedBoxes = $$('#ingredients-list input[type="checkbox"]:checked');
      checkedBoxes.forEach(cb => selectedIngredients.push(Number(cb.value)));
      formData.append("ingredients", JSON.stringify(selectedIngredients));
      
      if (isEditMode) {
        // Edit mode
        formData.append("action", "update");
        formData.append("idprodotto", currentProductId);
        
        // Only add image if a new one is selected (though it's disabled in edit mode)
        const imageFile = $("#product-image").files[0];
        if (imageFile) {
          formData.append("image", imageFile);
        }
      } else {
        // Add mode
        formData.append("action", "add");
        
        // Image is required for new products
        const imageFile = $("#product-image").files[0];
        if (!imageFile) {
          throw new Error("L'immagine è obbligatoria per i nuovi prodotti");
        }
        formData.append("image", imageFile);
      }

      const response = await fetchData(API_MANAGER_PRODUCT_HANDLER, {
        method: "POST",
        body: formData
      });

      if (response.success) {
        showToast("Successo", 
          isEditMode ? "Prodotto modificato con successo!" : "Prodotto aggiunto con successo!", 
          "success"
        );
        
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = "manager_menu.php";
        }, 1500);
      } else {
        throw new Error(response.error || "Errore durante il salvataggio");
      }

    } catch (err) {
      console.error("handleFormSubmit:", err);
      showToast("Errore", err.message, "error");
    } finally {
      // Reset loading state
      if (submitBtn) submitBtn.disabled = false;
      if (submitText) submitText.style.display = "inline";
      if (submitLoading) submitLoading.style.display = "none";
    }
  }

  // === INITIALIZATION ===
  window.addEventListener("DOMContentLoaded", () => {
    setTimeout(initializePage, 0);
  });
})();