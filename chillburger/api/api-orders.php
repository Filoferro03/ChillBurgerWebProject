<?php // api-orders.php

require_once '../bootstrap.php';

// Definisci queste costanti se non sono in bootstrap.php
if (!defined('ID_STATO_ANNULLATO_PER_STOCK')) {
    define("ID_STATO_ANNULLATO_PER_STOCK", 6); // Assicurati che questo ID esista e sia corretto nel tuo DB
}
if (!defined('MYSQL_SIGNAL_USER_EXCEPTION_SQLSTATE')) {
    define("MYSQL_SIGNAL_USER_EXCEPTION_SQLSTATE", "45000"); // SQLSTATE standard per SIGNAL
}
// Includi la definizione di StockUnavailableException se non è autocaricata o definita in DatabaseHelper.php prima della classe
if (!class_exists('StockUnavailableException')) { // Evita ridefinizioni se inclusa altrove
    class StockUnavailableException extends Exception {}
}


$response = [];
// error_log("api-orders.php - Azione richiesta: " . ($_POST['action'] ?? 'N/D'));

if (isset($_POST['action']) && $_POST['action'] == 'getDetails') {
    $idOrdine = null;
    if (isset($_GET['idordine'])) {
        $idOrdine = $_GET['idordine'];
    } else {
        // Se idordine non è in GET, potresti voler verificare se è in POST o sessione
        // Per ora, se non è in GET, potrebbe dare errore o usare un default come $_SESSION['idordine']
        // $idOrdine = $_SESSION['idordine'] ?? null; // Esempio se si volesse usare la sessione come fallback
        // Se $idOrdine rimane null qui, $dbh->getOrderDetails($idOrdine) fallirà o restituirà dati imprevisti.
        // È importante che $idOrdine sia valorizzato correttamente.
        // L'originale usava $_SESSION['idordine'] come fallback.
        if (isset($_SESSION['idordine'])) {
             $idOrdine = $_SESSION['idordine'];
        }
    }

    if ($idOrdine === null) {
        $response = ['success' => false, 'error' => 'ID ordine non specificato o non trovato.'];
    } else {
        $allOrders = $dbh->getOrderDetails($idOrdine);
        if ($allOrders !== null) { // Controlla se getOrderDetails ha restituito qualcosa
            $response['success'] = true;
            $response['data'] = $allOrders;
        } else {
            $response = ['success' => false, 'error' => 'Dettagli ordine non trovati per ID: ' . $idOrdine];
        }
    }
} elseif (!isUserLoggedIn() || !isset($_SESSION['idutente'])) {
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
        if (!isUserAdmin()) {
            http_response_code(403); // Forbidden
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
            http_response_code(403); // Forbidden
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
                    // Questo caso non dovrebbe accadere se l'ordine esiste e advanceOrderStatus è andato a buon fine
                    $response['message'] = 'Stato ordine aggiornato, ma impossibile recuperare i dettagli del nuovo stato.';
                }
            } else {
                // advanceOrderStatus ha restituito false (es. stato già finale, o prossimo stato non valido)
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
                $response['success'] = true; // L'operazione complessiva (tentativo + annullamento) è considerata un successo gestito
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
        } else {
            // Se data e ora non sono fornite, potresti voler impostare dei default o gestire l'errore
            // Per ora, se non fornite, $dbh->updateStatusToPayed riceverà null e potrebbe non aggiornare data/ora.
            // Assicurati che $dbh->updateStatusToPayed gestisca correttamente i valori null per data/ora.
        }
        $updateResult = $dbh->updateStatusToPayed($idordine, $deliveryDate, $deliveryTime); // $result è già usato
        if (!$updateResult) {
            http_response_code(500); // Internal Server Error
            $response = ['success' => false, 'error' => 'Errore durante il pagamento dell\'ordine'];
        } else {
            $response['success'] = true;
        }
    } else if (isset($_POST['action']) && $_POST['action'] == 'getAvailableTimes') {
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

header('Content-Type: application/json');
echo json_encode($response);

?>