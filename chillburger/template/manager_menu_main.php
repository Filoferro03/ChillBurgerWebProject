<section class="container py-5">
    <h1 class="display-4 custom-title text-center mb-3">
      <span class="txt">Gestione Menu</span>
      <span class="emoji">📋</span>
    </h1>

    <div class="container p-4">

      <section class="mb-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="mb-0 position-relative animate-underline">
            <span>Prodotti attuali</span>
          </h2>
        <button id="btn-new-product" class="btn btn-success">
          <span class="fas fa-plus me-2" aria-hidden="true"></span>
          <span class="visually-hidden">Aggiungi Nuovo Prodotto</span>
          Nuovo Prodotto
        </button>
          
        </div>

        <div id="filter-group" class="d-flex flex-wrap justify-content-center gap-2 mb-4">
        </div>

        <div id="product-list" class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4"></div>
      </section>


  </div>

    <div id="modal-overlay" class="d-none">
      <div id="modal-box" class="shadow rounded p-4 mx-auto" style="max-width: 500px; background-color: #e6ccb2;"></div>
    </div>
</section>
