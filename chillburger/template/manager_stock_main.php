<section class="container py-5">
  <h2 class="display-4 custom-title text-center mb-3">
    <span class="txt">Stock</span>
    <span class="emoji">✍🏻</span>
  </h2>

  <div class="card shadow-lg rounded-3 p-4 p-md-5">
    
    <div class="row mt-1 g-1">
      <div class="col-12 col-sm-6 col-md-3">
        <div class="bg-primary-subtle p-3 rounded-3 d-flex align-items-center justify-content-between">
          <span class="text-primary fw-semibold">Ingredienti Totali:</span>
          <span id="card-total" class="text-primary-emphasis fs-4 fw-bold"></span>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <div class="bg-success-subtle p-3 rounded-3 d-flex align-items-center justify-content-between">
          <span class="text-success fw-semibold">In magazzino:</span>
          <span id="card-instock" class="text-success-emphasis fs-4 fw-bold"></span>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <div class="bg-warning-subtle p-3 rounded-3 d-flex align-items-center justify-content-between">
          <span class="text-warning fw-semibold">Bassa Scorta:</span>
          <span id="card-lowstock" class="text-warning-emphasis fs-4 fw-bold"></span>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <div class="bg-danger-subtle p-3 rounded-3 d-flex align-items-center justify-content-between">
          <span class="text-danger fw-semibold">Esauriti:</span>
          <span id="card-outstock" class="text-danger-emphasis fs-4 fw-bold"></span>
        </div>
      </div>
    </div>
  
    <section class="mb-4">
      <h3 class="visually-hidden">Filtri di ricerca</h3>
      <div class="row g-3">
        <div class="col-12 col-md-4 mt-4">
          <label for="search-filter" class="form-label small text-secondary mb-1">Cerca Ingrediente</label>
          <input type="text" id="search-filter" class="form-control rounded-2 shadow-sm" placeholder="Cerca per nome ingrediente...">
        </div>

        <div class="col-12 col-md-4 mt-4">
          <label for="status-filter" class="form-label small text-secondary mb-1">Stato Scorta</label>
          <select id="status-filter" class="form-select rounded-2 shadow-sm">
            <option value="all">Tutti</option>
            <option value="in-stock">In Magazzino</option>
            <option value="low-stock">Bassa Scorta</option>
            <option value="out-stock">Esaurito</option>
          </select>
        </div>

        <div class="col-12 col-md-4 mt-4 d-flex align-items-end">
          <a id="btn-new-product"
            class="btn btn-success w-100 px-4"
            href="manager_new_ingredient.php">
            <span class="fas fa-plus me-2" aria-hidden="true"></span>
            <span class="visually-hidden">Aggiungi Nuovo Ingrediente</span>
            Nuovo Ingrediente
          </a>
        </div>
      </div>
    </section>

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

          <tbody id="stock-table"></tbody>
        </table>
      </div>

      <div class="modal fade" id="qtyModal" tabindex="-1" aria-labelledby="qtyModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h4 class="modal-title fw-bold" id="qtyModalLabel">Modifica Quantità</h4>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Chiudi"></button>
            </div>
            <div class="modal-body">
              <p id="modalProductName" class="fw-medium mb-3"></p>
              <div class="input-group">
                <button class="btn btn-outline-secondary" id="decrementBtn">−</button>
                <label for="qtyInput" class="visually-hidden">Quantità</label>
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

      <nav id="pager" class="mt-4 d-flex justify-content-center align-items-center"
           class="d-flex justify-content-between align-items-center mt-4 p-3 bg-white rounded-bottom-3 border-top"
           aria-label="Paginazione">
      </nav>
    </section>
  </div>
</section>