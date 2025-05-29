<section class="container-fluid m-auto py-4 text-center">
    <h1 class="display-4 custom-title text-center mb-3">
        <span class="txt">Dettaglio Profilo</span>
    </h1>

    <div class="container-fluid d-flex flex-column flex-lg-row align-items-center" id="profile-container">
        <div id="profile-data-area" class="card w-100 w-lg-33 mb-4 mb-lg-0 p-3 text-center">
            <h2 class="mb-3"> Dati Utente</h2>
            <div class="list-group list-group-flush mb-3">
                <p class="list-group-item py-1"><strong>Nome:</strong> <span id="profile-nome">Caricamento...</span></p>
                <p class="list-group-item py-1"><strong>Cognome:</strong> <span id="profile-cognome">Caricamento...</span></p>
                <p class="list-group-item py-1"><strong>Username:</strong> <span id="profile-username">Caricamento...</span></p>
            </div>
            <button type="button" id="logout-button" class="btn btn-sm btn-danger mx-auto" data-bs-toggle="modal" data-bs-target="#logoutModal">Logout</button>
        </div>

        <div id="order-history-area" class="card w-100 w-lg-66 p-3 ms-lg-4">
            <h3 class="text-center mb-3">Storico Ordini</h3>
            <div id="orders-list" class="list-group list-group-flush">
                <p class="text-center">Caricamento ordini...</p>
            </div>
            <div id="orders-pagination" class="d-flex justify-content-center mt-3"></div>
        </div>
    </div>

    <div class="modal overlay" id="logoutModal" tabindex="-1" aria-labelledby="logoutModalLabel">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content w-75 mx-auto">
          <div class="modal-header">
            <h5 class="modal-title" id="logoutModalLabel">Conferma Logout</h5>
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
            <h5 class="modal-title" id="stateModalLabel">Conferma Ricezione Ordine</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Confermi di aver ricevuto l'ordine correttamente?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
            <button type="button" class="btn order-button" id="confirm-state-button">Conferma</button>
          </div>
        </div>
      </div>
    </div>
</section>