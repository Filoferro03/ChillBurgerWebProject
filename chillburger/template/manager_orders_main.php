<section class="container py-5">

    <!-- Titolo principale -->
    <h2 class="display-4 custom-title text-center mb-3">
        <span class="txt">Orders</span>
        <span class="emoji">📦</span>
    </h2>

    <!-- ORDINI ATTUALI -->
    <h2 class="animate-underline mb-4">Ordini attuali</h2>

    <div class="row g-4 mb-5" id="ordersGrid">
        <?php
        $ordiniAttivi = [
            ["id"=>1, "img"=>"./resources/ChillBurgerLogo.png",
             "nome"=>"Order #1", "desc"=>"Double cheese burger • Organic Cola • Salsa house", "prezzo"=>"14,90 €"],
            ["id"=>2, "img"=>"./resources/ChillBurgerLogo.png",
             "nome"=>"Order #2", "desc"=>"Double cheese burger • Organic Cola • Salsa house", "prezzo"=>"14,90 €"],
            ["id"=>3, "img"=>"./resources/ChillBurgerLogo.png",
             "nome"=>"Order #3", "desc"=>"Double cheese burger • Organic Cola • Salsa house", "prezzo"=>"14,90 €"],
            // TODO Altri oridni (colega al database)
        ];

        foreach ($ordiniAttivi as $o): ?>
        <div class="col-6 col-md-4 col-lg-3">
            <!-- L’intera card è un link -->
            <a href="manager_order_details.php?id=<?= $o['id']; ?>" class="text-decoration-none">
                <div class="card h-100 text-center shadow-sm hover-up">
                    <img src="<?= $o['img']; ?>" class="card-img-top" alt="<?= $o['nome']; ?>">
                    <div class="card-body">
                        <h5 class="card-title"><?= $o['nome']; ?></h5>
                        <p class="card-text small text-muted"><?= $o['desc']; ?></p>
                    </div>
                    <div class="card-footer bg-white border-0">
                        <span class="fw-bold text-primary"><?= $o['prezzo']; ?></span>
                    </div>
                </div>
            </a>
        </div>
        <?php endforeach; ?>
    </div>

    <!-- STORICO ORDINI -->
    <h2 class="animate-underline mb-4">Storico ordini</h2>

    <div class="row g-4" id="historyGrid">
        <?php
        $storicoOrdini = [
            ["id"=>10, "img"=>"./resources/ChillBurgerLogo.png",
             "nome"=>"Order #10", "desc"=>"Double cheese burger • Organic Cola • Salsa house", "prezzo"=>"14,90 €"],
            ["id"=>11, "img"=>"./resources/ChillBurgerLogo.png",
             "nome"=>"Order #11", "desc"=>"Double cheese burger • Organic Cola • Salsa house", "prezzo"=>"14,90 €"],
            // TODO Altri oridni (colega al database)
        ];

        foreach ($storicoOrdini as $o): ?>
        <div class="col-6 col-md-4 col-lg-3">
            <a href="manager_order_details.php?id=<?= $o['id']; ?>" class="text-decoration-none">
                <div class="card h-100 text-center shadow-sm hover-up">
                    <img src="<?= $o['img']; ?>" class="card-img-top" alt="<?= $o['nome']; ?>">
                    <div class="card-body">
                        <h5 class="card-title"><?= $o['nome']; ?></h5>
                        <p class="card-text small text-muted"><?= $o['desc']; ?></p>
                    </div>
                    <div class="card-footer bg-white border-0">
                        <span class="fw-bold text-primary"><?= $o['prezzo']; ?></span>
                    </div>
                </div>
            </a>
        </div>
        <?php endforeach; ?>
    </div>

</section>
