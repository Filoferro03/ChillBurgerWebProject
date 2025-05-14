<?php
require_once("../bootstrap.php");
$result = [];
if ($_POST["action"] == "getProducts") {
    //get all products
} else if ($_POST["action"] == "addProducts") {
    //add a product to the cart
} else if ($_POST["action"] == "removeProd") {
    //removed a product from the cart
}
header("Content-type: application/json");
echo json_encode($result);
