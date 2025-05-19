<?php

require("../bootstrap.php");

$result = ["success" => false, "data" => null, "error" => null];

try {
    if (!isset($_POST["action"])) {
        throw new Exception("Azione non specificata.");
    }

    $action = $_POST["action"];

    switch ($action) {
        case "readnotification":
            if (!isset($_POST["idnotification"])) {
                throw new Exception("ID notifica mancante.");
            }
            $dbh->readNotification($_POST["idnotification"]);
            $result["success"] = true;
            break;

        case "deletenotification":
            if (!isset($_POST["idnotification"])) {
                throw new Exception("ID notifica mancante.");
            }
            $dbh->deleteNotification($_POST["idnotification"]);
            $result["success"] = true;
            break;

        case "getallnotifications":
            if (!isset($_SESSION["idutente"])) {
                throw new Exception("Utente non autenticato.");
            }
            $notifications = $dbh->getNotificationsByUserId($_SESSION["idutente"]);
            $result["success"] = true;
            $result["data"] = $notifications;
            break;

        case "ordernotification":
            if (!isset($_SESSION["idutente"], $_POST["idordine"])) {
                throw new Exception("Parametri mancanti per notifica ordine.");
            }
            $dbh->createOrderNotification($_SESSION["idutente"], $_POST["idordine"]);
            $result["success"] = true;
            break;

        case "ingredientnotification":
            if (!isset($_SESSION["idutente"], $_POST["idingrediente"], $_POST["nomeingrediente"])) {
                throw new Exception("Parametri mancanti per notifica ingrediente.");
            }
            $dbh->createLowStockIngredientNotification(
                $_SESSION["idutente"],
                $_POST["idingrediente"],
                $_POST["nomeingrediente"]
            );
            $result["success"] = true;
            break;

        case "productnotification":
            if (!isset($_SESSION["idutente"], $_POST["idprodotto"], $_POST["nomeprodotto"])) {
                throw new Exception("Parametri mancanti per notifica prodotto.");
            }
            $dbh->createLowStockProductNotification(
                $_SESSION["idutente"],
                $_POST["idprodotto"],
                $_POST["nomeprodotto"]
            );
            $result["success"] = true;
            break;

        case "haslowstockingredients":
            $result["success"] = true;
            $result["data"] = $dbh->hasLowStockIngredients();
            break;

        case "haslowstockproducts":
            $result["success"] = true;
            $result["data"] = $dbh->hasLowStockProducts();
            break;

        case "getlowstockingredients":
            $result["success"] = true;
            $result["data"] = $dbh->getLowStockIngredients();
            break;

        case "getlowstockproducts":
            $result["success"] = true;
            $result["data"] = $dbh->getLowStockProducts();
            break;

        default:
            throw new Exception("Azione non riconosciuta.");
    }
} catch (Exception $e) {
    $result["error"] = $e->getMessage();
}

header("Content-Type: application/json");
echo json_encode($result);
