<?php
require("bootstrap.php");

$result = [];

if (isset($_POST["idutente"]) && isset($_POST["idingrediente"]) && isset($_POST["nomeingrediente"])) {
    $result = $dbh->createLowStockIngredientNotification($_POST["idutente"], $_POST["idingrediente"], $_POST["nomeingrediente"]);
}


header("Content-Type: application/json");
echo json_encode($result);
