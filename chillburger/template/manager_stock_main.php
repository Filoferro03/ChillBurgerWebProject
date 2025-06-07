<section class="container py-5">
  <h2 class="display-4 custom-title text-center mb-3">
    <span class="txt">Stock</span>
    <span class="emoji">✍🏻</span>
  </h2>

  <div class="card shadow-lg rounded-3 p-4 p-md-5">
    <!-- ===== Summary Cards ================================================= -->
    <div class="row mt-1 g-1">
      <div class="col-12 col-sm-6 col-md-3">
        <div class="bg-primary-subtle p-3 rounded-3 d-flex align-items-center justify-content-between">
          <span class="text-primary fw-semibold">Prodotti Totali:</span>
          <span id="card-total" class="text-primary-emphasis fs-4 fw-bold"></span>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <div class="bg-success-subtle p-3 rounded-3 d-flex align-items-center justify-content-between">
          <span class="text-success fw-semibold">Prodotti in magazzino:</span>
          <span id="card-instock" class="text-success-emphasis fs-4 fw-bold"></span>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <div class="bg-warning-subtle p-3 rounded-3 d-flex align-items-center justify-content-between">
          <span class="text-warning fw-semibold">Prodotti con bassa Scorta:</span>
          <span id="card-lowstock" class="text-warning-emphasis fs-4 fw-bold"></span>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <div class="bg-danger-subtle p-3 rounded-3 d-flex align-items-center justify-content-between">
          <span class="text-danger fw-semibold">Prodotti esauriti:</span>
          <span id="card-outstock" class="text-danger-emphasis fs-4 fw-bold"></span>
        </div>
      </div>
    </div>
    <!-- ===================================================================== -->
  
    <!-- ===== Filters ======================================================= -->
    <section class="mb-4">
      <h3 class="visually-hidden">Filtri di ricerca</h3>
      <div class="row g-3">
        <div class="col-12 col-md-6 col-lg-3 mt-4">
          <label for="category-filter" class="form-label small text-secondary mb-1">Categoria</label>
          <select id="category-filter" class="form-select rounded-2 shadow-sm">
            <option value="">Tutte le Categorie</option>
            <option value="ingrediente">Ingredienti</option>
            <option value="bevanda">Bevande</option>
          </select>
        </div>

        <div class="col-12 col-md-6 col-lg-3 mt-4">
          <label for="status-filter" class="form-label small text-secondary mb-1">Stato Scorta</label>
          <select id="status-filter" class="form-select rounded-2 shadow-sm">
            <option value="all">Tutti</option>
            <option value="in-stock">In Magazzino</option>
            <option value="low-stock">Bassa Scorta</option>
            <option value="out-stock">Esaurito</option>
          </select>
        </div>
      </div>
    </section>
    <!-- ===================================================================== -->

    <!-- ===== Table ========================================================= -->
    <section>
      <div class="table-responsive rounded-3 shadow-sm border">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col" class="py-3 px-4 text-start text-uppercase small text-secondary">Prodotto</th>
              <th scope="col" class="py-3 px-4 text-start text-uppercase small text-secondary">Quantità</th>
              <th scope="col" class="py-3 px-4 text-start text-uppercase small text-secondary">Stato</th>
              <th scope="col" class="py-3 px-4 text-start text-uppercase small text-secondary">Rimuovi/Aggiungi</th>
              <th scope="col" class="py-3 px-4 text-start text-uppercase small text-secondary">Azione</th>
            </tr>
          </thead>

          <tbody id="stock-table"><!-- rows injected by JS --></tbody>
        </table>
      </div>

      <!-- Modal per Modifica Quantità -->
      <div class="modal fade" id="qtyModal" tabindex="-1" aria-labelledby="qtyModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title fw-bold" id="qtyModalLabel">Modifica Quantità</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Chiudi"></button>
            </div>
            <div class="modal-body">
              <p id="modalProductName" class="fw-medium mb-3"></p>
              <div class="input-group">
                <button class="btn btn-outline-secondary" id="decrementBtn">−</button>
                <input type="number" class="form-control text-center" id="qtyInput" value="0" min="0">
                <button class="btn btn-outline-secondary" id="incrementBtn">+</button>
              </div>
              <small class="text-muted">Puoi anche digitare direttamente il valore.</small>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
              <button type="button" class="btn btn-primary" id="saveQtyBtn">Salva</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Pagination (filled by JS) =================================== -->
      <nav id="pager" class="mt-4 d-flex justify-content-center align-items-center"
           class="d-flex justify-content-between align-items-center mt-4 p-3 bg-white rounded-bottom-3 border-top"
           aria-label="Paginazione">
      </nav>
    </section>
    <!-- ===================================================================== -->
  </div>
</section>