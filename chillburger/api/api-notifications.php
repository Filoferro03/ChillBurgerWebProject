<?php
require("../bootstrap.php");

$result = [];

$notifications = $dbh->getNotificationsByUserId($_SESSION["idutente"]);
$result = $notifications;


header("Content-Type: application/json");
echo json_encode($result);
