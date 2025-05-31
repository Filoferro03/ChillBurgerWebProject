<?php
require_once "bootstrap.php";

$templateParams = [
    "titolo" => "ChillBurger – Manager Menu",
    "nome"   => "template/manager_menu_main.php",
    "css"    => [
        "css/style.css",
        "css/manager_menu_style.css"
    ],
    //  ⬇️  JS locali a fine pagina (come già fai)
    "js" => ["js/manager_menu.js"]
];

require "template/base.php";
