<section class="container-fluid m-auto py-4 text-center">
    <h2 class="display-4 custom-title text-center mb-3">
        <span class="txt">Dettaglio Profilo</span>
    </h2>

    <div id="profile-data-area" class="card w-25 m-auto p-3 text-start">
        <p><strong>Nome:</strong> <span id="profile-nome">Caricamento...</span></p>
        <p><strong>Cognome:</strong> <span id="profile-cognome">Caricamento...</span></p>
        <p><strong>Username:</strong> <span id="profile-username">Caricamento...</span></p>
        <p><strong>IdUtente:</strong> <span id="profile-idutente">Caricamento...</span></p>

        <button type="button" id="logout-button" class="btn btn-danger m-auto">Logout</button>
    </div>

    <div class="card w-50 m-auto mt-4 p-3">
        <h3 class="text-center mb-3">Storico Ordini</h3>
        <div id="orders-list" class="list-group mb-3">
            <p class="text-center">Caricamento ordini...</p>
        </div>

        <div id="orders-pagination" class="d-flex justify-content-center"></div>
    </div>
</section>