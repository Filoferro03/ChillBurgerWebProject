<?php
session_start();
define("RESOURCES_DIR", "./resources/");
require_once("utils/functions.php");
require_once("db/database.php");
require_once("utils/functions.php");
$dbh = new DatabaseHelper("localhost", "root", "", "chillburgerdb", 3307);
