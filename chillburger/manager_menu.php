<?php
require_once "bootstrap.php";

$templateParams = [
    "titolo" => "ChillBurger – Manager Menu",
    "nome"   => "template/manager_menu_main.php",
    "css"    => [
        "css/style.css",
        "css/manager-menu.css"
    ],
    "js" => ["js/manager-menu.js"]
];

require "template/base.php";
?>