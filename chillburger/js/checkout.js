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

function displayOrderDetails(data) {
    let result = "";

    // ---- SEZIONE PRODOTTI PERSONALIZZATI ----
    if (data.orderCustom && data.orderCustom.length > 0) {
        const customProductsMap = new Map();

        data.orderCustom.forEach(item => {
            if (!customProductsMap.has(item.idpersonalizzazione)) {
                customProductsMap.set(item.idpersonalizzazione, {
                    idpersonalizzazione: item.idpersonalizzazione,
                    productName: item.nomeprodotto || 'Nome Prodotto N/D',
                    productQuantity: item.quantita !== undefined ? item.quantita : 'N/D',
                    productPrice: item.prezzo !== undefined ? parseFloat(item.prezzo).toFixed(2) : 'N/D',
                    modifiche: []
                });
            }
            customProductsMap.get(item.idpersonalizzazione).modifiche.push({
                ingredientName: item.nomeingrediente || 'Ingrediente N/D',
                action: item.azione || 'Azione N/D'
            });
        });

        customProductsMap.forEach(customProduct => {
            result += `
                <div class="card shadow-sm mb-2">
                    <div class="card-body d-flex flex-row justify-content-between align-items-center">
                        <div class="d-flex flex-column w-50">
                        <h5 class="card-title mb-1">${customProduct.productName}</h5>
                        <ul class="list-unstyled ms-3 small">`;

            if (customProduct.modifiche.length > 0) {
                customProduct.modifiche.forEach(mod => {
                    let prefix = mod.action === 'aggiunto' ? '+ ' : (mod.action === 'rimosso' ? '- ' : '');
                    result += `<li>${prefix}${mod.ingredientName}</li>`;
                });
            }

            result += `
                        </ul>
                        </div>
                        <p class="card-text m-0">
                            <strong>Quantità:</strong> ${customProduct.productQuantity}
                        </p>
                        <p class="card-text">
                            €${customProduct.productPrice}
                        </p>
                    </div>
                </div>`;
        });
    }

    // ---- SEZIONE PRODOTTI STANDARD ----
    if (data.orderStock && data.orderStock.length > 0) {
        data.orderStock.forEach(stockElement => {
            const productName = stockElement.nome || 'Nome Prodotto N/D';
            const quantity = stockElement.quantita !== undefined ? stockElement.quantita : 'N/D';
            const price = stockElement.prezzo !== undefined ? parseFloat(stockElement.prezzo).toFixed(2) : 'N/D';

            result += `
                <div class="card shadow-sm mb-2">
                    <div class="card-body d-flex flex-row justify-content-between align-items-center">
                        <h5 class="card-title w-50 mb-0">${productName}</h5>
                        <p class="card-text m-0">
                            <strong>Quantità:</strong> ${quantity}
                        </p>
                        <p class="card-text m-0">
                            € ${price}
                        </p>
                    </div>
                </div>`;
        });
    }

    result += `<div class="d-flex flex-row justify-content-between align-items-center mt-3 pt-2 ms-3 me-3">
                        <h5 class="card-title w-50 mb-0">Spedizione:</h5>
                        <p class="card-text mb-0">
                        </p>
                        <p class="card-text mb-0">
                            € 2.50
                        </p>
                    </div>
                `;

    // ---- PREZZO TOTALE ----
    if (data.totalPrice !== undefined && data.totalPrice !== null) {
        const totalPriceFormatted = parseFloat(data.totalPrice).toFixed(2);
        result += `
            <div class="text-end mt-3 pt-3 border-top">
                <h4><strong>Totale: €${totalPriceFormatted}</strong></h4>
            </div>`;
    } else {
        result += '<p class="text-muted mt-4 text-end">Prezzo totale non disponibile.</p>';
    }

    return result;
}

async function loadOrderDetails() {
    const orderDetailsContainer = document.getElementById('orderDetailsContainer');
    if (!orderDetailsContainer) {
        console.error("Elemento 'orderDetailsContainer' non trovato nel DOM.");
        return;
    }

    const apiUrl = `api/api-orders.php`;
    const formData = new FormData();
    formData.append('action', 'getDetails');

    const json = await fetchData(apiUrl, formData);

    if (json && json.success && json.data) {
        orderDetailsContainer.innerHTML = displayOrderDetails(json.data);
    } else {
        const errorMessage = json && json.error ? json.error : 'Dati non disponibili o si è verificato un errore.';
        orderDetailsContainer.innerHTML = `<p class='text-center text-danger'>Errore nel caricamento dei dettagli dell'ordine: ${errorMessage}</p>`;
    }
}

// --- Payment Validation Functions ---

function displayError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    const inputElement = document.getElementById(fieldId);
    if (errorElement) errorElement.textContent = message;
    if (inputElement) inputElement.classList.add('is-invalid');
}

function clearError(fieldId) {
    const errorElement = document.getElementById(`${fieldId}-error`);
    const inputElement = document.getElementById(fieldId);
    if (errorElement) errorElement.textContent = '';
    if (inputElement) inputElement.classList.remove('is-invalid');
}

function displayGeneralMessage(message, isSuccess) {
    const messageElement = document.getElementById('payment-general-message');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = 'text-center mt-3'; // Reset classes
        if (isSuccess) {
            messageElement.classList.add('text-success');
        } else {
            messageElement.classList.add('text-danger');
        }
    }
}


function validateCardholderName(name) {
    if (!name.trim()) {
        displayError('cardholder-name', 'Il nome sulla carta è obbligatorio.');
        return false;
    }
    // Theoretical: check for invalid characters, though typically names can be complex.
    // For this example, we'll just check if it's not empty.
    clearError('cardholder-name');
    return true;
}

function validateCardNumber(cardNumber) {
    const cleanedCardNumber = cardNumber.replace(/\s+/g, ''); // Remove spaces
    if (!cleanedCardNumber) {
        displayError('card-number', 'Il numero della carta è obbligatorio.');
        return false;
    }
    if (!/^\d+$/.test(cleanedCardNumber)) {
        displayError('card-number', 'Il numero della carta deve contenere solo cifre.');
        return false;
    }
    // Theoretical validation for common card lengths (e.g., 16 for Visa/Mastercard)
    if (cleanedCardNumber.length < 13 || cleanedCardNumber.length > 19) {
        displayError('card-number', 'Il numero della carta sembra non valido (lunghezza).');
        return false;
    }
    // Add Luhn algorithm check here for a more robust validation if needed
    clearError('card-number');
    return true;
}

function validateExpiryDate(expiryDate) {
    if (!expiryDate.trim()) {
        displayError('expiry-date', 'La data di scadenza è obbligatoria.');
        return false;
    }
    const match = expiryDate.match(/^(\d{2})\/?(\d{2})$/); // MM/YY or MMYY
    if (!match) {
        displayError('expiry-date', 'Formato data non valido. Usare MM/YY.');
        return false;
    }

    const month = parseInt(match[1], 10);
    const year = parseInt(`20${match[2]}`, 10); // Assuming 21st century

    if (month < 1 || month > 12) {
        displayError('expiry-date', 'Mese non valido.');
        return false;
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        displayError('expiry-date', 'La carta è scaduta.');
        return false;
    }

    clearError('expiry-date');
    return true;
}

function validateCVV(cvv) {
    if (!cvv.trim()) {
        displayError('cvv', 'Il CVV è obbligatorio.');
        return false;
    }
    if (!/^\d{3,4}$/.test(cvv)) {
        displayError('cvv', 'Il CVV deve essere di 3 o 4 cifre.');
        return false;
    }
    clearError('cvv');
    return true;
}


// --- Event Listener for Payment Form ---
document.addEventListener('DOMContentLoaded', () => {
    loadOrderDetails();

    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Stop default form submission

            // Clear previous general messages
            displayGeneralMessage('', false);


            // Get form values
            const cardholderName = document.getElementById('cardholder-name').value;
            const cardNumber = document.getElementById('card-number').value;
            const expiryDate = document.getElementById('expiry-date').value;
            const cvv = document.getElementById('cvv').value;

            // Perform validation
            const isNameValid = validateCardholderName(cardholderName);
            const isCardNumberValid = validateCardNumber(cardNumber);
            const isExpiryValid = validateExpiryDate(expiryDate);
            const isCvvValid = validateCVV(cvv);

            if (isNameValid && isCardNumberValid && isExpiryValid && isCvvValid) {
                // All validations passed
                // Simulate payment processing
                displayGeneralMessage('Pagamento in elaborazione...', true);
                console.log('Payment data (not sent to DB):', {
                    cardholderName,
                    cardNumber,
                    expiryDate,
                    cvv
                });

                // Here you would typically send data to a payment gateway.
                // For this example, we'll just show a success message after a delay.
                setTimeout(() => {
                    displayGeneralMessage('🎉 Pagamento confermato con successo! Il tuo ordine è in preparazione.', true);
                    // Optionally, redirect or clear form:
                    // paymentForm.reset();
                    // window.location.href = 'thank_you_page.php'; // Redirect to a thank you page
                }, 2000);

            } else {
                displayGeneralMessage('Alcuni campi non sono validi. Controlla i messaggi di errore.', false);
            }
        });
    }
});