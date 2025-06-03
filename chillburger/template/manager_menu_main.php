<?php
?>
<section class="container py-5">
    <h2 class="display-4 custom-title text-center mb-3">
      <span class="txt">Gestione Menu</span>
      <span class="emoji">📋</span>
    </h2>
    <main class="container p-4">
      <!-- Elenco prodotti -->
      <section class="mb-5">
        <h2 class="h4 mb-4 position-relative animate-underline">
          <!-- Per l’“underline animato” puoi mantenere la tua regola CSS custom animate-underline oppure usare ad esempio border-bottom -->
          <span>Prodotti attuali</span>
        </h2>
        <!-- row-cols-1 sul xs, row-cols-sm-2 su ≥576px, row-cols-lg-3 su ≥992px; g-4 = gap 1.5rem circa -->
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
            <label for="description" class="form-label">Descrizione</label>
            <textarea id="description" name="description" rows="3" class="form-control" required></textarea>
          </div>
          <div class="mb-3">
            <label for="price" class="form-label">Prezzo (€)</label>
            <input id="price" name="price" type="number" step="0.01" min="0" class="form-control" required>
          </div>
          <div class="mb-3">
            <label for="image" class="form-label">Immagine prodotto</label>
            <input id="image" name="image" type="file" accept="image/*" class="form-control" required>
            <!-- “hidden” diventa d-none, max-height e w-auto Bootstrap li gestisce internamente con img-fluid e classi di utilità -->
            <img id="image-preview" class="img-fluid mt-2 rounded d-none" alt="Anteprima immagine">
          </div>
          <div class="mb-3">
            <label class="form-label">Ingredienti</label>
            <!-- flex flex-wrap gap-2 → d-flex flex-wrap gap-2 -->
            <div id="ingredient-select" class="d-flex flex-wrap gap-2"></div>
          </div>
          <!-- w-full sm:w-auto → in Bootstrap si può usare d-grid per full-width e su sm “ridefinire” se serve,
              ma qui, se vuoi che il bottone sia sempre full-width, ti basta btn-primary w-100. -->
          <div class="d-grid">
            <button type="submit" class="btn btn-primary">Aggiungi Prodotto</button>
          </div>
        </form>
      </section>
    </main>

    <!-- Modal riusato per modifica / conferme -->
    <!-- “modal hidden” → d-none. Se preferisci usare il componente Modal nativo di Bootstrap, 
        dovrai adattare anche lo script JS; qui, per mantenere la struttura JS invariata, 
        ci limitiamo a sostituire hidden con d-none e le classi di stile. -->
    <div id="modal-overlay" class="d-none">
      <!-- “bg-white shadow rounded-lg p-6 w-full max-w-md” → bg-white, shadow, rounded, p-4, 
          con un max-width in linea o tramite utilità Bootstrap (qui imposto inline style max-width:500px). -->
      <div id="modal-box" class="bg-white shadow rounded p-4 mx-auto" style="max-width: 500px;"></div>
    </div>
</section>
