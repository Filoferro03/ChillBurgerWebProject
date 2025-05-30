
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

      return json.data;
  } catch (error) {
      console.error("Errore durante la fetch:", error.message);
      return null;
  }
}

async function updateIngredientStock(idingrediente,quantita) {
  const url = 'api/api-manager-stock.php';
  const formData = new FormData();
  formData.append('action', 'updateingredientquantity');
  formData.append('idingrediente', idingrediente);
  formData.append('qunatita', quantita);

  const response = await fetchData(url, formData);
  await fetchData(url, formData);
  setTimeout(function() {
            getProductsStock();
        }, 1000);
}

async function updateDrinkStock(idprodotto,quantita) {
  const url = 'api/api-manager-stock.php';
  const formData = new FormData();
  formData.append('action', 'updatedrinkquantity');
  formData.append('idprodotto', idprodotto);
  formData.append('qunatita', quantita);

  await fetchData(url, formData);
  setTimeout(function() {
            getProductsStock();
        }, 1000);
}



function generateProducts(products) {
  
}



async function getProductsStock() {
  const url = "api/api-manager-stock.php";
  const formData = new FormData();
  formData.append("action", "getallproducts");

  const products = await fetchData(url, formData);
  console.log("prodotti: ", products);
  //generateProducts(products);

}

getProductsStock();