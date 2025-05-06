<?php
require_once "bootstrap.php";

$templateParams["nome"] = "template/menu-main.php";
$templateParams["titolo"] = "ChillBurger - Menu";
$templateParams["js"] = array("js/menu.js");

require "template/base.php";
