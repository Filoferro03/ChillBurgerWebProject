// manager_menu.js
// Script di gestione CRUD prodotti e ingredienti – simulazione lato client

async function fetchData(url, formData) {
  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Errore HTTP: ${response.status}`);
    }
    const json = await response.json();
    if (!json.success) {
      throw new Error(json.error || "Errore sconosciuto dal server.");
    }
    return json.data; // { ingredients: [...], drinks: [...] }
  } catch (error) {
    console.error("Errore durante la fetch:", error.message);
    return null;
  }
}
// TODO
/* === DATI SIMULATI === */
const ingredients = [
  "Hamburger di manzo",
  "Pane",
  "Cheddar",
  "Bacon",
  "Insalata",
  "Pomodoro",
  "Salsa barbecue",
];

let products = [
  {
    id: 1,
    name: "Bacon Cheeseburger",
    description: "Burger di manzo con bacon croccante e cheddar fuso.",
    price: 9.5,
    image: "resources/products/bacon-cheeseburger.png",
    ingredients: [
      "Hamburger di manzo",
      "Pane",
      "Cheddar",
      "Bacon",
      "Salsa barbecue",
    ],
  },
  {
    id: 2,
    name: "Green Garden",
    description: "Burger vegetariano con verdure fresche.",
    price: 8.0,
    image: "resources/products/green-garden.png",
    ingredients: ["Hamburger vegano", "Pane", "Insalata", "Pomodoro"],
  },
];

let nextId = products.length + 1;

/* === HELPERS === */
const $ = (sel, root = document) => root.querySelector(sel);
const createEl = (tag, cls = "", html = "") => {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (html) el.innerHTML = html;
  return el;
};

/* === RENDERING === */
function renderIngredientSelect() {
  const container = $("#ingredient-select");
  container.innerHTML = "";
  ingredients.forEach((ing) => {
    const label = createEl("label", "flex items-center space-x-1");
    const input = createEl("input");
    input.type = "checkbox";
    input.value = ing;
    label.appendChild(input);
    label.appendChild(createEl("span", "", ing));
    container.appendChild(label);
  });
}

function createProductCard(prod) {
  const card = createEl("div", "card");
  const img = createEl("img");
  img.src = prod.image;
  img.alt = prod.name;
  card.appendChild(img);

  const body = createEl("div", "card-body");
  body.appendChild(createEl("h3", "text-lg font-semibold mb-1", prod.name));
  body.appendChild(
    createEl("p", "text-sm text-gray-600 mb-2", "€ " + prod.price.toFixed(2))
  );
  body.appendChild(createEl("p", "text-sm", prod.description));
  card.appendChild(body);

  const actions = createEl("div", "card-actions");
  const editBtn = createEl("button", "btn-primary", "Modifica");
  const delBtn = createEl(
    "button",
    "bg-red-600 text-white rounded-lg px-3 py-2 hover:bg-red-700 transition",
    "Elimina"
  );
  editBtn.addEventListener("click", () => openEditModal(prod.id));
  delBtn.addEventListener("click", () => openDeleteModal(prod.id));
  actions.appendChild(editBtn);
  actions.appendChild(delBtn);
  card.appendChild(actions);

  return card;
}

function renderProducts() {
  const list = $("#product-list");
  list.innerHTML = "";
  products.forEach((p) => list.appendChild(createProductCard(p)));
}

/* === AGGIUNTA === */
$("#add-product-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const newProduct = {
    id: nextId++,
    name: formData.get("name").trim(),
    description: formData.get("description").trim(),
    price: parseFloat(formData.get("price")),
    image: "#", // Placeholder – gestire upload lato server
    ingredients: [
      ...document.querySelectorAll("#ingredient-select input:checked"),
    ].map((i) => i.value),
  };
  fetch("/api/api-manager-menu.php", {
    method: "POST",
    body: JSON.stringify(newProduct),
  });
  products.push(newProduct);
  renderProducts();
  e.target.reset();
  $("#image-preview").classList.add("hidden");
});

$("#image").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const preview = $("#image-preview");
  preview.src = URL.createObjectURL(file);
  preview.classList.remove("hidden");
});

/* === MODALI === */
function closeModal() {
  $("#modal-overlay").classList.add("hidden");
}

function openEditModal(id) {
  const prod = products.find((p) => p.id === id);
  const overlay = $("#modal-overlay");
  const box = $("#modal-box");
  box.innerHTML = "";
  box.appendChild(
    createEl("h2", "text-xl font-semibold mb-4", "Modifica prodotto")
  );

  const nameIn = createEl("input", "input-field mb-2");
  nameIn.value = prod.name;
  const descIn = createEl("textarea", "input-field mb-2");
  descIn.value = prod.description;
  const priceIn = createEl("input", "input-field mb-2");
  priceIn.type = "number";
  priceIn.step = "0.01";
  priceIn.value = prod.price;

  const save = createEl("button", "btn-primary mr-2", "Salva");
  const cancel = createEl("button", "bg-gray-300 px-4 py-2 rounded", "Annulla");

  box.appendChild(nameIn);
  box.appendChild(descIn);
  box.appendChild(priceIn);
  box.appendChild(save);
  box.appendChild(cancel);

  save.addEventListener("click", () => {
    prod.name = nameIn.value.trim();
    prod.description = descIn.value.trim();
    prod.price = parseFloat(priceIn.value);
    // TODO: fetch PUT
    renderProducts();
    closeModal();
  });
  cancel.addEventListener("click", closeModal);
  overlay.classList.remove("hidden");
}

function openDeleteModal(id) {
  const overlay = $("#modal-overlay");
  const box = $("#modal-box");
  box.innerHTML = "";
  box.appendChild(
    createEl("p", "mb-4", "Sei sicuro di voler eliminare questo prodotto?")
  );
  const confirm = createEl("button", "btn-primary mr-2", "Conferma");
  const cancel = createEl("button", "bg-gray-300 px-4 py-2 rounded", "Annulla");
  box.appendChild(confirm);
  box.appendChild(cancel);
  confirm.addEventListener("click", () => {
    products = products.filter((p) => p.id !== id);
    // TODO: fetch DELETE
    renderProducts();
    closeModal();
  });
  cancel.addEventListener("click", closeModal);
  overlay.classList.remove("hidden");
}

async function getAllCompositions() {
  const url = "api/api-manager-stock.php";
  const formData = new FormData();
  formData.append("action", "getallburgers");

  const data = await fetchData(url, formData);
  console.log("prodotti:", data);
}

/* === INIT === */
renderIngredientSelect();
renderProducts();
getAllCompositions();
