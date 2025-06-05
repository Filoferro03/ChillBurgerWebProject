<?php

/**
 *  /api/api-notifications.php
 *  GET         → restituisce le notifiche del manager in JSON
 *  POST toggle → inverte il flag vista
 *  POST delete → elimina la notifica
 */
require_once __DIR__ . '../bootstrap.php';
session_start();

/* -------------------------------------------------------------
 * 1) QUAL È IL MANAGER LOGGATO?
 *    Salviamo in sessione sia idutente che username al login.
 *    Se nel vostro login avete solo 'user_id', cambiate di conseguenza.
 * ------------------------------------------------------------*/
$managerId = $_SESSION['idutente'] ?? 0;
if (!$managerId) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Non autenticato']);
    exit;
}

/* -------------------------------------------------------------
 * 2) METODI
 * ------------------------------------------------------------*/
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    /* --- LISTA NOTIFICHE ------------------------------------ */
    $stmt = $pdo->prepare("
        SELECT idnotifica, titolo, testo, vista, tipo, timestamp_notifica
        FROM notifiche
        WHERE idutente = :uid
        ORDER BY timestamp_notifica DESC
        LIMIT 100
    ");
    $stmt->execute(['uid' => $managerId]);

    echo json_encode([
        'success' => true,
        'data'    => $stmt->fetchAll(),
    ]);
    exit;
}

if ($method === 'POST') {
    $id      = $_POST['notification_id'] ?? 0;
    $action  = $_POST['action']          ?? '';

    if (!$id || !in_array($action, ['toggle', 'delete'], true)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Parametri mancanti']);
        exit;
    }

    try {
        if ($action === 'toggle') {
            $pdo->prepare("
                UPDATE notifiche
                SET vista = NOT vista
                WHERE idnotifica = ? AND idutente = ?
            ")->execute([$id, $managerId]);
        }

        if ($action === 'delete') {
            $pdo->prepare("
                DELETE FROM notifiche
                WHERE idnotifica = ? AND idutente = ?
            ")->execute([$id, $managerId]);
        }

        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

/* --- Metodi non permessi ---------------------------------- */
http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Metodo non consentito']);
