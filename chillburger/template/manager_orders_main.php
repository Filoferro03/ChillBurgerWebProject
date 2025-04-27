<section class="container py-5">

    <!-- Titolo principale -->
    <h2 class="display-4 custom-title text-center mb-3">
        <span class="txt">Orders</span>
        <span class="emoji">📦</span>
    </h2>

    <h2 class="animate-underline mb-4">Ordini Attuali</h2>

    <div class="row g-4 mb-5" id="menuGrid">
        <!-- card prodotto -->
        <?php
        /* TODO:
         * array fittizio di prodotti (in futuro potrai caricarlo dal DB)
         */
        $prodotti = [
            ["img"=>"./resources/ChillBurgerLogo.png",
             "nome"=>"Order #1","desc"=>"Double cheese burger • Organic Cola • Salsa house","prezzo"=>"14,90 €"],
            ["img"=>"./resources/ChillBurgerLogo.png",
             "nome"=>"Order #2","desc"=>"Double cheese burger • Organic Cola • Salsa house","prezzo"=>"14,90 €"],
            ["img"=>"./resources/ChillBurgerLogo.png",
             "nome"=>"Order #3","desc"=>"Double cheese burger • Organic Cola • Salsa house","prezzo"=>"14,90 €"],
            ["img"=>"./resources/ChillBurgerLogo.png",
             "nome"=>"Order #4","desc"=>"Double cheese burger • Organic Cola • Salsa house","prezzo"=>"14,90 €"],
            ["img"=>"./resources/ChillBurgerLogo.png",
             "nome"=>"Order #5","desc"=>"Double cheese burger • Organic Cola • Salsa house","prezzo"=>"14,90 €"],
            ["img"=>"./resources/ChillBurgerLogo.png",
             "nome"=>"Order #6","desc"=>"Double cheese burger • Organic Cola • Salsa house","prezzo"=>"14,90 €"],
            ["img"=>"./resources/ChillBurgerLogo.png",
             "nome"=>"Order #7","desc"=>"Double cheese burger • Organic Cola • Salsa house","prezzo"=>"14,90 €"],
        ];

        foreach ($prodotti as $p): ?>
        <div class="col-6 col-md-4 col-lg-3 menu-item">
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

    <h2 class="animate-underline mb-4">Storico Ordini</h2>
    <div class="row g-4" id="menuGrid">
        <?php
        /* TODO:
         * array fittizio di prodotti (in futuro potrai caricarlo dal DB)
         */
        $prodotti = [
            ["img"=>"./resources/ChillBurgerLogo.png",
             "nome"=>"Order #1","desc"=>"Double cheese burger • Organic Cola • Salsa house","prezzo"=>"14,90 €"],
            ["img"=>"./resources/ChillBurgerLogo.png",
             "nome"=>"Order #2","desc"=>"Double cheese burger • Organic Cola • Salsa house","prezzo"=>"14,90 €"],
            ["img"=>"./resources/ChillBurgerLogo.png",
             "nome"=>"Order #3","desc"=>"Double cheese burger • Organic Cola • Salsa house","prezzo"=>"14,90 €"],
            ["img"=>"./resources/ChillBurgerLogo.png",
             "nome"=>"Order #4","desc"=>"Double cheese burger • Organic Cola • Salsa house","prezzo"=>"14,90 €"],
            ["img"=>"./resources/ChillBurgerLogo.png",
             "nome"=>"Order #5","desc"=>"Double cheese burger • Organic Cola • Salsa house","prezzo"=>"14,90 €"],
            ["img"=>"./resources/ChillBurgerLogo.png",
             "nome"=>"Order #6","desc"=>"Double cheese burger • Organic Cola • Salsa house","prezzo"=>"14,90 €"],
            ["img"=>"./resources/ChillBurgerLogo.png",
             "nome"=>"Order #7","desc"=>"Double cheese burger • Organic Cola • Salsa house","prezzo"=>"14,90 €"],
        ];

        foreach ($prodotti as $p): ?>
        <div class="col-6 col-md-4 col-lg-3 menu-item">
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