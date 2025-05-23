<?php
require_once "bootstrap.php";

if (!isUserLoggedIn()) {
    header("Location: login.php");
    exit();
}

$templateParams = [
    "titolo" => "ChillBurger – Order_now",
    "nome"   => "template/order_now_main.php",
    "css"    => [
        "css/style.css",
        "css/menu_style.css",
        "css/order_now_style.css"
    ],
    "js"     => [
        "js/order_now.js"
    ]
];

require "template/base.php";
