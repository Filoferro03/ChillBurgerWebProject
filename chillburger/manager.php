<?php
require_once "bootstrap.php";

$templateParams = [
    "titolo" => "ChillBurger – Manager",
    "nome"   => "template/manager_main.php",
    "css"    => [
        "css/style.css",
        "css/manager_style.css"
    ],
    "js" => ["js/manager.js"]
];

require "template/base.php";
?>