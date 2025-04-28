<?php
require("../bootstrap.php");

$response = [];

$username = $_SESSION['username'];

    // Recupera i dati dell'utente dal database usando il nuovo metodo
    $userData = $dbh->getUserDataByUsername($username);

    if ($userData) {
        // Dati trovati
        $response['success'] = true;
        $response['userData'] = $userData;
    } else {
        // Errore: utente loggato ma dati non trovati nel DB (insolito ma gestito)
        http_response_code(404); // Not Found
        $response['success'] = false;
        $response['error'] = 'Dati utente non trovati';
    }

// Imposta l'header per la risposta JSON
header('Content-Type: application/json');

// Invia la risposta JSON
echo json_encode($response);

?>