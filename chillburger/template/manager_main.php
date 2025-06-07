<section class="container py-5">

    <h2 class="display-4 custom-title text-center mb-3">
        <span class="txt">Manager</span>
        <span class="emoji">🧑🏼‍💻</span>
    </h2>

    <div class="row justify-content-center mb-5">

        <div class="col-lg-5 mb-4 mb-lg-0">
            <div id="profile-data-area" class="card shadow-sm p-3 text-center bg-dark h-100">
                <h3 class="mb-3 black-text">I tuoi Dati</h3>
                <div class="list-group list-group-flush mb-3 text-start">
                    <p class="list-group-item py-1 bg-transparent"><strong>Nome:</strong> <span id="profile-nome">Caricamento...</span></p>
                    <p class="list-group-item py-1 bg-transparent"><strong>Cognome:</strong> <span id="profile-cognome">Caricamento...</span></p>
                    <p class="list-group-item py-1 bg-transparent"><strong>Username:</strong> <span id="profile-username">Caricamento...</span></p>
                </div>
                <button type="button" id="logout-button" class="btn btn-sm btn-danger mx-auto mt-auto" data-bs-toggle="modal" data-bs-target="#logoutModal">Logout</button>
            </div>
        </div>

        <div class="col-lg-7">
            <div class="card shadow-sm p-4 text-center bg-dark h-100">
                <div class="row row-cols-2 g-3">
                    <div class="col">
                        <a href="manager_orders.php" class="manager-link">
                            <span class="h1">📦</span>
                            <span class="h3 a-underline light">Ordini</span>
                        </a>
                    </div>
                    <div class="col">
                        <a href="manager_menu.php" class="manager-link">
                            <span class="h1">🍔</span>
                            <span class="h3 a-underline light">Menu</span>
                        </a>
                    </div>
                    <div class="col">
                        <a href="manager_stock.php" class="manager-link">
                            <span class="h1">✍🏻</span>
                            <span class="h3 a-underline light">Magazzino</span>
                        </a>
                    </div>
                    <div class="col">
                        <a href="manager_notifications.php" class="manager-link">
                            <span class="h1">🔔</span>
                            <span class="h3 a-underline light">Notifiche</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="modal overlay" id="logoutModal" tabindex="-1" aria-labelledby="logoutModalLabel">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content w-75 mx-auto">
          <div class="modal-header">
            <h4 class="modal-title" id="logoutModalLabel">Conferma Logout</h4>
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
</section>