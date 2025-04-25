<?php
require("../bootstrap.php");

$result = [];


if (isset($_POST['action']) && $_POST['action'] == 'login' && isset($_POST["loginusername"]) && isset($_POST["loginpassword"])) {

    $login = $dbh->checkLogin($_POST["loginusername"], $_POST["loginpassword"]);

    if (count($login) == 0) {
        $result['errorlogin'] = "Username e/o password non corretti";
    } else {
        $result["logineseguito"] = true;
    }
} else if (isset($_POST['action']) && $_POST['action'] == 'register') {

    if (isset($_POST['registerusername']) && isset($_POST["registerpassword"]) && isset($_POST["nome"]) && isset($_POST["cognome"]) && !empty($_POST["registerusername"]) && !empty($_POST["registerpassword"]) && !empty($_POST["nome"]) && !empty($_POST["cognome"])) {

        $registration = $dbh->registerUser($_POST["username"], $_POST["password"], $_POST["name"], $_POST["surname"], "client");

        if ($registration) {
            $result['registerresult'] = true;
            $result['registermsg'] = "Registrazione eseguita correttamente";
        } else {
            $result['registerresult'] = false;
            $result['registermsg'] = "Registrazione fallita";
        }
    } else {
        $result['registerresult'] = false;
        $result['registermsg'] = "Campi mancanti";
    }
}

header("Content-Type: application/json");
echo json_encode($result);
