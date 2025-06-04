<!-- chillburger/manager_menu.php – markup rivisto con gruppo filtri -->
<section class="container py-5">
  <h2 class="display-4 custom-title text-center mb-3">
    <span class="txt">Gestione Menu</span>
    <span class="emoji">📋</span>
  </h2>

  <main class="container p-4">

    <!-- Elenco prodotti + filtri -->
    <section class="mb-5">
      <h2 class="h4 mb-4 position-relative animate-underline">
        <span>Prodotti attuali</span>
      </h2>

      <!-- Gruppo pulsanti filtro (generato via JS) -->
      <div id="filter-group" class="d-flex flex-wrap justify-content-center gap-2 mb-4">
        <button class="btn btn-filter active" data-category="all">Tutto</button>
        <button class="btn btn-filter" data-category="Panini">Panini</button>
        <button class="btn btn-filter" data-category="Fritti">Fritti</button>
        <button class="btn btn-filter" data-category="Bevande">Bevande</button>
        <button class="btn btn-filter" data-category="Dolci">Dolci</button>
    </div>

      <!-- Griglia prodotti -->
      <div id="product-list" class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4"></div>
    </section>

    <!-- Aggiunta nuovo prodotto -->
    <section>
      <h2 class="h4 mb-4 position-relative animate-underline">
        <span>Aggiungi nuovo prodotto</span>
      </h2>

      <form id="add-product-form" class="bg-white shadow rounded p-4">
        <div class="mb-3">
          <label for="name" class="form-label">Nome prodotto</label>
          <input id="name" name="name" type="text" class="form-control" required>
        </div>
        <div class="mb-3">
          <label for="price" class="form-label">Prezzo (€/unità)</label>
          <input id="price" name="price" type="number" step="0.01" min="0" class="form-control" required>
        </div>
        <div class="mb-3">
          <label for="category" class="form-label">Categoria <span class="text-danger">*</span></label>
          <select id="category" name="category" class="form-select" required>
            <option value="" disabled selected>Seleziona una categoria...</option>
          </select>
        </div>
        <div class="mb-3">
          <label for="image" class="form-label">Immagine prodotto</label>
          <input id="image" name="image" type="file" accept="image/*" class="form-control" required>
          <img id="image-preview" class="img-fluid mt-2 rounded d-none" alt="Anteprima immagine">
        </div>
        <div class="mb-3">
          <label class="form-label">Ingredienti</label>
          <div id="ingredient-select" class="d-flex flex-wrap gap-2"></div>
        </div>
        <div class="d-grid">
          <button type="submit" class="btn btn-primary">Aggiungi Prodotto</button>
        </div>
      </form>
    </section>
  </main>

  <!-- Modal overlay -->
  <div id="modal-overlay" class="d-none">
    <div id="modal-box" class="bg-white shadow rounded p-4 mx-auto" style="max-width: 500px;"></div>
  </div>
</section>
