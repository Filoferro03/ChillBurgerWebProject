<section class="container py-5">

    <h1 class="display-4 custom-title text-center mb-3">
        <span class="txt">Ordini</span>
        <span class="emoji">📦</span>
    </h1>

    <h2 class="animate-underline mb-4">Ordini attuali</h2>

    <div class="row g-4 mb-5" id="ordersGrid">
        <div class="col-12 text-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Caricamento ordini attuali...</span>
            </div>
        </div>
    </div>

    <div id="activeOrdersPagination" class="d-flex justify-content-center mt-3"></div>

    <h2 class="animate-underline mb-4">Storico ordini</h2>

    <div class="row g-4" id="historyGrid">
        <div class="col-12 text-center">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Caricamento storico ordini...</span>
            </div>
        </div>
    </div>

    <div id="historyOrdersPagination" class="d-flex justify-content-center mt-3"></div>

    <div class="modal fade" id="confirmStatusModal" tabindex="-1" aria-labelledby="confirmStatusModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <p class="modal-title" id="confirmStatusModalLabel">Conferma Aggiornamento Stato</p>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    Sei sicuro di voler aggiornare lo stato dell'ordine #<span id="modalOrderId"></span>? <br/>
                    Il nuovo stato sarà: <strong id="modalNewStatus"></strong>.
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                    <button type="button" class="btn order-button" id="confirmUpdateStatusBtn">Conferma Aggiornamento</button>
                </div>
            </div>
        </div>
    </div>

</section>