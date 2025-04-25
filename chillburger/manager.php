<?php
require_once "bootstrap.php";

$templateParams = [
    "titolo" => "ChillBurger – Manager",
    "nome"   => "template/manager_main.php",
    "css"    => [
        "css/style.css",
        "css/about_us_style.css"
    ],
    "js"     => [""]
];

require "template/base.php";
?>