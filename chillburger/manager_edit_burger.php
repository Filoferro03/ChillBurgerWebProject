<?php
require_once "bootstrap.php";

$templateParams = [
    "titolo" => "ChillBurger – Manager Edit Burger",
    "nome"   => "template/manager-edit-burger-main.php",
    "css"    => [
        "css/style.css",
    ],
    "js" => ["js/manager-edit-burger.js"]
];

require "template/base.php";
