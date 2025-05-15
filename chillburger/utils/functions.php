<?php


function registerLogin($user)
{
    $_SESSION["username"] = $user["username"];
    $_SESSION["tipo"] = $user["tipo"];
    $_SESSION["nome"] = $user["nome"];
    $_SESSION["cognome"] = $user["cognome"];
    $_SESSION["idutente"] = $user["idutente"];
}

function setUserCart($idordine)
{
    $_SESSION["idordine"] = $idordine;
}

function isUserLoggedIn()
{
    return !empty($_SESSION['username']);
}

function logout()
{
    session_unset();
}
