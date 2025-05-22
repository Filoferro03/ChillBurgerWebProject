<?php
require_once "bootstrap.php";

$templateParams = [
    "titolo" => "ChillBurger – Order_now",
    "nome"   => "template/order_now_main.php",
    "css"    => [
        "css/style.css",
        "css/menu_style.css",
        "css/order_now_style.css"
    ],
    "js"     => [
        "js/menu_filter.js",
        "js/order_now.js"
    ]
];

require "template/base.php";
