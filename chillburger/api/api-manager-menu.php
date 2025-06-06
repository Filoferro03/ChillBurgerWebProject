<?php
require_once __DIR__ . '/../bootstrap.php'; //

// mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT); // Già presente
// ini_set('display_errors', 1); // Già presente, utile per debug

header('Content-Type: application/json'); //
// session_start(); // bootstrap.php già avvia la sessione

// Percorso di upload (assicurati che sia corretto e scrivibile)
$uploadDir = realpath(__DIR__ . '/../resources/products'); //
if (!$uploadDir) {
    $uploadDir = __DIR__ . '/../resources/products';
    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true)) {
        // Non inviare un errore JSON qui se la richiesta non è ancora stata processata
        // Questo controllo può essere fatto all'interno della logica POST/UPDATE se necessario
    }
}

try {
    $method = $_SERVER['REQUEST_METHOD'];

    // NUOVA SEZIONE: Gestione Richiesta GET per dettagli prodotto (per modale modifica)
    if ($method === 'GET' && isset($_GET['action']) && $_GET['action'] === 'getProduct' && isset($_GET['idprodotto'])) {
        $productId = intval($_GET['idprodotto']);
        $productData = $dbh->getProductWithComposition($productId); // METODO DA CREARE/ADATTARE in DatabaseHelper

        if ($productData) {
            // Assicura che il path dell'immagine sia corretto per il client
            if (isset($productData['image']) && !empty($productData['image']) && !str_starts_with($productData['image'], RESOURCES_DIR)) {
                 // RESOURCES_DIR è definita in bootstrap.php come "./resources/"
                $productData['image'] = RESOURCES_DIR . "products/" . $productData['image'];
            }
            echo json_encode(['success' => true, 'data' => $productData]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Prodotto non trovato']);
        }
        exit; // Termina lo script dopo aver gestito la richiesta GET
    }
    // FINE NUOVA SEZIONE GET

    switch ($method) {
        case 'POST':
            // MODIFICA: Gestione azione 'update' o 'add'
            $action = isset($_POST['action']) ? $_POST['action'] : 'add'; // Default ad 'add' se non specificato

            if ($action === 'update') {
                // --- LOGICA PER AGGIORNARE UN PRODOTTO ESISTENTE ---
                $idprodotto = isset($_POST['idprodotto']) ? intval($_POST['idprodotto']) : 0;
                $name = isset($_POST['name']) ? trim($_POST['name']) : null;
                $price = isset($_POST['price']) ? floatval($_POST['price']) : null;
                $idcategoria = isset($_POST['category']) ? intval($_POST['category']) : null;
                $ingredientsJson = isset($_POST['ingredients']) ? $_POST['ingredients'] : '[]';
                $ingredients = json_decode($ingredientsJson, true);
                $availability = isset($_POST['availability']) ? intval($_POST['availability']) : null;
                
                // Validate availability if provided
                if ($availability !== null && $availability < 0) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'La disponibilità deve essere un numero intero positivo o zero.']);
                    exit;
                }

                // Validazioni (simili a quelle dell'aggiunta)
                if (!$idprodotto) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'ID prodotto mancante per l\'aggiornamento.']);
                    exit;
                }
                if (!$name || $price === null || !$idcategoria) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Campi nome, prezzo o categoria mancanti per l\'aggiornamento.']);
                    exit;
                }
                if (json_last_error() !== JSON_ERROR_NONE || !is_array($ingredients)) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Formato ingredienti non valido per l\'aggiornamento.']);
                    exit;
                }

                $imageFilenameForDb = null;
                // Gestione upload immagine (solo se una nuova immagine è fornita)
                if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                    if (!$uploadDir || !is_dir($uploadDir) || !is_writable($uploadDir)) {
                         http_response_code(500);
                         echo json_encode(['success' => false, 'error' => 'Cartella immagini non accessibile o non scrivibile: ' . $uploadDir]);
                         exit;
                    }
                    $allowedExt = ['jpg', 'jpeg', 'png', 'webp'];
                    $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
                    if (!in_array($ext, $allowedExt, true)) {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'error' => 'Formato immagine non consentito per l\'aggiornamento.']);
                        exit;
                    }
                    $filename = uniqid('prod_update_') . '.' . $ext;
                    $destPath = $uploadDir . DIRECTORY_SEPARATOR . $filename;
                    if (!move_uploaded_file($_FILES['image']['tmp_name'], $destPath)) {
                        http_response_code(500);
                        echo json_encode(['success' => false, 'error' => 'Errore salvataggio nuova immagine per l\'aggiornamento.']);
                        exit;
                    }
                    $imageFilenameForDb = $filename;
                     // TODO: Potresti voler cancellare la vecchia immagine qui se l'upload della nuova ha successo
                }

                // Aggiornamento prodotto nel DB
                $updateSuccess = $dbh->updateProduct($idprodotto, $name, $price, $idcategoria, $imageFilenameForDb, $availability);

                if (!$updateSuccess) {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'error' => 'Errore durante l\'aggiornamento del prodotto nel database.']);
                    exit;
                }

                // Aggiorna composizione (cancella vecchie e aggiungi nuove)
                $dbh->deleteProductCompositions($idprodotto); // METODO DA CREARE in DatabaseHelper
                if ($idcategoria == $dbh->getPaniniCategoryId()) { // Assumendo che esista un metodo per ottenere l'ID della categoria panini
                    foreach ($ingredients as $idIng) {
                        $dbh->addProductComposition($idprodotto, intval($idIng));
                    }
                }
                
                $imageWebPath = $imageFilenameForDb ? (RESOURCES_DIR . 'products/' . $imageFilenameForDb) : null;
                // Se $imageFilenameForDb è null, potresti voler recuperare l'immagine esistente dal DB per la risposta
                if (!$imageWebPath) {
                    $existingProduct = $dbh->getProductWithComposition($idprodotto); // riutilizza per prendere path immagine
                    if ($existingProduct && isset($existingProduct['image'])) {
                        $imageWebPath = $existingProduct['image']; // questo dovrebbe già avere RESOURCES_DIR
                    }
                }


                echo json_encode([
                    'success' => true,
                    'message' => 'Prodotto aggiornato con successo!',
                    'product' => [ // Invia i dati aggiornati per un eventuale refresh lato client
                        'idprodotto'  => $idprodotto,
                        'nome'        => $name,
                        'prezzo'      => $price,
                        'image'       => $imageWebPath,
                        'idcategoria' => $idcategoria,
                        'ingredients' => $ingredients
                    ]
                ]);

            } elseif ($action === 'add') {
                // --- LOGICA ESISTENTE PER AGGIUNGERE UN NUOVO PRODOTTO ---
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
                
                // Aggiungi composizione solo se la categoria è "Panini" (o l'ID corrispondente)
                // Dovrai avere un modo per ottenere l'ID della categoria "Panini", es. da una costante o una query
                // Supponiamo che $dbh->getPaniniCategoryId() restituisca l'ID corretto.
                if ($idcategoria == $dbh->getPaniniCategoryId()) { // METODO DA CREARE/ADATTARE se non esiste
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

        case 'PUT': // Il JS è stato modificato per usare POST con action=update
                    // Quindi questo blocco PUT potrebbe non essere più necessario se si segue quella strada.
                    // Se si vuole mantenere un vero endpoint PUT, la logica di aggiornamento
                    // dovrebbe essere qui, e il JS dovrebbe inviare JSON raw con metodo PUT.
            http_response_code(405); // Method Not Allowed se non implementato qui
            echo json_encode([
                'success' => false,
                'error' => 'Metodo PUT non implementato direttamente, usare POST con action=update.'
            ]);
            break;

        case 'DELETE':
            // --- LOGICA PER ELIMINARE UN PRODOTTO ---
            if (isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['idprodotto'])) {
                $productId = intval($_GET['idprodotto']);

                // Opzionale: recuperare il nome del file immagine per cancellarlo dal server
                // $imageFilename = $dbh->getProductImageFilename($productId); // METODO DA CREARE in DatabaseHelper

                // 1. Cancella composizioni associate (se è un panino)
                $dbh->deleteProductCompositions($productId); // Assicurati che questo metodo esista

                // 2. Gestisci altre dipendenze (personalizzazioni, carrelli, notifiche)
                // Questo potrebbe essere complesso e richiedere ulteriori metodi nel DatabaseHelper
                // o l'uso di ON DELETE CASCADE nel DB (preferibile).
                // Per ora, ci concentriamo sulla cancellazione del prodotto e delle sue composizioni dirette.
                // Esempio:
                // $dbh->deleteProductFromCarts($productId);
                // $dbh->deleteProductPersonalizations($productId);
                // $dbh->deleteProductNotifications($productId);


                // 3. Cancella il prodotto
                $deleteSuccess = $dbh->deleteProduct($productId); // METODO DA CREARE in DatabaseHelper

                if ($deleteSuccess) {
                    // Opzionale: cancella il file immagine
                    // if ($imageFilename && file_exists($uploadDir . DIRECTORY_SEPARATOR . $imageFilename)) {
                    //     unlink($uploadDir . DIRECTORY_SEPARATOR . $imageFilename);
                    // }
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
            http_response_code(405); //
            echo json_encode(['success' => false, 'error' => 'Metodo non consentito']); //
            break;
    }
} catch (Throwable $e) { //
    error_log('API-manager-menu FATAL: ' . $e->getMessage() . " Trace: " . $e->getTraceAsString()); //
    http_response_code(500); //
    echo json_encode(['success' => false, 'error' => 'Errore interno del server. Controlla i log.']); //
}
?>