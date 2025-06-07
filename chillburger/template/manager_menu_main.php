
<!-- chillburger/manager_menu.php – markup rivisto con gruppo filtri -->
<section class="container py-5">
    <h2 class="display-4 custom-title text-center mb-3">
      <span class="txt">Gestione Menu</span>
      <span class="emoji">📋</span>
    </h2>

    <div class="container p-4">

      <!-- Elenco prodotti + filtri -->
      <section class="mb-5">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h2 class="h4 mb-0 position-relative animate-underline">
            <span>Prodotti attuali</span>
          </h2>
          <button id="btn-new-product" class="btn btn-success">
            <i class="fas fa-plus me-2"></i>Nuovo Prodotto
          </button>
          
        </div>

        <!-- Gruppo pulsanti filtro (generato via JS) -->
        <div id="filter-group" class="d-flex flex-wrap justify-content-center gap-2 mb-4">
        </div>

        <!-- Griglia prodotti -->
        <div id="product-list" class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4"></div>
      </section>


  </div>

    <!-- Modal overlay -->
    <div id="modal-overlay" class="d-none">
      <div id="modal-box" class="bg-white shadow rounded p-4 mx-auto" style="max-width: 500px;"></div>
    </div>
</section>
