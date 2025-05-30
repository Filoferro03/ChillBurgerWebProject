// manager_stock.js
let allProducts = [];

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

  await fetchData(url, formData);
  setTimeout(getProductsStock, 1000);
}

async function updateDrinkStock(idprodotto, quantita) {
  const url = 'api/api-manager-stock.php';
  const formData = new FormData();
  formData.append('action', 'updatedrinkquantity');
  formData.append('idprodotto', idprodotto);
  formData.append('quantita', quantita);  // ⬅️ corretto

  await fetchData(url, formData);
  setTimeout(getProductsStock, 1000);
}

const IMG_DIR = "chillburger/resources/products";

function statusClass(q) {
  return q === 0 ? "text-danger"
       : q <= 10 ? "text-warning"
       :          "text-success";
}
function statusLabel(q) {
  return q === 0 ? "Esaurito"
       : q <= 10 ? "Bassa Scorta"
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
        <a href="#" class="changeQty" data-id="${p.idprodotto}"
           data-type="${p.tipo}">Modifica Quantità</a>
      </td>`;
    tr.querySelector(".changeQty").addEventListener("click", async e => {
      e.preventDefault();
      const id    = e.currentTarget.dataset.id;
      const tipo  = e.currentTarget.dataset.type;  
      const delta = parseInt(prompt("Incremento positivo o negativo (es. 5 / -3):"), 10);
      if (Number.isNaN(delta)) return;
      if (tipo === "bevanda") {
        await updateDrinkStock(id, -delta);
      } else {
        await updateIngredientStock(id, -delta);
      }
    });
    tbody.appendChild(tr);
  });
}

function updateSummaryCards(products) {
  const total     = products.length;
  const outStock  = products.filter(p => p.giacenza === 0).length;
  const lowStock  = products.filter(p => p.giacenza > 0 && p.giacenza <= 10).length;
  const inStock   = products.filter(p => p.giacenza > 10).length;

  document.getElementById('card-total').textContent    = total;
  document.getElementById('card-outstock').textContent = outStock;
  document.getElementById('card-lowstock').textContent = lowStock;
  document.getElementById('card-instock').textContent  = inStock;
}


async function getProductsStock() {
  const url = "api/api-manager-stock.php";
  const formData = new FormData();
  formData.append("action", "getallproducts");

  const data = await fetchData(url, formData);
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

  updateSummaryCards(products);
  generateProducts(products);
}

// Prende il <select>
const categoryFilter = document.getElementById('category-filter');
categoryFilter.addEventListener('change', applyFilters);

const statusFilter   = document.getElementById('status-filter');
statusFilter.addEventListener('change', applyFiltersStatus);


function applyFilters() {
  const sel = categoryFilter.value;       // "" | "ingrediente" | "bevanda"
  
  // Se non hai selezionato nulla, mostra tutto
  const filtered = sel
    ? allProducts.filter(p => p.tipo === sel)
    : allProducts;

  generateProducts(filtered);
}

function applyFiltersStatus() {
  const sel = statusFilter.value;  // "" | "outstock" | "lowstock" | "instock"

  let filtered = allProducts;
  if (sel === "out-stock") {
    filtered = allProducts.filter(p => p.giacenza === 0);
  } else if (sel === "low-stock") {
    filtered = allProducts.filter(p => p.giacenza > 0 && p.giacenza <= 10);
  } else if (sel === "in-stock") {
    filtered = allProducts.filter(p => p.giacenza > 10);
  } else if (sel === "all") {
    filtered = allProducts;
  }

  generateProducts(filtered);
}

// Avvio
getProductsStock();
