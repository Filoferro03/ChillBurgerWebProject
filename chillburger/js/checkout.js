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

function displayOrderDetails(data) {
  let result = "";

  if (data.orderCustom && data.orderCustom.length > 0) {
    const customProductsMap = new Map();

    data.orderCustom.forEach((item) => {
      if (!customProductsMap.has(item.idpersonalizzazione)) {
        customProductsMap.set(item.idpersonalizzazione, {
          idpersonalizzazione: item.idpersonalizzazione,
          idprodotto: item.idprodotto || "", 
          productName: item.nomeprodotto || "Nome Prodotto N/D",
          productQuantity: item.quantita !== undefined ? item.quantita : "N/D", 
          productPrice:
            item.prezzo !== undefined
              ? parseFloat(item.prezzo).toFixed(2)
              : "N/D", 
          modifiche: [], 
        });
      }
      customProductsMap.get(item.idpersonalizzazione).modifiche.push({
        ingredientName: item.nomeingrediente || "",
        action: item.azione || "",
      });
    });

    customProductsMap.forEach((customProduct) => {
      result += `
                <div class="card shadow-sm mb-3">
                    <div class="card-body d-flex flex-column flex-md-row justify-content-md-between align-items-md-center text-center text-md-start">
                        <div class="w-100 w-md-50 mb-2 mb-md-0">
                            <p class="card-title"><a href="burger-details.php?id=${customProduct.idprodotto}" style="color: inherit; text-decoration: none;">${customProduct.productName}</a></p>`;

      if (
        customProduct.modifiche.length > 0 &&
        customProduct.modifiche[0].ingredientName != ""
      ) {
        result += `<ul class="list-unstyled ms-md-3 small">`;
        customProduct.modifiche.forEach((mod) => {
          let prefix = "";
          if (mod.action === "aggiunto") prefix = "+ ";
          else if (mod.action === "rimosso") prefix = "- ";
          result += `<li>${prefix}${mod.ingredientName}</li>`;
        });
        result += `</ul>`;
      }
      result += `</div>
                        <div class="d-flex flex-column align-items-center align-items-md-end w-100 w-md-auto mt-2 mt-md-0">
                            <p class="card-text m-0 mb-1">
                                Q.tà: ${customProduct.productQuantity}
                            </p>
                            <p class="card-text m-0 fw-bold">
                                €${customProduct.productPrice}
                            </p>
                        </div>
                    </div>
                </div>`;
    });
  }

  if (data.orderStock && data.orderStock.length > 0) {
    data.orderStock.forEach((stockElement) => {
      const productName = stockElement.nome || "Nome Prodotto N/D";
      const quantity =
        stockElement.quantita !== undefined ? stockElement.quantita : "N/D";
      const price =
        stockElement.prezzo !== undefined
          ? parseFloat(stockElement.prezzo).toFixed(2)
          : "N/D";

      result += `
                <div class="card shadow-sm mb-3">
                    <div class="card-body d-flex flex-column flex-md-row justify-content-md-between align-items-md-center text-center text-md-start">
                        <p class="card-title w-100 w-md-50 mb-2 mb-md-0"><a href="menu.php#${
                          stockElement.idprodotto || ""
                        }" style="color: inherit; text-decoration: none;">${productName}</a></p>
                        <div class="d-flex flex-column align-items-center align-items-md-end w-100 w-md-auto mt-2 mt-md-0">
                            <p class="card-text m-0 mb-1">
                                Q.tà: ${quantity}
                            </p>
                            <p class="card-text m-0 fw-bold">
                                € ${price}
                            </p>
                        </div>
                    </div>
                </div>`;
    });
  }

  result += `<div class="mt-3 pt-2 border-top">
                    <div class="d-flex justify-content-between align-items-center">
                        <p class="card-title mb-0 ms-3">Spedizione:</p>
                        <p class="card-text mb-0 fw-bold">
                            € 2.50
                        </p>
                    </div>
                </div>`;

  if (data.totalPrice !== undefined && data.totalPrice !== null) {
    const totalPriceFormatted = parseFloat(data.totalPrice).toFixed(2);
    result += `
            <div class="text-end mt-3 pt-3 border-top">
                <p>Totale: €${totalPriceFormatted}</p>
            </div>`;
  } else {
    result +=
      '<p class="text-muted mt-4 text-end">Prezzo totale non disponibile.</p>';
  }

  return result;
}
async function loadOrderDetails() {
  const orderDetailsContainer = document.getElementById(
    "orderDetailsContainer"
  );
  if (!orderDetailsContainer) {
    console.error("Elemento 'orderDetailsContainer' non trovato nel DOM.");
    return;
  }

  const apiUrl = `api/api-orders.php`;
  const formData = new FormData();
  formData.append("action", "getDetails");

  const json = await fetchData(apiUrl, formData);

  if (json && json.success && json.data) {
    orderDetailsContainer.innerHTML = displayOrderDetails(json.data);
  } else {
    const errorMessage =
      json && json.error
        ? json.error
        : "Dati non disponibili o si è verificato un errore.";
    orderDetailsContainer.innerHTML = `<p class='text-center text-danger'>Errore nel caricamento dei dettagli dell'ordine: ${errorMessage}</p>`;
  }
}

function displayError(fieldId, message) {
  const errorElement = document.getElementById(`${fieldId}-error`);
  const inputElement = document.getElementById(fieldId);
  if (errorElement) errorElement.textContent = message;
  if (inputElement) inputElement.classList.add("is-invalid");
}

function clearError(fieldId) {
  const errorElement = document.getElementById(`${fieldId}-error`);
  const inputElement = document.getElementById(fieldId);
  if (errorElement) errorElement.textContent = "";
  if (inputElement) inputElement.classList.remove("is-invalid");
}

function displayGeneralMessage(message, isSuccess) {
  const messageElement = document.getElementById("payment-general-message");
  if (messageElement) {
    messageElement.textContent = message;
    messageElement.className = "text-center mt-3"; // Reset classes
    if (isSuccess) {
      messageElement.classList.add("text-success");
    } else {
      messageElement.classList.add("text-danger");
    }
  }
}

function validateCardholderName(name) {
  if (!name.trim()) {
    displayError("cardholder-name", "Il nome sulla carta è obbligatorio.");
    return false;
  }
  clearError("cardholder-name");
  return true;
}

function validateCardNumber(cardNumber) {
  const cleanedCardNumber = cardNumber.replace(/\s+/g, ""); // Remove spaces
  if (!cleanedCardNumber) {
    displayError("card-number", "Il numero della carta è obbligatorio.");
    return false;
  }
  if (!/^\d+$/.test(cleanedCardNumber)) {
    displayError(
      "card-number",
      "Il numero della carta deve contenere solo cifre."
    );
    return false;
  }
  if (cleanedCardNumber.length < 13 || cleanedCardNumber.length > 19) {
    displayError(
      "card-number",
      "Il numero della carta sembra non valido (lunghezza)."
    );
    return false;
  }
  clearError("card-number");
  return true;
}

function validateExpiryDate(expiryDate) {
  if (!expiryDate.trim()) {
    displayError("expiry-date", "La data di scadenza è obbligatoria.");
    return false;
  }
  const match = expiryDate.match(/^(\d{2})\/?(\d{2})$/); // MM/YY or MMYY
  if (!match) {
    displayError("expiry-date", "Formato data non valido. Usare MM/YY.");
    return false;
  }

  const month = parseInt(match[1], 10);
  const year = parseInt(`20${match[2]}`, 10); // Assuming 21st century

  if (month < 1 || month > 12) {
    displayError("expiry-date", "Mese non valido.");
    return false;
  }

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    displayError("expiry-date", "La carta è scaduta.");
    return false;
  }

  clearError("expiry-date");
  return true;
}

function validateCVV(cvv) {
  if (!cvv.trim()) {
    displayError("cvv", "Il CVV è obbligatorio.");
    return false;
  }
  if (!/^\d{3,4}$/.test(cvv)) {
    displayError("cvv", "Il CVV deve essere di 3 o 4 cifre.");
    return false;
  }
  clearError("cvv");
  return true;
}

async function confirmOrder() {
  const apiUrl = `api/api-orders.php`;
  const formData = new FormData();
  formData.append("action", "payed");

  const deliveryDate = document.getElementById("delivery-date").value;
  const deliveryTime = document.getElementById("delivery-time").value;

  if (deliveryDate && deliveryTime) {
    formData.append("deliveryDate", deliveryDate);
    formData.append("deliveryTime", deliveryTime);
  }

  const json = await fetchData(apiUrl, formData);
  return json.success;
}

async function updateCart() {
  const apiUrl = `api/api-cart.php`;
  const formData = new FormData();
  formData.append("action", "createNewCart");
  console.log("prova a creare carrello");
  const json = await fetchData(apiUrl, formData);
}

function populateDeliveryDates() {
  const dateSelect = document.getElementById("delivery-date");
  if (!dateSelect) return;

  dateSelect.innerHTML =
    '<option value="" selected disabled>Seleziona una data</option>';

  const today = new Date();

  for (let i = 0; i < 3; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const formattedDate = date.toISOString().split("T")[0]; 

    const options = { weekday: "long", day: "numeric", month: "long" };
    const displayDate = date.toLocaleDateString("it-IT", options);

    const option = document.createElement("option");
    option.value = formattedDate;
    option.textContent =
      displayDate.charAt(0).toUpperCase() + displayDate.slice(1); 

    if (i === 0) {
      option.textContent += " (Oggi)";
    }

    dateSelect.appendChild(option);
  }
}

async function populateDeliveryTimes(date) {
  const timeSelect = document.getElementById("delivery-time");
  if (!timeSelect) return;

  timeSelect.disabled = true;
  timeSelect.innerHTML =
    '<option value="" selected disabled>Caricamento orari...</option>';

  const apiUrl = `api/api-orders.php`;
  const formData = new FormData();
  formData.append("action", "getAvailableTimes");
  formData.append("date", date);

  const json = await fetchData(apiUrl, formData);

  timeSelect.innerHTML =
    '<option value="" selected disabled>Seleziona un orario</option>';

  if (json && json.success && json.data) {
    json.data.forEach((time) => {
      const option = document.createElement("option");
      option.value = time;
      option.textContent = time.substring(0, 5);
      timeSelect.appendChild(option);
    });

    timeSelect.disabled = false;
  } else {
    timeSelect.innerHTML =
      '<option value="" selected disabled>Nessun orario disponibile</option>';
  }
}

function validateDeliveryDateTime() {
  const dateSelect = document.getElementById("delivery-date");
  const timeSelect = document.getElementById("delivery-time");

  let isValid = true;

  if (!dateSelect.value) {
    displayError("delivery-date", "Seleziona una data di consegna.");
    isValid = false;
  } else {
    clearError("delivery-date");
  }

  if (!timeSelect.value) {
    displayError("delivery-time", "Seleziona un orario di consegna.");
    isValid = false;
  } else {
    clearError("delivery-time");
  }

  return isValid;
}

function formatCardNumber(value) {
  const cleaned = value.replace(/\D/g, '');
  
  const limited = cleaned.substring(0, 19);
  
  const formatted = limited.replace(/(\d{4})(?=\d)/g, '$1 ');
  
  return formatted;
}

function formatExpiryDate(value) {
  const cleaned = value.replace(/\D/g, '');
  
  const limited = cleaned.substring(0, 4);
  
  if (limited.length >= 2) {
    return limited.substring(0, 2) + '/' + limited.substring(2);
  }
  
  return limited;
}

document.addEventListener("DOMContentLoaded", () => {
  loadOrderDetails();
  populateDeliveryDates();

  const dateSelect = document.getElementById("delivery-date");
  if (dateSelect) {
    dateSelect.addEventListener("change", function () {
      populateDeliveryTimes(this.value);
    });
  }

  const cardNumberInput = document.getElementById("card-number");
  if (cardNumberInput) {
    cardNumberInput.addEventListener("input", function (e) {
      const cursorPosition = e.target.selectionStart;
      const oldValue = e.target.value;
      const newValue = formatCardNumber(oldValue);
      
      e.target.value = newValue;
      
      const newCursorPosition = cursorPosition + (newValue.length - oldValue.length);
      e.target.setSelectionRange(newCursorPosition, newCursorPosition);
    });
  }

  const expiryDateInput = document.getElementById("expiry-date");
  if (expiryDateInput) {
    expiryDateInput.addEventListener("input", function (e) {
      const cursorPosition = e.target.selectionStart;
      const oldValue = e.target.value;
      const newValue = formatExpiryDate(oldValue);
      
      e.target.value = newValue;
      
      const newCursorPosition = cursorPosition + (newValue.length - oldValue.length);
      e.target.setSelectionRange(newCursorPosition, newCursorPosition);
    });
  }

  const paymentForm = document.getElementById("paymentForm");
  if (paymentForm) {
    paymentForm.addEventListener("submit", function (event) {
      event.preventDefault(); 

      displayGeneralMessage("", false);

      const cardholderName = document.getElementById("cardholder-name").value;
      const cardNumber = document.getElementById("card-number").value;
      const expiryDate = document.getElementById("expiry-date").value;
      const cvv = document.getElementById("cvv").value;

      const isDateTimeValid = validateDeliveryDateTime();
      const isNameValid = validateCardholderName(cardholderName);
      const isCardNumberValid = validateCardNumber(cardNumber);
      const isExpiryValid = validateExpiryDate(expiryDate);
      const isCvvValid = validateCVV(cvv);

      if (
        isDateTimeValid &&
        isNameValid &&
        isCardNumberValid &&
        isExpiryValid &&
        isCvvValid
      ) {
        displayGeneralMessage("Pagamento in elaborazione...", true);

        setTimeout(() => {
          if (confirmOrder()) {
            updateCart();
            displayGeneralMessage(
              "🎉 Pagamento confermato con successo! Il tuo ordine è in preparazione. Sarai reindirizzato al tuo profilo...",
              true
            );
            setTimeout(() => {
              window.location.href = "profile.php";
            }, 2500);
          }
        }, 2000);
      } else {
        displayGeneralMessage(
          "Alcuni campi non sono validi. Controlla i messaggi di errore.",
          false
        );
      }
    });
  }
});
