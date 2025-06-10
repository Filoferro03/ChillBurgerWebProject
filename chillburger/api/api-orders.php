<?php 

require_once '../bootstrap.php';

if (!defined('ID_STATO_ANNULLATO_PER_STOCK')) {
    define("ID_STATO_ANNULLATO_PER_STOCK", 6);
}
if (!defined('MYSQL_SIGNAL_USER_EXCEPTION_SQLSTATE')) {
    define("MYSQL_SIGNAL_USER_EXCEPTION_SQLSTATE", "45000"); 
}
if (!class_exists('StockUnavailableException')) {
    class StockUnavailableException extends Exception {}
}


$response = [];

if (isset($_POST['action']) && $_POST['action'] == 'getDetails') {
    $idOrdine = null;
    if (isset($_GET['idordine'])) {
        $idOrdine = $_GET['idordine'];
    } else {
        if (isset($_SESSION['idordine'])) {
             $idOrdine = $_SESSION['idordine'];
        }
    }

    if ($idOrdine === null) {
        $response = ['success' => false, 'error' => 'ID ordine non specificato o non trovato.'];
    } else {
        $orderDetails = $dbh->getOrderDetails($idOrdine); 
        $statusInfo = $dbh->getOrderCurrentStatusInfo($idOrdine); 
        if ($orderDetails !== null) { 
            $response['success'] = true;
            $response['data'] = $orderDetails; 
            $response['data']['statusInfo'] = $statusInfo; 
        } else {
            $response = ['success' => false, 'error' => 'Dettagli ordine non trovati per ID: ' . $idOrdine];
        }
    }
} elseif (!isUserLoggedIn() || !isset($_SESSION['idutente'])) {
    http_response_code(401); 
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
        if (!isUserAdmin()) {
            http_response_code(403); 
            $response = ['success' => false, 'error' => 'Accesso non autorizzato'];
        } else {
            $page = isset($_POST['page']) ? (int)$_POST['page'] : 1;
            $perPage = isset($_POST['perPage']) ? (int)$_POST['perPage'] : 5;
            $activeOrders = $dbh->getActiveOrdersPaginated($page, $perPage);
            $response['success'] = true;
            $response['data'] = $activeOrders;
        }
    } else if (isset($_POST['action']) && $_POST['action'] == 'getOrderHistory') {
        if (!isUserAdmin()) {
            http_response_code(403);
            $response = ['success' => false, 'error' => 'Accesso non autorizzato'];
        } else {
            $page = isset($_POST['page']) ? (int)$_POST['page'] : 1;
            $perPage = isset($_POST['perPage']) ? (int)$_POST['perPage'] : 5;
            $orderHistory = $dbh->getOrderHistoryPaginated($page, $perPage);
            $response['success'] = true;
            $response['data'] = $orderHistory;
        }
    } else if(isset($_POST['action']) && $_POST['action'] == 'update') {
        $idordine = $_POST['idordine'];

        try {
            $advanceSuccess = $dbh->advanceOrderStatus($idordine);

            if ($advanceSuccess) {
                $response['success'] = true;
                $latestStatusInfo = $dbh->getOrderCurrentStatusInfo($idordine);
                if ($latestStatusInfo) {
                    $response['message'] = 'Stato ordine aggiornato a: ' . $latestStatusInfo['descrizione'];
                    $response['new_status_id'] = $latestStatusInfo['idstato'];
                    $response['new_status_description'] = $latestStatusInfo['descrizione'];
                } else {
                    $response['message'] = 'Stato ordine aggiornato, ma impossibile recuperare i dettagli del nuovo stato.';
                }
            } else {
                $latestStatusInfo = $dbh->getOrderCurrentStatusInfo($idordine);
                if ($latestStatusInfo) {
                     $response['success'] = true; 
                     $response['message'] = 'Nessun avanzamento di stato valido o necessario. Stato attuale: ' . $latestStatusInfo['descrizione'];
                     $response['new_status_id'] = $latestStatusInfo['idstato'];
                     $response['new_status_description'] = $latestStatusInfo['descrizione'];
                } else {
                    http_response_code(500);
                    $response = ['success' => false, 'error' => 'Errore durante l\'avanzamento dello stato dell\'ordine. Impossibile recuperare lo stato attuale.'];
                }
            }

        } catch (StockUnavailableException $e) {
            error_log("StockUnavailableException per ordine $idordine: " . $e->getMessage());
            $annulResult = $dbh->setOrderStatus($idordine, ID_STATO_ANNULLATO_PER_STOCK);
            if ($annulResult) {
                $response['success'] = true; 
                $response['message'] = 'Ordine annullato automaticamente per insufficienza di stock.';
                $cancelledStatusInfo = $dbh->getStatusInfoById(ID_STATO_ANNULLATO_PER_STOCK);
                $response['new_status_id'] = ID_STATO_ANNULLATO_PER_STOCK;
                $response['new_status_description'] = $cancelledStatusInfo ? $cancelledStatusInfo['descrizione'] : 'Annullato per Stock';
            } else {
                http_response_code(500);
                $response = ['success' => false, 'error' => 'Stock insufficiente rilevato, ma fallito il tentativo di annullare l\'ordine. Contattare supporto.'];
            }
        } catch (mysqli_sql_exception $e) {
            http_response_code(500);
            error_log("mysqli_sql_exception in api-orders.php action 'update' per ordine $idordine: " . $e->getMessage() . " (Code: " . $e->getCode() . ", SQLSTATE: ". $e->getSqlState() .")");
            $response = ['success' => false, 'error' => 'Errore database: Impossibile aggiornare lo stato dell\'ordine. Dettagli: ' . $e->getMessage()];
        } catch (Exception $e) {
            http_response_code(500);
            error_log("Exception in api-orders.php action 'update' per ordine $idordine: " . $e->getMessage());
            $response = ['success' => false, 'error' => 'Errore applicativo: ' . $e->getMessage()];
        }

    } else if (isset($_POST['action']) && $_POST['action'] == 'payed') {
        $idordine = $_SESSION['idordine'];
        
        $deliveryDate = null;
        $deliveryTime = null;
        if (isset($_POST['deliveryDate']) && !empty($_POST['deliveryDate']) && isset($_POST['deliveryTime']) && !empty($_POST['deliveryTime'])) {
            $deliveryDate = $_POST['deliveryDate'];
            $deliveryTime = $_POST['deliveryTime'];
        } 
        $updateResult = $dbh->updateStatusToPayed($idordine, $deliveryDate, $deliveryTime); 
        if (!$updateResult) {
            http_response_code(500); 
            $response = ['success' => false, 'error' => 'Errore durante il pagamento dell\'ordine'];
        } else {
            $response['success'] = true;
        }
    } else if (isset($_POST['action']) && $_POST['action'] == 'getAvailableTimes') {
        $date = isset($_POST['date']) ? $_POST['date'] : date('Y-m-d');
        $availableTimes = $dbh->getAvailableTimeSlots($date);
        $response['success'] = true;
        $response['data'] = $availableTimes; 
    } else if (isset($_POST['action']) && $_POST['action'] == 'check_availability') {
    if (!isset($_SESSION['idordine'])) {
        $response = ['success' => false, 'error' => 'Nessun ordine attivo trovato nella sessione.'];
    } else {
        $idordine = $_SESSION['idordine'];
        $unavailable_items = $dbh->checkOrderAvailability($idordine);

        if (empty($unavailable_items)) {
            $response = ['success' => true];
        } else {
            $response = ['success' => false, 'unavailable_items' => $unavailable_items];
        }
    }
    } else {
        http_response_code(400); 
        $response = ['success' => false, 'error' => 'Azione non specificata o non valida'];
    }
}

header('Content-Type: application/json');
echo json_encode($response);

?>