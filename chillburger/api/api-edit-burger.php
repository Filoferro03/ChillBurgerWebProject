<?php
require("../bootstrap.php");

$result = [];

$ingredients = $dbh->getIngredientsByProduct(1);
$product = $dbh->getProduct(1);

for ($i = 0; $i < count($ingredients); $i++) {
    $ingredients[$i]["image"] = RESOURCES_DIR . "ingredients/" . $ingredients[$i]["image"];
}

$result = [
    "ingredients" => $ingredients,
    "product" => $product
];

header("Content-Type: application/json");
echo json_encode($result);

/*<?php
require("../bootstrap.php");

$result = [];

if (isset($_POST['action']) && $_POST['action'] === 'addQuantity' && isset($_POST["idingrediente"])) {
    $update = $dbh->addQuantity($_POST["idingrediente"]);
    $result = $update;

} else if (isset($_POST['action']) && $_POST['action'] === 'subtractQuantity' && isset($_POST["idingrediente"])) {
    $update = $dbh->subtractQuantity($_POST["idingrediente"]);
    $result = $update;

} else {
    
    $ingredients = $dbh->getIngredientsByProduct(1);
    $product = $dbh->getProduct(1);

    for ($i = 0; $i < count($ingredients); $i++) {
        $ingredients[$i]["image"] = RESOURCES_DIR . "ingredients/" . $ingredients[$i]["image"];
    }

    $result = [
        "ingredients" => $ingredients,
        "product" => $product
    ];
}

header("Content-Type: application/json");
echo json_encode($result);
 */
