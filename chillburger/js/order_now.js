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

function generateProducts(products, categories) {
  let result = "";

  products.forEach((product) => {
    result += `<div class="w-100" d-flex flex-column> 
      <img src="${product.image}" alt="${product.nome}" class="img-responsive">
      <div class="d-flex flex-column">
        <p class="text-center">${product.nome}</p>
      </div>
      <div class="d-flex flex-column">
        <p class="text-center">${product.prezzo}</p>
      </div>
      </div>`
    })

  return result;
}



async function getAllProducts() {
  const url = "api/api-order-now.php";  
  const formData = new FormData();
  formData.append("action", "getAllProducts");
  const jsonResponse = await fetchData(url, formData);
  console.log("i miei prodotti e categorie",jsonResponse);

  const products = generateProducts(jsonResponse.products, jsonResponse.categories);
  const main = document.querySelector("#menuGrid");
  main.innerHTML = products;
}

// Funzione per generare il menu
getAllProducts();