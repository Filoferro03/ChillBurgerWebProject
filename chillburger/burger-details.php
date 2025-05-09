<?php

require_once("bootstrap.php");

$templateParams["titolo"] = "Dettagli Panino";
$templateParams["nome"] = "template/burger-details.php";
$templateParams["js"] = array("js/burger-details.js");

if (isset($_GET["id"])) {
    $product = $dbh->getBurgerWithIngredients($_GET["id"]);
}

require("template/base.php");
