<section class="container py-5">
  <section class="container py-5">
    <h2 class="display-4 custom-title text-center mb-3">
      <span class="txt">Stock</span>
      <span class="emoji">✍🏻</span>
    </h2>
  </section>
  <div class="card shadow-lg rounded-3 p-4 p-md-5">
    <div class="row mt-1 g-1">
      <div class="col-12 col-sm-6 col-md-3">
        <div class="bg-primary-subtle p-3 rounded-3 d-flex align-items-center justify-content-between">
          <span class="text-primary fw-semibold">Prodotti Totali:</span>
          <span class="text-primary-emphasis fs-4 fw-bold">collega db</span>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <div class="bg-success-subtle p-3 rounded-3 d-flex align-items-center justify-content-between">
          <span class="text-success fw-semibold">In magazzino:</span>
          <span class="text-success-emphasis fs-4 fw-bold">collega db</span>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <div class="bg-warning-subtle p-3 rounded-3 d-flex align-items-center justify-content-between">
          <span class="text-warning fw-semibold">Bassa Scorta:</span>
          <span class="text-warning-emphasis fs-4 fw-bold">collega db</span>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <div class="bg-danger-subtle p-3 rounded-3 d-flex align-items-center justify-content-between">
          <span class="text-danger fw-semibold">Esauriti:</span>
          <span class="text-danger-emphasis fs-4 fw-bold">collega db</span>
        </div>
      </div>
    </div>

    <section class="mb-4">
      <div class="row g-3">
        <div class="col-12 col-md-6 col-lg-3 mt-4">
          <label for="category-filter" class="form-label small text-secondary mb-1">Categoria</label>
          <select id="category-filter" class="form-select rounded-2 shadow-sm">
            <option value="">Tutte le Categorie</option>
            <option value="clothing">Abbigliamento</option>
            <option value="food">Cibo e Bevande</option>
            <option value="books">Libri</option>
            <option value="home-goods">Articoli per la Casa</option>
          </select>
        </div>

        <div class="col-12 col-md-6 col-lg-3 mt-4">
          <label for="status-filter" class="form-label small text-secondary mb-1">Stato Scorta</label>
          <select id="status-filter" class="form-select rounded-2 shadow-sm">
            <option value="all">Tutti</option>
            <option value="in-stock">In Magazzino</option>
            <option value="low-stock">Bassa Scorta</option>
            <option value="out-of-stock">Esaurito</option>
          </select>
        </div>
      </div>
    </section>

    <section>
      <div class="table-responsive rounded-3 shadow-sm border">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col" class="py-3 px-4 text-start text-uppercase small text-secondary">Categoria</th>
              <th scope="col" class="py-3 px-4 text-start text-uppercase small text-secondary">Quantità</th>
              <th scope="col" class="py-3 px-4 text-start text-uppercase small text-secondary">Stato</th>
              <th scope="col" class="py-3 px-4 text-start text-uppercase small text-secondary">Azione</th>
            </tr>
          </thead>

          <!-- Table Body -->
          <tbody>
            <!-- Example Product Row -->
            <tr>
              <td class="py-3 px-4">
                <div class="d-flex align-items-center">
                  <div class="flex-shrink-0 me-3">
                    <img
                      class="rounded-circle object-fit-cover"
                      style="width: 40px; height: 40px;"
                      src="https://placehold.co/40x40/E0F2F7/0288D1?text=P1"
                      alt="Immagine Prodotto"
                    />
                  </div>
                  <div>
                    <div class="fw-medium text-dark">Cuffie Bluetooth Wireless</div>
                    <div class="small text-secondary">Modello X-200</div>
                  </div>
                </div>
              </td>
              <td class="py-3 px-4 text-dark fw-bold">85</td>
              <td class="py-3 px-4 text-dark fw-bold">In Magazzino</td>
              <td class="py-3 px-4 text-dark fw-bold">
                <a href="#">Modifica Quantità</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <nav
        class="d-flex justify-content-between align-items-center mt-4 p-3 bg-white rounded-bottom-3 border-top"
        aria-label="Paginazione"
      >
        <div class="d-block d-sm-none">
          <a href="#" class="btn btn-outline-secondary me-2">Precedente</a>
          <a href="#" class="btn btn-outline-secondary">Successivo</a>
        </div>
        <div class="d-none d-sm-flex flex-grow-1 justify-content-between align-items-center">
          <p class="mb-0 text-secondary small">
            Mostrando
            <span class="fw-medium">1</span>
            a
            <span class="fw-medium">10</span>
            di
            <span class="fw-medium">150</span>
            risultati
          </p>
          <ul class="pagination mb-0">
            <li class="page-item">
              <a class="page-link rounded-start-2" href="#" aria-label="Precedente">
                <span aria-hidden="true">&laquo;</span>
              </a>
            </li>
            <li class="page-item active" aria-current="page">
              <a class="page-link" href="#">1</a>
            </li>
            <li class="page-item"><a class="page-link" href="#">2</a></li>
            <li class="page-item d-none d-md-block">
              <a class="page-link" href="#">3</a>
            </li>
            <li class="page-item disabled">
              <span class="page-link">...</span>
            </li>
            <li class="page-item d-none d-md-block">
              <a class="page-link" href="#">9</a>
            </li>
            <li class="page-item"><a class="page-link" href="#">10</a></li>
            <li class="page-item">
              <a class="page-link rounded-end-2" href="#" aria-label="Successivo">
                <span aria-hidden="true">&raquo;</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </section>
  </div>
</section>
