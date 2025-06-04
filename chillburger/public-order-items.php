<?php
require_once("bootstrap.php"); //

$templateParams["titolo"] = "Articoli dell'Ordine"; //
$templateParams["nome"] = "template/public-order-items-main.php"; 
$templateParams["js"] = array("js/public-order-items.js"); 

if (!isset($_GET['idordine'])) {
    error_log("idordine mancante");
}

require("template/base.php"); //
?>