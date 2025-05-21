<?php
require_once("../bootstrap.php");
$result = [];

if (isset($_POST["action"])) {
    switch ($_POST["action"]) {
        case "getProducts":
            $products = $dbh->getProductsInCart($_SESSION["idordine"]);
            for ($i = 0; $i < count($products); $i++) {
                $products[$i]["image"] = RESOURCES_DIR . "products/" . $products[$i]["image"];
            }
            $result = $products;
            break;

        case "addProd":
            if (isset($_POST["idprodotto"])) {
                $dbh->addProductToCart($_POST["idprodotto"], $_SESSION["idordine"], $_POST["quantita"]);
                $result['success'] = true;
            } else {
                $result['success'] = false;
                $result['error'] = "ID prodotto mancante";
            }
            break;

        case "removeProd":
            if (isset($_POST["idprodotto"])) {
                $success = $dbh->removeProductFromCart($_POST["idprodotto"], $_SESSION["idordine"]);
                //$success = $dbh->removeProductFromCart($_POST["id"],$_POST["idprodotto"], $_SESSION["idordine"]);
                if ($success) {
                    $result['success'] = true;
                } else {
                    $result['success'] = false;
                    $result['error'] = "Errore durante la rimozione del prodotto dal carrello";
                }
            } else {
                $result['success'] = false;
                $result['error'] = "ID prodotto mancante";
            }
            break;

        case "createCart":
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
            break;

        default:
            $result['success'] = false;
            $result['error'] = "Azione non riconosciuta";
            break;
    }
} else {
    $result['success'] = false;
    $result['error'] = "Nessuna azione specificata";
}

header("Content-type: application/json");
echo json_encode($result);
