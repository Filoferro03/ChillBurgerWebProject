<?php
require_once __DIR__ . '/../bootstrap.php';
header('Content-Type: application/json');

if ($method === 'GET' &&
    isset($_GET['action'], $_GET['idingrediente']) &&
    $_GET['action'] === 'getIngredient') {

    $id   = intval($_GET['idingrediente']);
    $data = $dbh->getIngredient($id);     // nuovo metodo nel DatabaseHelper

    if ($data) {
        // aggiunge il path della risorsa se manca
        if (!empty($data['image']) &&
            !str_starts_with($data['image'], RESOURCES_DIR)) {
            $data['image'] = RESOURCES_DIR . $uploadDirRel . $data['image'];
        }
        echo json_encode(['success'=>true,'data'=>$data]);
    } else {
        http_response_code(404);
        echo json_encode(['success'=>false,'error'=>'Ingrediente non trovato']);
    }
    exit;
}

/*----------------------------------------------------------------
 * 1.  Solo POST
 *---------------------------------------------------------------*/
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['success'=>false,'message'=>'Metodo non consentito']));
}

/*----------------------------------------------------------------
 * 2.  Validazione campi
 *---------------------------------------------------------------*/
$name  = trim($_POST['name']  ?? '');
$price = $_POST['price'] ?? '';
$stock = $_POST['availability'] ?? '999';

if ($name === '' || !is_numeric($price) || $price < 0) {
    http_response_code(400);
    exit(json_encode(['success'=>false,'message'=>'Nome e prezzo obbligatori']));
}

/*----------------------------------------------------------------
 * 3.  Upload immagine (opzionale)
 *---------------------------------------------------------------*/
$imageFilenameForDb = null;           // nel DB salvi solo il nome file

if (!is_dir(INGR_RES_ABS)) {
    mkdir(INGR_RES_ABS, 0755, true);  // crea cartella se manca
}

if (!empty($_FILES['image']['tmp_name'])) {

    $allowed = ['jpg','jpeg','png','webp'];
    $ext     = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));

    if (!in_array($ext, $allowed)) {
        http_response_code(415);
        echo json_encode(['success'=>false,'message'=>'Formato immagine non supportato']);
        exit;
    }

    $imageFilenameForDb = 'ing_' . uniqid() . '.' . $ext;
    $destPath           = INGR_RES_ABS . $imageFilenameForDb;

    // log utile in debug
    error_log('Tmp: '.$_FILES['image']['tmp_name'].' → '.$destPath);

    if (!move_uploaded_file($_FILES['image']['tmp_name'], $destPath)) {
        error_log('move_uploaded_file fallita – permessi? path?');
        http_response_code(500);
        echo json_encode(['success'=>false,'message'=>'Upload immagine fallito']);
        exit;
    }

/*----------------------------------------------------------------
 * 4.  Inserimento su tabella `ingredienti`
 *---------------------------------------------------------------*/
try {
    $newId = $dbh->insertIngredient($name, $price, $stock, $imageFilename);
    if (!$newId) throw new Exception('Inserimento non riuscito');

    echo json_encode(['success'=>true, 'idingrediente'=>$newId]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}
