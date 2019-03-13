if(isset($_POST['name']) && isset($_POST['password'])) // Si on a les deux champs username et password
{
    if(!empty($_POST['name']) && !empty($_POST['password'])) // Si ils ne sont pas vide
    {
        sleep(2); // On laisse un chargement de deux secondes pour avoir le message du beforeSend
        $name = htmlspecialchars(trim($_POST['name'])); // On met $_POST['username'] dans une variable

        $req = $db->prepare('SELECT * FROM USERNAME');
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
            $_SESSION['name'] = $name;
            $_SESSION['password'] = $password;
            echo "success";
        }
        else{
            session_destroy();
            echo "erreur mdp ou name";
        }

    }
    else {
        session_destroy();
        echo "Merci de remplir tous les champs .."; // Le message s'affichera dans la DIV #response
    }

}