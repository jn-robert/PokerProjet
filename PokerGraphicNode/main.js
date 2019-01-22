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

function init() {
    // var Game = require('./Game');
    // var Player = require('./Player');
    let id = 0;
    let player;

    let game;

    // const socket = io.connect('myip:5000');
    const socket = io.connect('http://localhost:5000');

    // Create a new game. Emit newGame event.
    $('#new').on('click', () => {
        // game = new Game($('#room').val());
        const name = $('#nameNew').val();
        const jeton = $('#jetonNew').val();
        if (!name || !jeton) {
            alert('Erreur.');
            return;
        }
        socket.emit('createGame', {name, jeton});
        player = new Player(id++, name, jeton);
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
        socket.emit('joinGame', {name, room: roomID, jeton});
        player = new Player(id++, name, jeton);
        // game.addPlayer(id, name, jeton);

    });

    // New Game created by current client. Update the UI and create new Game var.
    // game = new Game();
    socket.on('newGame', (data) => {
        const message =
            `Hello, ${data.name}. no du salon: 
      ${data.room}`;

        // Create game for player 1
        game = new Game(); //data.room
        game.displayBoard(message);

    });

    /**
     * If player creates the game, he'll be P1 and has the first turn.
     * This event is received when opponent connects to the room.
     */
    //affichage suite a reception
    socket.on('message', function(data) {
        insereMessage(data.name, data.message)
    })



    //information de connection d'un nouveau membre
    socket.on('nouveau_client', function(name) {
        $('#zone_chat').prepend('<p><em>' + name + ' a rejoint la conversation</em></p>');
    })




    //partie qui ajoute le message dans la zone de chat
    $('#formulaire_chat').submit(function () {
        var message = $('#message').val(); //cf doc socket.io
        socket.emit('message', message);
        insereMessage(name, message);
        $('#message').val('').focus();
        return false;
    });


    //partie qui ajoute le message dans la zone de chat
    function insereMessage(name, message) {
        $('#zone_chat').prepend('<p><strong>' + name + '</strong> ' + message + '</p>');
    }
    socket.on('player1', (data) => {
        const message = `Hello, ${data.name}`;
        $('#userHello').html(message);
        player.setCurrentTurn(true);
        // game.addPlayer(player.getId(), player.getPlayerName(), player.getJetons());
    });

    /**
     * Joined the game, so player is P2.
     * This event is received when P2 successfully joins the game room.
     */
    socket.on('player2', (data) => {
        const message = `Hello, ${data.name}`;

        // Create game for player 2
        game = new Game(); //data.room
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

        console.log(data.pot);
        document.getElementById('pot').innerHTML = "Pot : " + data.pot;
        document.getElementById('texte').innerHTML = data.jetons1 + " jetons";
        document.getElementById('texte2').innerHTML = data.jetons2 + " jetons";
        document.CarteJoueur1.src = "image/" + data.cartes[0] + ".png";
        document.CarteJoueur2.src = "image/" + data.cartes[1] + ".png";
        document.T1.src = "image/dos.png";
        document.T2.src = "image/dos.png";
        document.T3.src = "image/dos.png";
        document.T4.src = "image/dos.png";
        document.T5.src = "image/dos.png";
        document.getElementById('texteGagnant').innerHTML = "";
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

    /**
     * change l'affichage en fonction du resultat envoyer par le serveur
     */
    socket.on('resultAction', (data) => {
        //desactive les boutons tant que l'autre joueur n'a pas joué

        if (data.tour < 6) {
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
                    if (data.jetons1 > 0) {
                        document.getElementById('all-in').disabled = !data.booleanCurrentTurn;
                        document.getElementById('check').disabled = !data.booleanCurrentTurn;
                        document.getElementById('suivre').disabled = true;
                        document.getElementById('raise').disabled = !data.booleanCurrentTurn;
                    } else {
                        console.log("joueur else default");
                        document.getElementById('all-in').disabled = true;
                        document.getElementById('check').disabled = false;
                        document.getElementById('suivre').disabled = true;
                        document.getElementById('raise').disabled = true;
                        document.getElementById('coucher').disabled = true;
                    }
            }

            document.getElementById('coucher').disabled = !data.booleanCurrentTurn;

            //affichage des variables
            document.getElementById('turn').innerHTML = message;
            document.getElementById('pot').innerHTML = "Pot : " + data.pot;
            document.getElementById('texte').innerHTML = data.jetons1 + " jetons";
            document.getElementById('texte2').innerHTML = data.jetons2 + " jetons";
            document.getElementById('texte3').innerText = data.tasJoueur1 + " jetons";
            document.getElementById('texte5').innerHTML = data.tasJoueur2 + " jetons";
            document.CarteJoueur1.src = "image/" + data.cartes[0] + ".png";
            document.CarteJoueur2.src = "image/" + data.cartes[1] + ".png";
        } else {
            document.getElementById('pot').innerHTML = "Pot : " + data.pot;
            document.getElementById('texte').innerHTML = data.jetons1 + " jetons";
            document.getElementById('texte2').innerHTML = data.jetons2 + " jetons";
            document.getElementById('texte3').innerText = data.tasJoueur1 + " jetons";
            document.getElementById('texte5').innerHTML = data.tasJoueur2 + " jetons";
            document.CarteJoueur1.src = "image/" + data.cartes[0] + ".png";
            document.CarteJoueur2.src = "image/" + data.cartes[1] + ".png";
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
            // socket.emit('continueGame', {playerName: player.name});
        }
        let compteur = 0;
        let compteur2 = 0;
        if (data.tour > 2 && data.tour <= 6 && data.choixJoueurs !== 'coucher') {
            for (let i = 0; i < data.tour; i++) {
                console.log(data.cartesTapis[i]);
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
