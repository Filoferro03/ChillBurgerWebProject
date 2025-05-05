<?php
require("../bootstrap.php");

$result = [];

$ingredients = $dbh->getIngredientsByProduct(1);

for ($i = 0; $i < count($ingredients); $i++) {
    $ingredients[$i]["image"] = RESOURCES_DIR . "ingredients/" . $ingredients[$i]["image"];
}

$result = $ingredients;

header("Content-Type: application/json");
echo json_encode($result);
