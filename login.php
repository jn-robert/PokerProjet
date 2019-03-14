<?php

$dbhost="localhost";
$dbuser="root";
$dbpass="";
$dbname="poker";
echo "tg";

try {
    $db = new PDO("mysql:host=$dbhost;dbname=$dbname", $dbuser, $dbpass);
    // set the PDO error mode to exception
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Connected successfully";
}
catch(PDOException $e)
{
    echo "Connection failed: " . $e->getMessage();
}

/*if(isset($_POST['name']) && isset($_POST['password'])) // Si on a les deux champs username et password
{
    if(!empty($_POST['name']) && !empty($_POST['password'])) // Si ils ne sont pas vide
    {
        sleep(2); // On laisse un chargement de deux secondes pour avoir le message du beforeSend
        $name = htmlspecialchars(trim($_POST['name'])); // On met $_POST['username'] dans une variable

        $req = $db->prepare('SELECT * FROM player');
        $req->execute();
        $post = $req->fetchAll();

        for ($i = 0; $i < sizeof($post)-1; $i++) {
            if ($name == $post[$i]["name"]) // Si le pseudo existe dans notre base de donnée
            {
                $password = htmlspecialchars(trim($_POST['password']));

                if ($password == $post[$i]["password"]) {
                    $succes = true;
                    break;
                }
            }
        }
        if($succes){
            echo "success";
        }
        else{
            echo "erreur mdp ou name";
        }

    }
    else {
        echo "Merci de remplir tous les champs .."; // Le message s'affichera dans la DIV #response
    }

}*/

if (isset($_POST['name']) && isset($_POST['password'])) {
    $login = $_POST['name'];
    $password = $_POST['password'];
    $stmt = $conn->prepare("SELECT nom, password FROM player WHERE nom='$login' AND password='$password';");
    $stmt->execute();
    if ($stmt->rowCount() == 1) {
        echo "success";
    }else{
        echo "non valide";

    }
}