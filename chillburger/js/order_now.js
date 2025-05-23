let products = [];

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
          <button class="btn btn-add btn-sm btn-green" data-idprodotto="${product.idprodotto}">+</button>

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
  products = jsonResponse.products;  // store globally

  const productsHtml = generateProducts(products);
  const main = document.querySelector("#menuGrid");
  if (main) main.innerHTML = productsHtml;

  setupFiltering();
  setupAddToCartButtons(); // call after products generated
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

async function addProductToCart(idprodotto) {
  // Find the product in the loaded products list
  const product = products.find(p => p.idprodotto == idprodotto);
  if (!product) {
    console.error("Prodotto non trovato:", idprodotto);
    return;
  }

  const url = "api/api-cart.php";
  const formData = new FormData();
  
  if (product.categoryDescrizione.toLowerCase() === "panini") {
    // Call addPers
    formData.append("action", "addPers");
    formData.append("idprodotto", idprodotto);
    formData.append("quantita", 1);
  } else {
    // Call addProd
    formData.append("action", "addProd");
    formData.append("idprodotto", idprodotto);
    formData.append("quantita", 1);
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData
    });
    const json = await response.json();

    if (json.success) {
      console.log("Prodotto aggiunto al carrello!");
      await init();
    } else {
      console.error("Errore aggiungendo prodotto:", json.error);
    }
  } catch (error) {
    console.error("Errore fetch:", error);
  }
}

function setupAddToCartButtons() {
  const buttons = document.querySelectorAll(".btn-add");
  buttons.forEach(button => {
    button.addEventListener("click", async () => {
      showAddOnePopup(button); // show +1 animation
      const idprodotto = button.dataset.idprodotto;
      await addProductToCart(idprodotto, 1);
    });
  });
}

function showAddOnePopup(button) {
  // Create span element
  const popup = document.createElement("span");
  popup.textContent = "+1";
  popup.className = "add-one-popup";

  // Position it relative to the button
  const rect = button.getBoundingClientRect();
  popup.style.left = `${rect.right + 5 + window.scrollX}px`; // 5px right of button
  popup.style.top = `${rect.top + rect.height / 2 + window.scrollY}px`; // vertically centered

  // Append to body
  document.body.appendChild(popup);

  // Remove after animation ends
  popup.addEventListener("animationend", () => {
    popup.remove();
  });
}

// Funzione per generare il menu
getAllProducts();