<?php


function registerLogin($user)
{
    $_SESSION["username"] = $user["username"];
    $_SESSION["tipo"] = $user["tipo"];
    $_SESSION["nome"] = $user["nome"];
    $_SESSION["cognome"] = $user["cognome"];
    $_SESSION["idutente"] = $user["idutente"];
}

function isUserLoggedIn()
{
    return !empty($_SESSION['username']);
}

function logout()
{
    unset($_SESSION["username"]);
    unset($_SESSION["tipo"]);
    unset($_SESSION["nome"]);
    unset($_SESSION["cognome"]);
}

function calculateTotalPrice($custom, $stock) {
    $total_price = 0;
    foreach ($custom as $item) {
        $total_price += $item["prezzo"] * $item["quantita"];
    }
    foreach ($stock as $item) {
        $total_price += $item["prezzo"] * $item["quantita"];
    }
    return $total_price;
}

?>