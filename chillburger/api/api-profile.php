<?php
require("../bootstrap.php");

$response = [];

$username = $_SESSION['username'];

    $userData = $dbh->getUserDataByUsername($username);

    if ($userData) {
        $response['success'] = true;
        $response['userData'] = $userData;
    } else {
        http_response_code(404); 
        $response['success'] = false;
        $response['error'] = 'Dati utente non trovati';
    }

header('Content-Type: application/json');
echo json_encode($response);
?>