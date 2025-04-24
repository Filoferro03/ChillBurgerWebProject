<?php
require_once "bootstrap.php";

$templateParams = [
    "titolo" => "ChillBurger – Menu",
    "nome"   => "template/menu_main.php",
    "css"    => ["css/menu_style.css"],
    "js"     => ["js/menu_filter.js"]
];

require "template/base.php";
?>