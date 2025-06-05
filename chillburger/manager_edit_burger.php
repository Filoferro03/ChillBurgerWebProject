<?php
require_once "bootstrap.php";

$templateParams = [
    "titolo" => "ChillBurger – Manager Edit Burger",
    "nome"   => "template/manager_edit_burger_main.php",
    "css"    => [
        "css/style.css",
    ],
    "js" => ["js/manager_edit_burger.js"]
];

require "template/base.php";
