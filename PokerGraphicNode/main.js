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
        this.currentTurn=null;
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

    // const socket = io.connect('http://tic-tac-toe-realtime.herokuapp.com'),
    const socket = io.connect('http://localhost:5000');

    // roomId Id of the room in which the game is running on the server.



    // Create a new game. Emit newGame event.
    /*var game;*/
    $('#new').on('click', () => {
        // game = new Game($('#room').val());
        const name = $('#nameNew').val();
        const jeton = $('#jetonNew').val();
        if (!name || !jeton) {
            alert('Erreur.');
            return;
        }
        socket.emit('createGame', { name, jeton });
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
        socket.emit('joinGame', { name, room: roomID, jeton });
        player = new Player(id++,name, jeton);
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
     * If player creates the game, he'll be P1(X) and has the first turn.
     * This event is received when opponent connects to the room.
     */
    socket.on('player1', (data) => {
        const message = `Hello, ${data.name}`;
        $('#userHello').html(message);
        player.setCurrentTurn(true);
        // game.addPlayer(player.getId(), player.getPlayerName(), player.getJetons());
    });

    /**
     * Joined the game, so player is P2(O).
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
        socket.emit('start', { room: roomID, playerName: player.name });
    });

    socket.on('1stR', (data) => {
        document.getElementById('start').disabled=true;
        //desactive les boutons tant que l'autre joueur n'a pas joué
        document.getElementById('all-in').disabled = !data.booleanCurrentTurn;
        document.getElementById('check').disabled = !data.booleanCurrentTurn;
        document.getElementById('suivre').disabled = !data.booleanCurrentTurn;
        document.getElementById('fold').disabled = !data.booleanCurrentTurn;
        document.getElementById('coucher').disabled = !data.booleanCurrentTurn;

        console.log(data.pot);
        document.getElementById('pot').innerHTML ="Pot : " +data.pot;
        document.getElementById('texte').innerHTML =data.jetons1+" jetons";
        document.getElementById('texte2').innerHTML =data.jetons2+" jetons";
        document.CarteJoueur1.src = "image/" + data.cartes[0] +".PNG" ;
        document.CarteJoueur2.src = "image/" + data.cartes[1] +".PNG" ;
    });

    $('#check').on('click', () =>{
        const roomId = $('#room').val();
        socket.emit('check', {room: roomId, playerName: player.name});
    });

    socket.on('resultAction', (data) => {
        const message = data.booleanCurrentTurn ? 'A votre tour' : 'A votre adversaire';

        //desactive les boutons tant que l'autre joueur n'a pas joué
        document.getElementById('all-in').disabled = !data.booleanCurrentTurn;
        document.getElementById('check').disabled = !data.booleanCurrentTurn;
        document.getElementById('suivre').disabled = !data.booleanCurrentTurn;
        document.getElementById('fold').disabled = !data.booleanCurrentTurn;
        document.getElementById('coucher').disabled = !data.booleanCurrentTurn;

        //affichage des variables
        document.getElementById('turn').innerHTML = message;
        document.getElementById('pot').innerHTML ="Pot : " +data.pot;
        document.getElementById('texte').innerHTML =data.jetons1+" jetons";
        document.getElementById('texte2').innerHTML =data.jetons2+" jetons";
        document.CarteJoueur1.src = "image/" + data.cartes[0] +".PNG" ;
        document.CarteJoueur2.src = "image/" + data.cartes[1] +".PNG" ;

        let compteur = 0;
        let compteur2 = 0;
        if (data.tour>2 && data.tour<=5) {
            for (let i = 0; i<data.tour; i++){
                console.log(data.cartesTapis[i]);
            }
            data.cartesTapis.forEach(function (entry) {
                switch (compteur) {
                    case 0:
                        document.T1.src = "image/" + entry +".PNG" ;
                        compteur++;
                        break;
                    case 1:
                        document.T2.src = "image/" + entry +".PNG" ;
                        compteur++;
                        break;
                    case 2:
                        document.T3.src = "image/" + entry +".PNG" ;
                        compteur++;
                        break;
                    case 3:
                        if (compteur<data.tour) {
                            document.T4.src = "image/" + entry + ".PNG";
                            compteur++;
                        }
                        break;
                    case 4:
                        if (compteur<data.tour) {
                            document.T5.src = "image/" + entry + ".PNG";
                        }
                        break;
                }
            });
        }
    });
}
