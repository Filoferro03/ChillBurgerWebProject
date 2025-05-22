<?php
require_once("bootstrap.php");

$templateParams["titolo"] = "ChillBurger - Checkout";
$templateParams["nome"] = "payment.php";
$templateParams["css"] = array("css/order-details.css");
$templateParams["js"] = array("js/checkout.js");

require("template/base.php")
?>