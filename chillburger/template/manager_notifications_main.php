<?php
require_once __DIR__ . '/../db/database.php';
session_start();

$managerId = $_SESSION['idutente'] ?? 0;
?>

<section class="container py-5">
    <h2 class="display-4 text-center mb-4">
        Notifiche <span aria-hidden="true">🔔</span>
    </h2>

<?php
if (!$managerId) {
    echo '<p class="text-center">Devi essere loggato per vedere le notifiche.</p>';
    echo '</section>';   // chiude il <section>
    return;              // stop qui: niente query, niente lista
}

/* --- se arrivi qui sei loggato --- */
$stmt = $pdo->prepare("
    SELECT idnotifica, titolo, testo, vista, tipo, timestamp_notifica
    FROM notifiche
    WHERE idutente = :uid
    ORDER BY timestamp_notifica DESC
    LIMIT 100
");
$stmt->execute(['uid' => $managerId]);
$notifiche = $stmt->fetchAll();
?>


<section class="container py-5">
    <h2 class="display-4 text-center mb-4">
        Notifiche <span aria-hidden="true">🔔</span>
    </h2>

    <?php if (!$notifiche): ?>
        <p class="text-center">Nessuna notifica presente.</p>
    <?php else: ?>
        <ul class="notification-list list-group">
            <?php foreach ($notifiche as $n): ?>
                <li class="notification list-group-item d-flex align-items-start gap-3 <?= $n['vista'] ? '' : 'unread' ?>">
                    <!-- Icona -->
                    <span class="icon" aria-hidden="true">🔔</span>

                    <div class="flex-grow-1">
                        <div class="meta mb-1">
                            <?= htmlspecialchars(date('d/m/Y H:i', strtotime($n['timestamp_notifica']))) ?>
                            · <?= htmlspecialchars(ucfirst($n['tipo'])) ?>
                        </div>
                        <p class="text mb-0"><?= htmlspecialchars($n['titolo']) ?></p>
                        <small class="text-muted"><?= htmlspecialchars($n['testo']) ?></small>
                    </div>

                    <div class="actions d-flex flex-column gap-2">
                        <!-- toggle letto/non letto -->
                        <form method="post" action="/api/api-notifications.php" class="js-toggle">
                            <input type="hidden" name="notification_id" value="<?= $n['idnotifica'] ?>">
                            <input type="hidden" name="action" value="toggle">
                            <button title="Segna come <?= $n['vista'] ? 'non letta' : 'letta' ?>">✔</button>
                        </form>
                        <!-- elimina -->
                        <form method="post" action="/api/api-notifications.php" class="js-delete">
                            <input type="hidden" name="notification_id" value="<?= $n['idnotifica'] ?>">
                            <input type="hidden" name="action" value="delete">
                            <button title="Elimina">✖</button>
                        </form>
                    </div>
                </li>
            <?php endforeach; ?>
        </ul>
    <?php endif; ?>
</section>