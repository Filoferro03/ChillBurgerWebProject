<?php
require("../bootstrap.php");

$result = [];

$products = $dbh->getAllProducts();


for ($i = 0; $i < count($products); $i++) {
    $products[$i]["image"] = RESOURCES_DIR . "products/" . $products[$i]["image"];
}

$result = [
    "products" => $products
];

header("Content-Type: application/json");
echo json_encode($result);
