<section class="container py-5">
  <div class="row justify-content-center">
    <div class="col-lg-8">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="display-4 custom-title text-center mb-3">
            <span class="txt">Nuovo Prodotto</span>
            <span class="emoji">🥒</span>
        </h2>

        <a href="manager_stock.php" class="btn btn-outline-secondary">
          <span class="fas fa-arrow-left me-2" aria-hidden="true"></span>
          <span class="visually-hidden">Indietro</span>
          Indietro
        </a>
      </div>

      <div class="card shadow">
        <div class="card-body p-4">
          <form id="product-form" enctype="multipart/form-data">
            <input type="hidden" id="product-id" name="product-id" value="">
            
            <div class="mb-3">
              <label for="product-name" class="form-label">Nome prodotto <span class="text-danger">*</span></label>
              <input id="product-name" name="name" type="text" class="form-control" required>
            </div>

            <div class="mb-3">
              <label for="product-price" class="form-label">Prezzo (€) <span class="text-danger">*</span></label>
              <input id="product-price" name="price" type="number" step="0.01" min="0" class="form-control" required>
            </div>

            <div class="mb-3" id="availability-section" style="display: none;">
              <label for="product-availability" class="form-label">Disponibilità <span class="text-danger">*</span></label>
              <input id="product-availability" name="availability" type="number" min="0" step="1" class="form-control" placeholder="Inserisci quantità disponibile">
              <div class="form-text">Inserisci 0 per indicare che il prodotto non è disponibile.</div>
            </div>

            <div class="mb-3">
              <label for="product-image" class="form-label">Immagine prodotto</label>
              <input id="product-image" name="image" type="file" accept="image/*" class="form-control">
              <div class="mt-3" id="current-image-container" style="display: none;">
                <label class="form-label">Immagine attuale:</label>
                <div>
                  <img id="current-image" class="img-fluid rounded" src="/" style="max-height: 200px;" alt="">
                </div>
              </div>
              <div class="mt-3" id="image-preview-container" style="display: none;">
                <label class="form-label">Anteprima nuova immagine:</label>
                <div>
                  <img id="image-preview" class="img-fluid rounded" src="/" style="max-height: 200px;" alt="">
                </div>
              </div>
            </div>

            <div class="mb-4" id="ingredients-section" style="display: none;">
              <label class="form-label">Ingredienti</label>
              <div id="ingredients-container" class="border rounded p-3 bg-light">
                <div id="ingredients-list" class="d-flex flex-wrap gap-2"></div>
                <div id="ingredients-loading" class="text-center text-muted">Caricamento ingredienti...</div>
                <div id="ingredients-error" class="text-danger" style="display: none;">Errore nel caricamento degli ingredienti.</div>
              </div>
            </div>

            <div class="d-grid gap-2 d-md-flex justify-content-md-end">
              <button type="button" id="btn-cancel" class="btn btn-outline-secondary me-md-2">Annulla</button>
              <button type="submit" id="btn-submit" class="btn btn-primary">
                <span id="submit-text">Aggiungi Prodotto</span>
                <span id="submit-loading" class="spinner-border spinner-border-sm" style="display: none; vertical-align: middle;"></span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1100">
    <div id="toast-message" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="toast-header">
        <strong class="me-auto" id="toast-title">Notifica</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body" id="toast-body">Messaggio</div>
    </div>
  </div>
</section>