<!DOCTYPE html>
<html lang="it">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $templateParams["titolo"]; ?></title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css"
        rel="stylesheet"
        integrity="sha384-SgOJa3DmI69IUzQ2PVdRZhwQ+dy64/BUtbMJw1MZ8t5HZApcHrRKUc4W0kG879m7"
        crossorigin="anonymous">
    <link rel="stylesheet" href="./css/style.css">
    <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
</head>


<body class="d-flex flex-column min-vh-100">
    <header>
        <nav class="mobile navbar py-4">
            <div class="container-fluid">
                <button class="navbar-toggler mx-1" type="button" data-bs-toggle="offcanvas"
                    data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="d-flex align-items-center">
                    <a class="navbar-brand me-2 d-flex" href="index.php">
                        <p class="chill-burger-title m-0">ChillBurger</p>
                    </a>
                </div>

                <div>
                    <?php if (isUserLoggedIn() && isUserClient()): ?>
                        <a class="text-decoration-none" href="profile.php" aria-label="Profilo">
                            <strong class="fa-solid fa-user text-black fs-2" aria-hidden="true"></strong>
                            <span class="visually-hidden">Profilo</span>
                        </a>
                        <a href="notifications.php" class="text-decoration-none mx-1" aria-label="Notifiche">
                            <strong class="fa-solid fa-bell text-black fs-2" aria-hidden="true"></strong>
                            <span class="visually-hidden">Notifiche</span>
                        </a>
                        <a href="cart.php" class="text-decoration-none" aria-label="Carrello">
                            <strong class="fa-solid fa-cart-shopping text-black fs-2" aria-hidden="true"></strong>
                            <span class="visually-hidden">Carrello</span>
                        </a>

                    <?php elseif (isUserLoggedIn() && isUserAdmin()): ?>
                        <a class="text-decoration-none" href="profile.php" aria-label="Profilo">
                            <strong class="fa-solid fa-user text-black fs-2" aria-hidden="true"></strong>
                            <span class="visually-hidden">Profilo</span>
                        </a>
                        <a href="notifications.php" class="text-decoration-none mx-1" aria-label="Notifiche">
                            <strong class="fa-solid fa-bell text-black fs-2" aria-hidden="true"></strong>
                            <span class="visually-hidden">Notifiche</span>
                        </a>
                        <a href="manager.php" class="text-decoration-none" aria-label="Manager">
                            <strong class="fa-solid fa-user-tie text-black fs-2" aria-hidden="true"></strong>
                            <span class="visually-hidden">Manager</span>
                        </a>

                    <?php else: ?>
                        <a href="login.php" class="text-decoration-none mx-4" aria-label="Login">
                            <strong class="fa-solid fa-user text-black fs-2" aria-hidden="true"></strong>
                            <span class="visually-hidden">Login</span>
                        </a>
                    <?php endif; ?>
                </div>
                <div class="offcanvas offcanvas-start w-50" tabindex="-1" id="offcanvasNavbar"
                    aria-labelledby="offcanvasNavbarLabel">
                    <div class="offcanvas-header">
                        <h5 class="offcanvas-title" id="offcanvasNavbarLabel">ChillBurger</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>
                    <div class="offcanvas-body">
                        <ul class="navbar-nav justify-content-start flex-grow-1 pe-3">
                            <li class="nav-item">
                                <a class="nav-link fs-3" aria-current="page" href="menu.php">Menu</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link fs-3" href="order_now.php">Ordina ora</a>
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

        <nav class="desktop navbar py-4 px-1">
            <div class="container-fluid">
                <a href="index.php"><img src="./resources/ChillBurgerLogo.png" alt="ChillBurger Logo" class="logo" /></a>
                <ul class="list-group list-group-horizontal d-flex justify-content-center gap-2">
                    <li class="list-group-item">
                        <a class="nav-link header-menu fs-3" aria-current="page" href="menu.php">Menu</a>
                    </li>
                    <li class="list-group-item">
                        <a class="nav-link header-menu fs-3" href="order_now.php">Ordina ora</a>
                    </li>
                    <li class="list-group-item">
                        <a class="nav-link header-menu fs-3" href="about_us.php">About us</a>
                    </li>
                    <li class="list-group-item">
                        <a class="nav-link header-menu fs-3" href="reviews.php">Recensioni</a>
                    </li>
                </ul>
                <div>
                    <?php if (isUserLoggedIn() && isUserClient()): ?>
                        <a class="text-decoration-none" href="profile.php" aria-label="Profilo">
                            <strong class="fa-solid fa-user text-black fs-3" aria-hidden="true"></strong>
                            <span class="visually-hidden">Profilo</span>
                        </a>
                        <a href="notifications.php" class="text-decoration-none mx-2" aria-label="Notifiche">
                            <strong class="fa-solid fa-bell text-black fs-3" aria-hidden="true"></strong>
                            <span class="visually-hidden">Notifiche</span>
                        </a>
                        <a href="cart.php" class="text-decoration-none" aria-label="Carrello">
                            <strong class="fa-solid fa-cart-shopping text-black fs-3" aria-hidden="true"></strong>
                            <span class="visually-hidden">Carrello</span>
                        </a>

                    <?php elseif (isUserLoggedIn() && isUserAdmin()): ?>
                        <a class="text-decoration-none" href="profile.php" aria-label="Profilo">
                            <strong class="fa-solid fa-user text-black fs-2" aria-hidden="true"></strong>
                            <span class="visually-hidden">Profilo</span>
                        </a>
                        <a href="notifications.php" class="text-decoration-none mx-4" aria-label="Notifiche">
                            <strong class="fa-solid fa-bell text-black fs-2" aria-hidden="true"></strong>
                            <span class="visually-hidden">Notifiche</span>
                        </a>
                        <a href="manager.php" class="text-decoration-none" aria-label="Manager">
                            <strong class="fa-solid fa-user-tie text-black fs-2" aria-hidden="true"></strong>
                            <span class="visually-hidden">Manager</span>
                        </a>

                    <?php else: ?>
                        <a href="login.php" class="text-decoration-none mx-4" aria-label="Login">
                            <strong class="fa-solid fa-user text-black fs-2" aria-hidden="true"></strong>
                            <span class="visually-hidden">Login</span>
                        </a>
                    <?php endif; ?>
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

    <footer class="py-3 mt-auto">
        <div class="container">
            <div class="d-flex flex-column">
                <div class=" d-flex justify-content-center mt-2">
                    <a href="https://www.facebook.com/" class=" me-3"
                        title="visualizza la nostra pagina facebook per restare aggioranato" aria-label="Visita la nostra pagina Facebook"><strong
                            class="fab fa-facebook fa-2x text-black" aria-hidden="true"></strong></a>
                    <a href="https://www.instagram.com/" class=" me-3"
                        title="visualizza la nostra pagina instagram per restare aggioranato" aria-label="Visita la nostra pagina Instagram"><strong
                            class="fab fa-instagram fa-2x text-black" aria-hidden="true"></strong></a>
                    <a href="https://x.com/home" class=""
                        title="visualizza la nostra pagina twitter per restare aggioranato" aria-label="Visita la nostra pagina X (Twitter)"><strong
                            class="fab fa-square-x-twitter fa-2x text-black" aria-hidden="true"></strong></a>
                </div>
            </div>
        </div>
        <div>
            <p class="text-center my-2">&copy; <?php echo date("Y"); ?> ChillBurger. Tutti i diritti riservati.</p>
        </div>
    </footer>

    <script src="js/shared/components.js"></script>
    <script src="js/shared/utils.js"></script>

    <?php
    if (isset($templateParams["css"])):
        foreach ($templateParams["css"] as $style):
    ?>
            <link rel="stylesheet" href="<?php echo $style; ?>">
        <?php
        endforeach;
    endif;
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