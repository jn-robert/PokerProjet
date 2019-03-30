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

function date() {
    var start = new Date();
    document.getElementById("date").innerHTML = "Dernier message le " + start.getDate() + " / " + start.getMonth() + " / " + start.getFullYear() + " à " + start.getHours() + ":" + start.getMinutes();
}

function stat() {

    $(document).ready(function () {
        socket.emit('callListJoueur');
    });

    socket.on('listJoueur', (data) => {
        let tab = data.tab;
        let msg = "<t8>Liste des joueurs</t8><br>";
        for (var i = 0; i < tab.length; i++) {
            msg += "<button onclick='traceStats(\"" + tab[i].nom + "\")'>" + tab[i].nom + "</button><br>";
        }
        msg += "<br><br>";
        document.getElementById("listeJoueur").innerHTML = msg;
    });
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
        const name = $('#nameNew').val();
        const jeton = $('#jetonNew').val();
        if (!name || !jeton) {
            alert('Erreur.');
            return;
        }
        player = new Player(id++, name, parseInt(jeton));
        socket.emit('createGame', {name, jeton: parseInt(jeton)});
    });

    // Join an existing game on the entered roomId. Emit the joinGame event.
    $('#join').on('click', () => {
        const name = $('#nameJoin').val();
        const roomID = $('#room').val();
        const jeton = $('#jetonNewJoin').val();
        if (!name || !roomID || !jeton) {
            alert('Erreur.');
            return;
        }
        player = new Player(id++, name, parseInt(jeton), roomID);
        socket.emit('joinGame', {name, room: roomID, jeton: parseInt(jeton)});
        // game.addPlayer(id, name, jeton);
        $('#tablejoinpart').hide();

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
        player.setCurrentTurn(true);
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
        document.getElementById('start').disabled = true;
        //desactive les boutons tant que l'autre joueur n'a pas joué
        document.getElementById('all-in').disabled = !data.booleanCurrentTurn;
        document.getElementById('check').disabled = !data.booleanCurrentTurn;
        document.getElementById('suivre').disabled = true;
        document.getElementById('raise').disabled = !data.booleanCurrentTurn;
        document.getElementById('coucher').disabled = !data.booleanCurrentTurn;

        document.getElementById('pot').innerHTML = "Pot : " + data.pot;
        /*
        document.getElementById('texte').innerHTML = data.jetons1 + " jetons";
        document.getElementById('texte2').innerHTML = data.jetons2 + " jetons";
        */
        let cartes;
        for (let i = 0; i < data.nbJoueurs; i++) {
            if (data.name[i] === player.name) {
                cartes = data.cartes[i];
                jetons = data.jetons[i];
                document.getElementById('label0').innerHTML = jetons;
                if (i == 0) {
                    document.getElementById('label2').innerHTML = data.jetons[i + 1];
                    document.getElementById('label1').innerHTML = data.jetons[i + 2];
                    document.getElementById('label3').innerHTML = data.jetons[i + 3];
                    console.log(data.jetons[i + 1])
                }
                if (i == 1) {
                    document.getElementById('label2').innerHTML = data.jetons[i - 1];
                    document.getElementById('label1').innerHTML = data.jetons[i + 1];
                    document.getElementById('label3').innerHTML = data.jetons[i + 2];
                    console.log(data.jetons[i - 1])
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
            document.getElementById("texte2").hidden = false
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
    });

    $('#suivre').on('click', () => {
        const roomId = $('#room').val();
        socket.emit('suivre', {room: roomId, playerName: player.name});
    });

    $('#raise').on('click', () => {
        const roomId = $('#room').val();
        socket.emit('raise', {room: roomId, playerName: player.name});
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
        location.reload(); //retourne a la page d'accueil du jeu
    });

    $('#envoi_message').on('click', () => {
        const roomId = $('#room').val();
        console.log("roomId : " + roomId);
        var message = document.getElementById("message").value;
        socket.emit('message', {room: room, pseudo: player.name, message: message});
    });

    socket.on('afficheMessage', (data) => {
        console.log("room " + data.room);
        console.log("roomId : " + room);
        // const roomId = $('#room').val();
        // console.log(roomId);

        if (room === `${data.room}`) {
            date();
            $('.message').append('<p><strong>' + data.pseudo + '</strong> ' + data.message + '</p>');
            var elmnt = document.getElementById("chatScroll");
            elmnt.scrollTop = elmnt.scrollHeight;
        }
    });

    socket.on('partieJoueur', (data) => {
        var test = data.tab;

        $(test25).append("<tbody id='mainbody'>");
        for (var i = 0; i<test.length ;i++) {
            var $newTr = $("<tr></tr>");
            $newTr.attr('id', 'newTr' + i);
            console.log("newTr" + i);
            // console.log(newTr+i);
            $(test25).append($newTr);
            $($newTr).append("<td><input type=\"text\" name=\"name\" id=\"nameJoin\" placeholder=\"Nom joueur\" required></td>");
            $($newTr).append("<td>"+ test[i].idPartie+"</td>");
            $($newTr).append("<td>"+test[i].nbJoueur+"</td>");
            $($newTr).append("<td><input type=\"number\" name=\"name\" id=\"jetonNewJoin\" placeholder=\"Nombre jetons\" required/></td>");
            $($newTr).append("<button id=\"join\" class=\"btn btn-primary\">Rejoindre une partie</button>");
            $($newTr).append("<br>");
            $(test25).append("</tr>");
        }
        $(test25).append("</tbody>");
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
        for (let i = 0; i < data.nbJoueurs; i++) {
            if (data.name[i] === player.name) {
                cartes = data.cartes[i];
                jetons = data.jetons[i];
                document.getElementById('label0').innerHTML = jetons;
                if (i == 0) {
                    document.getElementById('label2').innerHTML = data.jetons[i + 1];
                    document.getElementById('label1').innerHTML = data.jetons[i + 2];
                    document.getElementById('label3').innerHTML = data.jetons[i + 3];
                    console.log(data.jetons[i + 1])
                }
                if (i == 1) {
                    document.getElementById('label2').innerHTML = data.jetons[i - 1];
                    document.getElementById('label1').innerHTML = data.jetons[i + 1];
                    document.getElementById('label3').innerHTML = data.jetons[i + 2];
                    console.log(data.jetons[i - 1])
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

        if (data.tour < 6 && data.nbJoueurs!==1) {

            const message = data.booleanCurrentTurn ? 'A votre tour' : 'A votre adversaire';

            // document.getElementById('raise').disabled = data.tasHaut - data.tasJoueur2 > data.jetons2;

            switch (data.choixJoueurs) {
                case "check":
                    if (data.jetons1 > 0) {
                        console.log("joueur check");
                        document.getElementById('all-in').disabled = !data.booleanCurrentTurn;
                        document.getElementById('check').disabled = !data.booleanCurrentTurn;
                        document.getElementById('suivre').disabled = true;
                        document.getElementById('raise').disabled = !data.booleanCurrentTurn;
                    } else {
                        console.log("joueur else check");
                        document.getElementById('all-in').disabled = true;
                        document.getElementById('check').disabled = false;
                        document.getElementById('suivre').disabled = true;
                        document.getElementById('raise').disabled = true;
                    }
                    break;
                case "raise":
                    if (data.jetons1 > 0) {
                        console.log("joueur raise");
                        document.getElementById('all-in').disabled = !data.booleanCurrentTurn;
                        document.getElementById('check').disabled = true;
                        document.getElementById('suivre').disabled = !data.booleanCurrentTurn;
                        document.getElementById('raise').disabled = !data.booleanCurrentTurn;
                    } else {
                        console.log("joueur else raise");
                        document.getElementById('all-in').disabled = true;
                        document.getElementById('check').disabled = false;
                        document.getElementById('suivre').disabled = true;
                        document.getElementById('raise').disabled = true;
                    }
                    break;
                case "suivre":
                    if (data.jetons1 > 0) {
                        console.log("joueur suivre");
                        document.getElementById('all-in').disabled = !data.booleanCurrentTurn;
                        document.getElementById('check').disabled = true;
                        document.getElementById('suivre').disabled = !data.booleanCurrentTurn;
                        document.getElementById('raise').disabled = !data.booleanCurrentTurn;
                    } else {
                        console.log("joueur else suivre");
                        document.getElementById('all-in').disabled = false;
                        document.getElementById('check').disabled = true;
                        document.getElementById('suivre').disabled = false;
                        document.getElementById('raise').disabled = false;
                    }
                    break;
                case "all-in":
                    if (data.jetons1 > 0) {
                        console.log("joueur all-in");
                        document.getElementById('all-in').disabled = !data.booleanCurrentTurn;
                        document.getElementById('check').disabled = true;
                        document.getElementById('suivre').disabled = !data.booleanCurrentTurn;
                        document.getElementById('raise').disabled = !data.booleanCurrentTurn;
                    } else {
                        console.log("joueur else all-in");
                        document.getElementById('all-in').disabled = true;
                        document.getElementById('check').disabled = false;
                        document.getElementById('suivre').disabled = true;
                        document.getElementById('raise').disabled = true;
                        document.getElementById('coucher').disabled = true;
                    }
                    break;

                default:
                    // if (data.jetons1 > 0) {
                    //     document.getElementById('all-in').disabled = !data.booleanCurrentTurn;
                    //     document.getElementById('check').disabled = !data.booleanCurrentTurn;
                    //     document.getElementById('suivre').disabled = true;
                    //     document.getElementById('raise').disabled = !data.booleanCurrentTurn;
                    // } else {
                    console.log("joueur else default");
                    document.getElementById('all-in').disabled = false;
                    document.getElementById('check').disabled = false;
                    document.getElementById('suivre').disabled = true;
                    document.getElementById('raise').disabled = false;
                    document.getElementById('coucher').disabled = false;
                // }
            }

            document.getElementById('coucher').disabled = false;

            let cartes=null;
            let jetons;
            for (let i = 0; i < data.nbJoueurs; i++) {
                if (data.name[i] === player.name) {
                    cartes = data.cartes[i];
                    jetons = data.jetons[i];
                }
            }

            //console.log(data.cartes);

            //affichage des variables

            document.getElementById('turn').innerHTML = message;
            document.getElementById('pot').innerHTML = "Pot : " + data.pot;
            if (cartes != null) {
                document.CarteJoueur1.src = "image/" + cartes[0] + ".png";
                document.CarteJoueur2.src = "image/" + cartes[1] + ".png";
            }else {
                document.CarteJoueur1.src = "image/dos.png";
                document.CarteJoueur2.src = "image/dos.png";
            }
        } else {

            let cartes=null;
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
            }else {
                document.CarteJoueur1.src = "image/dos.png";
                document.CarteJoueur2.src = "image/dos.png";
            }
            document.getElementById('turn').innerHTML = "fin partie";
            document.getElementById('all-in').disabled = true;
            document.getElementById('check').disabled = true;
            document.getElementById('suivre').disabled = true;
            document.getElementById('raise').disabled = true;
            document.getElementById('coucher').disabled = true;
            // document.getElementById('start').disabled=false;

            console.log(data.vainqueur);
            document.getElementById('texteGagnant').innerHTML = data.vainqueur + " vainqueur avec : " + data.combiVainq;
            // console.log(data.combiVainq);
            socket.emit('continueGame', {playerName: player.name});
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
            document.getElementById('texteGagnant').innerHTML = "";
        }
    });
}