<section>
    <div class="container-fluid d-flex justify-content-center">
        <div class="card w-75 mt-4 mb-4">
            <div class="card-header text-center">
                 <h1 class="card-title">Dettaglio Ordine</h1>
            </div>
            <div class="card-body p-4" id="orderDetailsContainer">
                <p class="text-center">Caricamento dettagli ordine...</p>
            </div>
            <div class="card-body p-4 text-center">
                <div class="card w-50 mx-auto" id="reviewContainer">
                    <h2 class="card-header align-items-center">La tua Recensione</h2>
                </div>
                
            </div>
            <div class="card-footer text-center">
                <a href="profile.php" class="btn order-button">Torna al Profilo</a>
            </div>
        </div>
    </div>

<div class="modal overlay" id="reviewModal" tabindex="-1" aria-labelledby="reviewModalLabel">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content w-100 mx-auto">
      <div class="modal-header">
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <p>Lascia una recensione per questo ordine:</p>
        <form action="#" method="post" id="reviewForm">
          <div class="mb-3">
            <label for="review-title" class="form-label">Titolo della recensione <span class="text-danger">*</span></label>
            <input type="text" class="form-control" name="review-title" id="review-title" placeholder="Titolo della recensione..." required>
            <div class="invalid-feedback" id="review-title-error"></div>
          </div>
          <div class="mb-3">
            <label for="review-rating" class="form-label">Voto (da 1 a 5) <span class="text-danger">*</span></label>
            <input type="number" class="form-control" id="review-rating" name="review-rating" min="1" max="5" required>
            <div class="invalid-feedback" id="review-rating-error"></div>
          </div>
          <div class="mb-3">
            <label for="review-textarea" class="form-label">Commento:</label>
            <textarea class="form-control" name="review-textarea" id="review-textarea" cols="30" rows="5" placeholder="Scrivi qui il tuo commento..."></textarea>
            </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="cancel-review-button">No, grazie</button>
        <button type="button" class="btn order-button" id="confirm-review-button">Inserisci</button>
      </div>
    </div>
  </div>
</div>

<div class="modal overlay" id="deleteModal" tabindex="-1" aria-labelledby="deleteModalLabel">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content w-75 mx-auto">
      <div class="modal-header">
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <p>Sei sicuro di voler eliminare questa recensione?</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn order-button" data-bs-dismiss="modal">Annulla</button>
        <button type="button" class="btn btn-danger" id="delete-button">Conferma</button>
      </div>
    </div>
  </div>
</div>

</section>