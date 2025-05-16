<?php
require("../bootstrap.php");

$result = [];

$products = $dbh->getAllProducts();
$categories = $dbh->getAllCategories();


for ($i = 0; $i < count($products); $i++) {
    $products[$i]["image"] = RESOURCES_DIR . "products/" . $products[$i]["image"];
}

$result = [
    "products" => $products,
    "categories" => $categories
];

header("Content-Type: application/json");
echo json_encode($result);
