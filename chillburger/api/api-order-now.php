<?php
require("../bootstrap.php");
session_start();

//  TODO: implementa la logica per l'API order-now
// (Opzionale) controlla se utente loggato
//$userId = $_SESSION['idutente'] ?? 0;
//if (!$userId) { ... }

// Recupera prodotti visibili e disponibili
$stmt = $pdo->prepare("
    SELECT p.idprodotto, p.nome, p.prezzo, p.disponibilita, p.image, c.descrizione AS categoria
    FROM prodotti p
    JOIN categorie c ON p.idcategoria = c.idcategoria
    WHERE p.disponibilita > 0
    ORDER BY p.nome
");
$stmt->execute();
$prodotti = $stmt->fetchAll(PDO::FETCH_ASSOC);

header('Content-Type: application/json');
echo json_encode([
    'success' => true,
    'data' => $prodotti
]);
