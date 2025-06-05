async function fetchData(url, formData) {
  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.log(error.message);
  }
}

function generateProducts(products, categories) {
  let result = "";

  for (let i = 0; i < categories.length; i++) {
    const currentCategory = categories[i];
    const idcategoria = currentCategory["idcategoria"];
    const categoriaDescrizione = currentCategory["descrizione"];

    let categorySection = `<div class="mb-4"><h2 class="m-3 animate-underline text-center">${categoriaDescrizione}</h2><div class="row">`;

    for (let j = 0; j < products.length; j++) {
      if (products[j]["idcategoria"] !== idcategoria) continue;

      const nome = products[j]["nome"] ?? "Nome mancante";
      const imgSrc = products[j]["image"] ?? "./resources/menu/stock.jpg";
      const prezzo = products[j]["prezzo"] ?? "Prezzo mancante";
      const altText = nome;
      const idProdotto = products[j]["idprodotto"];

      const imgTag =
        idcategoria === 1
          ? `<a href="./burger-details.php?id=${idProdotto}">
                       <img src="${imgSrc}" class="card-img-top" alt="${altText}">
                   </a>`
          : `<img src="${imgSrc}" class="card-img-top" alt="${altText}">`;

      categorySection += `
            <div class="col-12 col-md-4 mb-5 d-flex flex-column menu-item align-items-center h-auto">
                <div id="${idProdotto}" class="card w-100 h-100 text-center hover-up">
    ${imgTag}
    <div class="card-body">
        <p class="card-title">${nome}</p>
    </div>
    <div class="card-footer bg-white">
        <p>${prezzo}€</p>
    </div>
</div>

            </div>`;
    }

    categorySection += `</div></div>`; // Chiudi row e div categoria
    result += categorySection;
  }

  return result;
}

async function getProductsData() {
  const url = "api/api-menu.php";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("response status: " + response.status);
    }

    const json = await response.json();
    console.log("prodotti:", json.products);
    console.log("categorie:", json.categories);
    const menuDiv = document.querySelector("#menuDiv");
    const menu = generateProducts(json.products, json.categories);
    menuDiv.innerHTML += menu;

    // 🟡 Dopo aver inserito il contenuto, controlla l'hash e scrolla
    const hash = window.location.hash;
    if (hash) {
      const target = document.getElementById(hash.substring(1));
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
}

getProductsData();
