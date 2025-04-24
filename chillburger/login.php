<?php
require_once("bootstrap.php");

$templateParams["nome"] = "template/login-form.php";
$templateParams["titolo"] = "ChillBurger - Login";
$templateParams["js"] = array("js/login.js");

require("template/base.php");
