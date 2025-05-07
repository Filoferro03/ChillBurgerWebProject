<?php
require_once("bootstrap.php");

$templateParams["titolo"] = "ChillBurger - Profilo";
$templateParams["nome"] = "profile-orders.php";
$templateParams["js"] = array("js/profile.js");
$templateParams["css"] = array("css/profile.css");

require("template/base.php")
?>