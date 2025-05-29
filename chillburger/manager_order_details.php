<?php
require_once "bootstrap.php";

$templateParams = [
    "titolo" => "ChillBurger – Dettagli Ordine",
    "nome"   => "template/manager_order_details_main.php",
    "css"    => [
        "css/style.css"
    ],
    "js" => ["js/manager-orders-view.js"]
];

require "template/base.php";
?>