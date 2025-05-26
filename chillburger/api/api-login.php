<?php
require("../bootstrap.php");

$result = [];


if (isset($_POST['action']) && $_POST['action'] == 'login' && isset($_POST["loginusername"]) && isset($_POST["loginpassword"])) {

    $login = $dbh->checkLogin($_POST["loginusername"], $_POST["loginpassword"]);

    if (count($login) == 0) {
        $result['loginmsg'] = "Username e/o password non corretti";
        $result["loginresult"] = false;
    } else {
        registerLogin($login[0]);
        $result['loginresult'] = isUserLoggedIn();
        $result["currentuser"] = $login[0];
    }
} else if (isset($_POST['action']) && $_POST['action'] == 'register') {

    if (isset($_POST['registerusername']) && isset($_POST["registerpassword"]) && isset($_POST['confirmpassword']) && isset($_POST["nome"]) && isset($_POST["cognome"]) && !empty($_POST["registerusername"]) && !empty($_POST["registerpassword"]) && !empty($_POST["confirmpassword"]) && !empty($_POST["nome"]) && !empty($_POST["cognome"])) {

        if ($_POST['registerpassword'] === $_POST['confirmpassword']) {

            $registration = $dbh->registerUser($_POST["registerusername"], $_POST["registerpassword"], $_POST["nome"], $_POST["cognome"], "cliente");

            if ($registration) {
                $result['registerresult'] = true;
                $result['registermsg'] = "Registrazione eseguita correttamente";
            }
        } else {
            $result['registerresult'] = false;
            $result['registermsg'] = "Le password non combaciano";
        }
    } else {
        $result['registerresult'] = false;
        $result['registermsg'] = "Campi mancanti";
    }
} else if (isset($_POST['action']) && $_POST['action'] == 'logout') {
    logout();
    $result['logoutresult'] = !isUserLoggedIn();
}

header("Content-Type: application/json");
echo json_encode($result);
