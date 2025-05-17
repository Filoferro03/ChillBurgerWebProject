<section class="container-fluid m-auto py-4 text-center">
    <h2 class="display-4 custom-title text-center mb-3">
        <span class="txt">Dettaglio Profilo</span>
    </h2>
    <div class="container-fluid d-flex flex-row align-items-center" id="profile-container">
    <div id="profile-data-area" class="card w-25 m-auto p-3 text-start">
        <h3 class="mb-3"> Dati Utente</h3>
        <div class="list-group mb-3">
        <p class="list-group-item mb-3 mt-3"><strong>Nome:</strong> <span id="profile-nome">Caricamento...</span></p>
        <p class="list-group-item mb-3"><strong>Cognome:</strong> <span id="profile-cognome">Caricamento...</span></p>
        <p class="list-group-item mb-3"><strong>Username:</strong> <span id="profile-username">Caricamento...</span></p>
        </div>

        <button type="button" id="logout-button" class="btn btn-danger m-auto" data-bs-toggle="modal" data-bs-target="#logoutModal">Logout</button>
    </div>

    <div id="order-history-area" class="card w-50 m-auto mt-4 p-3">
        <h3 class="text-center mb-3">Storico Ordini</h3>
        <div id="orders-list" class="list-group mb-3">
            <p class="text-center">Caricamento ordini...</p>
        </div>

        <div id="orders-pagination" class="d-flex justify-content-center"></div>
    </div>
    </div>

    <!-- Modal -->
<div class="modal overlay" id="logoutModal" tabindex="-1" aria-labelledby="logoutModalLabel">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content w-75 mx-auto">
      <div class="modal-header">
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <p>Sei sicuro di voler effettuare il logout?</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
        <button type="button" class="btn btn-danger" id="confirm-button">Conferma</button>
      </div>
    </div>
  </div>
</div>

<div class="modal overlay" id="stateModal" tabindex="-1" aria-labelledby="stateModalLabel">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content w-75 mx-auto">
      <div class="modal-header">
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <p>Confermi di aver ricevuto l'ordine correttamente?</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
        <button type="button" class="btn order-button" data-bs-dismiss="modal" id="confirm-state-button">Conferma</button>
      </div>
    </div>
  </div>
</div>

<div class="modal overlay" id="reviewModal" tabindex="-1" aria-labelledby="reviewModalLabel">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content w-75 mx-auto">
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


</section>