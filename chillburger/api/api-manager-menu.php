<?php
require_once __DIR__ . '/../bootstrap.php'; //

header('Content-Type: application/json'); //

// Percorso di upload (assicurati che sia corretto e scrivibile)
$uploadDir = realpath(__DIR__ . '/../resources/products'); //
if (!$uploadDir) {
    $uploadDir = __DIR__ . '/../resources/products';
    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true)) {
        // Error handled within POST logic
    }
}

try {
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getProduct' && isset($_GET['idprodotto'])) {
        $productId = intval($_GET['idprodotto']);
        $productData = $dbh->getProductWithComposition($productId);

        if ($productData) {
            if (isset($productData['image']) && !empty($productData['image']) && !str_starts_with($productData['image'], RESOURCES_DIR)) {
                $productData['image'] = RESOURCES_DIR . "products/" . $productData['image'];
            }
            echo json_encode(['success' => true, 'data' => $productData]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Prodotto non trovato']);
        }
        exit;
    }

    switch ($method) {
        case 'POST':
            $action = isset($_POST['action']) ? $_POST['action'] : 'add';

            if ($action === 'update') {
                $idprodotto = isset($_POST['idprodotto']) ? intval($_POST['idprodotto']) : 0;
                $name = isset($_POST['name']) ? trim($_POST['name']) : null;
                $price = isset($_POST['price']) ? floatval($_POST['price']) : null;
                $idcategoria = isset($_POST['category']) ? intval($_POST['category']) : null;
                $ingredientsJson = isset($_POST['ingredients']) ? $_POST['ingredients'] : '[]';
                $ingredients = json_decode($ingredientsJson, true);
                $availability = isset($_POST['availability']) ? intval($_POST['availability']) : null;

                if (!$idprodotto || !$name || $price === null || !$idcategoria) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Campi obbligatori mancanti per l\'aggiornamento.']);
                    exit;
                }
                
                $imageFilenameForDb = null;
                $oldImageFilename = null;
                
                if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                    $oldImageFilename = $dbh->getProductImageFilename($idprodotto);

                    if (!$uploadDir || !is_dir($uploadDir) || !is_writable($uploadDir)) {
                         http_response_code(500);
                         echo json_encode(['success' => false, 'error' => 'Cartella immagini non accessibile o non scrivibile: ' . $uploadDir]);
                         exit;
                    }
                    $allowedExt = ['jpg', 'jpeg', 'png', 'webp'];
                    $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
                    if (!in_array($ext, $allowedExt, true)) {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'error' => 'Formato immagine non consentito.']);
                        exit;
                    }
                    $filename = uniqid('prod_update_') . '.' . $ext;
                    $destPath = $uploadDir . DIRECTORY_SEPARATOR . $filename;
                    if (!move_uploaded_file($_FILES['image']['tmp_name'], $destPath)) {
                        http_response_code(500);
                        echo json_encode(['success' => false, 'error' => 'Errore nel salvataggio della nuova immagine.']);
                        exit;
                    }
                    $imageFilenameForDb = $filename;
                }

                $updateSuccess = $dbh->updateProduct($idprodotto, $name, $price, $idcategoria, $imageFilenameForDb, $availability);

                if (!$updateSuccess) {
                    if ($imageFilenameForDb && file_exists($destPath)) {
                        unlink($destPath);
                    }
                    http_response_code(500);
                    echo json_encode(['success' => false, 'error' => 'Errore durante l\'aggiornamento del prodotto nel database.']);
                    exit;
                }

                if ($updateSuccess && $imageFilenameForDb && $oldImageFilename) {
                    $oldImagePath = $uploadDir . DIRECTORY_SEPARATOR . $oldImageFilename;
                    if (file_exists($oldImagePath)) {
                        @unlink($oldImagePath);
                    }
                }

                $dbh->deleteProductCompositions($idprodotto);
                if ($idcategoria == $dbh->getPaniniCategoryId()) {
                    foreach ($ingredients as $idIng) {
                        $dbh->addProductComposition($idprodotto, intval($idIng));
                    }
                }

                echo json_encode([
                    'success' => true,
                    'message' => 'Prodotto aggiornato con successo!',
                ]);

            } elseif ($action === 'add') {
                 // La logica per 'add' rimane invariata
                if (strpos($_SERVER['CONTENT_TYPE'] ?? '', 'multipart/form-data') === false) { //
                    http_response_code(415); //
                    echo json_encode(['success' => false, 'error' => 'Unsupported Media Type']); //
                    exit; //
                }

                $requiredPost = ['name', 'price', 'category', 'ingredients']; //
                foreach ($requiredPost as $field) { //
                    if (empty($_POST[$field])) { //
                        http_response_code(400); //
                        echo json_encode(['success' => false, 'error' => "Campo '$field' mancante"]); //
                        exit; //
                    }
                }
                if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) { //
                    http_response_code(400); //
                    echo json_encode(['success' => false, 'error' => 'Immagine mancante o upload fallito']); //
                    exit; //
                }
                
                if (!$uploadDir || !is_dir($uploadDir) || !is_writable($uploadDir)) {
                     http_response_code(500);
                     echo json_encode(['success' => false, 'error' => 'Cartella immagini non accessibile o non scrivibile per aggiunta: ' . $uploadDir]);
                     exit;
                }


                $name = trim($_POST['name']); //
                $price = floatval($_POST['price']); //
                $ingredients = json_decode($_POST['ingredients'], true); //
                $idcategoria = intval($_POST['category']); //
                $availability = isset($_POST['availability']) ? intval($_POST['availability']) : null;
                
                // Validate availability if provided
                if ($availability !== null && $availability < 0) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'La disponibilità deve essere un numero intero positivo o zero.']);
                    exit;
                }

                if ($idcategoria <= 0) { //
                    http_response_code(400); //
                    echo json_encode(['success' => false, 'error' => 'Categoria non valida selezionata.']); //
                    exit; //
                }
                if (json_last_error() !== JSON_ERROR_NONE || !is_array($ingredients)) { //
                    http_response_code(400); //
                    echo json_encode(['success' => false, 'error' => 'Formato ingredienti non valido.']); //
                    exit; //
                }

                $allowedExt = ['jpg', 'jpeg', 'png', 'webp']; //
                $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION)); //
                if (!in_array($ext, $allowedExt, true)) { //
                    http_response_code(400); //
                    echo json_encode(['success' => false, 'error' => 'Formato immagine non consentito']); //
                    exit; //
                }

                $filename = uniqid('prod_') . '.' . $ext; //
                $destPath = $uploadDir . DIRECTORY_SEPARATOR . $filename; //

                if (!move_uploaded_file($_FILES['image']['tmp_name'], $destPath)) { //
                    http_response_code(500); //
                    error_log('API-manager-menu UPLOAD-ERR: ' . print_r(error_get_last(), true) . " Dest: " . $destPath); //
                    echo json_encode(['success' => false, 'error' => 'Errore salvataggio immagine']); //
                    exit; //
                }

                $imageFilenameForDb = $filename; //
                // RESOURCES_DIR è definita in bootstrap.php come "./resources/"
                $imageWebPath = RESOURCES_DIR . 'products/' . $filename; //


                // Per i panini, la disponibilità è sempre 999 (gestita tramite ingredienti)
                // Per altri prodotti, usa il valore fornito o 1 come default
                $finalAvailability = null;
                if ($idcategoria == $dbh->getPaniniCategoryId()) {
                    $finalAvailability = 999; // Panini sempre 999
                } else {
                    $finalAvailability = $availability !== null ? $availability : 1; // Default disponibile
                }
                
                $productId = $dbh->insertProduct($name, $price, $imageFilenameForDb, $idcategoria, $finalAvailability); //

                if (!$productId) { //
                    error_log('API-manager-menu ERROR: dbh->insertProduct ha restituito un ID non valido.'); //
                    throw new Exception('Errore durante l\'inserimento del prodotto nel database.'); //
                }
                
                if ($idcategoria == $dbh->getPaniniCategoryId()) { 
                    foreach ($ingredients as $idIng) { //
                        $dbh->addProductComposition($productId, intval($idIng)); //
                    }
                }

                echo json_encode([ //
                    'success' => true, //
                    'product' => [ //
                        'idprodotto'  => $productId, //
                        'nome'        => $name, //
                        'prezzo'      => $price, //
                        'image'       => $imageWebPath, //
                        'idcategoria' => $idcategoria, //
                        'ingredients' => $ingredients //
                    ]
                ]);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Azione POST non valida.']);
            }
            break;

        case 'DELETE':
            if (isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['idprodotto'])) {
                $productId = intval($_GET['idprodotto']);

                $imageFilename = $dbh->getProductImageFilename($productId); 

                $deleteSuccess = $dbh->deleteProduct($productId);

                if ($deleteSuccess) {
                    if ($imageFilename && file_exists($uploadDir . DIRECTORY_SEPARATOR . $imageFilename)) {
                         unlink($uploadDir . DIRECTORY_SEPARATOR . $imageFilename);
                    }
                    echo json_encode(['success' => true, 'message' => 'Prodotto eliminato con successo']);
                } else {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'error' => 'Errore durante l\'eliminazione del prodotto nel database.']);
                }
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Parametri mancanti o azione non valida per DELETE. Richiesti: action=delete, idprodotto.']);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Metodo non consentito']);
            break;
    }
} catch (Throwable $e) {
    error_log('API-manager-menu FATAL: ' . $e->getMessage() . " Trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Errore interno del server. Controlla i log.']);
}
?>