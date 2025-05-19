<?php
require("../bootstrap.php");

$result = [];

try {
    if (isset($_POST["id"]) && isset($_POST["action"]) && $_POST["action"] === "getIngredients") {
        $idProdotto = $_POST["id"];
        $idOrdine = $_SESSION["idordine"];

        $ingredients = $dbh->getIngredientsByProduct($idProdotto);
        $product = $dbh->getProduct($idProdotto);

        if (!$ingredients || !$product) {
            throw new Exception("Impossibile recuperare ingredienti o prodotto.");
        }

        for ($i = 0; $i < count($ingredients); $i++) {
            $ingredients[$i]["image"] = RESOURCES_DIR . "ingredients/" . $ingredients[$i]["image"];
        }

        if ($dbh->doesPersonalizationExist($idProdotto, $idOrdine)) {
            $personalization = $dbh->getPersonalizationWithModifications($idProdotto, $idOrdine);
        } else {
            $created = $dbh->createPersonalization($idProdotto, $idOrdine);
            if (!$created) {
                throw new Exception("Errore nella creazione della personalizzazione.");
            }
            $personalization = $dbh->getPersonalizationWithModifications($idProdotto, $idOrdine);
        }

        if ($personalization === null) {
            throw new Exception("Errore nel recupero della personalizzazione.");
        }

        $result = [
            "ingredients" => $ingredients,
            "product" => $product,
            "personalization" => $personalization,
        ];
    } else if (
        isset($_POST["action"]) && $_POST["action"] === "modify" &&
        isset($_POST["act"], $_POST["idpersonalizzazione"], $_POST["idingrediente"])
    ) {

        $idPersonalizzazione = $_POST["idpersonalizzazione"];
        $idIngrediente = $_POST["idingrediente"];
        $azione = $_POST["act"];

        if ($dbh->ingredientModificationExists($idPersonalizzazione, $idIngrediente)) {
            $dbh->deleteIngredientModification($idPersonalizzazione, $idIngrediente);
        }

        $modifica = $dbh->addIngredientModification($idPersonalizzazione, $idIngrediente, $azione);
        if (!$modifica) {
            throw new Exception("Errore nell'aggiunta della modifica ingrediente.");
        }
        $result = $modifica;
    } else if (isset($_POST["action"]) && $_POST["action"] === "deleteIngredient") {
        if (!isset($_POST["idpersonalizzazione"], $_POST["idingrediente"])) {
            throw new Exception("Parametri mancanti per eliminazione ingrediente.");
        }
        $dbh->deleteIngredientModification($_POST["idpersonalizzazione"], $_POST["idingrediente"]);
        $result = ["success" => true];
    } else if (isset($_POST["action"]) && $_POST["action"] === "getPersonalization") {
        if (!isset($_POST["id"], $_SESSION["idordine"])) {
            throw new Exception("Parametri mancanti per recupero personalizzazione.");
        }

        if ($dbh->doesPersonalizationExist($_POST["id"], $_SESSION["idordine"])) {
            $personalization = $dbh->getPersonalization($_SESSION["idordine"], $_POST["id"]);
            if ($personalization === null) {
                throw new Exception("Errore nel recupero della personalizzazione.");
            }
            $result = $personalization;
        } else {
            $result = [];
        }
    } else {
        $result = ["error" => "Azione non riconosciuta o parametri mancanti."];
    }
} catch (Exception $e) {
    $result = ["error" => $e->getMessage()];
}

header("Content-Type: application/json");
echo json_encode($result);
