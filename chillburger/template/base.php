<!DOCTYPE html>
<html lang="it">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $templateParams["titolo"]; ?></title>

    <!-- CSS “core” -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-SgOJa3DmI69IUzQ2PVdRZhwQ+dy64/BUtbMJw1MZ8t5HZApcHrRKUc4W0kG879m7"
        crossorigin="anonymous">
    <link rel="stylesheet" href="./css/style.css">
    <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">

    <?php
    /* ==========  CSS extra (per‑pagina)  ========== */
    if (!empty($templateParams['css'])) {
        foreach ($templateParams['css'] as $css) {
            echo '<link rel="stylesheet" href="' . htmlspecialchars($css, ENT_QUOTES) . '">' . PHP_EOL;
        }
    }

    /* ==========  JS extra (per‑pagina) – facoltativo  ========== */
    if (!empty($templateParams['js'])) {
        foreach ($templateParams['js'] as $js) {
            echo '<script src="' . htmlspecialchars($js, ENT_QUOTES) . '" defer></script>' . PHP_EOL;
        }
    }
    ?>
</head>


<body>
    <header>
        <!--Navbar for mobile-->
        <nav class="mobile navbar py-4">
            <div class="container-fluid">
                <button class="navbar-toggler mx-3" type="button" data-bs-toggle="offcanvas"
                    data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="d-flex align-items-center">
                    <a class="navbar-brand me-2 d-flex" href="index.php">
                        <img src="./resources/ChillBurgerLogoMobile.png" alt="ChillBurger Logo" class="logo me-2" />
                        <h1 class="chill-burger-title m-0">ChillBurger</h1>
                    </a>

                </div>

                <div>
                    <a class="text-decoration-none" href="#">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="black"
                            class="bi bi-person-circle" viewBox="0 0 16 16">
                            <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                            <path fill-rule="evenodd"
                                d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
                        </svg>
                    </a>
                    <a href="#" class="text-decoration-none mx-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="black" class="bi bi-bell"
                            viewBox="0 0 16 16">
                            <path
                                d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6" />
                        </svg>
                    </a>
                </div>
                <div class="offcanvas offcanvas-start w-50" tabindex="-1" id="offcanvasNavbar"
                    aria-labelledby="offcanvasNavbarLabel">
                    <div class="offcanvas-header">
                        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>
                    <div class="offcanvas-body">
                        <ul class="navbar-nav justify-content-start flex-grow-1 pe-3">
                            <li class="nav-item">
                                <a class="nav-link fs-3" aria-current="page" href="menu.php">Menu</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link fs-3" href="#">Ordina ora</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link fs-3" href="about_us.php">About us</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link fs-3" href="reviews.php">Recensioni</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>

        <!--Navbar for desktop-->
        <nav class="desktop navbar py-4 px-4">
            <div class="container-fluid">
                <a href="index.php"><img src="./resources/ChillBurgerLogo.png" alt="ChillBurger Logo" class="logo" /></a>
                <ul class="list-group list-group-horizontal d-flex justify-content-center gap-4">
                    <li class="list-group-item">
                        <a class="nav-link header-menu fs-2" aria-current="page" href="menu.php">Menu</a>
                    </li>
                    <li class="list-group-item">
                        <a class="nav-link header-menu fs-2" href="#">Ordina ora</a>
                    </li>
                    <li class="list-group-item">
                        <a class="nav-link header-menu fs-2" href="about_us.php">About us</a>
                    </li>
                    <li class="list-group-item">
                        <a class="nav-link header-menu fs-2" href="reviews.php">Recensioni</a>
                    </li>
                </ul>
                <div>
                    <a class="text-decoration-none" href="#">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="black"
                            class="bi bi-person-circle" viewBox="0 0 16 16">
                            <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                            <path fill-rule="evenodd"
                                d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
                        </svg>
                    </a>
                    <a href="#" class="text-decoration-none mx-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="black" class="bi bi-bell"
                            viewBox="0 0 16 16">
                            <path
                                d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6" />
                        </svg>
                    </a>
                </div>
            </div>
        </nav>
    </header>

    <main>
        <?php
        if (isset($templateParams["nome"])) {
            require($templateParams["nome"]);
        }
        ?>
    </main>

    <footer class="py-3">
        <div class="container">
            <div class="d-flex flex-column">
                <div class="d-flex justify-content-center">
                    <strong class="mb-4">Seguici</strong>
                </div>
                <div class=" d-flex justify-content-center mt-2">
                    <a href="https://www.facebook.com/" class=" me-3"
                        title="visualizza la nostra pagina facebook per restare aggioranato"><strong
                            class="fab fa-facebook fa-2x text-black"></strong></a>
                    <a href="https://www.instagram.com/" class=" me-3"
                        title="visualizza la nostra pagina instagram per restare aggioranato"><strong
                            class="fab fa-instagram fa-2x text-black"></strong></a>
                    <a href="https://x.com/home" class=""
                        title="visualizza la nostra pagina twitter per restare aggioranato"><strong
                            class="fab fa-square-x-twitter fa-2x text-black"></strong></a>
                </div>
            </div>
        </div>
        <div>
            <p class="text-center">&copy; 2023 ChillBurger. Tutti i diritti riservati.</p>
        </div>
    </footer>

    <?php
    if (isset($templateParams["js"])):
        foreach ($templateParams["js"] as $script):
    ?>
            <script src="<?php echo $script; ?>"></script>
    <?php
        endforeach;
    endif;
    ?>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-k6d4wzSIapyDyv1kpU366/PK5hCdSbCRGRCMv+eplOQJWyd1fbcAu9OCUj5zNLiq"
        crossorigin="anonymous"></script>
</body>

</html>