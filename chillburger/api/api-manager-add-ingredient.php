<?php
require_once __DIR__ . '/../bootstrap.php';

header('Content-Type: application/json; charset=utf-8');

set_error_handler(function ($severity, $message, $file, $line) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => "PHP error: $message in $file:$line"
    ]);
    exit;
});
set_exception_handler(function (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
    exit;
});

$uploadDirAbs = realpath(__DIR__ . '/../resources/ingredients');
if (!$uploadDirAbs) {                                    
    $uploadDirAbs = __DIR__ . '/../resources/ingredients';
    if (!is_dir($uploadDirAbs) && !mkdir($uploadDirAbs, 0775, true)) {
        throw new RuntimeException('Impossibile creare cartella upload: ' . $uploadDirAbs);
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'GET'
    && ($_GET['action'] ?? '') === 'getIngredient'
    && isset($_GET['idingrediente'])) {

    $id   = (int) $_GET['idingrediente'];
    $data = $dbh->getIngredient($id);

    if ($data) {
        if (!empty($data['image']) && !str_starts_with($data['image'], RESOURCES_DIR)) {
            $data['image'] = RESOURCES_DIR . "ingredients/" . $data['image'];
        }
        echo json_encode(['success' => true, 'data' => $data]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Ingrediente non trovato']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['success' => false, 'message' => 'Metodo non consentito']));
}

$name  = trim($_POST['name'] ?? '');
$price = $_POST['price'] ?? '';
$stock = $_POST['availability'] ?? '999';

if ($name === '' || !is_numeric($price) || $price < 0) {
    http_response_code(400);
    exit(json_encode([
        'success' => false,
        'message' => 'Nome e prezzo obbligatori e validi'
    ]));
}

$imageFilenameForDb = null;

if (!empty($_FILES['image']['tmp_name'])) {

    $allowed = ['jpg', 'jpeg', 'png', 'webp'];
    $ext     = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));

    if (!in_array($ext, $allowed, true)) {
        http_response_code(415);
        exit(json_encode(['success' => false, 'message' => 'Formato immagine non supportato']));
    }

    $imageFilenameForDb = 'ing_' . uniqid('', true) . '.' . $ext;
    $destPath = rtrim($uploadDirAbs, '/\\') . DIRECTORY_SEPARATOR . $imageFilenameForDb;

    if (!move_uploaded_file($_FILES['image']['tmp_name'], $destPath)) {
        throw new RuntimeException('Upload immagine fallito: permessi o path errato');
    }
}

$newId = $dbh->insertIngredient(
    $name,
    (float) $price,
    (int)   $stock,
    $imageFilenameForDb
);

if (!$newId) {
    throw new RuntimeException('Inserimento non riuscito');
}

echo json_encode(['success' => true, 'idingrediente' => $newId]);