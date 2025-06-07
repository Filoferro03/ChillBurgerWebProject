<?php
if (!class_exists('StockUnavailableException')) {
    class StockUnavailableException extends Exception {}
}

class DatabaseHelper
{
    private $db;

    public function __construct($servername, $username, $password, $dbname, $port)
    {
        $this->db = new mysqli($servername, $username, $password, $dbname, $port);
        if ($this->db->connect_error) {
            die("Connessione al db falllita");
        }
    }

    public function checkLogin($username, $password)
    {
        $query = "SELECT username, nome, cognome, tipo, idutente FROM utenti WHERE username = ? AND password = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param('ss', $username, $password);
        $stmt->execute();
        $result = $stmt->get_result();
        $data = $result->fetch_all(MYSQLI_ASSOC);
        $result->free();
        $stmt->close();
        return $data;
    }

    public function registerUser($username, $password, $name, $surname, $type)
    {
        $query = "INSERT INTO utenti (nome, cognome, username, password, tipo) VALUES (?, ?, ?, ?, ?)";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param('sssss', $name, $surname, $username, $password, $type);

        try {
            $success = $stmt->execute();
            $affectedRows = $stmt->affected_rows;
            $stmt->close();

            // Verifica che l'esecuzione sia andata a buon fine e che almeno una riga sia stata inserita
            return $success && $affectedRows > 0;
        } catch (mysqli_sql_exception $e) {
            return false;
        }
    }

    public function getReviews($page, $perPage = 5)
    {
        // Calcola l'offset per la paginazione
        $offset = ($page - 1) * $perPage;

        // Prima ottieni il conteggio totale delle recensioni
        $countQuery = "SELECT COUNT(*) AS totalReviews FROM chillburgerdb.recensioni";
        $countStmt = $this->db->prepare($countQuery);
        $countStmt->execute();
        $countResult = $countStmt->get_result();
        $totalReviews = $countResult->fetch_assoc()['totalReviews'];
        $countResult->free();
        $countStmt->close();

        // Poi ottieni le recensioni paginate
        $query = "SELECT r.titolo, r.voto, r.commento, r.timestamp_recensione, o.idordine, u.nome, u.cognome
                  FROM recensioni r 
                  JOIN ordini o ON o.idordine = r.idordine
                  JOIN utenti u ON u.idutente = o.idutente 
                  ORDER BY timestamp_recensione DESC
                  LIMIT ? OFFSET ?";

        $stmt = $this->db->prepare($query);
        $stmt->bind_param('ii', $perPage, $offset);
        $stmt->execute();

        $result = $stmt->get_result();
        $reviews = $result->fetch_all(MYSQLI_ASSOC);

        $result->free();
        $stmt->close();

        // Restituisci i dati con le informazioni di paginazione
        return [
            'reviews' => $reviews,
            'currentPage' => $page,
            'totalPages' => ceil($totalReviews / $perPage)
        ];
    }

    /**
     * Recupera i dati di un utente specifico dal suo username, escludendo la password.
     * @param string $username L'username dell'utente da cercare.
     * @return array|null Ritorna un array associativo con i dati dell'utente o null se non trovato.
     */
    public function getUserDataByUsername($username)
    {
        // Seleziona solo i campi necessari, ESCLUDENDO la password
        $query = "SELECT idutente, nome, cognome, username,idutente FROM utenti WHERE username = ?";
        $stmt = $this->db->prepare($query);
        if (!$stmt) {
            // Gestione errore preparazione statement
            error_log("Errore preparazione statement getUserDataByUsername: " . $this->db->error);
            return null;
        }
        $stmt->bind_param('s', $username);
        $stmt->execute();
        $result = $stmt->get_result();
        // Usiamo fetch_assoc() perché ci aspettiamo al massimo un utente
        $userData = $result->fetch_assoc();
        $result->free();
        $stmt->close();

        return $userData; // Ritorna l'array associativo dei dati o null se l'utente non esiste
    }


    public function getUserOrdersByUserPaginated($idutente, $page = 1, $perPage = 5)
    {
        if ($page < 1) {
            $page = 1;
        }
        $offset = ($page - 1) * $perPage;

        $countQuery = "SELECT COUNT(*) AS totalOrders
                   FROM ordini o
                   WHERE o.idutente = ? AND o.completato = TRUE";

        $countStmt = $this->db->prepare($countQuery);
        if (!$countStmt) {
            error_log("Errore preparazione count statement getUserOrdersByUserPaginated: " . $this->db->error);
            return ['orders' => [], 'currentPage' => $page, 'totalPages' => 0];
        }
        $countStmt->bind_param('i', $idutente);
        $countStmt->execute();
        $countResult = $countStmt->get_result();
        $totalOrdersRow = $countResult->fetch_assoc();
        $totalOrders = $totalOrdersRow ? $totalOrdersRow['totalOrders'] : 0;
        $countResult->free();
        $countStmt->close();

        $totalPages = 0;
        if ($perPage > 0 && $totalOrders > 0) {
            $totalPages = ceil($totalOrders / $perPage);
        } elseif ($totalOrders == 0) {
            $totalPages = 1;
        }


        $orders = [];
        if ($totalOrders > 0 && $page <= $totalPages) {
            $query = "SELECT
                    o.idordine,
                    o.data_ordine,
                    o.orario,
                    COALESCE(so.descrizione, 'Non disponibile') AS stato
                  FROM ordini o
                  LEFT JOIN (
                      modifiche_stato ms
                      JOIN (
                          SELECT idordine, MAX(timestamp_modifica) AS max_timestamp
                          FROM modifiche_stato
                          GROUP BY idordine
                      ) ms_max ON ms.idordine = ms_max.idordine AND ms.timestamp_modifica = ms_max.max_timestamp
                  ) ON o.idordine = ms.idordine
                  LEFT JOIN stati_ordine so ON ms.idstato = so.idstato
                  WHERE o.idutente = ? AND o.completato = TRUE
                  ORDER BY o.data_ordine DESC, o.orario DESC
                  LIMIT ? OFFSET ?";

            $stmt = $this->db->prepare($query);
            if (!$stmt) {
                error_log("Errore preparazione statement getUserOrdersByUserPaginated: " . $this->db->error);
                return ['orders' => [], 'currentPage' => $page, 'totalPages' => $totalPages, 'debug_error' => $this->db->error];
            }
            $stmt->bind_param('iii', $idutente, $perPage, $offset);
            $stmt->execute();
            $result = $stmt->get_result();
            $orders = $result->fetch_all(MYSQLI_ASSOC);
            $result->free();
            $stmt->close();
        }

        return [
            'orders' => $orders,
            'currentPage' => (int)$page, // Assicura che sia un intero
            'totalPages' => (int)$totalPages, // Assicura che sia un intero
        ];
    }

    public function updateIngredientQuantity($id, $quantity)
    {
        $query = "UPDATE ingredienti SET giacenza = giacenza - ? WHERE idingrediente = ?";

        $stmt = $this->db->prepare($query);
        $stmt->bind_param('ii', $quantity, $id);
        try {
            $success = $stmt->execute();
            $affectedRows = $stmt->affected_rows;
            $stmt->close();

            return $success && $affectedRows > 0;
        } catch (mysqli_sql_exception $e) {
            $stmt->close();
            return false;
        }
    }

    public function getLowStockIngredients()
    {
        $query = "SELECT * FROM ingredienti WHERE giacenza <= 2";

        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result();
        $ingredients = $result->fetch_all(MYSQLI_ASSOC);
        $result->free();
        $stmt->close();
        return $ingredients;
    }

    public function hasLowStockIngredients()
    {
        $query = "SELECT 1 FROM ingredienti WHERE giacenza <= 2 LIMIT 1"; // Ottimizzato per performance

        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result();
        $hasLowStock = $result->num_rows > 0;

        $result->free();
        $stmt->close();

        return $hasLowStock;
    }


    public function getLowStockProducts()
    {
        $query = "SELECT * FROM prodotti WHERE giacenza <= 2";

        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result();
        $ingredients = $result->fetch_all(MYSQLI_ASSOC);
        $result->free();
        $stmt->close();
        return $ingredients;
    }

    public function hasLowStockProducts()
    {
        $query = "SELECT 1 FROM prodotti WHERE giacenza <= 2 LIMIT 1"; // Ottimizzato per performance

        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result();
        $hasLowStock = $result->num_rows > 0;

        $result->free();
        $stmt->close();

        return $hasLowStock;
    }

    public function createLowStockIngredientNotification($idutente, $idingrediente, $nomeIngrediente)
    {
        $dataCorrente = date("Y-m-d");
        $oraCorrente = date("H:i:s");

        $titolo = "Attenzione: Ingrediente quasi finito";
        $testo = "L'ingrediente '$nomeIngrediente' sta per finire.";

        $query = "INSERT INTO notifiche (titolo, testo, vista, data, ora, tipo, idutente, idingrediente) 
              VALUES (?, ?, FALSE, ?, ?, 'ingrediente', ?, ?)";

        $stmt = $this->db->prepare($query);

        $stmt->bind_param('ssssis', $titolo, $testo, $dataCorrente, $oraCorrente, $idutente, $idingrediente);

        try {
            $stmt->execute();
            $stmt->close();
            return true;
        } catch (mysqli_sql_exception $e) {
            $stmt->close();
            return false;
        }
    }

    public function createLowStockProductNotification($idutente, $idprodotto, $nomeProdotto)
    {
        $dataCorrente = date("Y-m-d");
        $oraCorrente = date("H:i:s");

        $titolo = "Attenzione: Prodotto quasi finito";
        $testo = "Il prodotto '$nomeProdotto' sta per finire.";

        $query = "INSERT INTO notifiche (titolo, testo, vista, data, ora, tipo, idutente, idprodotto) 
              VALUES (?, ?, FALSE, ?, ?, 'prodotto', ?, ?)";

        $stmt = $this->db->prepare($query);

        $stmt->bind_param('ssssis', $titolo, $testo, $dataCorrente, $oraCorrente, $idutente, $idprodotto);

        try {
            $stmt->execute();
            $stmt->close();
            return true;
        } catch (mysqli_sql_exception $e) {
            $stmt->close();
            return false;
        }
    }


    public function createOrderNotification($idutente, $idordine)
    {
        $dataCorrente = date("Y-m-d");
        $oraCorrente = date("H:i:s");

        $titolo = "Attenzione: Modificato Stato del tuo ordine";
        $testo = "Lo stato del tuo ordine '$idordine' e' stato cambiato.";

        $query = "INSERT INTO notifiche (titolo, testo, vista, data, ora, tipo, idutente, idordine) 
              VALUES (?, ?, FALSE, ?, ?, 'prodotto', ?, ?)";

        $stmt = $this->db->prepare($query);

        $stmt->bind_param('ssssis', $titolo, $testo, $dataCorrente, $oraCorrente, $idutente, $idordine);

        try {
            $stmt->execute();
            $stmt->close();
            return true;
        } catch (mysqli_sql_exception $e) {
            $stmt->close();
            return false;
        }
    }



    public function getNotificationsByUserId($idutente)
    {
        try {
            $query = "SELECT * FROM notifiche WHERE idutente = ? AND vista = 0";

            $stmt = $this->db->prepare($query);

            // Verifica che la preparazione sia riuscita
            if ($stmt === false) {
                throw new Exception('Preparazione della query fallita');
            }

            $stmt->bind_param("i", $idutente);

            $stmt->execute();

            $result = $stmt->get_result();

            // Verifica se ci sono risultati
            if ($result->num_rows > 0) {
                $notifications = $result->fetch_all(MYSQLI_ASSOC);
            } else {
                $notifications = [];
            }

            $result->free();
            $stmt->close();

            return $notifications;
        } catch (Exception $e) {
            // Gestione degli errori
            error_log('Errore nella funzione getNotificationsByUserId: ' . $e->getMessage());
            return [];  // Ritorna un array vuoto in caso di errore
        }
    }

    public function readNotification($idnotifica)
    {
        $query = "UPDATE notifiche SET vista = 1 WHERE idnotifica = ?";

        $stmt = $this->db->prepare($query);
        if (!$stmt) {
            throw new Exception("Errore nella preparazione della query: " . $this->db->error);
        }

        $stmt->bind_param("i", $idnotifica);

        if (!$stmt->execute()) {
            throw new Exception("Errore nell'esecuzione della query: " . $stmt->error);
        }

        $affected = $stmt->affected_rows;
        $stmt->close();

        return $affected > 0;
    }


    public function deleteNotification($idnotifica)
    {
        $query = "DELETE FROM notifiche WHERE idnotifica = ?";

        $stmt = $this->db->prepare($query);
        if (!$stmt) {
            throw new Exception("Errore nella preparazione della query: " . $this->db->error);
        }

        $stmt->bind_param("i", $idnotifica);

        if (!$stmt->execute()) {
            throw new Exception("Errore nell'esecuzione della query: " . $stmt->error);
        }

        $affected = $stmt->affected_rows;
        $stmt->close();

        return $affected > 0;
    }



    public function getProduct($idprodotto)
    {
        $query = "SELECT * FROM prodotti WHERE idprodotto = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("i", $idprodotto);
        $stmt->execute();
        $result = $stmt->get_result();
        $product = $result->fetch_all(MYSQLI_ASSOC);
        return $product;
    }


    public function getIngredientsByProduct($idprodotto)
    {
        $query = "
        SELECT i.idingrediente, i.nome, i.sovrapprezzo, i.giacenza, i.image, c.quantita, c.essenziale
        FROM composizioni c
        INNER JOIN ingredienti i ON c.idingrediente = i.idingrediente
        WHERE c.idprodotto = ?
    ";

        $stmt = $this->db->prepare($query);
        $stmt->bind_param("i", $idprodotto);
        $stmt->execute();

        $result = $stmt->get_result();
        $ingredients = $result->fetch_all(MYSQLI_ASSOC);

        $stmt->close();
        return $ingredients;
    }

    public function createEmptyPersonalization($idprodotto, $prezzo, $idordine)
    {
        $query = "
        INSERT INTO personalizzazioni (prezzo, quantita, idordine, idprodotto)
        VALUES (?, ?, ?, ?)
    ";

        $stmt = $this->db->prepare($query);
        if (!$stmt) {
            // Gestione errore di preparazione
            return false;
        }

        $quantita = 1; // Valore predefinito per una personalizzazione "vuota"

        $stmt->bind_param("diii", $prezzo, $quantita, $idordine, $idprodotto);
        $success = $stmt->execute();

        if ($success) {
            $lastId = $this->db->insert_id;
            $stmt->close();
            return $lastId; // restituisci l'id della personalizzazione creata
        } else {
            $stmt->close();
            return false;
        }
    }


    /* appena creata nuova istanza di personalizzazione del panino standard del menu, chiami questa fun che 
       ti crea la composizione del panino personalizzato, all'inizio ovviamente sarà uguale al panino standard
       nel js quindi dovrai avere un array di tutti gli ingredienti del panino standard e delle quantita e tramite un for 
       chiamare questa funzione runnadola su tutti gli elementi dell'array
     */
    public function createNewBurgerComposition($idpersonalizzazione, $idingrediente, $quantita)
    {
        $query = "INSERT INTO modifiche_ingredienti (idpersonalizzazione, idingrediente, quantita) VALUES (?, ?, ?)";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param('iii', $idpersonalizzazione, $idingrediente, $quantita);
        try {
            $success = $stmt->execute();
            $affectedRows = $stmt->affected_rows;
            $stmt->close();

            // Verifica che l'esecuzione sia andata a buon fine e che almeno una riga sia stata inserita
            return $success && $affectedRows > 0;
        } catch (mysqli_sql_exception $e) {
            return false;
        }
    }

    /*ogni volta che clicchi + o - su un ingrediente, aggiorni la composizione del panino personalizzato
     */
    public function updateModifiedBurgerIngredientsQuantity($idpersonalizzazione, $idingrediente, $quantita)
    {
        $query = "UPDATE modifiche_ingredienti SET quantita = ? WHERE idpersonalizzazione = ? AND idingrediente = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param('iii', $quantita, $idpersonalizzazione, $idingrediente);

        try {
            $success = $stmt->execute();
            $affectedRows = $stmt->affected_rows;
            $stmt->close();

            // Verifica che l'esecuzione sia andata a buon fine e che almeno una riga sia stata aggiornata
            return $success && $affectedRows > 0;
        } catch (mysqli_sql_exception $e) {
            return false;
        }
    }

    public function getAllIngredients()
    {
        $query = "SELECT * FROM ingredienti";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result();
        $ingredients = $result->fetch_all(MYSQLI_ASSOC);
        $result->free();
        $stmt->close();
        return $ingredients;
    }

    public function getAllProducts()
    {
        $query = "
            SELECT p.*, c.descrizione AS categoryDescrizione
            FROM prodotti p
            JOIN categorie c ON p.idcategoria = c.idcategoria
            WHERE p.eliminato = 0
        ";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result();
        $products = $result->fetch_all(MYSQLI_ASSOC);
        $result->free();
        $stmt->close();
        return $products;
    }

    public function getBurgerWithIngredients($idprodotto)
    {
        $query = "
        SELECT 
            p.nome,
            p.image,
            i.nome AS nome_ingrediente
        FROM 
            prodotti p
        JOIN 
            composizioni c ON p.idprodotto = c.idprodotto
        JOIN 
            ingredienti i ON c.idingrediente = i.idingrediente
        WHERE 
            p.idprodotto = ?
    ";

        $stmt = $this->db->prepare($query);
        $stmt->bind_param('i', $idprodotto);
        $stmt->execute();
        $result = $stmt->get_result();

        $data = $result->fetch_all(MYSQLI_ASSOC);

        if (empty($data)) {
            return null;
        }

        $panino = [
            'nome' => $data[0]['nome'],               // nome del panino
            'image' => $data[0]['image'],             // immagine del panino
            'ingredienti' => array_column($data, 'nome_ingrediente') // lista ingredienti
        ];

        return $panino;
    }

    public function getOrderDetails($idordine)
    {
        $orderCustom = [];
        $orderStock = [];
        $totalPrice = 0;

        // Recupera i prodotti personalizzati con le loro modifiche di ingredienti
        $queryCustom = "SELECT pe.idpersonalizzazione, p.nome AS nomeprodotto, 
                               pe.prezzo, pe.quantita, pe.idprodotto,
                               i.nome AS nomeingrediente, m.azione
                        FROM ordini o
                        JOIN personalizzazioni pe ON o.idordine = pe.idordine
                        LEFT JOIN modifiche_ingredienti m ON pe.idpersonalizzazione = m.idpersonalizzazione
                        LEFT JOIN ingredienti i ON m.idingrediente = i.idingrediente
                        JOIN prodotti p ON pe.idprodotto = p.idprodotto
                        WHERE o.idordine = ?
                        ORDER BY pe.idpersonalizzazione";

        $stmtCustom = $this->db->prepare($queryCustom);
        if ($stmtCustom) {
            $stmtCustom->bind_param('i', $idordine);
            $stmtCustom->execute();
            $resultCustom = $stmtCustom->get_result();
            $orderCustom = $resultCustom->fetch_all(MYSQLI_ASSOC); // Questo conterrà più righe per personalizzazione se ci sono più modifiche
            $resultCustom->free();
            $stmtCustom->close();
        } else {
            // Gestisci errore di preparazione, es:
            error_log("Errore preparazione queryCustom in getOrderDetails: " . $this->db->error);
        }

        // Recupera i prodotti standard (non personalizzati)
        $queryStock = "SELECT p.nome, p.prezzo, cp.quantita, p.idcategoria, p.idprodotto
                       FROM ordini o
                       JOIN carrelli_prodotti cp ON o.idordine = cp.idordine
                       JOIN prodotti p ON cp.idprodotto = p.idprodotto
                       WHERE o.idordine = ?
                       ORDER BY p.idcategoria";

        $stmtStock = $this->db->prepare($queryStock);
        if ($stmtStock) {
            $stmtStock->bind_param('i', $idordine);
            $stmtStock->execute();
            $resultStock = $stmtStock->get_result();
            $orderStock = $resultStock->fetch_all(MYSQLI_ASSOC);
            $resultStock->free();
            $stmtStock->close();
        } else {
            // Gestisci errore di preparazione
            error_log("Errore preparazione queryStock in getOrderDetails: " . $this->db->error);
        }

        $priceQuery = "SELECT prezzo_totale FROM ordini WHERE idordine = ?";
        $stmtPrice = $this->db->prepare($priceQuery);
        $stmtPrice->bind_param('i', $idordine);
        $stmtPrice->execute();
        $resultPrice = $stmtPrice->get_result();
        $rowPrice = $resultPrice->fetch_assoc();
        if ($rowPrice !== null) {
            $totalPrice = floatval($rowPrice['prezzo_totale']);
        }
        $stmtPrice->close();

        return [
            'orderCustom' => $orderCustom,
            'orderStock' => $orderStock,
            'totalPrice' => $totalPrice
        ];
    }

    public function updateOrderStatus($orderId)
    {
        $insertQuery = "INSERT INTO modifiche_stato (idordine, idstato) VALUES (?, 
        (SELECT idstato 
         FROM stati_ordine 
         WHERE idstato = (
             SELECT COALESCE(MAX(ms.idstato), 0) + 1
             FROM modifiche_stato ms 
             WHERE ms.idordine = ?
         )))";
        $stmt = $this->db->prepare($insertQuery);

        if (!$stmt) {
            error_log("Errore preparazione statement (insertQuery) in updateStatusToConfirmed per ordine ID $orderId: " . $this->db->error);
            return false;
        }

        $stmt->bind_param('ii', $orderId, $orderId);

        if (!$stmt->execute()) {
            error_log("Errore esecuzione statement (insertQuery) in updateStatusToConfirmed per ordine ID $orderId: " . $stmt->error);
            $stmt->close();
            return false;
        }

        $affectedRows = $stmt->affected_rows;
        $stmt->close();

        return $affectedRows > 0;
    }

    public function hasUncompletedOrder($idutente)
    {
        $query = "
        SELECT idordine
        FROM ordini
        WHERE idutente = ? AND completato = FALSE
        LIMIT 1
    ";

        $stmt = $this->db->prepare($query);
        $stmt->bind_param('i', $idutente);
        $stmt->execute();
        $result = $stmt->get_result();

        $exists = $result->num_rows > 0;

        $stmt->close();
        return $exists;
    }

    public function createEmptyOrder($idutente)
    {
        $query = "
        INSERT INTO ordini (idutente, completato)
        VALUES (?, FALSE)
    ";

        $stmt = $this->db->prepare($query);
        $stmt->bind_param('i', $idutente);
        $success = $stmt->execute();

        if ($success) {
            $newOrderId = $this->db->insert_id;
            $stmt->close();
            return $newOrderId;
        } else {
            $stmt->close();
            return false;
        }
    }

    public function getUncompletedOrder($idutente)
    {
        $query = "
        SELECT *
        FROM ordini
        WHERE idutente = ? AND completato = FALSE
        LIMIT 1
    ";

        $stmt = $this->db->prepare($query);
        $stmt->bind_param('i', $idutente);
        $stmt->execute();
        $result = $stmt->get_result();

        $orders = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        if (!empty($orders)) {
            return $orders[0]; // Restituisce il primo ordine non completato
        } else {
            return null; // Nessun ordine trovato
        }
    }

    public function getProductsInCart($idordine)
    {
        $query = "
        SELECT 
            cp.idprodotto,
            cp.idordine,
            cp.quantita,
            p.idcategoria,
            p.nome,
            p.prezzo,
            p.image
        FROM carrelli_prodotti cp
        JOIN prodotti p ON cp.idprodotto = p.idprodotto
        WHERE cp.idordine = ?
    ";

        $stmt = $this->db->prepare($query);
        $stmt->bind_param("i", $idordine);
        $stmt->execute();

        $result = $stmt->get_result();
        $products = $result->fetch_all(MYSQLI_ASSOC);

        $stmt->close();
        return $products;
    }

    public function getPersonalizationsInCart($idordine)
    {
        $query = "SELECT pe.*, p.nome AS nomeprodotto, p.image
              FROM personalizzazioni pe
              JOIN prodotti p ON pe.idprodotto = p.idprodotto
              WHERE pe.idordine = ?";

        $stmt = $this->db->prepare($query);
        if (!$stmt) {
            error_log("Errore preparazione query getPersonalizationsInCart: " . $this->db->error);
            return [];
        }

        $stmt->bind_param("i", $idordine);
        $stmt->execute();
        $result = $stmt->get_result();
        $personalizations = $result->fetch_all(MYSQLI_ASSOC);

        $stmt->close();
        return $personalizations;
    }



    public function removeProductFromCart($idprodotto, $idordine)
    {
        $query = "DELETE FROM carrelli_prodotti WHERE idprodotto = ? AND idordine = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("ii", $idprodotto, $idordine);
        $success = $stmt->execute();
        $stmt->close();

        return $success;
    }

    public function removePersonalizationFromCart($idpersonalizzazione, $idordine)
    {
        $query = "DELETE FROM personalizzazioni WHERE idpersonalizzazione = ? AND idordine = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("ii", $idpersonalizzazione, $idordine);
        $success = $stmt->execute();
        $stmt->close();

        return $success;
    }

    public function addProductToCart($idprodotto, $idordine, $quantita)
    {
        $query = "INSERT INTO carrelli_prodotti (idprodotto, idordine, quantita) VALUES (?, ?, ?)";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("iii", $idprodotto, $idordine, $quantita);
        $success = $stmt->execute();
        $stmt->close();

        return $success;
    }


    public function getAllCategories()
    {
        $query = " SELECT * FROM Categorie";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result();
        $categories = $result->fetch_all(MYSQLI_ASSOC);
        $result->free();
        $stmt->close();
        return $categories;
    }

    public function doesPersonalizationExist($idprodotto, $idordine)
    {
        $query = "SELECT * FROM personalizzazioni WHERE idprodotto = ? AND idordine = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("ii", $idprodotto, $idordine);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->num_rows > 0;
    }

    public function doesModificationExist($idpersonalizzazione)
    {
        $query = "SELECT * FROM modifiche_ingredienti WHERE idpersonalizzazione = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("i", $idpersonalizzazione);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->num_rows > 0;
    }

    public function getPersonalizationWithModifications($idpersonalizzazione)
    {
        $query = "
        SELECT p.*, m.idingrediente, m.azione
        FROM personalizzazioni p
        LEFT JOIN modifiche_ingredienti m ON p.idpersonalizzazione = m.idpersonalizzazione
        WHERE p.idpersonalizzazione = ?
    ";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("i", $idpersonalizzazione);
        $stmt->execute();
        $result = $stmt->get_result();

        $data = $result->fetch_all(MYSQLI_ASSOC);
        return $data;
    }


    public function createPersonalization($idprodotto, $idordine, $quantita = 1)
    {
        $query = "INSERT INTO personalizzazioni (prezzo, quantita, idordine, idprodotto) VALUES (0, ?, ?, ?)";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("iii", $quantita, $idordine, $idprodotto);
        if ($stmt->execute()) {
            return $this->db->insert_id; // Restituisce l'idpersonalizzazione appena inserito
        } else {
            return false; // Inserimento fallito
        }
    }

    public function addIngredientModification($idpersonalizzazione, $idingrediente, $azione)
    {
        $query = "INSERT INTO modifiche_ingredienti (idpersonalizzazione, idingrediente, azione) VALUES (?, ?, ?)";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("iis", $idpersonalizzazione, $idingrediente, $azione);
        if ($stmt->execute()) {
            return $this->db->insert_id; // Restituisce l'idpersonalizzazione appena inserito
        } else {
            return false; // Inserimento fallito
        }
    }

    public function deleteIngredientModification($idpersonalizzazione, $idingrediente)
    {
        $query = "DELETE FROM modifiche_ingredienti WHERE idpersonalizzazione = ? AND idingrediente = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("ii", $idpersonalizzazione, $idingrediente);
        return $stmt->execute(); // Restituisce true se l'eliminazione è avvenuta con successo
    }

    public function ingredientModificationExists($idpersonalizzazione, $idingrediente)
    {
        $query = "SELECT 1 FROM modifiche_ingredienti WHERE idpersonalizzazione = ? AND idingrediente = ? LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("ii", $idpersonalizzazione, $idingrediente);
        $stmt->execute();
        $stmt->store_result();

        return $stmt->num_rows > 0;
    }

    public function insertReview($idordine, $titolo, $voto, $commento)
    {
        $query = "INSERT INTO recensioni (idordine, titolo, voto, commento) 
                  VALUES (?, ?, ?, ?)";
        $stmt = $this->db->prepare($query);
        if (!$stmt) {
            error_log("Error preparing statement for insertReview: " . $this->db->error);
            return false;
        }
        $stmt->bind_param('isis', $idordine, $titolo, $voto, $commento);

        try {
            $success = $stmt->execute();
            $affectedRows = $stmt->affected_rows;
            $stmt->close();
            return $success && $affectedRows > 0;
        } catch (mysqli_sql_exception $e) {
            // Check for duplicate entry error (MySQL error code 1062 for ER_DUP_ENTRY)
            if ($e->getCode() == 1062) {
                error_log("Attempt to insert duplicate review for order ID $idordine. Error: " . $e->getMessage());
            } else {
                error_log("SQL Exception during insertReview for order ID $idordine: " . $e->getMessage());
            }
            $stmt->close();
            return false;
        }
    }

    public function hasReviewForOrder($idordine)
    {
        $query = "SELECT 1 FROM recensioni WHERE idordine = ? LIMIT 1";
        $stmt = $this->db->prepare($query);
        if (!$stmt) {
            error_log("Error preparing statement for hasReviewForOrder: " . $this->db->error);
            return false; // Or throw an exception
        }
        $stmt->bind_param('i', $idordine);
        $stmt->execute();
        $stmt->store_result();
        $exists = $stmt->num_rows > 0;
        $stmt->close();
        return $exists;
    }

    public function getPersonalization($idordine, $idprodotto)
    {
        $query = "
        SELECT *
        FROM personalizzazioni
        WHERE idordine = ? AND idprodotto = ?
    ";

        $stmt = $this->db->prepare($query);
        $stmt->bind_param("ii", $idordine, $idprodotto);
        $stmt->execute();
        $result = $stmt->get_result();

        $data = $result->fetch_all(MYSQLI_ASSOC);
        $result->free();
        $stmt->close();

        return $data;
    }

    public function getPersonalizationByID($idpersonalizzazione)
    {
        $query = "
        SELECT *
        FROM personalizzazioni
        WHERE idpersonalizzazione = ?
    ";

        $stmt = $this->db->prepare($query);
        $stmt->bind_param("i", $idpersonalizzazione);
        $stmt->execute();
        $result = $stmt->get_result();

        $data = $result->fetch_all(MYSQLI_ASSOC);
        $result->free();
        $stmt->close();

        return $data;
    }

    public function getReviewByOrder($idordine)
    {
        $query = "SELECT r.titolo, r.voto, r.commento
        FROM recensioni r
        WHERE r.idordine = ?";

        $stmt = $this->db->prepare($query);
        $stmt->bind_param("i", $idordine);
        $stmt->execute();
        $result = $stmt->get_result();

        $review = $result->fetch_all(MYSQLI_ASSOC);
        $result->free();
        $stmt->close();

        return $review;
    }

    public function deleteReview($idordine)
    {
        $query = "DELETE FROM recensioni WHERE idordine = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("i", $idordine);
        return $stmt->execute();
    }

    public function updateReview($idordine, $titolo, $voto, $commento)
    {
        $query = "UPDATE recensioni SET titolo = ?, voto = ?, commento = ? WHERE idordine = ?";
        $stmt = $this->db->prepare($query);
        if (!$stmt) {
            error_log("Error preparing statement for updateReview: " . $this->db->error);
            return false;
        }
        $stmt->bind_param('sisi', $titolo, $voto, $commento, $idordine);
        return $stmt->execute();
    }

    public function getOrderById($idordine)
    {
        $query = "SELECT * FROM ordini WHERE idordine = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("i", $idordine);
        $stmt->execute();
        $result = $stmt->get_result();
        $order = $result->fetch_all(MYSQLI_ASSOC);
        $result->free();
        $stmt->close();
        return $order;
    }

    public function modifyProductQuantity($idordine, $idprodotto, $add)
    {
        $query = "UPDATE carrelli_prodotti SET quantita = quantita + ? WHERE idordine = ? AND idprodotto = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("iii", $add, $idordine, $idprodotto);
        $success = $stmt->execute();
        $stmt->close();
        return $success;
    }

    public function modifyPersonalizationQuantity($idordine, $idpersonalizzazione, $add)
    {
        $query = "UPDATE personalizzazioni SET quantita = quantita + ? WHERE idordine = ? AND idpersonalizzazione = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("iii", $add, $idordine, $idpersonalizzazione);
        $success = $stmt->execute();
        $stmt->close();
        return $success;
    }

    public function updateStatusToPayed($idordine, $deliveryDate, $deliveryTime)
    {
        $updateQuery = "UPDATE ordini SET data_ordine = ?, orario = ? WHERE idordine = ?";
        $stmtUpdate = $this->db->prepare($updateQuery);
        $stmtUpdate->bind_param('ssi', $deliveryDate, $deliveryTime, $idordine);
        $success = $stmtUpdate->execute();
        $stmtUpdate->close();

        if (!$success) {
            error_log("Failed to execute updateStatusToPayed for order ID $idordine");
            return false;
        }

        $updateQuery = "UPDATE ordini SET completato = 1 WHERE idordine = ?";
        $stmtUpdate = $this->db->prepare($updateQuery);
        $stmtUpdate->bind_param('i', $idordine);
        $success = $stmtUpdate->execute();
        $stmtUpdate->close();
        return $success;
    }

    public function getAvailableTimeSlots($date)
    {
        $query = "SELECT orario
              FROM fasce_orari
              WHERE orario NOT IN (
                  SELECT orario
                  FROM ordini
                  WHERE data_ordine = ?
              )
              ORDER BY orario"; // aggiunto ORDER BY per avere gli orari in ordine

        $stmt = $this->db->prepare($query);

        if (!$stmt) {
            error_log("Errore nella preparazione della query getAvailableTimeSlots: " . $this->db->error);
            return false;
        }

        $stmt->bind_param('s', $date);

        if (!$stmt->execute()) {
            error_log("Errore nell'esecuzione della query getAvailableTimeSlots: " . $stmt->error);
            $stmt->close();
            return false;
        }

        $result = $stmt->get_result();
        $availableSlots = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        $simplifiedSlots = array_map(function ($slot) {
            return $slot['orario'];
        }, $availableSlots);

        // Verifica se la data selezionata è oggi
        $today = date('Y-m-d');
        if ($date === $today) {
            // Ottieni l'ora corrente
            $currentTime = date('H:i:s');

            // Aggiungi un buffer di 30 minuti per la preparazione
            $minTime = date('H:i:s', strtotime($currentTime) + 30 * 60);

            // Filtra gli orari per rimuovere quelli già passati
            $simplifiedSlots = array_filter($simplifiedSlots, function ($time) use ($minTime) {
                return $time > $minTime;
            });

            // Reindexing array
            $simplifiedSlots = array_values($simplifiedSlots);
        }

        return $simplifiedSlots;
    }

    public function getAllQuantitiesInCart($idordine)
    {
        $query = "
            SELECT SUM(quantita) AS totale_quantita
            FROM (
                SELECT quantita FROM carrelli_prodotti WHERE idordine = ?
                UNION ALL
                SELECT quantita FROM personalizzazioni WHERE idordine = ?
            ) AS combined_quantities
        ";

        $stmt = $this->db->prepare($query);
        if (!$stmt) {
            return null;
        }

        $stmt->bind_param("ii", $idordine, $idordine);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result && $row = $result->fetch_assoc()) {
            return (int)$row['totale_quantita'];
        }

        return 0;
    }

    public function removePersonalizationComposition($idpersonalizzazione)
    {

        $query = "DELETE FROM modifiche_ingredienti WHERE idpersonalizzazione = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("i", $idpersonalizzazione);
        $success = $stmt->execute();
        $stmt->close();

        return $success;
    }

    public function isProductInCart($idprodotto, $idordine)
    {
        $sql = "SELECT 1 FROM carrelli_prodotti WHERE idprodotto = ? AND idordine = ? LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param("ii", $idprodotto, $idordine);
        $stmt->execute();
        $stmt->store_result();

        return $stmt->num_rows > 0;
    }

    /**
     * Ottiene tutti gli ordini attivi (non completati)
     * @return array Array di ordini attivi
     */
    public function getActiveOrdersPaginated($page = 1, $perPage = 5) // Added pagination parameters
    {
        if ($page < 1) $page = 1; // Ensure page is at least 1
        $offset = ($page - 1) * $perPage;

        // Count total active orders first
        $countQuery = "SELECT COUNT(*) AS totalOrders
                       FROM ordini o
                       LEFT JOIN (
                           modifiche_stato ms
                           JOIN (
                               SELECT idordine, MAX(timestamp_modifica) AS max_timestamp
                               FROM modifiche_stato
                               GROUP BY idordine
                           ) ms_max ON ms.idordine = ms_max.idordine AND ms.timestamp_modifica = ms_max.max_timestamp
                       ) ON o.idordine = ms.idordine
                       WHERE ms.idstato < 5 AND o.completato = 1";
        $countStmt = $this->db->prepare($countQuery);
        $countStmt->execute();
        $countResult = $countStmt->get_result();
        $totalOrders = $countResult->fetch_assoc()['totalOrders'];
        $countResult->free();
        $countStmt->close();

        $totalPages = 0;
        if ($perPage > 0 && $totalOrders > 0) {
            $totalPages = ceil($totalOrders / $perPage);
        } elseif ($totalOrders == 0) { // If there are no orders, there's still 1 page (empty)
            $totalPages = 1;
        }

        $query = "SELECT o.idordine, o.data_ordine, o.orario, o.prezzo_totale,
                  COALESCE(so.descrizione, 'In attesa') AS stato
                  FROM ordini o
                  LEFT JOIN (
                      modifiche_stato ms
                      JOIN (
                          SELECT idordine, MAX(timestamp_modifica) AS max_timestamp
                          FROM modifiche_stato
                          GROUP BY idordine
                      ) ms_max ON ms.idordine = ms_max.idordine AND ms.timestamp_modifica = ms_max.max_timestamp
                  ) ON o.idordine = ms.idordine
                  LEFT JOIN stati_ordine so ON ms.idstato = so.idstato
                  WHERE ms.idstato < 5 AND o.completato = 1
                  ORDER BY o.data_ordine DESC, o.orario DESC
                  LIMIT ? OFFSET ?";

        $stmt = $this->db->prepare($query);
        if (!$stmt) {
            error_log("Errore preparazione statement getActiveOrdersPaginated: " . $this->db->error);
            return ['orders' => [], 'currentPage' => $page, 'totalPages' => $totalPages, 'error_db' => $this->db->error];
        }

        $stmt->bind_param('ii', $perPage, $offset);
        $stmt->execute();
        $result = $stmt->get_result();
        $orders = $result->fetch_all(MYSQLI_ASSOC);
        $result->free();
        $stmt->close();

        return [
            'orders' => $orders,
            'currentPage' => $page,
            'totalPages' => $totalPages
        ];
    }

    /**
     * Ottiene lo storico degli ordini (completati)
     * @return array Array di ordini completati
     */
    public function getOrderHistoryPaginated($page = 1, $perPage = 5) // Added pagination parameters
    {
        if ($page < 1) $page = 1; // Ensure page is at least 1
        $offset = ($page - 1) * $perPage;

        // Count total historical orders first
        $countQuery = "SELECT COUNT(*) AS totalOrders
                       FROM ordini o
                       LEFT JOIN (
                           modifiche_stato ms
                           JOIN (
                               SELECT idordine, MAX(timestamp_modifica) AS max_timestamp
                               FROM modifiche_stato
                               GROUP BY idordine
                           ) ms_max ON ms.idordine = ms_max.idordine AND ms.timestamp_modifica = ms_max.max_timestamp
                       ) ON o.idordine = ms.idordine
                       WHERE ms.idstato >= 5";
        $countStmt = $this->db->prepare($countQuery);
        $countStmt->execute();
        $countResult = $countStmt->get_result();
        $totalOrders = $countResult->fetch_assoc()['totalOrders'];
        $countResult->free();
        $countStmt->close();

        $totalPages = 0;
        if ($perPage > 0 && $totalOrders > 0) {
            $totalPages = ceil($totalOrders / $perPage);
        } elseif ($totalOrders == 0) { // If there are no orders, there's still 1 page (empty)
            $totalPages = 1;
        }

        $query = "SELECT o.idordine, o.data_ordine, o.orario, o.prezzo_totale,
                  COALESCE(so.descrizione, 'Completato') AS stato
                  FROM ordini o
                  LEFT JOIN (
                      modifiche_stato ms
                      JOIN (
                          SELECT idordine, MAX(timestamp_modifica) AS max_timestamp
                          FROM modifiche_stato
                          GROUP BY idordine
                      ) ms_max ON ms.idordine = ms_max.idordine AND ms.timestamp_modifica = ms_max.max_timestamp
                  ) ON o.idordine = ms.idordine
                  LEFT JOIN stati_ordine so ON ms.idstato = so.idstato
                  WHERE ms.idstato >= 5
                  ORDER BY o.data_ordine DESC, o.orario DESC
                  LIMIT ? OFFSET ?";

        $stmt = $this->db->prepare($query);
        if (!$stmt) {
            error_log("Errore preparazione statement getOrderHistoryPaginated: " . $this->db->error);
            return ['orders' => [], 'currentPage' => $page, 'totalPages' => $totalPages, 'error_db' => $this->db->error];
        }

        $stmt->bind_param('ii', $perPage, $offset);
        $stmt->execute();
        $result = $stmt->get_result();
        $orders = $result->fetch_all(MYSQLI_ASSOC);
        $result->free();
        $stmt->close();

        return [
            'orders' => $orders,
            'currentPage' => $page,
            'totalPages' => $totalPages
        ];
    }

    public function getAllDrinks()
    {
        $query = "SELECT * FROM prodotti WHERE idcategoria = (SELECT idcategoria FROM categorie WHERE descrizione LIKE '%bevande%') AND eliminato = 0";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result();
        $drinks = $result->fetch_all(MYSQLI_ASSOC);
        $result->free();
        $stmt->close();
        return $drinks;
    }

    public function getAllFrieds()
    {
        $query = "SELECT * FROM prodotti WHERE idcategoria = (SELECT idcategoria FROM categorie WHERE descrizione LIKE '%fritti%') AND eliminato = 0";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result();
        $drinks = $result->fetch_all(MYSQLI_ASSOC);
        $result->free();
        $stmt->close();
        return $drinks;
    }

    public function getAllDessertes()
    {
        $query = "SELECT * FROM prodotti WHERE idcategoria = (SELECT idcategoria FROM categorie WHERE descrizione LIKE '%desserti%') AND eliminato = 0";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result();
        $drinks = $result->fetch_all(MYSQLI_ASSOC);
        $result->free();
        $stmt->close();
        return $drinks;
    }

    public function modifyQuantityDrink($idprodotto, $quantita)
    {
        $query = "UPDATE prodotti SET disponibilita = disponibilita - ? WHERE idprodotto = ?";
        $stmt = $this->db->prepare($query);
        if (!$stmt) {
            throw new Exception("Errore nella preparazione della query: " . $this->db->error);
        }

        $stmt->bind_param("ii", $quantita, $idprodotto);
        $success = $stmt->execute();

        if (!$success) {
            throw new Exception("Errore nell'esecuzione della query: " . $stmt->error);
        }

        $stmt->close();
        return $success;
    }

    public function getAllBurgersCompositions()
    {
        $query = "SELECT 
        p.idprodotto,
        p.nome AS nome_prodotto,
        p.prezzo,
        p.disponibilita,
        p.image AS prodotto_image,
        
        c.idingrediente,
        c.quantita AS quantita_necessaria,
        c.essenziale,
        
        i.nome AS nome_ingrediente,
        i.sovrapprezzo,
        i.giacenza,
        i.image AS ingrediente_image

        FROM prodotti p
        JOIN composizioni c ON p.idprodotto = c.idprodotto
        JOIN ingredienti i ON c.idingrediente = i.idingrediente
        WHERE p.idcategoria = 1
        ORDER BY p.idprodotto, c.idingrediente";

        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $result = $stmt->get_result();
        $compositions = $result->fetch_all(MYSQLI_ASSOC);
        $result->free();
        $stmt->close();
        return $compositions;
    }

    // TODO       
    /* ===========================================================
    * Codice da riguardare inizia qui. 
    * ============================================================
    */
    // DatabaseHelper.php
    public function getAllProductsWithIngredients() {

        // TODO bisogna gestire la discrepanza tra idcategoria e descrizione
        $sql = "
            SELECT 
                p.idprodotto, p.nome, p.descrizione, p.prezzo, p.image,
                c.descrizione  AS categoria,
                i.idingrediente, i.nome AS nome_ingrediente,
                cmp.quantita, cmp.essenziale
            FROM prodotti p
            JOIN categorie c        ON p.idcategoria = c.idcategoria
            LEFT JOIN composizioni cmp ON p.idprodotto = cmp.idprodotto
            LEFT JOIN ingredienti  i   ON cmp.idingrediente = i.idingrediente
            ORDER BY p.idprodotto
        ";
        $res = $this->db->query($sql);
        $rows = $res->fetch_all(MYSQLI_ASSOC);

        // raggruppa per prodotto
        $products = [];
        foreach ($rows as $r) {
            $id = $r['idprodotto'];
            if (!isset($products[$id])) {
                $products[$id] = [
                    'idprodotto' => $id,
                    'nome'       => $r['nome'],
                    'prezzo'     => (float)$r['prezzo'],
                    'image'      => $r['image'],
                    'categoria'  => $r['categoria'],
                    'ingredients'=> []
                ];
            }
            if ($r['idingrediente']) {
                $products[$id]['ingredients'][] = [
                    'idingrediente'=> $r['idingrediente'],
                    'nome'         => $r['nome_ingrediente'],
                    'quantita'     => (int)$r['quantita'],
                    'essenziale'   => (bool)$r['essenziale']
                ];
            }
        }

        return array_values($products);
    }
    
    /* DatabaseHelper.php */
    public function insertProduct($nome, $prezzo, $imageFilenameForDb, $idcategoria, $disponibilita = null) {
        // Per i panini, la disponibilità è sempre 999 (gestita tramite ingredienti)
        // Per altri prodotti, usa il valore fornito o 1 (disponibile) come default
        if ($disponibilita === null) {
            $disponibilita = 999; // Default per compatibilità
        }
        
        $sql = "INSERT INTO prodotti
                (nome, prezzo, image, idcategoria, disponibilita)
                VALUES (?, ?, ?, ?, ?)"; // 5 placeholders
        $stmt = $this->db->prepare($sql);
        
        if ($stmt === false) {
            error_log("DatabaseHelper::insertProduct - Errore preparazione query: " . $this->db->error);
            return false; 
        }
        
        // Tipi di parametri: nome (s), prezzo (d), image (s), idcategoria (i), disponibilita (i)
        $stmt->bind_param('sdsii', $nome, $prezzo, $imageFilenameForDb, $idcategoria, $disponibilita);
        
        if (!$stmt->execute()) {
            error_log("DatabaseHelper::insertProduct - Errore esecuzione query: " . $stmt->error);
            $stmt->close();
            return false;
        }
        
        $id = $this->db->insert_id;
        $stmt->close();
        return $id;
    }
    

    public function addProductComposition($idprodotto, $idingrediente,
                                        $quantita = 1, $essenziale = true) {
        $sql = "INSERT INTO composizioni (idprodotto, idingrediente, quantita, essenziale)
                VALUES (?,?,?,?)";
        $stmt = $this->db->prepare($sql);
        $essenziale = $essenziale ? 1 : 0;
        $stmt->bind_param('iiii', $idprodotto, $idingrediente, $quantita, $essenziale);

        return $stmt->execute();
    }

    /**
     * Recupera i dati di un prodotto specifico, inclusi gli ID dei suoi ingredienti.
     * @param int $productId L'ID del prodotto.
     * @return array|null Un array associativo con i dati del prodotto e un array 'ingredients' con gli ID, o null se non trovato.
     */
    public function getProductWithComposition($productId) {
        $product = null;
        $productBaseArray = $this->getProduct($productId); // getProduct esistente restituisce un array
        if (!empty($productBaseArray)) {
            $product = $productBaseArray[0]; // Prendiamo il primo (e unico atteso) prodotto
        }

        if (!$product) {
            error_log("getProductWithComposition: Prodotto non trovato con ID: " . $productId);
            return null;
        }

        $ingredientIds = [];
        $query_comp = "SELECT idingrediente FROM composizioni WHERE idprodotto = ?";
        $stmt_comp = $this->db->prepare($query_comp);
        if ($stmt_comp) {
            $stmt_comp->bind_param('i', $productId);
            $stmt_comp->execute();
            $result_comp = $stmt_comp->get_result();
            while ($row_comp = $result_comp->fetch_assoc()) {
                $ingredientIds[] = intval($row_comp['idingrediente']); // Assicura che siano interi
            }
            $stmt_comp->close();
        } else {
            error_log("Errore preparazione statement per composizione in getProductWithComposition: " . $this->db->error);
        }
        $product['ingredients'] = $ingredientIds;
        return $product;
    }

public function updateProduct($idprodotto, $nome, $prezzo, $idcategoria, $imageFilenameForDb = null, $disponibilita = null) {
        if ($imageFilenameForDb && $disponibilita !== null) {
            $sql = "UPDATE prodotti SET nome = ?, prezzo = ?, idcategoria = ?, image = ?, disponibilita = ? WHERE idprodotto = ?";
            $stmt = $this->db->prepare($sql);
            if (!$stmt) {
                error_log("Errore preparazione statement (con immagine e disponibilità) in updateProduct: " . $this->db->error);
                return false;
            }
            // CORRETTO: nome(s), prezzo(d), idcategoria(i), image(s), disponibilita(i), idprodotto(i)
            $stmt->bind_param('sdisii', $nome, $prezzo, $idcategoria, $imageFilenameForDb, $disponibilita, $idprodotto);
        } else if ($imageFilenameForDb) {
            $sql = "UPDATE prodotti SET nome = ?, prezzo = ?, idcategoria = ?, image = ? WHERE idprodotto = ?";
            $stmt = $this->db->prepare($sql);
            if (!$stmt) {
                error_log("Errore preparazione statement (con immagine) in updateProduct: " . $this->db->error);
                return false;
            }
            // CORRETTO: nome(s), prezzo(d), idcategoria(i), image(s), idprodotto(i)
            $stmt->bind_param('sdisi', $nome, $prezzo, $idcategoria, $imageFilenameForDb, $idprodotto);
        } else if ($disponibilita !== null) {
            $sql = "UPDATE prodotti SET nome = ?, prezzo = ?, idcategoria = ?, disponibilita = ? WHERE idprodotto = ?";
            $stmt = $this->db->prepare($sql);
            if (!$stmt) {
                error_log("Errore preparazione statement (con disponibilità) in updateProduct: " . $this->db->error);
                return false;
            }
            // CORRETTO: nome(s), prezzo(d), idcategoria(i), disponibilita(i), idprodotto(i)
            $stmt->bind_param('sdiii', $nome, $prezzo, $idcategoria, $disponibilita, $idprodotto);
        } else {
            $sql = "UPDATE prodotti SET nome = ?, prezzo = ?, idcategoria = ? WHERE idprodotto = ?";
            $stmt = $this->db->prepare($sql);
            if (!$stmt) {
                error_log("Errore preparazione statement (senza immagine) in updateProduct: " . $this->db->error);
                return false;
            }
            // CORRETTO: nome(s), prezzo(d), idcategoria(i), idprodotto(i)
            $stmt->bind_param('sdii', $nome, $prezzo, $idcategoria, $idprodotto);
        }
        $success = $stmt->execute();
        if (!$success) {
            error_log("Errore esecuzione statement in updateProduct: " . $stmt->error);
        }
        $stmt->close();
        return $success;
    }
    
    /**
     * Rimuove tutte le associazioni di ingredienti per un dato prodotto.
     * @param int $idprodotto L'ID del prodotto.
     * @return bool True se l'operazione ha avuto successo, false altrimenti.
     */
    public function deleteProductCompositions($idprodotto) {
        $sql = "DELETE FROM composizioni WHERE idprodotto = ?";
        $stmt = $this->db->prepare($sql);
        if (!$stmt) {
            error_log("Errore preparazione statement in deleteProductCompositions: " . $this->db->error);
            return false;
        }
        $stmt->bind_param('i', $idprodotto);
        $success = $stmt->execute();
        if (!$success) {
            error_log("Errore esecuzione statement in deleteProductCompositions: " . $stmt->error);
        }
        $stmt->close();
        return $success;
    }

    /**
     * Rimuove un prodotto dalla tabella prodotti.
     * ATTENZIONE: Chiamare questo metodo solo dopo aver gestito le dipendenze
     * (es. cancellando da composizioni, personalizzazioni, ecc.) se non si usa ON DELETE CASCADE.
     * @param int $idprodotto L'ID del prodotto da eliminare.
     * @return bool True se l'eliminazione ha avuto successo, false altrimenti.
     */
    public function deleteProduct($idprodotto) {
        $sql = "UPDATE prodotti SET eliminato = 1 WHERE idprodotto = ?";
        $stmt = $this->db->prepare($sql);
        if (!$stmt) {
            error_log("Errore preparazione statement in softDeleteProduct: " . $this->db->error);
            return false;
        }
        $stmt->bind_param('i', $idprodotto);
        $success = $stmt->execute();
        if (!$success) {
            error_log("Errore esecuzione statement in softDeleteProduct: " . $stmt->error);
        }
        $stmt->close();
        return $success;
    }

    /**
     * Recupera l'ID della categoria "Panini".
     * @return int|null L'ID della categoria o null se non trovata.
     */
    public function getPaniniCategoryId() {
        $query = "SELECT idcategoria FROM categorie WHERE LOWER(descrizione) = 'panini' LIMIT 1";
        $stmt = $this->db->prepare($query);
        if ($stmt) {
            $stmt->execute();
            $result = $stmt->get_result();
            if ($row = $result->fetch_assoc()) {
                $stmt->close();
                return intval($row['idcategoria']);
            }
            $stmt->close();
            error_log("Categoria 'panini' non trovata nel database.");
        } else {
            error_log("Errore preparazione statement in getPaniniCategoryId: " . $this->db->error);
        }
        return null;
    }

    /**
     * Recupera il nome del file immagine di un prodotto.
     * @param int $productId L'ID del prodotto.
     * @return string|null Il nome del file immagine o null se non trovato/non impostato.
     */
    public function getProductImageFilename($productId) {
        $query = "SELECT image FROM prodotti WHERE idprodotto = ? LIMIT 1";
        $stmt = $this->db->prepare($query);
        if ($stmt) {
            $stmt->bind_param('i', $productId);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($row = $result->fetch_assoc()) {
                $stmt->close();
                return $row['image'];
            }
            $stmt->close();
        } else {
            error_log("Errore preparazione statement in getProductImageFilename: " . $this->db->error);
        }
        return null;
    }

    public function advanceOrderStatus($orderId) {
        $currentStatusQuery = "SELECT MAX(idstato) AS current_max_idstato FROM modifiche_stato WHERE idordine = ? AND idstato != " . ID_STATO_ANNULLATO_PER_STOCK; // Assicurati che ID_STATO_ANNULLATO_PER_STOCK sia definito
        $stmtStatus = $this->db->prepare($currentStatusQuery);
        if (!$stmtStatus) {
            error_log("Errore preparazione currentStatusQuery in advanceOrderStatus: " . $this->db->error);
            return false;
        }
        $stmtStatus->bind_param('i', $orderId);
        $stmtStatus->execute();
        $resultStatus = $stmtStatus->get_result();
        $rowStatus = $resultStatus->fetch_assoc();
        $stmtStatus->close();
        
        $current_max_idstato = ($rowStatus && $rowStatus['current_max_idstato'] !== null) ? (int)$rowStatus['current_max_idstato'] : 0;
        
        // Se lo stato corrente è 0 (nessuno stato precedente valido escluso annullato), il prossimo è 1 (In Attesa).
        // Altrimenti, è lo stato massimo corrente + 1.
        $nextStatusId = ($current_max_idstato == 0 && !$this->hasAnyStatusOtherThanCancelled($orderId, ID_STATO_ANNULLATO_PER_STOCK)) ? 1 : $current_max_idstato + 1;


        $checkStateExistsQuery = "SELECT 1 FROM stati_ordine WHERE idstato = ?";
        $stmtCheck = $this->db->prepare($checkStateExistsQuery);
         if (!$stmtCheck) {
            error_log("Errore preparazione checkStateExistsQuery in advanceOrderStatus: " . $this->db->error);
            return false;
        }
        $stmtCheck->bind_param('i', $nextStatusId);
        $stmtCheck->execute();
        $stmtCheck->store_result();
        $stateExists = $stmtCheck->num_rows > 0;
        $stmtCheck->close();

        if (!$stateExists) {
             // Non c'è un prossimo stato valido definito nella tabella stati_ordine
             // (es. si è provato ad andare oltre "Confermato")
            return false; // Indica che non c'è stato un avanzamento o che lo stato non è valido.
        }

        $insertQuery = "INSERT INTO modifiche_stato (idordine, idstato, timestamp_modifica) VALUES (?, ?, NOW())";
        $stmt = $this->db->prepare($insertQuery);

        if (!$stmt) {
            error_log("Errore preparazione statement (insertQuery) in advanceOrderStatus per ordine ID $orderId: " . $this->db->error);
            return false;
        }

        $stmt->bind_param('ii', $orderId, $nextStatusId);

        try {
            $success = $stmt->execute();
            $affectedRows = $stmt->affected_rows;
            $stmt->close();
            return $success && $affectedRows > 0;
        } catch (mysqli_sql_exception $e) {
            $stmt->close();
            // Controlla specificamente l'SQLSTATE che il trigger dovrebbe usare per SIGNAL
            if ($e->getSqlState() === MYSQL_SIGNAL_USER_EXCEPTION_SQLSTATE) { // MYSQL_SIGNAL_USER_EXCEPTION_SQLSTATE deve essere '45000'
                throw new StockUnavailableException("Stock insufficiente rilevato dal database: " . $e->getMessage(), $e->getCode(), $e);
            }
            error_log("SQL Exception in advanceOrderStatus for order ID $orderId: " . $e->getMessage() . " (Code: " . $e->getCode() . ", SQLSTATE: " . $e->getSqlState() . ")");
            throw $e; // Rilancia altre eccezioni SQL
        }
    }

    // Funzione helper per advanceOrderStatus per determinare se l'ordine ha solo stati "annullato" o nessuno stato
    private function hasAnyStatusOtherThanCancelled($orderId, $idStatoAnnullato) {
        $query = "SELECT 1 FROM modifiche_stato WHERE idordine = ? AND idstato != ? LIMIT 1";
        $stmt = $this->db->prepare($query);
        if (!$stmt) return true; // Assume there might be other states if query fails, to be safe
        $stmt->bind_param('ii', $orderId, $idStatoAnnullato);
        $stmt->execute();
        $stmt->store_result();
        $hasOtherStatus = $stmt->num_rows > 0;
        $stmt->close();
        return $hasOtherStatus;
    }


    public function setOrderStatus($orderId, $statusId) {
        $query = "INSERT INTO modifiche_stato (idordine, idstato, timestamp_modifica) VALUES (?, ?, NOW())";
        $stmt = $this->db->prepare($query);
        if (!$stmt) {
            error_log("Errore preparazione statement setOrderStatus: " . $this->db->error);
            return false;
        }
        $stmt->bind_param('ii', $orderId, $statusId);
        $success = $stmt->execute();
        if (!$success) {
            error_log("Errore esecuzione statement setOrderStatus: " . $stmt->error);
        }
        $stmt->close();
        return $success;
    }

    public function getOrderCurrentStatusInfo($idordine) {
        $query = "SELECT ms.idstato, so.descrizione
                  FROM modifiche_stato ms
                  JOIN stati_ordine so ON ms.idstato = so.idstato
                  WHERE ms.idordine = ?
                  ORDER BY ms.timestamp_modifica DESC
                  LIMIT 1";
        $stmt = $this->db->prepare($query);
        if (!$stmt) {
            error_log("Errore preparazione statement getOrderCurrentStatusInfo: " . $this->db->error);
            return null;
        }
        $stmt->bind_param('i', $idordine);
        $stmt->execute();
        $result = $stmt->get_result();
        $statusInfo = $result->fetch_assoc();
        $stmt->close();
        return $statusInfo;
    }
    
    public function getStatusInfoById($statusId) {
         $query = "SELECT idstato, descrizione FROM stati_ordine WHERE idstato = ?";
         $stmt = $this->db->prepare($query);
         if (!$stmt) {
            error_log("Errore preparazione statement getStatusInfoById: " . $this->db->error);
            return null;
         }
         $stmt->bind_param('i', $statusId);
         $stmt->execute();
         $result = $stmt->get_result();
         $statusData = $result->fetch_assoc();
         $stmt->close();
         return $statusData;
    }
}