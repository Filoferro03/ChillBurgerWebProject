<section>
    <div class="container-fluid d-flex justify-content-center flex-column">
        <h1 class="display-4 custom-title text-center mb-3 mt-2">
            <span class="txt">Checkout</span>
        </h1>
        
        <div class="card col-12 col-md-10 col-lg-8 mx-auto my-4">
            <div class="card-header text-center">
                <h2 class="card-title">Riepilogo Ordine</h2>
            </div>
            <div class="card-body p-3 p-md-4" id="orderDetailsContainer">
                <p class="text-center">Caricamento dettagli ordine...</p>
            </div>
        </div>
        
        <div class="card col-12 col-md-10 col-lg-8 mx-auto my-4">
            <div class="card-header text-center">
                <h3 class="card-title">Pagamento</h3>
            </div>
            <div class="card-body p-3 p-md-4 col-12 col-lg-10 mx-auto" id="paymentContainer">
                <p class="fs-5 text-center mb-4">Inserisci i tuoi dati di pagamento</p>
                <form id="paymentForm" novalidate>
                    <div class="card mb-4 p-3 border-light shadow-sm">
                        <p class="card-title mb-3 text-center">Seleziona data e ora di consegna</p>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="delivery-date" class="form-label">Data di consegna</label>
                                <select class="form-select form-select-sm" id="delivery-date" name="delivery-date" required>
                                </select>
                                <div class="invalid-feedback" id="delivery-date-error"></div>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="delivery-time" class="form-label">Ora di consegna</label>
                                <select class="form-select form-select-sm" id="delivery-time" name="delivery-time" required disabled>
                                    <option value="" selected disabled>Seleziona prima una data</option>
                                </select>
                                <div class="invalid-feedback" id="delivery-time-error"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="cardholder-name" class="form-label">Nome sulla Carta</label>
                        <input type="text" class="form-control form-control-sm" id="cardholder-name" name="cardholder-name" required>
                        <div class="invalid-feedback" id="cardholder-name-error"></div>
                    </div>
                    <div class="mb-3">
                        <label for="card-number" class="form-label">Numero Carta</label>
                        <input type="text" class="form-control form-control-sm" id="card-number" name="card-number" placeholder="---- ---- ---- ----" maxlength="23" required> 
                        <div class="invalid-feedback" id="card-number-error"></div>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="expiry-date" class="form-label">Data di Scadenza</label>
                            <input type="text" class="form-control form-control-sm" id="expiry-date" name="expiry-date" placeholder="MM/YY" maxlength="5" required> 
                            <div class="invalid-feedback" id="expiry-date-error"></div>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="cvv" class="form-label">CVV</label>
                            <input type="text" class="form-control form-control-sm" id="cvv" name="cvv" placeholder="---" required>
                            <div class="invalid-feedback" id="cvv-error"></div>
                        </div>
                    </div>
                     <div class="text-center mt-3" id="payment-general-message">
                        </div>
                </form>
            </div>
            <div class="card-footer text-center p-3">
                <div class="d-flex flex-column flex-sm-row justify-content-sm-end gap-2">
                    <button type="button" class="btn btn-secondary w-sm-auto order-sm-1" onclick="window.history.back();">Torna indietro</button>
                    <button type="submit" class="btn order-button w-sm-auto order-sm-2" form="paymentForm">Conferma pagamento</button>
                </div>
            </div>
        </div>
    </div>
</section>