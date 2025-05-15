<?php
require_once "bootstrap.php";

$templateParams["nome"] = "template/menu-main.php";
$templateParams["titolo"] = "ChillBurger - Menu";
$templateParams["js"] = array("js/menu.js");
$templateParams["css"] = array("css/style.css", "css/menu_style.css", "css/order_now_style.css");

require "template/base.php";
