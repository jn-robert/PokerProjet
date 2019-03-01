<?php

$dbhost="localhost";
$dbuser="root";
$dbpass="";
$dbname="ajax";
$db = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpass);


if ($_POST) {
    $user_prenom = $_POST['prenom'];
    $user_nom = $_POST['nom'];
    $user_pseudo = $_POST['pseudo'];
    $user_password = $_POST['passwordRegister'];
    $user_second_password = $_POST['secondPassword'];












}













?>