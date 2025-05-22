<?php
require_once __DIR__ . '../bootstrap.php';
session_start();

$managerId = $_SESSION['idutente'] ?? 0;
if (!$managerId) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Non autenticato']);
    exit;
}

// Recupera prodotti in stock (>0)
$stmtInStock = $pdo->query("
    SELECT idprodotto, nome, prezzo, disponibilita, image
    FROM prodotti
    WHERE disponibilita > 0
    ORDER BY nome
");
$prodottiInStock = $stmtInStock->fetchAll(PDO::FETCH_ASSOC);

// Recupera prodotti out of stock (=0)
$stmtOutStock = $pdo->query("
    SELECT idprodotto, nome, prezzo, disponibilita, image
    FROM prodotti
    WHERE disponibilita = 0
    ORDER BY nome
");
$prodottiOutStock = $stmtOutStock->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    'success' => true,
    'inStock' => $prodottiInStock,
    'outStock' => $prodottiOutStock
]);
