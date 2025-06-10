<?php
/* 
    
    FIXME
    Per vedere gli errori nel browser, va tolto quando finiamo
    
*/
ini_set('display_errors', 1);
error_reporting(E_ALL);


require_once("bootstrap.php");

$templateParams["titolo"] = "ChillBurger - Home";
$templateParams["nome"] = "template/homepage.php";

require("template/base.php");
?>