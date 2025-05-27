<section class="container py-5">

    <h2 class="display-4 custom-title text-center mb-3">
        <span class="txt">Ordini</span>
        <span class="emoji">📦</span>
    </h2>

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
    
</section>