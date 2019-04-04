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

const socket = io.connect('localhost:5000');
let nameUser;


var startTime = 0;
var start = 0;
var end = 0;
var diff = 0;
var timerID = 0;
var sec;
var roomT;
var nameT;
var jetonsT;
function chrono(roomId, name, jetons){
    end = new Date();
    diff = end - start;
    diff = new Date(diff);
    var msec = diff.getMilliseconds();
    sec = diff.getSeconds();
    var min = diff.getMinutes();
    var hr = diff.getHours()-1;
    if (min < 10){
        min = "0" + min;
    }
    if (sec < 10){
        sec = "0" + sec;
    }
    if(msec < 10){
        msec = "00" +msec;
    }
    else if(msec < 100){
        msec = "0" +msec;
    }
    console.log("sec : "+sec);
    console.log(name);
    console.log(roomId);
    roomT = roomId;
    nameT = name;
    jetonsT = jetons
    // document.getElementById("chronotime").innerHTML = hr + ":" + min + ":" + sec + ":" + msec;
    // const room = $('#room').val();
    // const jeton = $('#jetonNew').val();
   /* if (sec === "03") {

        socket.emit("exit", {room: roomT, playerName: nameT, jetonP: jetonsT});
    }*/
    timerID = setTimeout("chrono(roomT,nameT,jetonsT)", 500);
}
function chronoStart(roomId, name, jetons){
    // document.chronoForm.startstop.value = "stop!";
    // document.chronoForm.startstop.onclick = chronoStop;
    // document.chronoForm.reset.onclick = chronoReset;
    start = new Date();
    chrono(roomId, name, jetons);
}
function chronoContinue(){
    // document.chronoForm.startstop.value = "stop!";
    // document.chronoForm.startstop.onclick = chronoStop;
    // document.chronoForm.reset.onclick = chronoReset;
    start = new Date()-diff;
    start = new Date(start);
    chrono();
}
function chronoReset(){
    // document.getElementById("chronotime").innerHTML = "0:00:00:000";
    start = new Date();
}
function chronoStopReset(){
    // document.getElementById("chronotime").innerHTML = "0:00:00:000";
    // document.chronoForm.startstop.onclick = chronoStart;
}
function chronoStop(){
    // document.chronoForm.startstop.value = "start!";
    // document.chronoForm.startstop.onclick = chronoContinue;
    // document.chronoForm.reset.onclick = chronoStopReset;
    clearTimeout(timerID);
}


/**
 * Gestion login
 */

function getCookie(name) {
    let v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? v[2] : null;
}

function setCookie(name, value, days) {
    let d = new Date;
    d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
    document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
}

function minutetest() {
    test = new Date();
    if (test.getMinutes()<10){
        return "0"+test.getMinutes();
    }else{
        return test.getMinutes();
    }

}

function deleteCookie(name) {
    setCookie(name, '', -1);
}

function login() {
    $(document).ready(function () {
        let errorNom = document.getElementById("errorNameLog");
        let errorPwd = document.getElementById("errorPassLog");
        let pseudo = $("#pseudoLog").val();
        let pass = $("#password").val();
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
        let nom = $("#nameRegister").val();
        let prenom = $("#prenom").val();
        let pass = $("#passwordRegister").val();
        let pseudo = $("#pseudo").val();
        let secondPassword = $("#secondPassword").val();

        if (nom !== "" && prenom !== "" && pass !== "" && pseudo !== "" && secondPassword !== "") {

            document.getElementById("errorNom").innerHTML = "";
            document.getElementById("errorPrenom").innerHTML = "";
            document.getElementById("errorPass").innerHTML = "";
            document.getElementById("errorPas").innerHTML = "";
            document.getElementById("errorPseudo").innerHTML = "";

            let user_textLength = nom.trim().length;
            let pw_textLength = pass.trim().length;

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


            if (secondPassword !== pass) {
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

            if (nom === "") {
                document.getElementById("errorNom").innerHTML = "veuillez saisir le nom";
                document.getElementById("errorNom").style.color = "red";
            } else {
                document.getElementById("errorNom").innerHTML = "";
                document.getElementById("errorNom").style.color = "white";
            }
            if (prenom === "") {
                document.getElementById("errorPrenom").innerHTML = "veuillez saisir le pseudo";
                document.getElementById("errorPrenom").style.color = "red";
            } else {
                document.getElementById("errorPrenom").innerHTML = "";
                document.getElementById("errorPrenom").style.color = "white";
            }
            if (pseudo === "") {
                document.getElementById("errorPseudo").innerHTML = "veuillez saisir le pseudo";
                document.getElementById("errorPseudo").style.color = "red";
            } else {
                document.getElementById("errorPseudo").innerHTML = "";
                document.getElementById("errorPseudo").style.color = "white";
            }
            if (pass === "") {
                document.getElementById("errorPas").innerHTML = "veuillez saisir le password";
                document.getElementById("errorPas").style.color = "red";
            } else {
                document.getElementById("errorPas").innerHTML = "";
                document.getElementById("errorPas").style.color = "white";
            }
            if (secondPassword === "") {
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
        let msg = "<t8>Liste des joueurs</t8><br><br>";
        for (let i = 0; i < tab.length; i++) {
            msg += "<button class='btn btn-primary' onclick='traceStats(\"" + tab[i].idPlayer + "\")'>" + tab[i].nom + "</button><br><br>";
        }
        msg += "<br><br>";
        document.getElementById("listeJoueur").innerHTML = msg;
    });
}

let boolGraph = false;

function traceStats(id) {
    if (boolGraph) {
        location.reload();
        console.log("test");


    } else {
        boolGraph = true;
        recpDonne(id);
        console.log("test2");
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

function tailleChat(message) {
    let test="";
    if (message.length>30){
        let nbLignePourPhrase = Math.ceil(message.length / 30);
        for (let i =1;i<nbLignePourPhrase;i++){
            if (i === 1) {
                if (message[31] !== " " && message[33] !== " ") {
                    test = "<br>" + message.substring(0, 32) + "-"+"<br>";
                } else {
                    test = "<br>" + message.substring(0, 32) + "<br>";
                }
            }else if(i === nbLignePourPhrase-1) {
                if (message[(30*i)-1]!==" "&& message[(30*i)+1]!==" ") {
                    test +=  message.substring(30*i,(30*(i+1)));
                }else {
                    test +=  message.substring(30*i,(30*(i+1)));
                }
            }else if (i >1) {
                if (message[(30*i)-1]!==" "&& message[(30*i)+1]!==" ") {
                    test +=  message.substring(30*i,(30*(i+1)))+ "-"+"<br>";
                }else {
                    test +=  message.substring(30*i,(30*(i+1)))+ "<br>";
                }
            }
        }
    }else {
        test = message;
    }
    test[test.length-6]="z";
    console.log(test);
    return test;

}


function infoJoueur(tabStats) {


    let pseudo = tabStats.pseudo;
    $('#infoJoueur').append(
        "<ul class=\"list-group\">\n" +
        "  <li class=\"list-group-item active\" style='text-align: center;'>"+pseudo+"</li>\n" +
        "  <li class=\"list-group-item\"style='text-align: justify;'>Prenom :"+tabStats.prenom+"</li>\n" +
        "  <li class=\"list-group-item\"style='text-align: justify;'>Nom :"+tabStats.nom+"</li>\n" +
        "  <li class=\"list-group-item\"style='text-align: justify;'>Date d'inscription :"+tabStats.dateInscription+"</li>\n" +
        "  <li class=\"list-group-item\"style='text-align: justify;'>Nombre de jetons : " + tabStats.jetons+"</li>\n" +
        "</ul>"
        // "<table border='2'><tr><td>Pseudo : " + pseudo + "<br>Prenom :"  + tabStats.prenom + "<br> Nom : " + tabStats.nom + " + <br>Date d'inscription :  "+ tabStats.dateInscription + '<br>'+ "Nombre de jetons :  + tabStats.jetons + <br>"+ "</table></td></tr>"

    );

}


function init() {
    // let Game = require('./Game');
    // let Player = require('./Player');
    let id = 0;
    let player;
    let game;
    let room;

    socket.on('nombreJetonJoueurAffichage', (data) => {
        document.getElementById("jetonDispo").innerText = data.jeton;
        $("#jetonNew").attr({"max" : data.jeton,});
        $("#jetonNewJoin").attr({"max" : data.jeton,});

        $('#new').on('click', () => {
            const jeton = $('#jetonNew').val();
            const roomId = $('#room').val();
            if (!jeton || jeton < 100 || jeton > data.jeton) {
                alert('Nombre de jetons incorrecte');
                return;
            }
            player = new Player(id++, getCookie("userCookie"), parseInt(jeton));
            socket.emit('createGame', {name: getCookie("userCookie"), jeton: parseInt(jeton)});
            $(window).on('unload', function () {
                socket.emit("exit", {room: roomId, playerName: player.name, jetonP: parseInt(jeton)});
            });
        });

        socket.on('affichageBouton', (data) => {
            if (data.jeton > 100) {
                $('.remettreJeton').hide();
            }else{
                $('.remettreJeton').show();
            }
        });

        $(document).ready(function () {
            socket.emit('remettreJetonJoueur', {pseudo: getCookie("userCookie")});
        });

        $('#remettreJeton').on('click', () => {
            console.log("coucou");
            socket.emit('remettreJeton',{pseudo: getCookie("userCookie")});
            location.reload();
        });

        $('#join').on('click', () => {
            const roomID = $('#select').val();
            const jeton = $('#jetonNewJoin').val();
            const roomId = $('#room').val();
            if (!roomID || !jeton || jeton < 100 || jeton > data.jeton) {
                alert('Nombre de jetons incorrecte.');
                return;
            }
            player = new Player(id++, getCookie("userCookie"), parseInt(jeton), roomID);
            socket.emit('joinGame', {name: getCookie("userCookie"), room: roomID, jeton: parseInt(jeton)});
            socket.emit('messageGameExit', {room: roomId, playerName: player.name, action: "join"});
            $('#tablejoinpart').hide();
            $(window).on('unload', function () {
                socket.emit("exit", {room: roomId, playerName: player.name});
            });
        });
    });

    socket.on('newGame', (data) => {
        const message = `Hello, ${data.name}. Vous êtes dans le salon numéro: ${data.room}`;
        // Create game for player 1
        room = `${data.room}`;
        game = new Game(); //data.room
        game.displayBoard(message);
        document.getElementById('all-in').style.display = "none";
        document.getElementById('check').style.display = "none";
        document.getElementById('suivre').style.display = "none";
        document.getElementById('raise').style.display = "none";
        document.getElementById('coucher').style.display = "none";

        if (data.nbJoueurs === 1) {
            let message = "En attente d'adversaire";
            document.getElementById('turn').innerHTML = message;
            document.getElementById('all-in').style.display = "none";
            document.getElementById('check').style.display = "none";
            document.getElementById('suivre').style.display = "none";
            document.getElementById('raise').style.display = "none";
            document.getElementById('coucher').style.display = "none";
        }

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
        document.getElementById('all-in').style.display = "none";
        document.getElementById('check').style.display = "none";
        document.getElementById('suivre').style.display = "none";
        document.getElementById('raise').style.display = "none";
        document.getElementById('coucher').style.display = "none";

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

    socket.on('1stR', (data) => {

        let message;
        let cartes;
        let jetons;


        console.log(data.nbJoueurs);

        if(data.nbJoueurs === 2){
            document.jetonJoueur2.style.visibility = "visible";
            document.CarteJoueur3.style.visibility = "visible";
            document.CarteJoueur4.style.visibility = "visible";
            document.jetonJoueur3.style.visibility = "hidden";
            document.CarteJoueur5.style.visibility = "hidden";
            document.CarteJoueur6.style.visibility = "hidden";
        }


        if(data.nbJoueurs === 3){
            document.jetonJoueur2.style.visibility = "visible";
            document.CarteJoueur3.style.visibility = "visible";
            document.CarteJoueur4.style.visibility = "visible";
            document.jetonJoueur3.style.visibility = "visible";
            document.CarteJoueur5.style.visibility = "visible";
            document.CarteJoueur6.style.visibility = "visible";
        }

        if(data.nbJoueurs === 4){
            document.jetonJoueur3.style.visibility = "visible";
            document.CarteJoueur5.style.visibility = "visible";
            document.CarteJoueur6.style.visibility = "visible";
            document.jetonJoueur4.style.visibility = "visible";
            document.CarteJoueur7.style.visibility = "visible";
            document.CarteJoueur8.style.visibility = "visible";
        }


        if (data.currentTurn === player.name) {

            // chrono();

            message = "A votre tour";
            document.getElementById('all-in').style.display = "inline";
            document.getElementById('check').style.display = "inline";
            document.getElementById('suivre').style.display = "none";
            document.getElementById('raise').style.display = "inline";
            document.getElementById('coucher').style.display = "inline";
            const roomId = $('#room').val();
            const jeton = $('#jetonNew').val();

            console.log("room : "+roomId);

            chronoStart(1, data.currentTurn, parseInt(jeton));

        } else {
            message = "A votre adversaire";
            document.getElementById('all-in').style.display = "none";
            document.getElementById('check').style.display = "none";
            document.getElementById('suivre').style.display = "none";
            document.getElementById('raise').style.display = "none";
            document.getElementById('coucher').style.display = "none";
        }

        document.getElementById('pot').innerHTML = data.pot;
        document.getElementById('turn').innerHTML = message;

        for (let i = 0; i < data.nbJoueurs; i++) {
            if (data.name[i] === player.name) {
                cartes = data.cartes[i];
                jetons = data.jetons[i];

                document.getElementById('label0').innerHTML = jetons;
                if (i === 0) {
                    if (data.jetons[i + 1] !== undefined) {
                        document.getElementById('label2').innerHTML = data.jetons[i + 1] +" ("+ data.name[i+1] + ")";
                    }
                    if (data.jetons[i + 2] !== undefined) {
                        document.getElementById('label1').innerHTML = data.jetons[i + 2] +" ("+ data.name[i+2] + ")";
                    }
                    if (data.jetons[i + 3] !== undefined) {
                        document.getElementById('label3').innerHTML = data.jetons[i + 3] +" ("+ data.name[i+3] + ")";
                    }
                }
                if (i === 1) {
                    if (data.jetons[i - 1] !== undefined) {
                        document.getElementById('label2').innerHTML = data.jetons[i - 1] +" ("+ data.name[i-1] + ")";
                    }
                    if (data.jetons[i + 1] !== undefined) {
                        document.getElementById('label1').innerHTML = data.jetons[i + 1] +" ("+ data.name[i+1] + ")";
                    }
                    if (data.jetons[i + 2] !== undefined) {
                        document.getElementById('label3').innerHTML = data.jetons[i + 2] +" ("+ data.name[i+2] + ")";
                    }
                }
                if (i === 2) {
                    if (data.jetons[i - 2] !== undefined) {
                        document.getElementById('label2').innerHTML = data.jetons[i - 2] +" ("+ data.name[i-2] + ")";
                    }
                    if (data.jetons[i - 1] !== undefined) {
                        document.getElementById('label1').innerHTML = data.jetons[i - 1] +" ("+ data.name[i-1] + ")";
                    }
                    if (data.jetons[i + 1] !== undefined) {
                        document.getElementById('label3').innerHTML = data.jetons[i + 1] +" ("+ data.name[i+1] + ")";
                    }

                }
                if (i === 3) {
                    if (data.jetons[i - 3] !== undefined) {
                        document.getElementById('label2').innerHTML = data.jetons[i - 3] +" ("+ data.name[i-3] + ")";
                    }
                    if (data.jetons[i - 2] !== undefined) {
                        document.getElementById('label1').innerHTML = data.jetons[i - 2] +" ("+ data.name[i-2] + ")";
                    }
                    if (data.jetons[i - 1] !== undefined) {
                        document.getElementById('label3').innerHTML = data.jetons[i - 1] +" ("+ data.name[i-1] + ")";
                    }
                }
            }
        }

        if (data.nbJoueurs === 1) {
            message = "En attente d'adversaire";
            document.getElementById('turn').innerHTML = message;
            document.getElementById('all-in').style.display = "none";
            document.getElementById('check').style.display = "none";
            document.getElementById('suivre').style.display = "none";
            document.getElementById('raise').style.display = "none";
            document.getElementById('coucher').style.display = "none";
        }

        if (data.nbJoueurs === 2) {
            document.getElementById("CarteJoueur3").hidden = false;
            document.getElementById("CarteJoueur4").hidden = false;
            document.getElementById("texte").hidden = false;
            document.getElementById("texte2").hidden = false;
            document.getElementById("texte3").hidden = true;
            document.getElementById("texte5").hidden = true;
        }

        if (data.nbJoueurs === 3) {
            document.getElementById("CarteJoueur3").hidden = false;
            document.getElementById("CarteJoueur4").hidden = false;
            document.getElementById("CarteJoueur5").hidden = false;
            document.getElementById("CarteJoueur6").hidden = false;
            document.getElementById("texte").hidden = false;
            document.getElementById("texte2").hidden = false;
            document.getElementById("texte3").hidden = false;
            document.getElementById("texte5").hidden = true;
        }

        if (data.nbJoueurs === 4) {
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

        // if (jetons === 0 || jetons === null) {
        //     console.log("jetons : "+jetons);
        //     window.location.href = "game.html";
        // }

        console.log(jetons);

        if (jetons === undefined) {
            console.log("undefined client");
            const roomId = $('#room').val();
            socket.emit("exit2", {room: roomId, playerName: player.name});

            // window.location.href = "game.html";
        }

        document.CarteJoueur1.src = "image/" + cartes[0] + ".png";
        document.CarteJoueur2.src = "image/" + cartes[1] + ".png";

        document.T1.src = "image/dos.png";
        document.T2.src = "image/dos.png";
        document.T3.src = "image/dos.png";
        document.T4.src = "image/dos.png";
        document.T5.src = "image/dos.png";


    });

    socket.on("exit2r", (data)=>{
        if (data.test) {
            console.log("test");
            window.location.href = "game.html";
        }
    });

    $('#check').on('click', () => {
        const roomId = $('#room').val();
        chronoStop();
        console.log("after clic : "+sec);
        socket.emit('check', {room: roomId, playerName: player.name});
    });

    $('#suivre').on('click', () => {
        const roomId = $('#room').val();
        socket.emit('suivre', {room: roomId, playerName: player.name});

    });

    $('#raise').on('click', () => {
        socket.emit('raiseVerif', {playerName: player.name});
    });

    socket.on("raise", (data) => {
        const roomId = $('#room').val();
        let mise = prompt("Veuillez entrer votre mise:");
        if (mise !== null && mise !== "" && data.jeton >= mise) {
            console.log("ok");
            socket.emit('raise', {room: roomId, playerName: player.name, miseJeton: mise});
        }else{

        }
    });

    $('#all-in').on('click', () => {
        const roomId = $('#room').val();
        socket.emit('all-in', {room: roomId, playerName: player.name});

    });

    $('#coucher').on('click', () => {
        const roomId = $('#room').val();
        socket.emit('coucher', {room: roomId, playerName: player.name});
    });

    $('#exit').on('click', () => {
        // socket.leave(data.room);
        const roomId = $('#room').val();
        const jeton = $('#jetonNew').val();
        socket.emit("exit", {room: roomId, playerName: player.name, jetonP: parseInt(jeton)});
        window.location.href = "game.html"; //retourne a la page d'accueil du jeu

    });

    $('#envoi_message').on('click', () => {
        const roomId = $('#room').val();
        let message = document.getElementById("message").value;
        socket.emit('message', {room: room, pseudo: player.name, message: message});
    });


    socket.on("afficheGameJoin", (data) => {
        document.getElementById("messageGameJoin").style.color = "red";
        document.getElementById("messageGameJoin").innerText = "Connexion / Deconnexion : " + data.playerName + " a fait l'action : " + data.action;
    });

    socket.on('afficheMessage', (data) => {
        // const roomId = $('#room').val();
        // console.log(roomId);

        if (room === `${data.room}`) {
            if (data.message !== ""){
                let start = new Date();
                minutetest();
                $('.message').append('<p ><strong><span id="hour">' +'['+start.getHours() + ':' + minutetest()+']'+'</span>'+'  '+'<span id="name">'+ data.pseudo +'</span></strong> '+ ': '+tailleChat(data.message)+'</p>');
                $("#message").remove();
                $("#messageEmplacement").append('<input style="width:100%" type="text" name="message" id="message" placeholder="Une mauvaise pioche faite le savoir" autofocus/>');
                let elmnt = document.getElementById("chatScroll");
                elmnt.scrollTop = elmnt.scrollHeight;


            }
        }
    });

    socket.on('partieJoueur', (data) => {
        let test = data.tab;
        for (let i = 0; i < test.length; i++) {
            $("#select").append("<option value=\"" + test[i].idPartie + "\">" + test[i].idPartie + "</option>");
            $("#tablePartie").append(
                "<tr>" +
                "<td>" + test[i].idPartie + "</td>" +
                "<td>" + test[i].nbJoueur + "/4 </td>" +
                "</tr>"
            );

        }
    });

    $(document).ready(function () {
        socket.emit('callPartie');
    });

    $(document).ready(function () {
        socket.emit('nombreJetonJoueur', {pseudo: getCookie("userCookie")});
    });


    /**
     * change l'affichage en fonction du resultat envoyer par le serveur
     */
    socket.on('resultAction', (data) => {

        // traitement des messages

        document.getElementById("messageGameAction").style.color = "red";
        document.getElementById("messageGameAction").innerText = "Action : " + data.playerName + " a fait l'action : " + data.actionPrecedente;


        if(data.actionPrecedente === "suivre"){
            document.getElementById("messageGameRaise").style.color = "red";
            document.getElementById("messageGameRaise").innerText = "Mise : " + data.playerName + " a suivi : " + data.jetonsActuellementMiser;
        }
        else if(data.actionPrecedente === "raise"){
            document.getElementById("messageGameRaise").style.color = "red";
            document.getElementById("messageGameRaise").innerText = "Mise : " + data.playerName + " a misé : " + data.miseEnCours;
        }
        else{
            document.getElementById("messageGameRaise").style.color = "black";
            document.getElementById("messageGameRaise").innerText = "Mise : le pot est actuellement a : " + data.pot;
        }



        //desactive les boutons tant que l'autre joueur n'a pas joué

        /**
         * récupère les letiables jetons et cartes du joueur
         */


        let cartes;
        let jetons;
        for (let i = 0; i < data.nbJoueursTable; i++) {
            if (data.name[i] === player.name) {
                cartes = data.cartes[i];
                jetons = parseInt(data.jetons[i]);
                document.getElementById('label0').innerHTML = jetons;
                if (i === 0) {
                    if (data.jetons[i + 1] !== undefined) {
                        console.log("jetons i+1 : "+data.jetons[i+1]);
                        document.getElementById('label2').innerHTML = data.jetons[i + 1] +" ("+ data.name[i+1] + ")";
                    }
                    if (data.jetons[i + 2] !== undefined) {
                        document.getElementById('label1').innerHTML = data.jetons[i + 2] +" ("+ data.name[i+2] + ")";
                    }
                    if (data.jetons[i + 3] !== undefined) {
                        document.getElementById('label3').innerHTML = data.jetons[i + 3] +" ("+ data.name[i+3] + ")";
                    }
                }
                if (i === 1) {
                    if (data.jetons[i - 1] !== undefined) {
                        document.getElementById('label2').innerHTML = data.jetons[i - 1] +" ("+ data.name[i-1] + ")";
                    }
                    if (data.jetons[i + 1] !== undefined) {
                        document.getElementById('label1').innerHTML = data.jetons[i + 1] +" ("+ data.name[i+1] + ")";
                    }
                    if (data.jetons[i + 2] !== undefined) {
                        document.getElementById('label3').innerHTML = data.jetons[i + 2] +" ("+ data.name[i+2] + ")";
                    }
                }
                if (i === 2) {
                    if (data.jetons[i - 2] !== undefined) {
                        document.getElementById('label2').innerHTML = data.jetons[i - 2] +" ("+ data.name[i-2] + ")";
                    }
                    if (data.jetons[i - 1] !== undefined) {
                        document.getElementById('label1').innerHTML = data.jetons[i - 1] +" ("+ data.name[i-1] + ")";
                    }
                    if (data.jetons[i + 1] !== undefined) {
                        document.getElementById('label3').innerHTML = data.jetons[i + 1] +" ("+ data.name[i+1] + ")";
                    }

                }
                if (i === 3) {
                    if (data.jetons[i - 3] !== undefined) {
                        document.getElementById('label2').innerHTML = data.jetons[i - 3] +" ("+ data.name[i-3] + ")";
                    }
                    if (data.jetons[i - 2] !== undefined) {
                        document.getElementById('label1').innerHTML = data.jetons[i - 2] +" ("+ data.name[i-2] + ")";
                    }
                    if (data.jetons[i - 1] !== undefined) {
                        document.getElementById('label3').innerHTML = data.jetons[i - 1] +" ("+ data.name[i-1] + ")";
                    }
                }
            }
        }

        if (data.tour < 6 && data.nbJoueurs !== 1) {

            let message;

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



            //affichage des letiables

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

            let cartes;
            let jetons;
            for (let i = 0; i < data.nbJoueurs; i++) {
                if (data.name[i] === player.name) {
                    cartes = data.cartes[i];
                    jetons = data.jetons[i];
                }
            }

            if (data.nbJoueurs === 1) {
                message = "En attente d'adversaire";
                document.getElementById('turn').innerHTML = message;
                document.getElementById('all-in').style.display = "none";
                document.getElementById('check').style.display = "none";
                document.getElementById('suivre').style.display = "none";
                document.getElementById('raise').style.display = "none";
                document.getElementById('coucher').style.display = "none";
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
            document.getElementById('messageGameAction').style.color = "red";
            document.getElementById('messageGameAction').innerHTML = data.vainqueur + " vainqueur avec : " + data.combiVainq;

            socket.emit('continueGame', {playerName: player.name});

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
            document.getElementById("messageGameAction").style.color = "red";
            document.getElementById("messageGameAction").innerText = "Action : " + data.playerName + " a fait l'action : " + data.actionPrecedente;
        }

        if(data.actionPrecedente === "exit") {
            document.getElementById("messageGameJoin").style.color = "red";
            document.getElementById("messageGameJoin").innerText = "Connexion / Deconnexion : " + data.playerName + " a fait l'action : " + data.actionPrecedente;
            console.log(data.indexPlayerLeave);
            for (let i = 0; i < data.nbJoueurs; i++) {
                if (data.nbJoueurs + 1 === 1) {
                    document.getElementById('label2').innerHTML = "";
                    document.jetonJoueur2.style.visibility = "hidden";
                    document.CarteJoueur3.style.visibility = "hidden";
                    document.CarteJoueur4.style.visibility = "hidden";
                }
                if (data.nbJoueurs + 1 === 2) {
                    document.getElementById('label2').innerHTML = "";
                    document.jetonJoueur2.style.visibility = "hidden";
                    document.CarteJoueur3.style.visibility = "hidden";
                    document.CarteJoueur4.style.visibility = "hidden";
                }
                if (data.nbJoueurs + 1 === 3) {
                    document.getElementById('label1').innerHTML = "";
                    document.jetonJoueur3.style.visibility = "hidden";
                    document.CarteJoueur5.style.visibility = "hidden";
                    document.CarteJoueur6.style.visibility = "hidden";
                }
                if (data.nbJoueurs + 1 === 4) {
                    document.getElementById('label3').innerHTML = "";
                    document.jetonJoueur4.style.visibility = "hidden";
                    document.CarteJoueur7.style.visibility = "hidden";
                    document.CarteJoueur8.style.visibility = "hidden";

                }

            }

        }


    });
}