<?php
require("../bootstrap.php");
$result = [];

if (isset($_POST['action']) && $_POST['action'] == 'getAllProducts') {
    $products = $dbh->getAllProducts();

    for ($i = 0; $i < count($products); $i++) {
        $products[$i]['image'] = RESOURCES_DIR . "products/" . $products[$i]['image'];
    }

    $categories = $dbh->getAllCategories();
    $result = [
        'products' => $products,
        'categories' => $categories
    ];
}

header('Content-Type: application/json');
echo json_encode($result);
?>