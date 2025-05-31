<?php
/**
 * api-manager-menu.php
 * Endpoint semplificato per la gestione CRUD dei prodotti del menu.
 * Sostituire gli array/fetch con query reali al database.
 */

require_once __DIR__.'/../bootstrap.php';
header('Content-Type: application/json');

// TODO: Verificare autenticazione e ruolo manager

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
  case 'GET':
    // TODO: recuperare prodotti dal database
    echo json_encode([]);
    break;

  case 'POST':
    // TODO: validare input e inserire nuovo prodotto
    echo json_encode(['success' => true, 'message' => 'Prodotto creato']);
    break;

  case 'PUT':
    // TODO: aggiornare prodotto esistente
    echo json_encode(['success' => true, 'message' => 'Prodotto aggiornato']);
    break;

  case 'DELETE':
    // TODO: eliminare prodotto
    echo json_encode(['success' => true, 'message' => 'Prodotto eliminato']);
    break;

  default:
    http_response_code(405);
    echo json_encode(['error' => 'Metodo non consentito']);
    break;
}
?>
