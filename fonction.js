function initialisation() {
    document.getElementsByClassName("home")[0].style.display = "block";
    nav();
}


function logout(){
    deleteCookie("userCookie");
}

function nav(){
    console.log(getCookie("userCookie"));
    if(getCookie("userCookie") == null){
        document.getElementsByClassName("navConnected")[0].style.display = "none";
        document.getElementsByClassName("navNoConnected")[0].style.display = "block";
    }
    else{
        document.getElementsByClassName("navNoConnected")[0].style.display = "none";
        document.getElementsByClassName("navConnected")[0].style.display = "block";
    }
}


function begin() {
    document.getElementsByClassName("BeforeGame")[0].style.display = "none";
    document.getElementsByClassName("Game")[0].style.display = "none";
}



function clear() {
    document.getElementsByClassName("navConnected")[0].style.display = "none";
    document.getElementsByClassName("navNoConnected")[0].style.display = "none";
    document.getElementsByClassName("home")[0].style.display = "none";
}

$(document).ready(function () {
    $('#registerFormulaire').submit(function (e) {
        e.preventDefault();

        var nom = $("#nameRegister").val();
        var pass = $("#passwordRegister").val();
        var pseudo = $("#pseudo").val();
        var secondPassword = $("#secondPassword").val();


        if (nom != "" && pass != "" && pseudo != "" && secondPassword != "") {


            document.getElementById("errorNom").innerHTML = "";
            document.getElementById("errorNom").style.color = "white";


            var user_textLength = nom.trim().length;
            var pw_textLength = pass.trim().length;


            if (user_textLength < 1) {
                document.getElementById("errorNom").innerHTML = "Veuillez saisir un nom contenant au minimum 2 caractères";
                document.getElementById("errorNom").style.color = "red";
                return false;
            }

            if (pw_textLength < 7) {
                document.getElementById("errorPas").innerHTML = "Veuillez saisir un mot de passe contenant au minimum 8 caractères";
                document.getElementById("errorPas").style.color = "red";
                return false;
            }


            if (secondPassword != pass) {
                console.log(secondPassword);
                console.log(pass);
                //alert("erreur");
                document.getElementById("errorPass").innerHTML = "veuillez mettre le meme mot de passe";
                document.getElementById("errorPass").style.color = "red";

                return false;
            }
            else {
                document.getElementById("errorPass").innerHTML = "";
                document.getElementById("errorPass").style.color = "white";
            }


            var data = $("#registerFormulaire").serialize();

            $.ajax({
                type: 'POST',
                url: 'register.php',
                data: data,
                success: function (data) {
                    if (data == 1) {

                    }
                    else if (data == "registered") {
                        console.log("registered");
                        initialisation();
                    }
                    else {

                    }
                },
                error: function (resultat, statut, erreur) {
                    alert("failed");
                }

            });

            return false;
        }

        if (nom == "") {
            document.getElementById("errorNom").innerHTML = "veuillez saisir le nom";
            document.getElementById("errorNom").style.color = "red";
        }
        else {
            document.getElementById("errorNom").innerHTML = "";
            document.getElementById("errorNom").style.color = "white";
        }
        if (pseudo == "") {
            document.getElementById("errorEmail").innerHTML = "veuillez saisir le email";
            document.getElementById("errorEmail").style.color = "red";
        }
        if (pass == "") {
            document.getElementById("errorPas").innerHTML = "veuillez saisir le password";
            document.getElementById("errorPas").style.color = "red";
        }
        if (secondPassword == "") {
            document.getElementById("errorPass").innerHTML = "veuillez saisir le SecondPassword";
            document.getElementById("errorPass").style.color = "red";
        }

        //alert("Entrer toutes les valeurs")

    });

});

