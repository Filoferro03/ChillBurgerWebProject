<?php
require_once "bootstrap.php";

$templateParams = [
    "titolo" => "ChillBurger – Manager Menu",
    "nome"   => "template/manager_menu_main.php",
    "css"    => [
        "css/style.css",
        "css/manager_menu_style.css",
        "css/menu_style.css",
    ],
    "js" => ["js/manager_menu.js"]
];

require "template/base.php";
