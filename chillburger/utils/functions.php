<?php


function registerLogin($user)
{
    $_SESSION["username"] = $user["username"];
    $_SESSION["tipo"] = $user["tipo"];
    $_SESSION["nome"] = $user["nome"];
    $_SESSION["cognome"] = $user["cognome"];
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
    log("logout", "Logout effettuato con successo.");
}

?>