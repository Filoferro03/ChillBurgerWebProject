<?php
require_once("bootstrap.php");

if (isUserLoggedIn()) {

    $templateParams["nome"] = "template/homepage.php";
    $templateParams["titolo"] = "ChillBurger - HomePage";
} else {
    $templateParams["nome"] = "template/login-form.php";
    $templateParams["titolo"] = "ChillBurger - Login";
    $templateParams["js"] = array("js/login.js");
}



require("template/base.php");
