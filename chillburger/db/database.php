<?php
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
        $query = "SELECT titolo, voto, commento, timestamp_recensione
                  FROM chillburgerdb.recensioni 
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
                    o.timestamp_ordine,
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
                  ORDER BY o.timestamp_ordine DESC
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

    public function getNotificationsByUserId($idutente)
    {
        try {
            $query = "SELECT * FROM notifiche WHERE idutente = ?";

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
        SELECT i.idingrediente, i.nome, i.sovrapprezzo, i.giacenza, i.image, c.quantita
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
        $query = "SELECT * FROM prodotti";
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
                               pe.prezzo, pe.quantita, 
                               i.nome AS nomeingrediente, m.azione
                        FROM ordini o
                        JOIN personalizzazioni pe ON o.idordine = pe.idordine
                        JOIN modifiche_ingredienti m ON pe.idpersonalizzazione = m.idpersonalizzazione
                        JOIN ingredienti i ON m.idingrediente = i.idingrediente
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
        $queryStock = "SELECT p.nome, p.prezzo, cp.quantita, p.idcategoria
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

        // Calcolo del prezzo totale corretto
        $processed_personalizations = []; // Per tenere traccia degli idpersonalizzazione già sommati

        if (!empty($orderCustom)) { // Verifica che $orderCustom non sia vuoto
            foreach ($orderCustom as $item) {
                // Assicurati che gli indici esistano
                if (isset($item['idpersonalizzazione'], $item['prezzo'], $item['quantita'])) {
                    if (!in_array($item['idpersonalizzazione'], $processed_personalizations)) {
                        $totalPrice += floatval($item['prezzo']) * intval($item['quantita']);
                        $processed_personalizations[] = $item['idpersonalizzazione'];
                    }
                }
            }
        }

        if (!empty($orderStock)) { // Verifica che $orderStock non sia vuoto
            foreach ($orderStock as $item) {
                // Assicurati che gli indici esistano
                if (isset($item['prezzo'], $item['quantita'])) {
                    $totalPrice += floatval($item['prezzo']) * intval($item['quantita']);
                }
            }
        }

        return [
            'orderCustom' => $orderCustom,
            'orderStock' => $orderStock,
            'totalPrice' => $totalPrice
        ];
    }

    public function updateStatusToConfirmed($orderId) { 
        $insertQuery = "INSERT INTO modifiche_stato (idordine, idstato)
                    VALUES (?, (SELECT idstato FROM stati_ordine WHERE descrizione = 'Confermato'))";
        $stmt = $this->db->prepare($insertQuery);

        if (!$stmt) {
            error_log("Errore preparazione statement (insertQuery) in updateStatusToConfirmed per ordine ID $orderId: " . $this->db->error);
            return false;
        }

        $stmt->bind_param('i', $orderId);

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

    public function removeProductFromCart($idprodotto, $idordine)
    {
        $query = "DELETE FROM carrelli_prodotti WHERE idprodotto = ? AND idordine = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("ii", $idprodotto, $idordine);
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

    public function getPersonalizationWithModifications($idprodotto, $idordine)
    {
        $query = "
            SELECT p.*, m.idingrediente, m.azione
            FROM personalizzazioni p
            LEFT JOIN modifiche_ingredienti m ON p.idpersonalizzazione = m.idpersonalizzazione
            WHERE p.idprodotto = ? AND p.idordine = ?
        ";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("ii", $idprodotto, $idordine);
        $stmt->execute();
        $result = $stmt->get_result();

        $data = [];
        while ($row = $result->fetch_all(MYSQLI_ASSOC)) {
            $data[] = $row;
        }
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
}
