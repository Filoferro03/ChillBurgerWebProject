<?php
require_once "bootstrap.php";

$templateParams = [
    "titolo" => "ChillBurger – Manager_Notifications",
    "nome"   => "template/manager_notifications_main.php",
    "css"    => [
        "css/style.css",
        "css/manager_style.css"
    ],
    "js"     => [
        "js/manager_notifications.js"
    ]
];

require "template/base.php";
?>