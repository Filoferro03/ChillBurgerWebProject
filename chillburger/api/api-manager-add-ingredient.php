<?php
// ChillBurger – API: inserimento di un nuovo ingrediente
header('Content-Type: application/json');
session_start();

require_once __DIR__ . '/../bootstrap.php';      // apre la sessione DB + autoload
require_once __DIR__ . '/../utils/functions.php';// se usi funzioni comuni
$dbh = new DatabaseHelper($servername,$username,$password,$dbname,$port);

// Solo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success'=>false, 'message'=>'Metodo non consentito']);
    exit;
}

// === Validazione campi ===
$name   = trim($_POST['name']   ?? '');
$price  = floatval($_POST['price'] ?? -1);
$stock  = isset($_POST['availability']) ? intval($_POST['availability']) : 999; // default “illimitato”

if ($name === '' || $price < 0) {
    http_response_code(400);
    echo json_encode(['success'=>false,'message'=>'Nome e prezzo sono obbligatori']);
    exit;
}

// === Upload immagine ===
$imageFilenameForDb = null;
$uploadDir = __DIR__ . '/../resources/ingredients/';
if (!is_dir($uploadDir)) { mkdir($uploadDir, 0755, true); }

if (!empty($_FILES['image']['tmp_name'])) {
    $allowed = ['jpg','jpeg','png','webp'];
    $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowed)) {
        http_response_code(415);
        echo json_encode(['success'=>false,'message'=>'Formato immagine non supportato']);
        exit;
    }

    $imageFilenameForDb = 'ing_' . uniqid() . '.' . $ext;
    $destPath = $uploadDir . $imageFilenameForDb;
    if (!move_uploaded_file($_FILES['image']['tmp_name'], $destPath)) {
        http_response_code(500);
        echo json_encode(['success'=>false,'message'=>'Upload immagine fallito']);
        exit;
    }
}

// === Inserimento DB ===
try {
    // nuovo metodo nel DatabaseHelper (vedi sotto)  
    $id = $dbh->insertIngredient($name, $price, $stock, $imageFilenameForDb);

    if ($id) {
        echo json_encode(['success'=>true, 'id'=>$id]);
    } else {
        throw new Exception('Inserimento non riuscito');
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success'=>false, 'message'=>$e->getMessage()]);
}
