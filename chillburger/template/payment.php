<section>
    <div class="container-fluid d-flex justify-content-center flex-column">
        <h2 class="display-4 custom-title text-center mb-3 mt-2">
            <span class="txt">Checkout</span>
        </h2>
        
        <div class="card w-75 m-auto my-4">
            <div class="card-header text-center">
                <h3 class="card-title">Riepilogo Ordine</h3>
            </div>
            <div class="card-body p-4" id="orderDetailsContainer">
                <p class="text-center">Caricamento dettagli ordine...</p>
            </div>
        </div>
        
        <div class="card w-75 m-auto my-4">
            <div class="card-header text-center">
                <h3 class="card-title">Pagamento</h3>
            </div>
            <div class="card-body p-4 w-50 m-auto" id="paymentContainer">
                <h5 class="text-center mb-4">Inserisci i tuoi dati di pagamento</h5>
                <form id="paymentForm" novalidate>
                    <div class="card mb-4 p-3 border-light shadow-sm">
                        <h5 class="card-title mb-3">Seleziona data e ora di consegna</h5>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="delivery-date" class="form-label">Data di consegna</label>
                                <select class="form-select" id="delivery-date" name="delivery-date" required>
                                    <option value="" selected disabled>Seleziona una data</option>
                                    <!-- Le opzioni verranno popolate dinamicamente -->
                                </select>
                                <div class="invalid-feedback" id="delivery-date-error">Seleziona una data di consegna.</div>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="delivery-time" class="form-label">Ora di consegna</label>
                                <select class="form-select" id="delivery-time" name="delivery-time" required disabled>
                                    <option value="" selected disabled>Seleziona prima una data</option>
                                    <!-- Le opzioni verranno popolate dinamicamente -->
                                </select>
                                <div class="invalid-feedback" id="delivery-time-error">Seleziona un'ora di consegna.</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="cardholder-name" class="form-label">Nome sulla Carta</label>
                        <input type="text" class="form-control" id="cardholder-name" name="cardholder-name" required>
                        <div class="invalid-feedback" id="cardholder-name-error"></div>
                    </div>
                    <div class="mb-3">
                        <label for="card-number" class="form-label">Numero Carta</label>
                        <input type="text" class="form-control" id="card-number" name="card-number" placeholder="---- ---- ---- ----" required>
                        <div class="invalid-feedback" id="card-number-error"></div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="expiry-date" class="form-label">Data di Scadenza</label>
                            <input type="text" class="form-control" id="expiry-date" name="expiry-date" placeholder="MM/YY" required>
                            <div class="invalid-feedback" id="expiry-date-error"></div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="cvv" class="form-label">CVV</label>
                            <input type="text" class="form-control" id="cvv" name="cvv" placeholder="---" required>
                            <div class="invalid-feedback" id="cvv-error"></div>
                        </div>
                    </div>
                     <div class="text-center mt-3" id="payment-general-message">
                        </div>
                </form>
            </div>
            <div class="card-footer text-center">
                <div class="d-flex justify-content-between w-50 m-auto">
                    <button type="button" class="btn btn-secondary" onclick="window.history.back();">Torna indietro</button>
                    <button type="submit" class="btn order-button" form="paymentForm">Conferma pagamento</button>
                </div>
            </div>
        </div>
    </div>
</section>