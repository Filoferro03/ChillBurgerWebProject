<?php
require_once("../bootstrap.php");
$result = [];

if (isset($_POST["action"])) {
    switch ($_POST["action"]) {
        case "getProducts":
            $products = $dbh->getProductsInCart($_SESSION["idordine"]);
            $personalizations = $dbh->getPersonalizationsInCart($_SESSION["idordine"]);
            for ($i = 0; $i < count($products); $i++) {
                $products[$i]["image"] = RESOURCES_DIR . "products/" . $products[$i]["image"];
            }

            for ($i = 0; $i < count($personalizations); $i++) {
                $personalizations[$i]["image"] = RESOURCES_DIR . "products/" . $personalizations[$i]["image"];
            }

            $result["products"] = $products;
            $result["personalizations"] = $personalizations;
            break;

        case "addProd":
            if (isset($_POST["idprodotto"])) {
                if ($dbh->isProductInCart($_POST["idprodotto"], $_SESSION["idordine"])) {
                    $dbh->modifyProductQuantity($_SESSION["idordine"], $_POST["idprodotto"], $_POST["quantita"]);
                    $result['success'] = true;
                } else {
                    $dbh->addProductToCart($_POST["idprodotto"], $_SESSION["idordine"], $_POST["quantita"]);
                    $result['success'] = true;
                }
            } else {
                $result['success'] = false;
                $result['error'] = "ID prodotto mancante";
            }
            break;

        case "addPers":
            if (isset($_POST["idprodotto"])) {
                $dbh->createPersonalization($_POST["idprodotto"], $_SESSION["idordine"], $_POST["quantita"]);
                $result['success'] = true;
            } else {
                $result['success'] = false;
                $result['error'] = "ID prodotto mancante";
            }
            break;

        case "removeProd":
            if (isset($_POST["idprodotto"])) {
                $success = $dbh->removeProductFromCart($_POST["idprodotto"], $_SESSION["idordine"]);
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

        case "removePers":
            if (isset($_POST["idpersonalizzazione"])) {
                $success2 = $dbh->removePersonalizationComposition($_POST["idpersonalizzazione"]);
                $success = $dbh->removePersonalizationFromCart($_POST["idpersonalizzazione"], $_SESSION["idordine"]);
                if ($success && $success2) {
                    $result['success'] = true;
                    $result["success2"] = true;
                } else {
                    $result['success'] = false;
                    $result["success2"] = false;
                    $result['error'] = "Errore durante la rimozione del prodotto dal carrello";
                }
            } else {
                $result['success'] = false;
                $result['error'] = "ID prodotto mancante";
            }
            break;

        case "getCartPrice":
            if (isset($_SESSION["idordine"])) {
                $order = $dbh->getOrderById($_SESSION["idordine"]);
                $result["order"] = $order;
                $result['success'] = true;
            } else {
                $result["order"] = [];
                $result['success'] = false;
            }

            break;


        case "modifyProdQuantity":
            if (isset($_SESSION["idordine"]) && isset($_POST["idprodotto"]) && isset($_POST["quantita"])) {
                $dbh->modifyProductQuantity($_SESSION["idordine"], $_POST["idprodotto"], $_POST["quantita"]);
                $result['success'] = true;
            } else {
                $result["message"] = "Non è stata settata in modfiy la scelta";
                $result['success'] = false;
            }

            break;


        case "modifyPersQuantity":
            if (isset($_SESSION["idordine"]) && isset($_POST["idpersonalizzazione"]) && isset($_POST["quantita"])) {
                $dbh->modifyPersonalizationQuantity($_SESSION["idordine"], $_POST["idpersonalizzazione"], $_POST["quantita"]);
                $result['success'] = true;
            } else {
                $result["message"] = "Non è stata settata in modfiy la scelta";
                $result['success'] = false;
            }

            break;

        case "getCartTotalQuantity":

            $totalquantity = $dbh->getAllQuantitiesInCart($_SESSION["idordine"]);
            $result = $totalquantity;

            break;

        case "createCart":
            if (isset($_SESSION["idutente"]) && isUserClient()) {
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

        case "createNewCart":
            if (isset($_SESSION["idutente"]) && isUserClient()) {
                $idcart = $dbh->createEmptyOrder($_SESSION["idutente"]);
                $result['createCart'] = true;
                $result['idordine'] = $idcart;
                setUserCart($result['idordine']);
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
