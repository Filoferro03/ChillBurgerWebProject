<?php

require_once("bootstrap.php");

$templateParams["titolo"] = "Modifica Burger";
$templateParams["nome"] = "template/edit-burger.php";
$templateParams["js"] = array("js/edit-burger.js");

require("template/base.php");
