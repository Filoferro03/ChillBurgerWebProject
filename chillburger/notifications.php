<?php

require_once("bootstrap.php");

$templateParams["titolo"] = "Notifiche";
$templateParams["nome"] = "template/notifications.php";
$templateParams["js"] = array("js/notifications.js");

require("template/base.php");
