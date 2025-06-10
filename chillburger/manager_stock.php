<?php
require_once "bootstrap.php";

$templateParams = [
    "titolo" => "ChillBurger – Magazzino Manager",
    "nome"   => "template/manager_stock_main.php",
    "css"    => [
        "css/style.css",
        "css/manager_stock_style.css",
        "css/manager_menu_style.css",
    ],
    "js"     => ["js/manager_stock.js"]
];


require "template/base.php";
