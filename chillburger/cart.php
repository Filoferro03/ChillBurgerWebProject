<?php

require_once("bootstrap.php");

$templateParams["titolo"] = "Carrello";
$templateParams["nome"] = "template/cart-view.php";
$templateParams["js"] = array("js/cart.js");

require("template/base.php");
