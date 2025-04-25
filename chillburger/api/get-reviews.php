<?php
require_once '../bootstrap.php';

// Ottieni il parametro page dalla richiesta GET, default a 1 se non specificato
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;

// Assicurati che page sia almeno 1
if ($page < 1) {
    $page = 1;
}

$reviews = $dbh->getReviews($page);

header('Content-Type: application/json');
echo json_encode($reviews);
?>