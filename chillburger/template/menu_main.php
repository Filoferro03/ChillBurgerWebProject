<!-- template/menu_main.php -->
<section class="container py-5">

    <h2 class="display-4 menu-title text-center mb-5">
        Il nostro menù 🍔
    </h2>

    <!-- Filtri opzionali -->
    <div class="d-flex flex-wrap justify-content-center gap-2 mb-4">
        <button class="btn btn-filter active" data-category="all">Tutto</button>
        <button class="btn btn-filter"          data-category="burger">Burger</button>
        <button class="btn btn-filter"          data-category="fries">Fries</button>
        <button class="btn btn-filter"          data-category="drink">Drink</button>
    </div>

    <!-- Lista prodotti -->
    <div class="row g-4" id="menuGrid">

        <!-- Esempio di card prodotto -->
        <?php
        // array fittizio di prodotti (in futuro potrai caricarlo dal DB)
        $prodotti = [
            ["cat"=>"burger","img"=>"./resources/menu/burger_classic.jpg",
             "nome"=>"Classic Burger","desc"=>"Manzo 150 g • Cheddar • Salsa house","prezzo"=>"8,90 €"],
            ["cat"=>"burger","img"=>"./resources/menu/burger_double.jpg",
             "nome"=>"Double Smash","desc"=>"Doppio manzo • Bacon croccante","prezzo"=>"11,50 €"],
            ["cat"=>"fries","img"=>"./resources/menu/fries.jpg",
             "nome"=>"Patatine Rustiche","desc"=>"Patate fresche con buccia","prezzo"=>"3,50 €"],
            ["cat"=>"drink","img"=>"./resources/menu/cola.jpg",
             "nome"=>"Cola Bio 33 cl","desc"=>"Dolcificata con zucchero di canna","prezzo"=>"2,50 €"],
        ];

        foreach ($prodotti as $p): ?>
        <div class="col-6 col-md-4 col-lg-3 menu-item" data-category="<?= $p['cat']; ?>">
            <div class="card h-100 text-center shadow-sm hover-up">
                <img src="<?= $p['img']; ?>" class="card-img-top" alt="<?= $p['nome']; ?>">
                <div class="card-body">
                    <h5 class="card-title"><?= $p['nome']; ?></h5>
                    <p class="card-text small text-muted"><?= $p['desc']; ?></p>
                </div>
                <div class="card-footer bg-white border-0">
                    <span class="fw-bold text-primary"><?= $p['prezzo']; ?></span>
                </div>
            </div>
        </div>
        <?php endforeach; ?>
    </div>
</section>

<!-- Mini‑script di filtro (senza dipendenze) -->
<script defer>
document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".btn-filter");
    const items   = document.querySelectorAll(".menu-item");

    buttons.forEach(btn => btn.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const cat = btn.dataset.category;

        items.forEach(card => {
            card.style.display = (cat==="all" || card.dataset.category===cat) ? "" : "none";
        });
    }));
});
</script>
