<section class="container py-5">
    <h2 class="display-4 custom-title text-center mb-3">
        <span class="txt">Carrello</span>
        <span class="emoji">😋</span>
    </h2>

    <div id="cart" class=" p-4 m-4 row w-100 ">
        <div id="cart-elements" class="d-flex row flex-column align-items-center ">
            <p class="text-center">Caricamento carrello...</p>
        </div>

        <div id="cart-summary-container" class="d-flex flex-column w-100 mt-5">
            <div id="summary-details"></div>

            <div id="availability-alert" class="alert alert-danger mt-3" style="display: none;" role="alert">
                </div>

            <div class="d-flex flex-column align-items-center mt-4">
                <button id="checkoutBtn" class="btn btn-lg bg-white" disabled>Vai al Checkout</button>
            </div>
        </div>
    </div>

    <div class="modal fade" id="confirmDeleteModal" tabindex="-1" aria-labelledby="confirmDeleteLabel" >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="confirmDeleteLabel">Conferma Rimozione</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Chiudi"></button>
          </div>
          <div class="modal-body">
            Sei sicuro di voler rimuovere questo prodotto dal carrello?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
            <button type="button" class="btn btn-success" id="confirmDeleteBtn">Sì</button>
          </div>
        </div>
      </div>
    </div>
</section>