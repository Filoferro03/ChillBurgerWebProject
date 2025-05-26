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



        default:
            throw new Exception("Azione non riconosciuta.");
    }
} catch (Exception $e) {
    $result["error"] = $e->getMessage();
}

header("Content-Type: application/json");
echo json_encode($result);
