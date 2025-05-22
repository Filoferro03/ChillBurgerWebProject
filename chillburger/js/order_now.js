async function fetchData(url, formData) {
  try {
      const response = await fetch(url, {
          method: "POST",
          body: formData
      });
      if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
      }
      return await response.json();
  } catch (error) {
      console.log(error.message);
  }
}

function generateProducts(products) {
  let result = "";
  products.forEach((product) => {
    result += `
    <div class="col-6 col-md-4 col-lg-3 menu-item" data-category="${product.categoryDescrizione}">
      <div class="card h-100 text-center shadow-sm hover-up">
        <img src="${product.image}" class="card-img-top" alt="${product.nome}">
        <div class="card-body">
          <h5 class="card-title">${product.nome}</h5>
          <p class="card-text small text-muted">${product.descrizione || ''}</p>
        </div>

        <div class="card-footer bg-white border-0">
          <span class="fw-bold text-primary">${product.prezzo} €</span>
          <div class="d-flex justify-content-center">
            <button class="btn btn-outline-success btn-add" data-idprodotto="${product.idprodotto}">+</button>
          </div>
        </div>
      </div>
    </div>
    `;
  });
  return result;
}

async function getAllProducts() {
  const url = "api/api-order-now.php";
  const formData = new FormData();
  formData.append("action", "getAllProducts");

  const jsonResponse = await fetchData(url, formData);
  const products = jsonResponse.products;

  const productsHtml = generateProducts(products);
  const main = document.querySelector("#menuGrid");
  if (main) main.innerHTML = productsHtml;

  setupFiltering();
  setupAddToCartButtons();
}


function setupFiltering() {
  const buttons = document.querySelectorAll(".btn-filter");
  const items = document.querySelectorAll(".menu-item");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      // Remove active from all buttons
      buttons.forEach(b => b.classList.remove("active"));
      // Add active to clicked button
      btn.classList.add("active");

      const cat = btn.dataset.category;

      items.forEach(card => {
        card.style.display = (cat === "all" || card.dataset.category === cat) ? "" : "none";
      });
    });
  });
}

async function addProductToCart(idprodotto, quantita = 1) {
  const url = "api/api-cart.php";
  const formData = new FormData();
  formData.append("action", "addProd");
  formData.append("idprodotto", idprodotto);
  formData.append("quantita", quantita);

  const response = await fetch(url, {
    method: "POST",
    body: formData
  });
  const json = await response.json();

  if (json.success) {
    console.log("Prodotto aggiunto al carrello!");
    // Ricarica il carrello se vuoi:
    await init();  // supponendo che init() ricarichi il carrello dal backend
  } else {
    console.error("Errore aggiungendo prodotto:", json.error);
  }
}

function setupAddToCartButtons() {
  const buttons = document.querySelectorAll(".btn-add");
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const idprodotto = button.dataset.idprodotto;
      addProductToCart(idprodotto, 1);
    });
  });
}

// Funzione per generare il menu
getAllProducts();