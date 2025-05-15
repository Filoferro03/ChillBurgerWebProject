<?php // api-orders.php

require_once '../bootstrap.php'; // Assicurati che il percorso sia corretto

$response = [];

if (!isUserLoggedIn() || !isset($_SESSION['idutente'])) {
    http_response_code(401); // Unauthorized
    $response = ['success' => false, 'error' => 'Utente non autenticato o sessione non valida'];
} else {
    $idutente = $_SESSION['idutente'];

    if (isset($_POST['action']) && $_POST['action'] == 'getByUser') {

        $page = isset($_POST['page']) ? (int)$_POST['page'] : 1;
        if ($page < 1) {
            $page = 1;
        }

        $paginatedData = $dbh->getUserOrdersByUserPaginated($idutente, $page);

        $response['success'] = true;
        $response['data'] = $paginatedData;

    } else if (isset($_POST['action']) && $_POST['action'] == 'getDetails') {
        $idOrdine = null;
        if (isset($_GET['idordine'])) {
            $idOrdine = $_GET['idordine'];
        }
        $allOrders = $dbh->getOrderDetails($idOrdine);
        $response['success'] = true;
        $response['data'] = $allOrders;
    } else if(isset($_POST['action']) && $_POST['action'] == 'confirm') {
        $idordine = $_POST['idordine'];
        $result = $dbh->updateStatusToConfirmed($idordine);
        if(!$result){
            http_response_code(500); // Internal Server Error
            $response = ['success' => false, 'error' => 'Errore durante la conferma dell\'ordine'];
        }else{
            $response['success'] = true;
        }
    } else {
        http_response_code(400); // Bad Request
        $response = ['success' => false, 'error' => 'Azione non specificata o non valida'];
    }
}

// Imposta l'header e invia la risposta JSON
header('Content-Type: application/json');
echo json_encode($response);

?>