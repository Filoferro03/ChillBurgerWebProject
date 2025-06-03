<?php
require_once __DIR__ . '/../bootstrap.php';

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
ini_set('display_errors', 1);

header('Content-Type: application/json');
session_start();

// TODO: Verificare autenticazione e ruolo manager
// TODO: Rimuovere i log di debug in produzione

try {
    $method = $_SERVER['REQUEST_METHOD'];

    switch ($method) {
        case 'GET':
            try {
                $dbh = new DatabaseHelper(DB_SERVER, DB_USER, DB_PASS, DB_NAME, DB_PORT);
                $products = $dbh->getAllProductsWithIngredients();

                echo json_encode([
                    'success'  => true,
                    'products' => $products
                ]);
            } catch (Throwable $e) {
                http_response_code(500);
                error_log($e);
                echo json_encode([
                    'success' => false,
                    'error'   => 'Server error'
                ]);
            }
            break;

        case 'POST':
            // La richiesta deve essere multipart/form-data
            if (strpos($_SERVER['CONTENT_TYPE'] ?? '', 'multipart/form-data') === false) {
                http_response_code(415);
                echo json_encode([
                    'success' => false,
                    'error'   => 'Unsupported Media Type'
                ]);
                exit;
            }

            // Validazione campi obbligatori
            $required = ['name', 'description', 'price', 'ingredients'];
            foreach ($required as $field) {
                if (empty($_POST[$field])) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error'   => "Campo '$field' mancante"
                    ]);
                    exit;
                }
            }

            $name        = trim($_POST['name']);
            $description = trim($_POST['description']);
            $price       = floatval($_POST['price']);
            $ingredients = json_decode($_POST['ingredients'], true); // array di ID
            $category    = isset($_POST['category']) ? intval($_POST['category']) : 1;

            // Immagine obbligatoria
            if (
                !isset($_FILES['image']) ||
                $_FILES['image']['error'] !== UPLOAD_ERR_OK
            ) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error'   => 'Upload immagine fallito'
                ]);
                exit;
            }

            // Salvataggio immagine
            $uploadDir = realpath(__DIR__ . '/../resources/products');
            if (!$uploadDir) {
                $uploadDir = __DIR__ . '/../resources/products';
                if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true)) {
                    http_response_code(500);
                    echo json_encode([
                        'success' => false,
                        'error'   => 'Impossibile creare cartella immagini'
                    ]);
                    exit;
                }
            }

            $allowedExt = ['jpg', 'jpeg', 'png', 'webp'];
            $ext        = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
            if (!in_array($ext, $allowedExt, true)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error'   => 'Formato immagine non consentito'
                ]);
                exit;
            }

            $filename = uniqid('prod_') . '.' . $ext;
            $destPath = $uploadDir . DIRECTORY_SEPARATOR . $filename;
            if (!move_uploaded_file($_FILES['image']['tmp_name'], $destPath)) {
                $phpErr = error_get_last();
                http_response_code(500);
                error_log('UPLOAD-ERR: ' . print_r($phpErr, true));
                echo json_encode([
                    'success' => false,
                    'error'   => 'Errore salvataggio immagine'
                ]);
                exit;
            }

            $imgPath = '/resources/products/' . $filename;

            // Inserimento prodotto nel DB
            try {
                $dbh        = new DatabaseHelper(DB_SERVER, DB_USER, DB_PASS, DB_NAME, DB_PORT);
                $productId  = $dbh->insertProduct($name, $description, $price, $imgPath, $category);
                if (!$productId) {
                    throw new Exception('insertProduct returned false');
                }

                foreach ($ingredients as $idIng) {
                    $dbh->addProductComposition($productId, intval($idIng));
                }

                echo json_encode([
                    'success' => true,
                    'product' => [
                        'idprodotto'  => $productId,
                        'nome'        => $name,
                        'descrizione' => $description,
                        'prezzo'      => $price,
                        'image'       => $imgPath,
                        'categoria'   => $category,
                        'ingredients' => $ingredients
                    ]
                ]);
            } catch (Throwable $e) {
                error_log('API-manager-menu ERROR: ' . $e->getMessage());
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'error'   => 'Server error'
                ]);
            }

            break;

        case 'PUT':
            // TODO: aggiornare prodotto esistente
            echo json_encode([
                'success' => true,
                'message' => 'Prodotto aggiornato'
            ]);
            break;

        case 'DELETE':
            // TODO: eliminare prodotto
            echo json_encode([
                'success' => true,
                'message' => 'Prodotto eliminato'
            ]);
            break;

        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'error'   => 'Metodo non consentito'
            ]);
            break;
    }
} catch (Throwable $e) {
    error_log('MANAGER-MENU API FATAL: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Fatal: ' . $e->getMessage()
    ]);
}
