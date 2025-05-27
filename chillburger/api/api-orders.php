<?php // api-orders.php

require_once '../bootstrap.php'; // Assicurati che il percorso sia corretto

$response = [];
error_log("api-orders.php - Azione richiesta: " . $_POST['action']);


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

    } else if (isset($_POST['action']) && $_POST['action'] == 'getActiveOrders') {
        // Verifica se l'utente è un manager
        if (!isUserAdmin()) {
            http_response_code(403); // Forbidden
            $response = ['success' => false, 'error' => 'Accesso non autorizzato'];
        } else {
            $page = isset($_POST['page']) ? (int)$_POST['page'] : 1; // Get page from POST
            $perPage = isset($_POST['perPage']) ? (int)$_POST['perPage'] : 5; // Get perPage from POST
            $activeOrders = $dbh->getActiveOrdersPaginated($page, $perPage);
            $response['success'] = true;
            $response['data'] = $activeOrders;
        }
    } else if (isset($_POST['action']) && $_POST['action'] == 'getOrderHistory') {
        // Verifica se l'utente è un manager
        if (!isUserAdmin()) {
            http_response_code(403); // Forbidden
            $response = ['success' => false, 'error' => 'Accesso non autorizzato'];
        } else {
            $page = isset($_POST['page']) ? (int)$_POST['page'] : 1; // Get page from POST
            $perPage = isset($_POST['perPage']) ? (int)$_POST['perPage'] : 5; // Get perPage from POST
            $orderHistory = $dbh->getOrderHistoryPaginated($page, $perPage);
            $response['success'] = true;
            $response['data'] = $orderHistory;
        }
    } else if (isset($_POST['action']) && $_POST['action'] == 'getDetails') {
        $idOrdine = null;
        if (isset($_GET['idordine'])) {
            $idOrdine = $_GET['idordine'];
        } else {
            $idOrdine = $_SESSION['idordine'];
        }
        $allOrders = $dbh->getOrderDetails($idOrdine);
        $response['success'] = true;
        $response['data'] = $allOrders;
        
    } else if(isset($_POST['action']) && $_POST['action'] == 'confirm') {
        $idordine = $_POST['idordine'];
        $result = $dbh->updateOrderStatus($idordine);
        if(!$result){
            http_response_code(500); // Internal Server Error
            $response = ['success' => false, 'error' => 'Errore durante la conferma dell\'ordine'];
        } else{
            $response['success'] = true;
        }
    } else if (isset($_POST['action']) && $_POST['action'] == 'payed') {
        $idordine = $_SESSION['idordine'];
        
        // Aggiorna la data e l'ora di consegna se sono state specificate
        if (isset($_POST['deliveryDate']) && isset($_POST['deliveryTime'])) {
            $deliveryDate = $_POST['deliveryDate'];
            $deliveryTime = $_POST['deliveryTime'];
        }
        $result = $dbh->updateStatusToPayed($idordine, $deliveryDate, $deliveryTime);
        if (!$result) {
            http_response_code(500); // Internal Server Error
            $response = ['success' => false, 'error' => 'Errore durante il pagamento dell\'ordine'];
        } else {
            $response['success'] = true;
        }
    } else if (isset($_POST['action']) && $_POST['action'] == 'getAvailableTimes') {
        // Restituisce gli orari disponibili per una data specifica
        $date = isset($_POST['date']) ? $_POST['date'] : date('Y-m-d');

        $availableTimes = $dbh->getAvailableTimeSlots($date);
        
        $response['success'] = true;
        $response['data'] = $availableTimes; 
    }
    
    else {
        http_response_code(400); // Bad Request
        $response = ['success' => false, 'error' => 'Azione non specificata o non valida'];
    }
}

// Imposta l'header e invia la risposta JSON
header('Content-Type: application/json');
echo json_encode($response);

?>