<?php

require_once("bootstrap.php");

$templateParams["titolo"] = "ChillBurger – Notifiche Manager";
$templateParams["nome"] = "template/manager_notifications_main.php";
$templateParams["css"] = array("css/manager_style.css");
$templateParams["js"] = array("js/manager_notifications.js");

require("template/base.php");
