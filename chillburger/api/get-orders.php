<?php
require_once '../bootstrap.php';

// Ottieni il parametro page dalla richiesta GET, default a 1 se non specificato
$username = isset($_GET['username']) ? $_GET['username'] : '';

$orders = $dbh->getUserOrders($username);

header('Content-Type: application/json');
echo json_encode($orders);
?>