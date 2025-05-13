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

    /**
     * Recupera una pagina specifica di ordini per un utente.
     * @param int $idutente L'idutente dell'utente.
     * @param int $page La pagina richiesta (inizia da 1).
     * @param int $perPage Quanti ordini per pagina.
     * @return array Ritorna un array con 'orders', 'currentPage', 'totalPages'.
     */
    public function getUserOrdersByUserPaginated($idutente, $page = 1, $perPage = 5) // Rinominato e parametri aggiunti
    {
        if ($page < 1) {
            $page = 1;
        }
        $offset = ($page - 1) * $perPage;

        // Query per contare il totale degli ordini dell'utente
        $countQuery = "SELECT COUNT(*) AS totalOrders FROM ordini WHERE idutente = ?";
        $countStmt = $this->db->prepare($countQuery);
        if (!$countStmt) {
            error_log("Errore preparazione count statement getUserOrdersByUserIdPaginated: " . $this->db->error);
            return ['orders' => [], 'currentPage' => $page, 'totalPages' => 0];
        }
        $countStmt->bind_param('i', $idutente);
        $countStmt->execute();
        $countResult = $countStmt->get_result();
        $totalOrders = $countResult->fetch_assoc()['totalOrders'];
        $countResult->free();
        $countStmt->close();

        $totalPages = ceil($totalOrders / $perPage);

        // Query per recuperare gli ordini paginati
        $query = "SELECT idordine, timestamp_ordine
                  FROM ordini
                  WHERE idutente = ?
                  ORDER BY timestamp_ordine DESC
                  LIMIT ? OFFSET ?";
        $stmt = $this->db->prepare($query);
        if (!$stmt) {
            error_log("Errore preparazione statement getUserOrdersByUserIdPaginated: " . $this->db->error);
            return ['orders' => [], 'currentPage' => $page, 'totalPages' => $totalPages];
        }
        // Nota: i tipi sono i, i, i (idutente, limit, offset)
        $stmt->bind_param('iii', $idutente, $perPage, $offset);
        $stmt->execute();
        $result = $stmt->get_result();
        $orders = $result->fetch_all(MYSQLI_ASSOC);
        $result->free();
        $stmt->close();

        return [
            'orders' => $orders ?: [],
            'currentPage' => $page,
            'totalPages' => $totalPages
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

    public function getIngredientsByProduct2($idprodotto)
    {
        $query = "
        SELECT i.idingrediente, i.nome, i.sovrapprezzo, i.giacenza, i.image, m.quantita
        FROM modifiche_ingredienti m
        INNER JOIN ingredienti i ON m.idingrediente = i.idingrediente
        WHERE m.idprodotto = ?
    ";

        $stmt = $this->db->prepare($query);
        $stmt->bind_param("i", $idprodotto);
        $stmt->execute();

        $result = $stmt->get_result();
        $ingredients = $result->fetch_all(MYSQLI_ASSOC);

        $stmt->close();
        return $ingredients;
    }

    /*quando dal carrello decidi di modificare hamburger del menu, crei una nuova istanza di personalizzazioni
     */
    public function createNewBurger($idprodotto, $idordine, $prezzo)
    {
        $query = "INSERT INTO personalizzazioni (prezzo ,quantita, idprodotto, idordine) VALUES (?, ?, ?, ?)";
        $stmt = $this->db->prepare($query);
        $quantita = 1;
        $stmt->bind_param('iiii', $prezzo, $quantita, $idprodotto, $idordine);
        $result = $stmt->get_result();
        $product = $result->fetch_all(MYSQLI_ASSOC);
        return $product;
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
        $query = "SELECT p.nome AS nomeprodotto, pe.prezzo, pe.quantita, i.nome AS nomeingrediente, m.azione
                  FROM ordini o, personalizzazioni pe, modifiche_ingredienti m, ingredienti i, prodotti p
                  WHERE o.idordine = ?
                  AND o.idordine = pe.idordine
                  AND pe.idpersonalizzazione = m.idpersonalizzazione
                  AND m.idingrediente = i.idingrediente
                  AND pe.idprodotto = p.idprodotto";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param('i', $idordine);
        $stmt->execute();
        $result = $stmt->get_result();
        $orderCustom = $result->fetch_all(MYSQLI_ASSOC);
        $result->free();
        $stmt->close();

        $query =    "SELECT p.nome, p.prezzo, c.quantita
                    FROM ordini o, carrelli_prodotti c, prodotti p
                    WHERE o.idordine = ?
                    AND o.idordine = c.idordine
                    AND c.idprodotto = p.idprodotto";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param('i', $idordine);
        $stmt->execute();
        $result = $stmt->get_result();
        $orderStock = $result->fetch_all(MYSQLI_ASSOC);
        $result->free();
        $stmt->close();
        return [
            'orderCustom' => $orderCustom,
            'orderStock' => $orderStock,
            'totalPrice' => calculateTotalPrice($orderCustom, $orderStock)
        ];
    }
}
