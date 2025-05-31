<section class="container py-5">
    <h2 class="display-4 custom-title text-center mb-3">
        <span class="txt">Gestione Menu</span>
        <span class="emoji">📋</span>
    </h2>


  <?php /* Navbar riusabile del sito */
  if (file_exists(__DIR__.'/template/navbar.php')) {
      include __DIR__.'/template/navbar.php';
  }
  ?>

  <main class='flex-1 container mx-auto p-4 space-y-10'>

    <!-- Elenco prodotti -->
    <section>
      <h2 class='text-2xl font-semibold mb-2'>Prodotti attuali</h2>
      <div id='product-list' class='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'></div>
    </section>

    <!-- Aggiunta nuovo prodotto -->
    <section>
      <h2 class='text-2xl font-semibold mb-2'>Aggiungi nuovo prodotto</h2>
      <form id='add-product-form' class='bg-white shadow rounded-lg p-6 space-y-4'>
        <div>
          <label for='name' class='block font-medium mb-1'>Nome prodotto</label>
          <input id='name' name='name' type='text' class='input-field' required>
        </div>
        <div>
          <label for='description' class='block font-medium mb-1'>Descrizione</label>
          <textarea id='description' name='description' rows='3' class='input-field' required></textarea>
        </div>
        <div>
          <label for='price' class='block font-medium mb-1'>Prezzo (€)</label>
          <input id='price' name='price' type='number' step='0.01' min='0' class='input-field' required>
        </div>
        <div>
          <label for='image' class='block font-medium mb-1'>Immagine prodotto</label>
          <input id='image' name='image' type='file' accept='image/*' class='input-field' required>
          <img id='image-preview' class='mt-2 max-h-40 w-auto hidden rounded-lg' alt='Anteprima immagine'>
        </div>
        <div>
          <label class='block font-medium mb-1'>Ingredienti</label>
          <div id='ingredient-select' class='flex flex-wrap gap-2'></div>
        </div>
        <button type='submit' class='btn-primary w-full sm:w-auto'>Aggiungi Prodotto</button>
      </form>
    </section>
  </main>

  <!-- Modal riusato per modifica / conferme -->
  <div id='modal-overlay' class='modal hidden'>
    <div id='modal-box' class='bg-white rounded-lg p-6 w-full max-w-md shadow-lg'></div>
  </div>

  <!-- Script JS -->
  <script src='js/manager_menu.js'></script>

  </section>
</html>
