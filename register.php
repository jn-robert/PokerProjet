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


    if($user_password == $user_second_password){
         try {
                $stmt = $db->prepare("INSERT INTO `PLAYER` (`idPlayer`, `nom`, `prenom`, `pseudo`, `password`,  `dateInscription`, `jeton`) VALUES (NULL, :nom, :prenom, :pseudo, :pass,  now(), 100;");
                $stmt->bindParam(":nom", $user_nom);
                $stmt->bindParam(":prenom", $user_prenom);
                $stmt->bindParam(":pseudo", $user_pseudo);
                $stmt->bindParam(":pass", $user_password);

                if ($stmt->execute()) {
                    echo "registered";
                } else {
                    echo "Query could not execute !";
                }


         } catch (PDOException $e) {
               echo $e->getMessage();
         }
    }
    else{
        echo "Wrong Second Password !";
    }

}

?>