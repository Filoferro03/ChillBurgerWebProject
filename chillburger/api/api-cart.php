<?php
require_once("../bootstrap.php");
$result = [];
if (isset($_POST["action"]) && $_POST["action"] == "getProducts") {
    $products = $dbh->getProductsInCart($_SESSION["idordine"]);
    for ($i = 0; $i < count($products); $i++) {
        $products[$i]["image"] = RESOURCES_DIR . "products/" . $products[$i]["image"];
    }
    $result = $products;
} else if (isset($_POST["action"]) && $_POST["action"] == "addProducts") {
    //add a product to the cart
} else if (isset($_POST["action"]) && $_POST["action"] == "removeProd") {
    $dbh->removeProductFromCart($_POST["idprodotto"], $_SESSION["idordine"]);
} else if (isset($_POST['action']) && $_POST['action'] === 'createCart') {
    if (isset($_SESSION["idutente"])) {
        if ($dbh->hasUncompletedOrder($_SESSION["idutente"])) {
            $cart = $dbh->getUncompletedOrder($_SESSION["idutente"]);
            $result['createCart'] = true;
            $result['idordine'] = $cart["idordine"];
            setUserCart($result['idordine']);
        } else {
            $idcart = $dbh->createEmptyOrder($_SESSION["idutente"]);
            $result['createCart'] = true;
            $result['idordine'] = $idcart;
            setUserCart($result['idordine']);
        }
    } else {
        $result['createCart'] = false;
        $result['message'] = "Utente non loggato";
    }
}
header("Content-type: application/json");
echo json_encode($result);
