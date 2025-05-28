<?php
require_once "bootstrap.php";

$templateParams = [
    "titolo" => "ChillBurger – Manager_Stock",
    "nome"   => "template/manager_stock_main.php",
    "css"    => [
        "css/style.css",
        "css/manager_stock.css",
    ],
    "js"     => ["js/manager_stock.js"]
];


require "template/base.php";
