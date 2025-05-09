<?php
require("../bootstrap.php");

$result = [];

if (isset($_POST['idprodotto'])) {
    $burger = $dbh->getBurgerWithIngredients($_POST['idprodotto']);

    if ($burger !== null) {
        $burger['image'] = RESOURCES_DIR . "products/" . $burger['image'];
    }

    $result = $burger;
}

header("Content-Type: application/json");
echo json_encode($result);
