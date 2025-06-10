<?php
require_once("bootstrap.php");

$templateParams = [];

if (isUserLoggedIn()) {
    if (isUserClient()) {
        // Se è cliente carico il template “ordine ora”
        $templateParams["nome"]   = "template/order_now_main.php";
        $templateParams["titolo"] = "ChillBurger – Order Now";
        $templateParams["css"]    = [
          "css/style.css",
          "css/menu_style.css",
          "css/order_now_style.css"
        ];
        $templateParams["js"]     = [
          "js/order_now.js"
        ];
    } else {
        // Se è manager (o altro ruolo non cliente), mostro la pagina di “accesso negato”
        $templateParams["nome"]   = "template/access_denied.php";
        $templateParams["titolo"] = "Accesso Negato";
        $templateParams["css"]    = [
          "css/style.css"
        ];
    }
} else {
    // Non loggato: mandato al login
    $templateParams["nome"]   = "template/login-form.php";
    $templateParams["titolo"] = "ChillBurger – Login";
    $templateParams["css"]    = [
      "css/style.css"
    ];
    $templateParams["js"]     = [
      "js/login.js"
    ];
}

require("template/base.php");
