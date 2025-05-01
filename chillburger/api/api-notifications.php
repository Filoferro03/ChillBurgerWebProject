<?php
require("../bootstrap.php");

$result = [];

//MODIFICA IN UTILS IN MANIERA CHE IN SESSION HAI ANCHE IDUTENTE
$notifications = $dbh->getNotificationsByUserId($_SESSION["idutente"]);
$result = $notifications;


header("Content-Type: application/json");
echo json_encode($result);
