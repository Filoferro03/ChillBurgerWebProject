<!-- template/menu_main.php -->
<section class="container py-5">

    <!-- Titolo principale -->
    <h2 class="display-4 custom-title text-center mb-3">
        <span class="txt">Ordina Ora</span>
        <span class="emoji">🤩</span>
    </h2>

    <!-- Filtri opzionali -->
    <div class="d-flex flex-wrap justify-content-center gap-2 mb-4">
        <button class="btn btn-filter active" data-category="all">Tutto</button>
        <button class="btn btn-filter" data-category="burger">Burger</button>
        <button class="btn btn-filter" data-category="fries">Fries</button>
        <button class="btn btn-filter" data-category="drink">Drink</button>
    </div>

    <!-- Lista prodotti -->
    <div class="row g-4" id="menuGrid">

        <!-- card prodotto -->
        <?php

        /* TODO:
         *  
         * array fittizio di prodotti (in futuro potrai caricarlo dal DB)
         */
        $prodotti = [
            ["cat"=>"burger","img"=>"./resources/menu/stock.jpg",
             "nome"=>"Classic Burger","desc"=>"Manzo 150 g • Cheddar • Salsa house","prezzo"=>"8,90 €"],
            ["cat"=>"burger","img"=>"./resources/menu/stock.jpg",
             "nome"=>"Double Smash","desc"=>"Doppio manzo • Bacon croccante","prezzo"=>"11,50 €"],
            ["cat"=>"fries","img"=>"./resources/menu/stock.jpg",
             "nome"=>"Patatine Rustiche","desc"=>"Patate fresche con buccia","prezzo"=>"3,50 €"],
            ["cat"=>"drink","img"=>"./resources/menu/stock.jpg",
             "nome"=>"Cola Bio 33 cl","desc"=>"Dolcificata con zucchero di canna","prezzo"=>"2,50 €"],
        ];

        foreach ($prodotti as $p): ?>
        <!-- Card prodotto -->
        <div class="col-6 col-md-4 col-lg-3 menu-item" data-category="<?= $p['cat']; ?>">
            <div class="card h-100 text-center shadow-sm hover-up">
                <img src="<?= $p['img']; ?>" class="card-img-top" alt="<?= $p['nome']; ?>">
                <div class="card-body">
                    <h5 class="card-title"><?= $p['nome']; ?></h5>
                    <p class="card-text small text-muted"><?= $p['desc']; ?></p>
                </div>
                <div class="card-footer bg-white border-0">
                    <!-- Prezzo sopra i bottoni -->
                    <div class="d-block mb-3">
                        <span class="fw-bold text-primary"><?= $p['prezzo']; ?></span>
                    </div>
                    <!-- Bottoni aggiungi e rimuovi -->
                    <div class="d-flex justify-content-between">
                        <button class="btn btn-outline-success btn-sm btn-add" data-id="<?= $p['nome']; ?>">+ Aggiungi</button>
                        <button class="btn btn-outline-danger btn-sm btn-remove" data-id="<?= $p['nome']; ?>">− Rimuovi</button>
                    </div>
                </div>
            </div>
        </div>

        <?php endforeach; ?>
    </div>
</section>

