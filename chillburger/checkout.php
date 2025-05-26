<?php
require_once("bootstrap.php");

$templateParams["titolo"] = "ChillBurger - Checkout";
$templateParams["nome"] = "payment.php";
$templateParams["js"] = array("js/checkout.js");

require("template/base.php")
?>