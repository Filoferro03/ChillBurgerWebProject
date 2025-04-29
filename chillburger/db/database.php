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
        $query = "SELECT username, nome, cognome, tipo FROM utenti WHERE username = ? AND password = ?";
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

    public function getReviews($page, $perPage = 5) {
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
        $query = "SELECT titolo, voto, commento, data, ora
                  FROM chillburgerdb.recensioni 
                  ORDER BY data DESC, ora DESC
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
        $query = "SELECT idutente, nome, cognome, username FROM utenti WHERE username = ?";
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
     * @param string $username L'username dell'utente.
     * @param int $page La pagina richiesta (inizia da 1).
     * @param int $perPage Quanti ordini per pagina.
     * @return array Ritorna un array con 'orders', 'currentPage', 'totalPages'.
     */
    public function getUserOrdersByUserPaginated($username, $page = 1, $perPage = 5) // Rinominato e parametri aggiunti
    {
        if ($page < 1) {
            $page = 1;
        }
        $offset = ($page - 1) * $perPage;

        // Query per contare il totale degli ordini dell'utente
        $countQuery = "SELECT COUNT(*) AS totalOrders FROM ordini o JOIN utenti u ON o.idutente = u.idutente
        WHERE username = ?";
        $countStmt = $this->db->prepare($countQuery);
        if (!$countStmt) {
            error_log("Errore preparazione count statement getUserOrdersByUserIdPaginated: " . $this->db->error);
            return ['orders' => [], 'currentPage' => $page, 'totalPages' => 0];
        }
        $countStmt->bind_param('s', $username);
        $countStmt->execute();
        $countResult = $countStmt->get_result();
        $totalOrders = $countResult->fetch_assoc()['totalOrders'];
        $countResult->free();
        $countStmt->close();

        $totalPages = ceil($totalOrders / $perPage);

        // Query per recuperare gli ordini paginati
        $query = "SELECT o.idordine, o.data, o.ora
                  FROM ordini o
                  JOIN utenti u ON o.idutente = u.idutente
                  WHERE u.username = ?
                  ORDER BY o.data DESC, o.ora DESC
                  LIMIT ? OFFSET ?";
        $stmt = $this->db->prepare($query);
        if (!$stmt) {
            error_log("Errore preparazione statement getUserOrdersByUserIdPaginated: " . $this->db->error);
            return ['orders' => [], 'currentPage' => $page, 'totalPages' => $totalPages];
        }
        // Nota: i tipi sono i, i, i (userId, limit, offset)
        $stmt->bind_param('sii', $username, $perPage, $offset);
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
}