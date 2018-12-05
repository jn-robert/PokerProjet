(function init() {
    let id = 0;
    let player;
    let game;

    // const socket = io.connect('http://tic-tac-toe-realtime.herokuapp.com'),
    const socket = io.connect('http://localhost:5000');

    class Player {
        constructor(id,name,jetons) {
            this.id = id;
            this.name = name;
            this.jetons = jetons;
            this.main = [];
            this.tas = 0;
            this.ajoue = false;
        };

        // Set the currentTurn for player to turn and update UI to reflect the same.
        setCurrentTurn(turn) {
            this.currentTurn = turn;
            const message = turn ? 'A votre tour' : 'A votre adversaire';
            $('#turn').text(message);
        };

        getPlayerName() {
            return this.name;
        };

        getCurrentTurn() {
            return this.currentTurn;
        };

        getAction(){

        };

        getJetons(){
            return this.jetons;
        };

        addMain(carte){
            this.main.push(carte);
        };

        getMain(){
            return this.main;
        };

        getTas(){
            return this.tas;
        };

        coucher(){
            this.main=[];
        };

        fold(mise) {
            if (mise <= this.jetons){
                this.jetons -= mise;
                this.tas += mise;
            }
        };

        allin() {
            this.tas += this.jetons;
            this.jetons = 0;
        };

        callCheck() {

        };

        raise(mise,miseJoueur) {
            if (mise <= this.jetons && miseJoueur <= this.jetons && miseJoueur > mise ){
                this.jetons -= miseJoueur;
                this.tas += miseJoueur;
            }
        };

        reset() {
            this.main = [];
            this.tas = 0;
        };
    }

    // roomId Id of the room in which the game is running on the server.
    class Game {
        constructor(roomId) {
            this.roomId = roomId;
            this.listePlayerTable = [];
            this.listePlayerGame = [];
            this.pot = 0;
            this.cartes = new Carte();
            this.tapisCarte = [];
            this.dealer = 0;
            this.tour = 0;
        }

        // Create the Game board by attaching event listeners to the buttons.
        // Remove the menu from DOM, display the gameboard and greet the player.
        displayBoard(message) {
            $('.menu').css('display', 'none');
            $('.gameBoard').css('display', 'block');
            $('#userHello').html(message);
        }

        getRoomId() {
            return this.roomId;
        }

        // Send an update to the opponent to update their UI's tile
        playTurn() {
            // Emit an event to update other player that you've played your turn.
            socket.emit('playTurn', {room: this.getRoomId()});
        }

        getTapis(){
            return this.tapisCarte;
        };

        addPlayer(id,name,jetons) {
            let newPlayer = new Player(id, name, jetons);
            newPlayer.game = this;
            this.listePlayerTable.push(newPlayer);
            this.listePlayerGame.push(newPlayer);
        };

        reset() {
            this.pot = 0;
            this.cartes = new Cartes();
            for (let i=0; i<this.listePlayerGame.length; i++) {
                this.listePlayerGame[i].reset();
            }
            this.tour=0;
        };

        blind(petiteBlinde, grosseBlinde){
            if (this.dealer>=this.listePlayerGame.length){
                this.dealer=0;
            }
            this.listePlayerGame[this.dealer+1].fold(petiteBlinde);
            if (this.dealer+2<this.listePlayerGame.length) {
                this.listePlayerGame[this.dealer + 2].fold(grosseBlinde);
            }else {
                this.listePlayerGame[0].fold(grosseBlinde);
            }
            this.pot=petiteBlinde+grosseBlinde;
            this.dealer++;
        };

        affichage(){
            var compteur = 0;
            var compteur2 = 0;
            console.log();
            console.log();

            document.getElementById('pot').innerHTML ='Pot : ' +this.pot;
            console.log('Pot : '+this.pot);
            console.log('Tapis : ');

            if (this.tour<=5) {
                for (let i = 0; i<this.tour; i++){
                    console.log(this.tapisCarte[i]);
                }
                this.getTapis().forEach(function (entry) {
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
                            document.T4.src = "image/" + entry +".PNG" ;
                            compteur++;
                            break;
                        case 4:
                            document.T5.src = "image/" + entry +".PNG" ;
                            compteur++;
                            break;
                    }
                });
            }
            console.log();
            console.log('Joueurs :');
            for (let i=0;i<this.listePlayerGame.length;i++){
                label = "label".concat(i.toString());
                document.getElementById(label).innerHTML = this.listePlayerGame[i].getJetons().toString() + " jetons";
                this.listePlayerGame[i].getMain().forEach(function (entry) {
                    switch (compteur2) {
                        case 0:
                            document.CarteJoueur1.src = "image/" + entry +".PNG" ;
                            compteur2++;
                            break;
                        case 1:
                            document.CarteJoueur2.src = "image/" + entry +".PNG" ;
                            compteur2++;
                            break;
                    }
                });
                console.log(''+this.listePlayerGame[i].getNom()+" : "+this.listePlayerGame[i].getMain()+", "+this.listePlayerGame[i].getJetons()+" coins");
            }
        };

        /**
         * affiche les options mise, check, coucher, all-in
         * selectionne l'option choisi et fait l'action liée
         */

        option(miseMin){

            let index =[];
            let actionPrec = 'check'; //action précedente autre que coucher pour déterminer possibilités des actions a jouer

            for (let i=0;i<this.listePlayerGame.length;i++) {
                console.log(this.listePlayerGame[i].getNom()+' :');
                    let action;
                    switch (actionPrec) {
                        case 'check':
                            action = joueJoueur(i);

                        case 'suivre':
                            do{
                                while (!this.listePlayerGame[i].ajoue) {
                                    action = joueJoueur(i);
                                }
                            }while (action==='check') ;

                            break;
                        case 'relancer':
                            if (miseMin >this.listePlayerGame[i].getJetons()){
                                do {
                                    while (!this.listePlayerGame[i].ajoue) {
                                        action = joueJoueur(i);
                                    }
                                } while (action === 'check' || action === 'relancer' || action ==='suivre');
                            }else if(miseMin === this.listePlayerGame[i].getJetons()){
                                do {
                                    while (!this.listePlayerGame[i].ajoue) {
                                        action = joueJoueur(i);
                                    }
                                } while (action === 'check' || action === 'relancer');
                            } else {
                                do {
                                    while (!this.listePlayerGame[i].ajoue) {
                                        action = joueJoueur(i);
                                    }
                                } while (action === 'check');
                            }
                            break;
                        case 'all-in':
                            do {
                                while (!this.listePlayerGame[i].ajoue) {
                                    action = joueJoueur(i);
                                }
                            }while (action==='check' || action==='relancer' || action==='suivre');

                            break;
                        default:
                            console.log('coucher');
                    }

                    switch (action) {
                        case 'coucher':
                            this.listePlayerGame[i].coucher();
                            index.push(i);
                            break;
                        case 'check':
                            this.listePlayerGame[i].callCheck();
                            actionPrec = 'check';
                            break;
                        case 'suivre':
                            this.listePlayerGame[i].fold(miseMin);
                            this.pot+=miseMin;
                            actionPrec = 'suivre';
                            break;
                        case 'relancer':
                            do {
                                var miseRel = readlineSync.question('mise Relance : ');
                            } while (miseRel >this.listePlayerGame[i].getJetons() || miseRel <= miseMin);
                            miseMin = miseRel;
                            this.listePlayerGame[i].fold(miseMin);
                            this.pot+=miseMin;
                            actionPrec = 'relancer';
                            break;
                        case 'all-in':
                            this.listePlayerGame[i].allin();
                            miseMin = this.listePlayerGame[i].getTas();
                            this.pot += miseMin;
                            actionPrec = 'all-in';
                            break;
                        default:
                            console.log('Selectionner une action proposée');
                    }
                    console.log();
            }
            for (let i=0;i<index.length;i++){
                this.listePlayerGame.splice(index[i],1);
            }
        };

        play(petiteBlinde, grosseBlinde) {
            while (this.listePlayerGame.length > 1){
                this.reset();

                // initialisation des blinds
                this.affichage();
                this.blind(petiteBlinde,grosseBlinde);
                this.affichage();

                //initialisation main + affichage main joueur
                for (let i=0 ; i<2 ;i++){
                    for (let j=0 ; j<this.listePlayerGame.length ;j++){
                        this.listePlayerGame[j].addMain(this.cartes.giveCarte());
                    }
                }
                this.affichage();
                this.option(grosseBlinde);
                this.tour++;
                for (let i=0; i<5 ;i++){
                    this.tapisCarte.push(this.cartes.giveCarte());
                }
                this.tour++;
                for (let i=0;i<3;i++){
                    this.tour++;
                    this.affichage();
                    this.option(grosseBlinde);
                }
            }
        };
    }

    class Carte{
        constructor() {
            this.suits = [ 's', 'h', 'd', 'c' ];
            this.ranks = [ '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A' ];
            this.cards = [];

            this.init();
            this.shuffle();
        }

        giveCarte(){
            var temp = this.cards[this.cards.length];
            return this.cards.pop();
            // return temp;
        };

        init() {
            var suitsLen = this.suits.length;
            var ranksLen = this.ranks.length;
            var i, j;

            for (i=0; i<suitsLen; i++) {
                for (j=0; j<ranksLen; j++) {
                    this.cards.push( this.ranks[j] + this.suits[i] );
                }
            }
        };

        shuffle() {
            var currentIndex = this.cards.length, temporaryValue, randomIndex ;
            while (0 !== currentIndex) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;
                temporaryValue = this.cards[currentIndex];
                this.cards[currentIndex] = this.cards[randomIndex];
                this.cards[randomIndex] = temporaryValue;
            }
        };

        drawCard() {
            return this.cards.pop();
        };
    }
    // Create a new game. Emit newGame event.
    $('#new').on('click', () => {
        const name = $('#nameNew').val();
        const jeton = $('#jetonNew').val();
        if (!name || !jeton) {
            alert('Erreur.');
            return;
        }
        socket.emit('createGame', { name });
        player = new Player(id++,name, jeton);
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
        socket.emit('joinGame', { name, room: roomID });
        player = new Player(id++,name, jeton);
    });

    // New Game created by current client. Update the UI and create new Game var.
    socket.on('newGame', (data) => {
        const message =
            `Hello, ${data.name}. no du salon: 
      ${data.room}`;

        // Create game for player 1
        game = new Game(data.room);
        game.displayBoard(message);
    });

    /**
     * If player creates the game, he'll be P1(X) and has the first turn.
     * This event is received when opponent connects to the room.
     */
    socket.on('player1', (data) => {
        const message = `Hello, ${player.getPlayerName()}`;
        $('#userHello').html(message);
        player.setCurrentTurn(true);
    });

    /**
     * Joined the game, so player is P2(O).
     * This event is received when P2 successfully joins the game room.
     */
    socket.on('player2', (data) => {
        const message = `Hello, ${data.name}`;

        // Create game for player 2
        game = new Game(data.room);
        game.displayBoard(message);
        player.setCurrentTurn(false);
    });

    /**
     * Opponent played his turn. Update UI.
     * Allow the current player to play now.
     */
    socket.on('turnPlayed', (data) => {
        player.setCurrentTurn(true);
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
}());
