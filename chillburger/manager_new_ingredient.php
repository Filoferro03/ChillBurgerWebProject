<?php
require_once "bootstrap.php";

$templateParams = [
    "titolo" => "ChillBurger – Manager New Ingredient",
    "nome"   => "template/manager_new_ingredient_main.php",
    "css"    => [
        "css/style.css",
    ],
    "js" => ["js/manager_new_ingredient.js"]
];

require "template/base.php";
