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

// if (isset($_POST['action']) && $_POST['action'] == 'getingredients' && isset($_POST['idprodotto'])) {

//     $ingredients = $dbh->getIngredientsByProduct($_POST['idprodotto']);
//     $product = $dbh->getProduct($_POST['idprodotto']);

//     for ($i = 0; $i < count($ingredients); $i++) {
//         $ingredients[$i]["image"] = RESOURCES_DIR . "ingredients/" . $ingredients[$i]["image"];
//     }

//     $result = [
//         "ingredients" => $ingredients,
//         "product" => $product
//     ];
// } else if (isset($_POST['action']) && $_POST['action'] == 'createpersonalization' && isset($_POST['idprodotto']) && isset($_POST['prezzo']) && isset($_POST['idordine'])) {

//     $burger = $dbh->createEmptyPersonalization($_POST['idprodotto'], $_POST['prezzo'], $_POST['idordine']);
//     $result = ["idpanino" => $burger];
// } else if (isset($_POST['action']) && $_POST['action'] == 'modifyburger' && isset($_POST['idpersonalizzazione']) && isset($_POST['idingrediente']) && isset($_POST['quantita'])) {

//     $result = $dbh->createNewBurgerComposition($_POST['idpersonalizzazione'], $_POST['idingrediente'], $_POST['quantita']);
// } else {
//     $result = "Api Non e andata a buon fine";
// }



header("Content-Type: application/json");
echo json_encode($result);
