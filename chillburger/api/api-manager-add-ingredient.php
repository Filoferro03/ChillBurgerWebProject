<?php
/**
 * api/api-manager-add-ingredient.php
 *
 *  – GET  action=getIngredient&idingrediente=ID → dettaglio ingrediente
 *  – POST (form “nuovo ingrediente”)           → inserimento ingrediente
 */

require_once __DIR__ . '/../bootstrap.php';

/* -----------------------------------------------------------
 *  Output JSON + handler fatal error / exception
 * --------------------------------------------------------- */
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

/* -----------------------------------------------------------
 *  Percorsi: file-system (assoluto) e URL pubblico
 * --------------------------------------------------------- */
$uploadDirAbs = realpath(__DIR__ . '/../resources/ingredients');
if (!$uploadDirAbs) {                                    // se la cartella non esiste
    $uploadDirAbs = __DIR__ . '/../resources/ingredients';
    if (!is_dir($uploadDirAbs) && !mkdir($uploadDirAbs, 0775, true)) {
        throw new RuntimeException('Impossibile creare cartella upload: ' . $uploadDirAbs);
    }
}
$uploadDirRel = '/resources/ingredients/';               // URL da usare nel browser

/* =========================================================
 *  GET → dettaglio singolo ingrediente
 * --------------------------------------------------------- */
if ($_SERVER['REQUEST_METHOD'] === 'GET'
    && ($_GET['action'] ?? '') === 'getIngredient'
    && isset($_GET['idingrediente'])) {

    $id   = (int) $_GET['idingrediente'];
    $data = $dbh->getIngredient($id);                    // tuo metodo nel DB helper

    if ($data) {
        if (!empty($data['image']) && !str_starts_with($data['image'], $uploadDirRel)) {
            $data['image'] = $uploadDirRel . $data['image'];    // completa l’URL
        }
        echo json_encode(['success' => true, 'data' => $data]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Ingrediente non trovato']);
    }
    exit;
}

/* =========================================================
 *  Solo POST da qui in poi
 * --------------------------------------------------------- */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['success' => false, 'message' => 'Metodo non consentito']));
}

/* ---------------------------------------------------------
 *  Validazione campi
 * --------------------------------------------------------- */
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

/* ---------------------------------------------------------
 *  Upload immagine (opzionale)
 * --------------------------------------------------------- */
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

/* ---------------------------------------------------------
 *  Inserimento nel DB
 * --------------------------------------------------------- */
$newId = $dbh->insertIngredient(
    $name,
    (float) $price,
    (int)   $stock,
    $imageFilenameForDb          // può valere null se l’immagine non viene caricata
);

if (!$newId) {
    throw new RuntimeException('Inserimento non riuscito');
}

echo json_encode(['success' => true, 'idingrediente' => $newId]);
