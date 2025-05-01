<?php // api-orders.php

require_once '../bootstrap.php'; // Assicurati che il percorso sia corretto

$response = [];

// 1. Verifica se l'utente è loggato e recupera l'ID utente
if (!isUserLoggedIn() || !isset($_SESSION['username'])) {
    http_response_code(401); // Unauthorized
    $response = ['success' => false, 'error' => 'Utente non autenticato o sessione non valida'];
} else {
    $username = $_SESSION['username'];

    // 2. Controlla l'azione (se usi ancora l'approccio con 'action')
    if (isset($_POST['action']) && $_POST['action'] == 'getByUser') {

        // 3. Ottieni il numero di pagina dalla richiesta POST (default a 1)
        $page = isset($_POST['page']) ? (int)$_POST['page'] : 1;
        if ($page < 1) {
            $page = 1;
        }

        // 4. Recupera gli ordini paginati usando il nuovo metodo
        // Il terzo argomento è il numero di ordini per pagina (es. 5)
        $paginatedData = $dbh->getUserOrdersByUserPaginated($username, $page);

        // 5. Prepara la risposta
        $response['success'] = true;
        // Includi tutti i dati restituiti dal metodo (orders, currentPage, totalPages)
        $response['data'] = $paginatedData;

    } else {
        http_response_code(400); // Bad Request
        $response = ['success' => false, 'error' => 'Azione non specificata o non valida'];
    }
}

// Imposta l'header e invia la risposta JSON
header('Content-Type: application/json');
echo json_encode($response);

?>