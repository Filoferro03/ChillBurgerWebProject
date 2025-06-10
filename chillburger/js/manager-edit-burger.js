(() => {
    // === HELPERS ===
    const getEl = (sel) => document.querySelector(sel);
    const getAllEl = (sel) => document.querySelectorAll(sel);

    // === STATE ===
    let allAvailableIngredients = [];
    let paniniCategoryId = null;

    // === API ENDPOINTS ===
    const API_MENU_PAGE_DATA = "api/api-menu.php";
    const API_STOCK_DATA = "api/api-manager-stock.php";
    const API_MANAGER_PRODUCT_HANDLER = "api/api-manager-menu.php";

    // --- Funzione Fetch Generica ---
    async function fetchData(url, options = {}) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Errore generico' }));
                throw new Error(errorData.error || `HTTP error ${response.status}`);
            }
            return response.json();
        } catch (err) {
            showToast("Errore di Rete", err.message, "error");
            throw err;
        }
    }
    
    // --- Notifiche Toast ---
    function showToast(title, message, type = 'info') {
        const toast = getEl("#toast-message");
        if (!toast) return;
        const bsToast = new bootstrap.Toast(toast);
        getEl("#toast-title").textContent = title;
        getEl("#toast-body").textContent = message;
        toast.className = `toast ${type === 'error' ? 'bg-danger text-white' : 'bg-success text-white'}`;
        bsToast.show();
    }

    // --- Funzioni UI Ingredienti ---

    /**
     * Aggiunge una riga di ingrediente al form.
     * @param {object} [ingredientData] - Dati per pre-popolare la riga.
     */
    function addIngredientRow(ingredientData = {}) {
        const container = getEl('#ingredients-rows-container');
        const row = document.createElement('div');
        row.className = 'ingredient-row d-flex align-items-center gap-2 mb-2';
        
        row.innerHTML = `
            <div class="flex-grow-1">
                <label class="visually-hidden">Nome Ingrediente</label>
                <input type="text" list="ingredients-datalist" class="form-control form-control-sm ingredient-name" placeholder="Nome ingrediente" required value="${ingredientData.nome || ''}">
            </div>
            <div>
                <label class="visually-hidden">Quantità</label>
                <input type="number" class="form-control form-control-sm ingredient-quantity" placeholder="Q.tà" min="1" required value="${ingredientData.quantita || 1}">
            </div>
            <div class="form-check">
                <input type="checkbox" class="form-check-input ingredient-essential" ${ingredientData.essenziale ? 'checked' : ''}>
                <label class="form-check-label small">Essenz.</label>
            </div>
            <button type="button" class="btn btn-danger btn-sm btn-remove-ingredient">
                <span class="fas fa-trash"></span>
            </button>
        `;

        container.appendChild(row);

        row.querySelector('.btn-remove-ingredient').addEventListener('click', () => {
            row.remove();
        });
    }

    /** Popola il datalist con gli ingredienti disponibili */
    function populateIngredientDatalist() {
        const datalist = getEl('#ingredients-datalist');
        if (!datalist) return;
        datalist.innerHTML = '';
        allAvailableIngredients.forEach(({ nome }) => {
            const option = document.createElement('option');
            option.value = nome;
            datalist.appendChild(option);
        });
    }
    
    // --- Caricamento Dati e Setup Iniziale ---
    
    /** Inizializzazione principale della pagina */
    async function initializePage() {
        const urlParams = new URLSearchParams(window.location.search);
        const currentProductId = urlParams.get('id');
        const isEditMode = !!currentProductId;

        getEl("#page-title").textContent = isEditMode ? "Modifica Prodotto" : "Nuovo Prodotto";
        getEl("#submit-text").textContent = isEditMode ? "Salva Modifiche" : "Aggiungi Prodotto";

        try {
            await loadInitialData();
            setupFormHandlers();
            if (isEditMode) {
                await loadProductData(currentProductId);
            }
        } catch (error) {
            console.error("Inizializzazione fallita:", error);
        }
    }

    /** Carica categorie e ingredienti disponibili */
    async function loadInitialData() {
        const menuData = await fetchData(API_MENU_PAGE_DATA);
        
        const stockFormData = new FormData();
        stockFormData.append("action", "getallproducts");
        const stockData = await fetchData(API_STOCK_DATA, { method: "POST", body: stockFormData });

        const categories = menuData.categories || [];
        paniniCategoryId = (categories.find(c => c.descrizione.toLowerCase() === 'panini') || {}).idcategoria;

        allAvailableIngredients = (stockData.data.ingredients || []).map(i => ({ idingrediente: i.idingrediente, nome: i.nome }));
        
        const categorySelect = getEl("#product-category");
        categorySelect.innerHTML = '<option value="" disabled selected>Seleziona...</option>';
        categories.forEach(cat => {
            categorySelect.innerHTML += `<option value="${cat.idcategoria}">${cat.descrizione}</option>`;
        });
        
        populateIngredientDatalist();
    }

    /** Carica i dati di un prodotto esistente per la modifica */
    async function loadProductData(productId) {
        const { data: product } = await fetchData(`${API_MANAGER_PRODUCT_HANDLER}?action=getProduct&idprodotto=${productId}`);
        
        getEl("#product-name").value = product.nome;
        getEl("#product-price").value = product.prezzo;
        getEl("#product-category").value = product.idcategoria;

        if (product.image) {
            getEl("#current-image").src = product.image;
            getEl("#current-image-container").style.display = "block";
        }

        getEl("#product-category").dispatchEvent(new Event('change'));

        if (product.idcategoria == paniniCategoryId && Array.isArray(product.ingredients)) {
            product.ingredients.forEach(ing => addIngredientRow(ing));
        } else {
             getEl("#product-availability").value = product.disponibilita ?? 0;
        }
    }
    
    // --- Gestori di Eventi ---
    function setupFormHandlers() {
        getEl("#product-category").addEventListener("change", handleCategoryChange);
        getEl("#product-image").addEventListener("change", handleImagePreview);
        getEl("#product-form").addEventListener("submit", handleFormSubmit);
        getEl("#btn-add-ingredient").addEventListener("click", () => addIngredientRow());
        getEl("#btn-cancel").addEventListener("click", () => window.location.href = "manager_menu.php");
    }

    function handleCategoryChange(event) {
        const isPanini = event.target.value == paniniCategoryId;
        getEl("#ingredients-section").style.display = isPanini ? 'block' : 'none';
        getEl("#availability-section").style.display = isPanini ? 'none' : 'block';
    }

    function handleImagePreview(event) {
        const file = event.target.files[0];
        const previewContainer = getEl("#image-preview-container");
        if (file) {
            getEl("#image-preview").src = URL.createObjectURL(file);
            previewContainer.style.display = "block";
            getEl('#current-image-container').style.display = 'none';
        } else {
            previewContainer.style.display = "none";
        }
    }
    
    async function handleFormSubmit(event) {
        event.preventDefault();
        
        const submitBtn = getEl("#btn-submit");
        submitBtn.disabled = true;
        getEl("#submit-loading").style.display = "inline-block";
        
        try {
            const formData = new FormData(getEl("#product-form"));
            const ingredientsData = [];
            
            if (getEl("#product-category").value == paniniCategoryId) {
                const rows = getAllEl('.ingredient-row');
                for (const row of rows) {
                    const name = row.querySelector('.ingredient-name').value.trim();
                    const quantity = parseInt(row.querySelector('.ingredient-quantity').value, 10);
                    const essential = row.querySelector('.ingredient-essential').checked;
                    
                    const ingredient = allAvailableIngredients.find(i => i.nome.toLowerCase() === name.toLowerCase());
                    
                    if (!ingredient) {
                        throw new Error(`L'ingrediente "${name}" non è valido o non esiste.`);
                    }
                    if (isNaN(quantity) || quantity < 1) {
                        throw new Error(`La quantità per "${name}" non è valida.`);
                    }
                    
                    ingredientsData.push({
                        id: ingredient.idingrediente,
                        qty: quantity,
                        ess: essential
                    });
                }
            }
            
            formData.set("ingredients", JSON.stringify(ingredientsData));
            
            if (getEl("#product-category").value == paniniCategoryId) {
                formData.delete('availability');
            }
            
            const currentProductId = new URLSearchParams(window.location.search).get('id');
            formData.append("action", currentProductId ? "update" : "add");
            if (currentProductId) formData.append("idprodotto", currentProductId);
            
            const response = await fetchData(API_MANAGER_PRODUCT_HANDLER, { method: "POST", body: formData });
            
            if (response.success) {
                showToast("Successo", response.message || "Operazione completata!", "success");
                setTimeout(() => window.location.href = "manager_menu.php", 1500);
            } else {
                throw new Error(response.error || "Errore sconosciuto.");
            }

        } catch (err) {
            showToast("Errore di Validazione", err.message, "error");
        } finally {
            submitBtn.disabled = false;
            getEl("#submit-loading").style.display = "none";
        }
    }
    
    // === AVVIO ===
    document.addEventListener("DOMContentLoaded", initializePage);
})();