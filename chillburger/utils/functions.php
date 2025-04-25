<?php


function registerLogin($user)
{
    $_SESSION["username"] = $user["username"];
    $_SESSION["type"] = $user["type"];
    $_SESSION["name"] = $user["name"];
    $_SESSION["surname"] = $user["surname"];
}

function isUserLoggedIn()
{
    return !empty($_SESSION['username']);
}
