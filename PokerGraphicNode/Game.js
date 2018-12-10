module.exports = Game;
var Player = require('./Player.js');
var Cartes = require('./Cartes.js');

function Game() {
    this.roomId = 0;
    this.listePlayerTable = [];
    this.listePlayerGame = [];
    this.pot = 0;
    this.cartes = new Cartes();
    this.tapisCarte = [];
    this.dealer = 0;
    this.tour = 0;
    this.actionPrec = null;
    this.canPlay = false;
    this.recoltJetons = 0;
    this.misePrec = 0;
}

// Create the Game board by attaching event listeners to the buttons.
// Remove the menu from DOM, display the gameboard and greet the player.
Game.prototype.displayBoard = function (message) {
    $('.menu').css('display', 'none');
    $('.gameBoard').css('display', 'block');
    $('#userHello').html(message);
};

Game.prototype.getRecoltJetons = function(){
    return this.recoltJetons;
};

Game.prototype.getRoomId = function () {
        return this.roomId;
};

    // Send an update to the opponent to update their UI's tile

Game.prototype.playTurn = function () {
    socket.emit('playTurn', {room: this.getRoomId()});
};
// Emit an event to update other player that you've played your turn.


Game.prototype.getTapis = function() {
    return this.tapisCarte;
};

Game.prototype.addPlayer = function(id, name, jetons) {
    let newPlayer = new Player(id, name, jetons);
    newPlayer.game = this;
    this.listePlayerTable.push(newPlayer);
    this.listePlayerGame.push(newPlayer);
};

//test
Game.prototype.getTour = function () {
    return this.tour;
};

Game.prototype.reset = function () {
        this.pot = 0;
        this.cartes = new Cartes();
        for (let i=0; i<this.listePlayerGame.length; i++) {
            this.listePlayerGame[i].reset();
        }
        this.tour=0;
};

Game.prototype.blind = function(petiteBlinde, grosseBlinde){
        if (this.dealer>=this.listePlayerGame.length){
            this.dealer=0;
        }
        else if (this.dealer+1<this.listePlayerGame.length) {
            this.listePlayerGame[this.dealer + 1].fold(petiteBlinde);
        }
        else if (this.dealer+2<this.listePlayerGame.length) {
            this.listePlayerGame[this.dealer + 2].fold(grosseBlinde);
        }else {
            this.listePlayerGame[0].fold(grosseBlinde);
        }
        this.pot=petiteBlinde+grosseBlinde;
        this.dealer++;
};

Game.prototype.affichage = function () {
        var compteur = 0;
        var compteur2 = 0;
        console.log();
        console.log();



        // window.document.getElementById('pot').innerHTML ="Pot : " +this.pot;
        console.log('Pot : '+this.pot);
        console.log('Tapis : ');

        if (this.tour<=5) {
            for (let i = 0; i<this.tour; i++){
                console.log(this.tapisCarte[i]);
            }
            this.getTapis().forEach(function (entry) {
                switch (compteur) {
                    case 0:
                        // document.T1.src = "image/" + entry +".PNG" ;
                        compteur++;
                        break;
                    case 1:
                        // document.T2.src = "image/" + entry +".PNG" ;
                        compteur++;
                        break;
                    case 2:
                        // document.T3.src = "image/" + entry +".PNG" ;
                        compteur++;
                        break;
                    case 3:
                        // document.T4.src = "image/" + entry +".PNG" ;
                        compteur++;
                        break;
                    case 4:
                        // document.T5.src = "image/" + entry +".PNG" ;
                        compteur++;
                        break;
                }
            });
        }
        console.log();
        console.log('Joueurs :');
        for (let i=0;i<this.listePlayerGame.length;i++){
            label = "label".concat(i.toString());
            // document.getElementById(label).innerHTML = this.listePlayerGame[i].getJetons().toString() + " jetons";
            this.listePlayerGame[i].getMain().forEach(function (entry) {
                switch (compteur2) {
                    case 0:
                        // document.CarteJoueur1.src = "image/" + entry +".PNG" ;
                        compteur2++;
                        break;
                    case 1:
                        // document.CarteJoueur2.src = "image/" + entry +".PNG" ;
                        compteur2++;
                        break;
                }
            });
            console.log(''+this.listePlayerGame[i].getNom()+" : "+this.listePlayerGame[i].getMain()+", "+this.listePlayerGame[i].getJetons()+" coins");
        }
};

Game.prototype.joueJoueur = function(name, action, miseMin) {
    let indice;
    switch (this.actionPrec) {
        case null:
            this.actionPrec = action;
            if (action === "check"){
                // this.canPlay=true;
            }
            if (action === "fold"){
                this.actionPrec=action;
                // this.canPlay=true;
                this.misePrec = 10;
            }
            if (action === "all-in"){
                this.actionPrec=action;
                // this.canPlay=true;
            }
            break;
        case "check":
            if (action === "check"){
                this.canPlay=true;
            }
            if (action === "fold"){
                this.actionPrec=action;
                this.canPlay=true;
                this.misePrec = 10;
            }
            if (action === "all-in"){
                this.actionPrec=action;
                this.canPlay=true;
            }
            break;
        case "suivre":
            if (action === "fold"){
                this.actionPrec=action;
                // this.canPlay=true;
                this.misePrec = 10;
            }
            if (action === "all-in"){
                this.actionPrec=action;
                this.canPlay=true;
            }
            break;
        case "fold":
            if (action==="suivre"){
                this.actionPrec=action;
                this.canPlay=true;
            }
            if (action === "fold"){
                this.actionPrec=action;
                // this.canPlay=true;
                this.misePrec = this.misePrec+10;
            }
            if (action === "all-in"){
                this.actionPrec=action;
                this.canPlay=true;
            }
            break;
        case "all-in":
            if (action === "suivre"){
                this.actionPrec=action;
                this.canPlay=true;
            }
            if (action === "fold"){
                this.actionPrec=action;
                this.canPlay=true;
                this.misePrec = this.misePrec+10;
            }
            if (action === "all-in"){
                this.actionPrec=action;
                this.canPlay=true;
            }
            break;
        case "coucher":
            break;
    }
    for (let i=0;i<this.listePlayerGame.length; i++){
        if (this.listePlayerGame[i].getNom() === name){
            indice=i;
            this.listePlayerGame[indice].setAjoue(true);
            console.log(this.misePrec);
            this.listePlayerGame[i].jetons=this.listePlayerGame[i].jetons-this.misePrec;
            console.log(this.listePlayerGame[i].jetons);
        }else {
            this.listePlayerGame[i].setAjoue(false);
        }
    }

    /*switch (action) {
        case 'check':
            console.log('check by '+name);
            break;
        default :
            console.log(action);
    }*/


    if (this.canPlay) {
        this.tour++;
        this.canPlay=false;
        this.actionPrec=null;
        this.misePrec=0;
    }
    console.log(this.tour);
};

/**
     * affiche les options mise, check, coucher, all-in
     * selectionne l'option choisi et fait l'action liée
     */

    Game.prototype.option = function(miseMin){

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

    Game.prototype.play = function(petiteBlinde, grosseBlinde) {
        // while (this.listePlayerGame.length > 1){
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
            this.tour=2;
            /*this.option(grosseBlinde);
            this.tour++;*/
            for (let i=0; i<5 ;i++){
                this.tapisCarte.push(this.cartes.giveCarte());
            }
            /*this.tour++;
            for (let i=0;i<3;i++){
                this.tour++;
                this.affichage();
                this.option(grosseBlinde);
            }*/
        // }
    };