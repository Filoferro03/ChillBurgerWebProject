<?php
require_once "bootstrap.php";

$templateParams = [
    "titolo" => "ChillBurger – Manager",
    "nome"   => "template/manager_main.php",
    "css"    => [
        "css/style.css",
        "css/manager_style.css"
    ],
    "js"     => [""]
];

require "template/base.php";
?>