<?php

require("../bootstrap.php");

$result = [];

if (isset($_POST['action']) && isset($_POST["idnotification"])) {
    if ($_POST['action'] == 'readnotification') {
        $dbh->readNotification($_POST["idnotification"]);
    } else if ($_POST['action'] == 'deletenotification') {
        $dbh->deleteNotification($_POST["idnotification"]);
    }
}

$notifications = $dbh->getNotificationsByUserId($_SESSION["idutente"]);
$result = $notifications;

header("Content-Type: application/json");
echo json_encode($result);
