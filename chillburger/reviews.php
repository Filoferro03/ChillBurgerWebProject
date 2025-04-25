<?php
require_once("bootstrap.php");

$templateParams["titolo"] = "ChillBurger - Recensioni";
$templateParams["nome"] = "reviews-list.php";
$templateParams["css"] = array("css/reviews.css");
$templateParams["js"] = array("js/reviews.js");

require("template/base.php")
?>