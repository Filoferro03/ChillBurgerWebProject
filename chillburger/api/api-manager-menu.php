<?php
require_once __DIR__.'/../bootstrap.php';

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);   // tutte le query che falliscono lanciano eccezione
ini_set('display_errors', 1);                                // SOLO in sviluppo

header('Content-Type: application/json');
session_start();      

// TODO: Verificare autenticazione e ruolo manager

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
          echo json_encode(['success'=>false,'error'=>'Server error']);
          error_log($e);
      }
      break;


    case 'POST':
    

      // la richiesta deve essere multipart/form-data
      if (strpos($_SERVER['CONTENT_TYPE'] ?? '', 'multipart/form-data') === false) {
          http_response_code(415);
          echo json_encode(['success'=>false,'error'=>'Unsupported Media Type']);
          exit;
      }

      // --- 2) validazione campi ----------------------------------------------
      $required = ['name','description','price','ingredients'];
      foreach ($required as $f) {
          if (!isset($_POST[$f]) || $_POST[$f]==='') {
              http_response_code(400);
              echo json_encode(['success'=>false,'error'=>"Campo '$f' mancante"]);
              exit;
          }
      }

      $nome        = trim($_POST['name']);
      $descrizione = trim($_POST['description']);
      $prezzo      = floatval($_POST['price']);
      $ingredienti = json_decode($_POST['ingredients'], true);   // array di ID
      $categoria   = isset($_POST['category']) ? intval($_POST['category']) : 1;

      // immagine obbligatoria
      if (!isset($_FILES['image']) || $_FILES['image']['error']!==UPLOAD_ERR_OK) {
          http_response_code(400);
          echo json_encode(['success'=>false,'error'=>'Upload immagine fallito']);
          exit;
      }

      // --- 3) salvataggio immagine -------------------------------------------
      $uploadDir = realpath(__DIR__.'/../resources/products');
      if (!$uploadDir) {
          $uploadDir = __DIR__.'/../resources/products';
          if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true)) {
              http_response_code(500);
              echo json_encode(['success'=>false,'error'=>'Impossibile creare cartella immagini']);
              exit;
          }
      }

      $allowed = ['jpg','jpeg','png','webp'];                // estensioni ammesse
      $ext     = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
      if (!in_array($ext, $allowed, true)) {
          http_response_code(400);
          echo json_encode(['success'=>false,'error'=>'Formato immagine non consentito']);
          exit;
      }

      $destPath = $uploadDir . DIRECTORY_SEPARATOR . uniqid('prod_').'.'.$ext;
      // DEBUG temporaneo — RIMUOVI in produzione TODO
      error_log('DBG upload tmp = '.$_FILES['image']['tmp_name']);
      error_log('DBG upload ext = '.$ext);
      error_log('DBG upload dir writable? '.(is_writable($uploadDir) ? 'YES' : 'NO'));
      error_log('DBG upload dir = '.$uploadDir);

      if (!@move_uploaded_file($_FILES['image']['tmp_name'], $destPath)) {
        $phpErr = error_get_last();
        error_log('UPLOAD-ERR detail: '.print_r($phpErr, true));
    
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error'   => 'Errore salvataggio immagine',
            'info'    => $phpErr['message'] ?? 'n/a'     // ← facoltativo: rimuovi in prod
        ]);
        exit;
    }  

      $imgPath = '/resources/products/' . basename($destPath);   // path da salvare nel DB


      // --- 4) inserimento DB --------------------------------------------------
      try {
          $dbh   = new DatabaseHelper(DB_SERVER,DB_USER,DB_PASS,DB_NAME,DB_PORT);
          $idprodotto = $dbh->insertProduct($nome,$descrizione,$prezzo,$imgPath,$categoria);
          if (!$idprodotto) throw new Exception('insertProduct failed');

          foreach ($ingredienti as $idIng) {
              $dbh->addProductComposition($idprodotto, intval($idIng));
          }

          echo json_encode([
              'success' => true,
              'product' => [
                  'idprodotto'  => $idprodotto,
                  'nome'        => $nome,
                  'descrizione' => $descrizione,
                  'prezzo'      => $prezzo,
                  'image'       => $imgPath,
                  'categoria'   => $categoria,
                  'ingredients' => $ingredienti
              ]
          ]);
        } catch (Throwable $e) {
          error_log('API-manager-menu ERROR: '.$e->getMessage());
          http_response_code(500);
          echo json_encode(['success'=>false,'error'=>'Server error', 'detail'=>$e->getMessage()]);
        }
      
          http_response_code(500);
          echo json_encode(['success'=>false,'error'=>'Server error']);
      }
      break;
    

    case 'PUT':
      // TODO: aggiornare prodotto esistente
      echo json_encode(['success' => true, 'message' => 'Prodotto aggiornato']);
      break;

    case 'DELETE':
      // TODO: eliminare prodotto
      echo json_encode(['success' => true, 'message' => 'Prodotto eliminato']);
      break;

    default:
      http_response_code(405);
      echo json_encode(['error' => 'Metodo non consentito']);
      break;
} catch (Throwable $e) {
  // così l’errore arriva al client **ed è loggato**
  error_log('MANAGER-MENU API FATAL: '.$e->getMessage());
  http_response_code(500);
  echo json_encode([
      'success' => false,
      'error'   => 'Fatal: '.$e->getMessage()
  ]);
}
?>
