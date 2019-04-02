class Game {
    displayBoard(message) {
        $('.menu').css('display', 'none');
        $('.gameBoard').css('display', 'block');
        $('#userHello').html(message);
    };
}

class Player {
    constructor(id, name, jeton) {
        this.id = id;
        this.name = name;
        this.jeton = jeton;
        this.currentTurn = null;
    }

    setCurrentTurn(turn) {
        this.currentTurn = turn;
        const message = turn ? 'A votre tour' : 'A votre adversaire';
        $('#turn').text(message);
    };
}

const socket = io.connect('http://localhost:5000');
var nameUser;



/**
 * Gestion login
 */

function getCookie(name) {
    var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? v[2] : null;
}

function setCookie(name, value, days) {
    var d = new Date;
    d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
    document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
}

function deleteCookie(name) {
    setCookie(name, '', -1);
}

function login() {
    $(document).ready(function () {
        var errorNom = document.getElementById("errorNameLog");
        var errorPwd = document.getElementById("errorPassLog");
        var pseudo = $("#pseudoLog").val();
        var pass = $("#password").val();
        if (pseudo !== "" && pass !== "") {
            errorNom.innerText = "";
            errorPwd.innerText = "";

            socket.emit('checkUserLogin', {pseudo: pseudo, pwd: pass});

            socket.on('loginSucces', (data) => {
                nameUser = data.pseudo;
                setCookie("userCookie", nameUser, 1);
                window.location.href = "home.html";
            });

        } else {
            if (pseudo !== "") {
                errorNom.innerText = "";
            } else {
                errorNom.innerText = "veuillez entrez un nom";
                errorNom.style.color = "red";
                errorNom.style.fontSize = "11px";
            }
            if (pass !== "") {
                errorPwd.innerText = "";
            } else {
                errorPwd.innerText = "veuillez entrez un mdp";
                errorPwd.style.color = "red";
                errorPwd.style.fontSize = "11px";
            }
            //alert("Please Fill All The Details");
        }
        return false;
    });

}


function register() {
    $(document).ready(function () {
        var nom = $("#nameRegister").val();
        var prenom = $("#prenom").val();
        var pass = $("#passwordRegister").val();
        var pseudo = $("#pseudo").val();
        var secondPassword = $("#secondPassword").val();

        if (nom != "" && prenom != "" && pass != "" && pseudo != "" && secondPassword != "") {

            document.getElementById("errorNom").innerHTML = "";
            document.getElementById("errorPrenom").innerHTML = "";
            document.getElementById("errorPass").innerHTML = "";
            document.getElementById("errorPas").innerHTML = "";
            document.getElementById("errorPseudo").innerHTML = "";

            var user_textLength = nom.trim().length;
            var pw_textLength = pass.trim().length;

            if (user_textLength < 1) {
                document.getElementById("errorNom").innerHTML = "Veuillez saisir un nom contenant au minimum 2 caractères";
                document.getElementById("errorNom").style.color = "red";
                return false;
            }

            if (pw_textLength < 2) {
                document.getElementById("errorPas").innerHTML = "Veuillez saisir un mot de passe contenant au minimum 2 caractères";
                document.getElementById("errorPas").style.color = "red";
                return false;
            }


            if (secondPassword != pass) {
                document.getElementById("errorPass").innerHTML = "veuillez mettre le meme mot de passe";
                document.getElementById("errorPass").style.color = "red";

                return false;
            } else {
                document.getElementById("errorPass").innerHTML = "";
                document.getElementById("errorPass").style.color = "white";

                socket.emit('createNewUSer', {nomUser: nom, prenom: prenom, pseudo: pseudo, pass: pass});

                socket.on('RegisterSucces', (dat) => {
                    nameUser = dat.pseudo;
                    setCookie("userCookie", nameUser, 1);
                    window.location.href = "home.html";
                });
            }

        } else {

            if (nom == "") {
                document.getElementById("errorNom").innerHTML = "veuillez saisir le nom";
                document.getElementById("errorNom").style.color = "red";
            } else {
                document.getElementById("errorNom").innerHTML = "";
                document.getElementById("errorNom").style.color = "white";
            }
            if (prenom == "") {
                document.getElementById("errorPrenom").innerHTML = "veuillez saisir le pseudo";
                document.getElementById("errorPrenom").style.color = "red";
            } else {
                document.getElementById("errorPrenom").innerHTML = "";
                document.getElementById("errorPrenom").style.color = "white";
            }
            if (pseudo == "") {
                document.getElementById("errorPseudo").innerHTML = "veuillez saisir le pseudo";
                document.getElementById("errorPseudo").style.color = "red";
            } else {
                document.getElementById("errorPseudo").innerHTML = "";
                document.getElementById("errorPseudo").style.color = "white";
            }
            if (pass == "") {
                document.getElementById("errorPas").innerHTML = "veuillez saisir le password";
                document.getElementById("errorPas").style.color = "red";
            } else {
                document.getElementById("errorPas").innerHTML = "";
                document.getElementById("errorPas").style.color = "white";
            }
            if (secondPassword == "") {
                document.getElementById("errorPass").innerHTML = "veuillez saisir le SecondPassword";
                document.getElementById("errorPass").style.color = "red";
            } else {
                document.getElementById("errorPass").innerHTML = "";
                document.getElementById("errorPass").style.color = "white";
            }
        }

    });
}


/**
 * Gestion de la page des stats
 */
function stat() {


    $(document).ready(function () {
        socket.emit('callListJoueur');
    });

    socket.on('listJoueur', (data) => {
        let tab = data.tab;
        let msg = "<t8>Liste des joueurs</t8><br>";
        for (var i = 0; i < tab.length; i++) {
            msg += "<button onclick='traceStats(\"" + tab[i].idPlayer + "\")'>" + tab[i].nom + "</button><br>";
        }
        msg += "<br><br>";
        document.getElementById("listeJoueur").innerHTML = msg;
    });
}

let boolGraph = false;

function traceStats(id) {
    if (boolGraph) {
        location.reload();
    } else {
        boolGraph = true;
        recpDonne(id);
    }
}

function recpDonne(id) {
    console.log("Affiche");
    console.log(id);
    socket.emit('getStatsPlayer', {id: id});

    socket.on('ReturnStatsPlayer', (data) => {
        let tabStats = data.tab[0];
        infoJoueur(tabStats);
        socket.on('ResturnStatsActionPlayer', (data) => {
            let allIn = 0;
            let check = 0;
            let fold = 0;
            let raise = 0;
            for (let i = 0; i < data.tab.length; i++) {
                allIn += data.tab[i].nbAllIn;
                check += data.tab[i].nbCheck;
                fold += data.tab[i].nbFold;
                raise += data.tab[i].nbRaise;
            }
            Morris.Donut({
                element: 'statsAction',
                data: [
                    {label: "All-in", value: allIn},
                    {label: "Check", value: check},
                    {label: "Fold", value: fold},
                    {label: "Raise", value: raise},
                ]
            });
        });
    });
}

function infoJoueur(tabStats) {
    var msg = "<table border='2'><tr><td>";
    msg += "Pseudo : " + tabStats.pseudo + "<br>";
    msg += "Prenom : " + tabStats.prenom + "<br>";
    msg += "Nom : " + tabStats.nom + "<br>";
    msg += "Date d'inscription : " + tabStats.dateInscription + "<br>";
    msg += "Nombre de jetons : " + tabStats.jetons + "<br>";
    msg += "</table></td></tr>";
    document.getElementById("infoJoueur").innerHTML = msg;
}


function init() {
    // var Game = require('./Game');
    // var Player = require('./Player');
    let id = 0;
    let player;
    let game;
    let room;


    // const socket = io.connect('myip:5000');
    // Create a new game. Emit newGame event.
    $('#new').on('click', () => {
        const jeton = $('#jetonNew').val();
        const roomId = $('#room').val();
        if (!jeton) {
            alert('Veuillez entrer le nombre de jeton');
            return;
        }
        player = new Player(id++, getCookie("userCookie"), parseInt(jeton));
        socket.emit('createGame', {name: getCookie("userCookie"), jeton: parseInt(jeton)});
        $(window).on('unload', function () {
            socket.emit("exit", {room: roomId, playerName: player.name});
        });
/*        $(window).on('beforeunload', function (event) {
            event.preventDefault();
            console.log(event.preventDefault())
        });*/
    });

    // Join an existing game on the entered roomId. Emit the joinGame event.
    $('#join').on('click', () => {
        const roomID = $('#select').val();
        const jeton = $('#jetonNewJoin').val();
        const roomId = $('#room').val();
        if (!roomID || !jeton) {
            alert('Erreur.');
            return;
        }
        player = new Player(id++, getCookie("userCookie"), parseInt(jeton), roomID);
        socket.emit('joinGame', {name: getCookie("userCookie"), room: roomID, jeton: parseInt(jeton)});
        socket.emit('messageAction', {room: roomId, playerName: player.name, action: "join"});
        $('#tablejoinpart').hide();
        $(window).on('unload', function () {
            socket.emit("exit", {room: roomId, playerName: player.name});
        });
    });

    // New Game created by current client. Update the UI and create new Game var.
    // game = new Game();
    socket.on('newGame', (data) => {
        const message = `Hello, ${data.name}. Vous êtes dans le salon numéro: ${data.room}`;
        // Create game for player 1
        room = `${data.room}`;
        game = new Game(); //data.room
        game.displayBoard(message);
        $('#tablejoinpart').hide();
    });

    /**
     * If player creates the game, he'll be P1 and has the first turn.
     * This event is received when opponent connects to the room.
     */
    socket.on('player1', (data) => {
        const message = `Hello, ${data.name}`;
        $('#userHello').html(message);
        player.setCurrentTurn(false);
    });

    /**
     * Joined the game, so player is P2.
     * This event is received when P2 successfully joins the game room.
     */
    socket.on('player', (data) => {
        const message = `Hello, ${data.name}`;
        // Create game for player
        game = new Game(); //data.room
        room = `${data.room}`;
        game.displayBoard(message);
        player.setCurrentTurn(false);
        if (data.nbJoueurs === 2) {
            const roomID = $('#room').val();
            socket.emit('start', {room: roomID, playerName: player.name});
        }
    });

    /**
     * Opponent played his turn. Update UI.
     * Allow the current player to play now.
     */
    socket.on('turnPlayed', (data) => {
        // player.setCurrentTurn(true);
    });

    // If the other player wins, this event is received. Notify user game has ended.
    socket.on('gameEnd', (data) => {
        game.endGame(data.message);
        socket.leave(data.room);
    });

    /**
     * End the game on any err event.
     */
    socket.on('err', (data) => {
        game.endGame(data.message);
    });

    $('#start').on('click', () => {
        // console.log(game.getPlayer());
        const roomID = $('#room').val();
        socket.emit('start', {room: roomID, playerName: player.name});
    });

    socket.on('1stR', (data) => {

        var message;

        if (data.currentTurn === player.name) {

            message = "A votre tour";
            document.getElementById('all-in').style.display = "inline";
            document.getElementById('check').style.display = "inline";
            document.getElementById('suivre').style.display = "none";
            document.getElementById('raise').style.display = "inline";
            document.getElementById('coucher').style.display = "inline";
        } else {
            message = "A votre adversaire";
            document.getElementById('all-in').style.display = "none";
            document.getElementById('check').style.display = "none";
            document.getElementById('suivre').style.display = "none";
            document.getElementById('raise').style.display = "none";
            document.getElementById('coucher').style.display = "none";
        }

        // document.getElementById('start').disabled = true;
        // //desactive les boutons tant que l'autre joueur n'a pas joué
        // document.getElementById('all-in').disabled = !data.booleanCurrentTurn;
        // document.getElementById('check').disabled = !data.booleanCurrentTurn;
        // document.getElementById('suivre').disabled = true;
        // document.getElementById('raise').disabled = !data.booleanCurrentTurn;
        // document.getElementById('coucher').disabled = !data.booleanCurrentTurn;

        document.getElementById('pot').innerHTML = data.pot;
        document.getElementById('turn').innerHTML = message;
        /*
        document.getElementById('texte').innerHTML = data.jetons1 + " jetons";
        document.getElementById('texte2').innerHTML = data.jetons2 + " jetons";
        document.getElementById('texte2').innerHTML = data.jetons2 + con" jetons";
        */
        let cartes;
        let jetons;
        for (let i = 0; i < data.nbJoueurs; i++) {
            if (data.name[i] === player.name) {
                cartes = data.cartes[i];
                jetons = data.jetons[i];
                document.getElementById('label0').innerHTML = jetons;
                if (i == 0) {
                    document.getElementById('label2').innerHTML = data.jetons[i + 1];
                    document.getElementById('label1').innerHTML = data.jetons[i + 2];
                    document.getElementById('label3').innerHTML = data.jetons[i + 3];
                }
                if (i == 1) {
                    document.getElementById('label2').innerHTML = data.jetons[i - 1];
                    document.getElementById('label1').innerHTML = data.jetons[i + 1];
                    document.getElementById('label3').innerHTML = data.jetons[i + 2];
                }
                if (i == 2) {
                    document.getElementById('label2').innerHTML = data.jetons[i - 2];
                    document.getElementById('label1').innerHTML = data.jetons[i - 1];
                    document.getElementById('label3').innerHTML = data.jetons[i + 1];

                }
                if (i == 3) {
                    document.getElementById('label2').innerHTML = data.jetons[i - 3];
                    document.getElementById('label1').innerHTML = data.jetons[i - 2];
                    document.getElementById('label3').innerHTML = data.jetons[i - 1];
                }
            }
        }

        if (data.nbJoueurs == 2) {
            document.getElementById("CarteJoueur3").hidden = false;
            document.getElementById("CarteJoueur4").hidden = false;
            document.getElementById("texte").hidden = false;
            document.getElementById("texte2").hidden = false;
            document.getElementById("texte3").hidden = true;
            document.getElementById("texte5").hidden = true;
        }

        if (data.nbJoueurs == 3) {
            document.getElementById("CarteJoueur3").hidden = false;
            document.getElementById("CarteJoueur4").hidden = false;
            document.getElementById("CarteJoueur5").hidden = false;
            document.getElementById("CarteJoueur6").hidden = false;
            document.getElementById("texte").hidden = false;
            document.getElementById("texte2").hidden = false;
            document.getElementById("texte3").hidden = false;
            document.getElementById("texte5").hidden = true;
        }

        if (data.nbJoueurs == 4) {
            document.getElementById("CarteJoueur3").hidden = false;
            document.getElementById("CarteJoueur4").hidden = false;
            document.getElementById("CarteJoueur5").hidden = false;
            document.getElementById("CarteJoueur6").hidden = false;
            document.getElementById("CarteJoueur7").hidden = false;
            document.getElementById("CarteJoueur8").hidden = false;
            document.getElementById("texte").hidden = false;
            document.getElementById("texte2").hidden = false;
            document.getElementById("texte3").hidden = false;
            document.getElementById("texte5").hidden = false;

        }

        document.CarteJoueur1.src = "image/" + cartes[0] + ".png";
        document.CarteJoueur2.src = "image/" + cartes[1] + ".png";

        document.T1.src = "image/dos.png";
        document.T2.src = "image/dos.png";
        document.T3.src = "image/dos.png";
        document.T4.src = "image/dos.png";
        document.T5.src = "image/dos.png";


    });

    $('#check').on('click', () => {
        const roomId = $('#room').val();
        socket.emit('check', {room: roomId, playerName: player.name});
        socket.emit('messageAction', {room: roomId, playerName: player.name, action: "check"});
    });

    $('#suivre').on('click', () => {
        const roomId = $('#room').val();
        socket.emit('suivre', {room: roomId, playerName: player.name});
        socket.emit('messageAction', {room: roomId, playerName: player.name, action: "suivre"});

    });

    $('#raise').on('click', () => {
        const roomId = $('#room').val();
        socket.emit('raise', {room: roomId, playerName: player.name});
        socket.emit('messageAction', {room: roomId, playerName: player.name, action: "raise"});

    });

    $('#all-in').on('click', () => {
        const roomId = $('#room').val();
        socket.emit('all-in', {room: roomId, playerName: player.name});
        socket.emit('messageAction', {room: roomId, playerName: player.name, action: "all-in"});

    });

    $('#coucher').on('click', () => {
        const roomId = $('#room').val();
        socket.emit('coucher', {room: roomId, playerName: player.name});
        socket.emit('messageAction', {room: roomId, playerName: player.name, action: "fold"});

    });

    $('#exit').on('click', () => {
        // socket.leave(data.room);
        const roomId = $('#room').val();
        socket.emit("exit", {room: roomId, playerName: player.name});
        socket.emit('messageAction', {room: roomId, playerName: player.name, action: "exit"});
        window.location.href = "game.html"; //retourne a la page d'accueil du jeu

    });

    $('#envoi_message').on('click', () => {
        const roomId = $('#room').val();
        var message = document.getElementById("message").value;
        socket.emit('message', {room: room, pseudo: player.name, message: message});
    });

    socket.on("afficheAction", (data) => {
        document.getElementById("messageGame").style.color = "red";
        document.getElementById("messageGame").innerText = data.playerName + " a fait l'action : " + data.action;
    });

    socket.on('afficheMessage', (data) => {
        // const roomId = $('#room').val();
        // console.log(roomId);

        if (room === `${data.room}`) {
            if (data.message != "") {
                var start = new Date();

                $('.message').append('<p ><strong><span id="hour">' +'['+start.getHours() + ":" + start.getMinutes()+']'+'</span>'+'  '+'<span id="name">'+ data.pseudo +'</span></strong> '+ ': ' + data.message + '</p>');
                $("#message").text("test");

                var elmnt = document.getElementById("chatScroll");
                elmnt.scrollTop = elmnt.scrollHeight;


            }
        }
    });

    socket.on('partieJoueur', (data) => {
        var test = data.tab;
        for (var i = 0; i < test.length; i++) {
            $("#select").append("<option value=\"" + test[i].idPartie + "\">" + test[i].idPartie + "</option>");
            $("#tablePartie").append(
                "<tr>" +
                "<td>" + test[i].idPartie + "</td>" +
                "<td>" + test[i].nbJoueur + "</td>" +
                "</tr>"
            );

        }
    });

    $(document).ready(function () {
        socket.emit('callPartie');
    });


    /**
     * change l'affichage en fonction du resultat envoyer par le serveur
     */
    socket.on('resultAction', (data) => {
        //desactive les boutons tant que l'autre joueur n'a pas joué

        /**
         * récupère les variables jetobs et cartes du joueur
         */


        let cartes;
        let jetons;
        for (let i = 0; i < data.nbJoueurs; i++) {
            if (data.name[i] === player.name) {
                cartes = data.cartes[i];
                jetons = parseInt(data.jetons[i]);
                document.getElementById('label0').innerHTML = jetons;
                if (i == 0) {
                    document.getElementById('label2').innerHTML = data.jetons[i + 1];
                    document.getElementById('label1').innerHTML = data.jetons[i + 2];
                    document.getElementById('label3').innerHTML = data.jetons[i + 3];
                }
                if (i == 1) {
                    document.getElementById('label2').innerHTML = data.jetons[i - 1];
                    document.getElementById('label1').innerHTML = data.jetons[i + 1];
                    document.getElementById('label3').innerHTML = data.jetons[i + 2];
                }
                if (i == 2) {
                    document.getElementById('label2').innerHTML = data.jetons[i - 2];
                    document.getElementById('label1').innerHTML = data.jetons[i - 1];
                    document.getElementById('label3').innerHTML = data.jetons[i + 1];

                }
                if (i == 3) {
                    document.getElementById('label2').innerHTML = data.jetons[i - 3];
                    document.getElementById('label1').innerHTML = data.jetons[i - 2];
                    document.getElementById('label3').innerHTML = data.jetons[i - 1];
                }
            }
        }

        // let compteurAllIn = 0;
        // if (jetons === 0) {
        //     console.log("requete all-in");
        //     const roomId = $('#room').val();
        //     socket.emit('all-in', {room: roomId, playerName: player.name});
        //     compteurAllIn = 1;
        // }

        if (data.tour < 6 && data.nbJoueurs !== 1) {

            var message;
            if (data.currentTurn === player.name) {

                let cartes = null;
                let jetons;
                for (let i = 0; i < data.nbJoueurs; i++) {
                    if (data.name[i] === player.name) {
                        cartes = data.cartes[i];
                        jetons = data.jetons[i];
                    }
                }
                console.log(jetons);
                if (jetons === 0) {
                    console.log("requete all-in");
                    const roomId = $('#room').val();
                    socket.emit('all-in', {room: roomId, playerName: player.name});
                    // compteurAllIn = 1;
                }

                message = "A votre tour";

                switch (data.choixJoueurs) {
                    case "check":

                        document.getElementById('all-in').style.display = "inline";
                        document.getElementById('check').style.display = "inline";
                        document.getElementById('suivre').style.display = "none";
                        document.getElementById('raise').style.display = "inline";
                        document.getElementById('coucher').style.display = "inline";

                        break;
                    case "raise":

                        document.getElementById('all-in').style.display = "inline";
                        document.getElementById('check').style.display = "none";
                        document.getElementById('suivre').style.display = "inline";
                        document.getElementById('raise').style.display = "inline";
                        document.getElementById('coucher').style.display = "inline";

                        break;
                    case "suivre":

                        document.getElementById('all-in').style.display = "inline";
                        document.getElementById('check').style.display = "none";
                        document.getElementById('suivre').style.display = "inline";
                        document.getElementById('raise').style.display = "inline";
                        document.getElementById('coucher').style.display = "inline";

                        break;
                    case "all-in":
                        document.getElementById('all-in').style.display = "inline";
                        document.getElementById('check').style.display = "none";
                        document.getElementById('suivre').style.display = "inline";
                        document.getElementById('raise').style.display = "inline";
                        document.getElementById('coucher').style.display = "inline";

                        break;

                    default:

                        document.getElementById('all-in').style.display = "inline";
                        document.getElementById('check').style.display = "inline";
                        document.getElementById('suivre').style.display = "none";
                        document.getElementById('raise').style.display = "inline";
                        document.getElementById('coucher').style.display = "inline";
                }
            } else {
                message = "A votre adversaire";
                document.getElementById('all-in').style.display = "none";
                document.getElementById('check').style.display = "none";
                document.getElementById('suivre').style.display = "none";
                document.getElementById('raise').style.display = "none";
                document.getElementById('coucher').style.display = "none";

            }



            //affichage des variables

            document.getElementById('turn').innerHTML = message;
            document.getElementById('pot').innerHTML = "Pot : " + data.pot;
            if (cartes != null) {
                document.CarteJoueur1.src = "image/" + cartes[0] + ".png";
                document.CarteJoueur2.src = "image/" + cartes[1] + ".png";
            } else {
                document.CarteJoueur1.src = "image/dos.png";
                document.CarteJoueur2.src = "image/dos.png";
            }
        } else {

            let cartes = null;
            let jetons;
            for (let i = 0; i < data.nbJoueurs; i++) {
                if (data.name[i] === player.name) {
                    cartes = data.cartes[i];
                    jetons = data.jetons[i];
                }
            }

            document.getElementById('pot').innerHTML = "Pot : " + data.pot;
            if (cartes != null) {
                document.CarteJoueur1.src = "image/" + cartes[0] + ".png";
                document.CarteJoueur2.src = "image/" + cartes[1] + ".png";
            } else {
                document.CarteJoueur1.src = "image/dos.png";
                document.CarteJoueur2.src = "image/dos.png";
            }
            document.getElementById('turn').innerHTML = "fin partie";
            document.getElementById('messageGame').style.color = "red";
            document.getElementById('messageGame').innerHTML = data.vainqueur + " vainqueur avec : " + data.combiVainq;
            // console.log(data.combiVainq);

            // else {
                socket.emit('continueGame', {playerName: player.name});
            // }
            // const roomID = $('#room').val();
            // socket.emit('start', {room: roomID, playerName: player.name});
        }
        let compteur = 0;
        let compteur2 = 0;
        if (data.tour > 2 && data.tour <= 6 && data.choixJoueurs !== 'coucher') {
            for (let i = 0; i < data.tour; i++) {
                //console.log(data.cartesTapis[i]);
            }
            data.cartesTapis.forEach(function (entry) {
                switch (compteur) {
                    case 0:
                        document.T1.src = "image/" + entry + ".png";
                        compteur++;
                        break;
                    case 1:
                        document.T2.src = "image/" + entry + ".png";
                        compteur++;
                        break;
                    case 2:
                        document.T3.src = "image/" + entry + ".png";
                        compteur++;
                        break;
                    case 3:
                        if (compteur < data.tour) {
                            document.T4.src = "image/" + entry + ".png";
                            compteur++;
                        }
                        break;
                    case 4:
                        if (compteur < data.tour) {
                            document.T5.src = "image/" + entry + ".png";
                        }
                        break;
                }
            });
        } else {
            document.T1.src = "image/dos.png";
            document.T2.src = "image/dos.png";
            document.T3.src = "image/dos.png";
            document.T4.src = "image/dos.png";
            document.T5.src = "image/dos.png";
            document.getElementById('messageGame').style.color = "black";
            document.getElementById('messageGame').innerHTML = "En attente d'une action...";
        }
    });
}