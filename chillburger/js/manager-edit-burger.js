// chillburger/js/manager-edit-burger.js (Versione con JavaScript Standard)
(() => {
  // === HELPERS ===
  const getEl = (sel, root = document) => root.querySelector(sel);
  const getAllEl = (sel, root = document) => root.querySelectorAll(sel);
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
  const API_MENU_PAGE_DATA = "api/api-menu.php";
  const API_STOCK_DATA = "api/api-manager-stock.php";
  const API_MANAGER_PRODUCT_HANDLER = "api/api-manager-menu.php";

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
    const toast = getEl("#toast-message");
    const toastTitle = getEl("#toast-title");
    const toastBody = getEl("#toast-body");
    
    if (toast && toastTitle && toastBody) {
      toastTitle.textContent = title;
      toastBody.textContent = message;
      toast.className = `toast ${type === 'error' ? 'bg-danger text-white' : type === 'success' ? 'bg-success text-white' : ''}`;
      const bsToast = new bootstrap.Toast(toast);
      bsToast.show();
    }
  }

  // === INITIALIZATION ===
  async function initializePage() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      currentProductId = urlParams.get('id');
      isEditMode = !!currentProductId;

      const pageTitle = getEl("#page-title");
      const submitText = getEl("#submit-text");
      
      if (isEditMode) {
        if (pageTitle) pageTitle.textContent = "Modifica Prodotto";
        if (submitText) submitText.textContent = "Salva Modifiche";
      }

      await loadInitialData();
      setupFormHandlers();
      
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
      const menuJson = await fetchData(API_MENU_PAGE_DATA);
      allAvailableCategories = menuJson.categories || [];
      const paniniCat = allAvailableCategories.find(c => c.descrizione.toLowerCase() === "panini");
      paniniCategoryId = paniniCat ? Number(paniniCat.idcategoria) : null;

      const fd = new FormData();
      fd.append("action", "getallproducts");
      const ingJson = await fetchData(API_STOCK_DATA, { method: "POST", body: fd });
      if (!ingJson.success) throw new Error(ingJson.error || "Errore ingredienti");
      allAvailableIngredients = ingJson.data.ingredients.map(i => ({
        idingrediente: Number(i.idingrediente),
        nome: i.nome,
      }));

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
      if (!response.success) throw new Error(response.error || "Prodotto non trovato");

      const product = response.data;
      getEl("#product-id").value = product.idprodotto;
      getEl("#product-name").value = product.nome;
      getEl("#product-price").value = product.prezzo;
      
      const categorySelect = getEl("#product-category");
      if (categorySelect) {
        categorySelect.value = product.idcategoria;
      }

      if (product.image) {
        const currentImageContainer = getEl("#current-image-container");
        const currentImage = getEl("#current-image");
        if (currentImageContainer && currentImage) {
          currentImage.src = product.image;
          currentImageContainer.style.display = "block";
        }
      }
      
      const isPanini = paniniCategoryId && Number(product.idcategoria) === paniniCategoryId;
      handleCategoryChange({ target: { value: product.idcategoria } }); // Simula il cambio per mostrare/nascondere le sezioni corrette

      if (isPanini) {
        if (product.ingredients && Array.isArray(product.ingredients)) {
          selectIngredients(product.ingredients);
        }
      } else {
        if (typeof product.disponibilita !== 'undefined') {
          const availabilityInput = getEl("#product-availability");
          if (availabilityInput) availabilityInput.value = product.disponibilita;
        }
      }
    } catch (err) {
      console.error("loadProductData:", err);
      showToast("Errore", `Errore caricamento prodotto: ${err.message}`, "error");
    }
  }
  
  // === RENDER UI COMPONENTS ===
  function renderCategorySelect() {
    const selectElement = getEl("#product-category");
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

  function renderIngredientsSection() {
    const container = getEl("#ingredients-list");
    if (!container) return;
    container.innerHTML = "";
    if (allAvailableIngredients.length > 0) {
      allAvailableIngredients.forEach(({ idingrediente, nome }) => {
        const label = createEl("label", { class: "form-check form-check-inline align-items-center me-3 mb-2" });
        const input = createEl("input", { class: "form-check-input me-1", type: "checkbox", value: idingrediente, name: "ingredients" });
        const span = createEl("span", { class: "form-check-label" }, nome);
        label.append(input, span);
        container.appendChild(label);
      });
      getEl("#ingredients-loading").style.display = "none";
    } else {
      getEl("#ingredients-loading").style.display = "none";
      getEl("#ingredients-error").style.display = "block";
    }
  }

  // === UI VISIBILITY MANAGERS ===
  function showHideSection(sectionId, show) {
      const section = getEl(sectionId);
      if (section) {
          section.style.display = show ? 'block' : 'none';
      }
  }

  function manageAvailabilityField(show) {
      const availabilityInput = getEl("#product-availability");
      showHideSection("#availability-section", show);
      if (availabilityInput) {
          availabilityInput.required = show;
          if (show && !isEditMode && !availabilityInput.value) {
              availabilityInput.value = "1";
          }
      }
  }

  // === SELECT INGREDIENTS ===
  function selectIngredients(ingredientIds) {
    getAllEl('#ingredients-list input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = ingredientIds.includes(Number(checkbox.value));
    });
  }

  // === EVENT HANDLERS ===
  function setupFormHandlers() {
    const categorySelect = getEl("#product-category");
    if (categorySelect) categorySelect.addEventListener("change", handleCategoryChange);

    const imageInput = getEl("#product-image");
    if (imageInput) imageInput.addEventListener("change", handleImagePreview);

    const form = getEl("#product-form");
    if (form) form.addEventListener("submit", handleFormSubmit);

    const cancelBtn = getEl("#btn-cancel");
    if (cancelBtn) cancelBtn.addEventListener("click", () => window.location.href = "manager_menu.php");
  }

  function handleCategoryChange(event) {
    const selectedCategoryId = parseInt(event.target.value, 10);
    const isPanini = paniniCategoryId !== null && selectedCategoryId === paniniCategoryId;
    
    showHideSection("#ingredients-section", isPanini);
    manageAvailabilityField(!isPanini);
    
    if (!isPanini) {
      getAllEl('#ingredients-list input[type="checkbox"]:checked').forEach(cb => cb.checked = false);
    }
  }

  function handleImagePreview(event) {
    const file = event.target.files[0];
    const previewContainer = getEl("#image-preview-container");
    const preview = getEl("#image-preview");
    
    if (file && previewContainer && preview) {
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.src = e.target.result;
        previewContainer.style.display = "block";
        getEl('#current-image-container').style.display = 'none'; // Nasconde l'immagine corrente se se ne carica una nuova
      };
      reader.readAsDataURL(file);
    } else if (previewContainer) {
      previewContainer.style.display = "none";
    }
  }

  async function handleFormSubmit(event) {
    event.preventDefault();
    
    const submitBtn = getEl("#btn-submit");
    const submitText = getEl("#submit-text");
    const submitLoading = getEl("#submit-loading");
    
    if (submitBtn) submitBtn.disabled = true;
    if (submitText) submitText.style.display = "none";
    if (submitLoading) submitLoading.style.display = "inline-block";

    try {
      const formData = new FormData();
      formData.append("name", getEl("#product-name").value);
      formData.append("price", getEl("#product-price").value);
      formData.append("category", getEl("#product-category").value);
      
      const selectedCategoryId = parseInt(getEl("#product-category").value, 10);
      const isPanini = paniniCategoryId !== null && selectedCategoryId === paniniCategoryId;
      
      if (!isPanini) {
        const availabilityInput = getEl("#product-availability");
        const availability = parseInt(availabilityInput.value, 10);
        if (isNaN(availability) || availability < 0) {
          throw new Error("La disponibilità deve essere un numero intero positivo o zero.");
        }
        formData.append("availability", availability);
      }
      
      const selectedIngredients = Array.from(getAllEl('#ingredients-list input[type="checkbox"]:checked')).map(cb => Number(cb.value));
      formData.append("ingredients", JSON.stringify(selectedIngredients));
      
      const imageFile = getEl("#product-image").files[0];

      if (isEditMode) {
        formData.append("action", "update");
        formData.append("idprodotto", currentProductId);
        if (imageFile) formData.append("image", imageFile); // Aggiunge l'immagine solo se ne è stata selezionata una nuova
      } else {
        formData.append("action", "add");
        if (!imageFile) throw new Error("L'immagine è obbligatoria per i nuovi prodotti.");
        formData.append("image", imageFile);
      }

      const response = await fetchData(API_MANAGER_PRODUCT_HANDLER, { method: "POST", body: formData });

      if (response.success) {
        const successMessage = isEditMode ? "Prodotto modificato con successo!" : "Prodotto aggiunto con successo!";
        showToast("Successo", successMessage, "success");
        setTimeout(() => window.location.href = "manager_menu.php", 1500);
      } else {
        throw new Error(response.error || "Errore durante il salvataggio.");
      }
    } catch (err) {
      console.error("handleFormSubmit:", err);
      showToast("Errore", err.message, "error");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (submitText) submitText.style.display = "inline";
      if (submitLoading) submitLoading.style.display = "none";
    }
  }

  // === INITIALIZATION ===
  window.addEventListener("DOMContentLoaded", initializePage);
})();