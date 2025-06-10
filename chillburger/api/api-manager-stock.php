<?php

require("../bootstrap.php");

$result = ["success" => false, "error" => null];

try {
    if (!isset($_POST["action"])) {
        throw new Exception("Azione non specificata dans.");
    }

    $action = $_POST["action"];

    switch ($action) {
        case "getallproducts":
            $ingredients = $dbh->getAllIngredients();
            foreach ($ingredients as &$item) {
                if (!empty($item['image'])) {
                    $item['image'] = RESOURCES_DIR . "ingredients/" . $item['image'];
                }
            }
            unset($item);

            $drinks = $dbh->getAllDrinks();
            foreach ($drinks as &$item) {
                if (!empty($item['image'])) {
                    $item['image'] = RESOURCES_DIR . "products/" . $item['image'];
                }
            }
            unset($item);

            $desserts = $dbh->getAllDessertes();
            foreach ($desserts as &$item) {
                if (!empty($item['image'])) {
                    $item['image'] = RESOURCES_DIR . "products/" . $item['image'];
                }
            }
            unset($item);

            $friedFood = $dbh->getAllFrieds();
            foreach ($friedFood as &$item) {
                if (!empty($item['image'])) {
                    $item['image'] = RESOURCES_DIR . "products/" . $item['image'];
                }
            }
            unset($item);


            $result["success"] = true;
            $result["data"] = [
                "ingredients" => $ingredients,
                "drinks" => $drinks,
                "friedFood" => $friedFood,
                "desserts" => $desserts
            ];
            break;

        case "updateingredientquantity":
            if (isset($_POST["idingrediente"]) && isset($_POST["quantita"])) {
                $dbh->updateIngredientQuantity($_POST["idingrediente"], $_POST["quantita"]);
                $result["success"] = true;
            } else {
                $result["success"] = false;
            }
            break;

        case "updatedrinkquantity":
            if (isset($_POST["idprodotto"]) && isset($_POST["quantita"])) {
                $dbh->modifyQuantityDrink($_POST["idprodotto"], $_POST["quantita"]);
                $result["success"] = true;
            } else {
                $result["success"] = false;
            }
            break;

        case "getallburgers":
            $compositions = $dbh->getAllBurgersCompositions();
            $result["data"] = [
                "compositions" => $compositions,
            ];
            $result["success"] = true;
            break;
        default:
            throw new Exception("Azione non riconosciuta.");
    }
} catch (Exception $e) {
    $result["error"] = $e->getMessage();
}

header("Content-Type: application/json");
echo json_encode($result);