<?php
require("../bootstrap.php"); // Include il file di bootstrap che inizializza la connessione al DB, le sessioni, ecc.

$result = []; // Variabile che conterrà il risultato della richiesta, da restituire in formato JSON.

try {
    // Caso 1: Richiesta per ottenere gli ingredienti e la personalizzazione di un prodotto
    if (isset($_POST["id"]) && isset($_POST["action"]) && $_POST["action"] === "getIngredients") {
        $idPersonalizzazione = $dbh->getPersonalizationByID($_POST["id"]);
        $idProdotto = $idPersonalizzazione[0]["idprodotto"];
        $idOrdine = $_SESSION["idordine"]; // Recupera l'ID dell'ordine dalla sessione

        $ingredients = $dbh->getIngredientsByProduct($idProdotto); // Ingredienti base del prodotto
        $product = $dbh->getProduct($idProdotto); // Dati del prodotto

        if (!$ingredients || !$product) {
            throw new Exception("Impossibile recuperare ingredienti o prodotto.");
        }

        // Aggiunge il percorso corretto per le immagini degli ingredienti
        for ($i = 0; $i < count($ingredients); $i++) {
            $ingredients[$i]["image"] = RESOURCES_DIR . "ingredients/" . $ingredients[$i]["image"];
        }

        $personalizationmodified = $dbh->getPersonalizationWithModifications($_POST["id"]);

        if ($personalizationmodified === null) {
            throw new Exception("Errore nel recupero della personalizzazione.");
        }

        // Risposta JSON con tutti i dati necessari al frontend
        $result = [
            "ingredients" => $ingredients,
            "product" => $product,
            "personalization" => $personalizationmodified,
        ];

        // Caso 2: Richiesta per modificare un ingrediente (aggiunto/rimosso)
    } else if (
        isset($_POST["action"]) && $_POST["action"] === "modify" &&
        isset($_POST["act"], $_POST["idpersonalizzazione"], $_POST["idingrediente"])
    ) {
        $idPersonalizzazione = $_POST["idpersonalizzazione"];
        $idIngrediente = $_POST["idingrediente"];
        $azione = $_POST["act"];

        // Se esiste già una modifica registrata, la elimina per evitare duplicazioni
        if ($dbh->ingredientModificationExists($idPersonalizzazione, $idIngrediente)) {
            $dbh->deleteIngredientModification($idPersonalizzazione, $idIngrediente);
        }

        // Inserisce la nuova modifica nel DB
        $modifica = $dbh->addIngredientModification($idPersonalizzazione, $idIngrediente, $azione);
        $result = $modifica;

        // Caso 3: Richiesta per eliminare una modifica a un ingrediente
    } else if (isset($_POST["action"]) && $_POST["action"] === "deleteIngredient") {
        if (!isset($_POST["idpersonalizzazione"], $_POST["idingrediente"])) {
            throw new Exception("Parametri mancanti per eliminazione ingrediente.");
        }
        $dbh->deleteIngredientModification($_POST["idpersonalizzazione"], $_POST["idingrediente"]);
        $result = ["success" => true];

        // Caso 4: Richiesta per recuperare una personalizzazione esistente (senza ingredienti)
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
            $result = []; // Nessuna personalizzazione esistente
        }

        // Caso di default: parametri mancanti o azione non riconosciuta
    } else {
        $result = ["error" => "Azione non riconosciuta o parametri mancanti."];
    }
} catch (Exception $e) {
    // Gestione degli errori: restituisce un messaggio in formato JSON
    $result = ["error" => $e->getMessage()];
}

// Imposta l’header per rispondere con JSON
header("Content-Type: application/json");
echo json_encode($result);
