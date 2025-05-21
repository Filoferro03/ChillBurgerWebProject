<?php
require_once '../bootstrap.php';

$response = [];

if (isset($_POST['action']) && $_POST['action'] === 'submit') {
    $idutente = $_SESSION['idutente'];
    $idordine = isset($_POST['idordine']) ? (int)$_POST['idordine'] : null;
    $titolo = isset($_POST['review_title']) ? trim($_POST['review_title']) : null;
    $voto = isset($_POST['review_rating']) ? (int)$_POST['review_rating'] : null;
    $commento = isset($_POST['review_comment']) ? trim($_POST['review_comment']) : ''; // Comment can be empty

    if (!$idordine) {
            $response['error'] = 'ID ordine mancante.';
    } elseif (!$titolo) {
            $response['error'] = 'Titolo della recensione mancante.';
    } elseif ($voto === null || $voto < 1 || $voto > 5) {
            $response['error'] = 'Voto non valido. Deve essere tra 1 e 5.';
   } else {
        // Check if a review for this order already exists
        if ($dbh->hasReviewForOrder($idordine)) {
            $response['error'] = 'Una recensione per questo ordine è già stata inviata.';
        } else {
            $insertSuccess = $dbh->insertReview($idordine, $titolo, $voto, $commento, $idutente);

            if ($insertSuccess) {
                $response['success'] = true;
                unset($response['error']); 
            } else {
                $response['error'] = 'Errore durante il salvataggio della recensione nel database.';
            }
        }
    }
} else if (isset($_POST['action']) && $_POST['action'] === 'getall') {
    // Ottieni il parametro page dalla richiesta GET, default a 1 se non specificato
    $page = isset($_POST['page']) ? (int)$_POST['page'] : 1;

    // Assicurati che page sia almeno 1
    if ($page < 1) {
        $page = 1;
    }

    $reviews = $dbh->getReviews($page);

    $response['data'] = $reviews;
    $response['success'] = true;

} else if(isset($_POST['action']) && $_POST['action'] == "getbyorder") {
    $idOrdine = isset($_POST['idordine']) ? intval($_POST['idordine']) : null;

    $review = $dbh->getReviewByOrder($idOrdine);

    if ($review !== null && !empty($review)) {
        $response['data'] = $review;
        $response['success'] = true;
    } else {
        $response['error'] = 'Recensione non trovata';
        $response['success'] = false;
    }
} else if (isset($_POST['action']) && $_POST['action'] == "delete") {
    $idordine = isset($_POST['idordine']) ? (int)$_POST['idordine'] : null;
    $response['success'] = $dbh->deleteReview($idordine);
}
else if (isset($_POST['action']) && $_POST['action'] === 'update') {
    $idordine = isset($_POST['idordine']) ? (int)$_POST['idordine'] : null;
    $titolo = isset($_POST['review_title']) ? trim($_POST['review_title']) : null;
    $voto = isset($_POST['review_rating']) ? (int)$_POST['review_rating'] : null;
    $commento = isset($_POST['review_comment']) ? trim($_POST['review_comment']) : ''; // Comment can be empty

    if (!$idordine) {
            $response['error'] = 'ID ordine mancante.';
    } elseif (!$titolo) {
            $response['error'] = 'Titolo della recensione mancante.';
    } elseif ($voto === null || $voto < 1 || $voto > 5) {
            $response['error'] = 'Voto non valido. Deve essere tra 1 e 5.';
   } else {
        $insertSuccess = $dbh->updateReview($idordine, $titolo, $voto, $commento);

        if ($insertSuccess) {
            $response['success'] = true;
            unset($response['error']); 
        } else {
            $response['error'] = 'Errore durante il salvataggio della recensione nel database.';
        }
    }
}

else {
    $response['error'] = 'Azione non valida o parametri mancanti.';
    $response['success'] = false;
}



header('Content-Type: application/json');
echo json_encode($response);
?>