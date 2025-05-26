<?php
require_once("bootstrap.php");

if (isUserLoggedIn()) {

    if (isUserClient()) {
        $templateParams["nome"] = "template/homepage.php";
        $templateParams["titolo"] = "ChillBurger - HomePage";
    } else {
        $templateParams["nome"] = "template/manager_main.php";
        $templateParams["titolo"] =  "ChillBurger - Manager";
        $templateParams["css"] = array("css/style.css", "css/manager_style.css");
        $templateParams["js"] = array("");
    }
} else {
    $templateParams["nome"] = "template/login-form.php";
    $templateParams["titolo"] = "ChillBurger - Login";
    $templateParams["js"] = array("js/login.js");
}



require("template/base.php");
?>
