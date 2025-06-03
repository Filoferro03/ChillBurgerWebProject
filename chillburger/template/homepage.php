<section class="hero-section d-flex flex-column justify-content-center align-items-center text-center">
    <div class="hero-overlay"></div>
    <div class="hero-content container">
        <h1 class="display-1 welcome-to-title mb-4">Welcome to</h1>
        <h1 class="display-1 chill-burger-title mb-4">Chill Burger</h1>
        <div class="d-flex flex-column flex-md-row justify-content-center align-items-center gap-3">
            <?php if (isset($_SESSION["idutente"])) { ?>
                <?php if (isUserClient()) { ?>
                    <a href="order_now.php" class="btn btn-body btn-lg me-md-3 mb-3 mb-md-0">Ordina</a>
                    <a href="menu.php" class="btn btn-body btn-lg me-md-3 mb-3 mb-md-0">Menu</a>
                <?php } else if (isUserAdmin()) { ?>
                    <a href="menu.php" class="btn btn-body btn-lg me-md-3 mb-3 mb-md-0">Menu</a>
                <?php } ?>
            <?php } else { ?>
                <a href="menu.php" class="btn btn-body btn-lg me-md-3 mb-3 mb-md-0">Menu</a>
            <?php } ?>
        </div>

    </div>
</section>
<?php

?>