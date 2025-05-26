<?php

require_once("bootstrap.php");

$templateParams["titolo"] = "ChillBurger – Manager_Notifications";
$templateParams["nome"] = "template/manager_notifications_main.php";
$templateParams["css"] = array("css/style.css", "css/manager_style.css");
$templateParams["js"] = array("js/manager_notifications.js");

require("template/base.php");
