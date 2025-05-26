<?php
require_once("bootstrap.php");

$templateParams["titolo"] = "ChillBurger - Riepilogo ordine";
$templateParams["nome"] = "order-details.php";
$templateParams["js"] = array("js/order-view.js");

require("template/base.php")
?>