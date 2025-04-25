<?php
require_once "bootstrap.php";

$templateParams = [
    "titolo" => "ChillBurger – Orer_now",
    "nome"   => "template/order_now_main.php",
    "css"    => [
        "css/style.css",
        "css/menu_style.css",
        "css/order_now_style.css"
    ],
    "js"     => ["js/menu_filter.js"]
];

require "template/base.php";
?>