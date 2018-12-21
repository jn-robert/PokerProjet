var PokerEvaluator = require('poker-evaluator');
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
    this.tasHaut=0;
    this.allCards= [];
    this.evalCards = [];
    this.combiGagnante= [];
    this.start=true;
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

Game.prototype.afficheJoueurName = function(index){
    return this.listePlayerGame[index].getPlayerName();
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
        if (!this.start){
            this.cartes = new Cartes();
            this.start=true;
        }
        for (let i=0; i<this.listePlayerGame.length; i++) {
            this.listePlayerGame[i].resetPlayer();
        }
        this.tour=0;
        // this.actionPrec = null;
};


Game.prototype.blind = function(petiteBlinde, grosseBlinde){
    this.listePlayerGame[this.dealer+1 % this.listePlayerGame.length].jetons -= petiteBlinde;
    this.listePlayerGame[this.dealer +2 % this.listePlayerGame.length].jetons -= grosseBlinde;
    this.pot=petiteBlinde+grosseBlinde;
    this.dealer++;
};

Game.prototype.joueJoueur = function(name, action, miseMin) {
    let indice;
    let bool = false;

    let boolTours=1;


    switch (this.actionPrec) {
        case null:
            for (let i=0; i<this.listePlayerGame.length;i++) {
                if (this.listePlayerGame[i].getPlayerName() === name && this.listePlayerGame[i].allIn) {
                    break;
                } else {
                    this.actionPrec = action;
                    if (action === "check") {
                        // this.canPlay=true;
                    }
                    if (action === "raise") {
                        this.actionPrec = action;
                        this.misePrec = miseMin;
                        this.tasHaut = this.misePrec;
                        for (let j = 0; j < this.listePlayerGame.length; j++) {
                            if (this.listePlayerGame[j].getPlayerName() === name) {
                                // if (this.tasHaut - this.listePlayerGame[j].getTas() <= this.listePlayerGame[j].jetons) {
                                    this.listePlayerGame[j].jetons -= this.tasHaut - this.listePlayerGame[j].getTas();
                                    this.listePlayerGame[j].tas += this.tasHaut - this.listePlayerGame[j].getTas();
                                // }
                            }else {
                                this.listePlayerGame[j].tas = 0;
                            }
                        }
                    }
                    if (action === "all-in") {
                        this.actionPrec = action;
                        for (let j = 0; j < this.listePlayerGame.length; j++) {
                            if (this.listePlayerGame[j].getPlayerName() === name) {
                                this.misePrec = this.listePlayerGame[j].getJetons();
                                this.tasHaut = this.misePrec;
                                this.listePlayerGame[j].tas += this.listePlayerGame[j].jetons;
                                this.listePlayerGame[j].jetons = 0;
                                this.listePlayerGame[j].allIn = true;
                            }
                        }
                    }
                    if (action === "coucher"){
                        for (let j=0;j<this.listePlayerGame.length; j++){
                            if (this.listePlayerGame.length <3){
                                if (this.listePlayerGame[j].getPlayerName() !== name){
                                    this.listePlayerGame[j].jetons += this.tasHaut + this.listePlayerGame[j].getTas();
                                    let boolJoueur = false;
                                    for (let k =0; k<this.listePlayerTable.length; k++){
                                        for (let l = 0; l<this.listePlayerGame.length; l++){
                                            if(this.listePlayerTable[k].getPlayerName() !== this.listePlayerGame[l].getPlayerName()){
                                                boolJoueur = true;
                                            }
                                        }
                                        if (boolJoueur) {
                                            this.listePlayerGame.push(this.listePlayerTable[k]);
                                            boolJoueur=false;
                                            // this.canPlay=true;
                                            this.actionPrec=null;
                                            this.misePrec=0;
                                            this.tasHaut=0;
                                            boolTours=1;
                                            for (let i=0; i<this.listePlayerGame.length;i++){
                                                this.listePlayerGame[i].tas=0;
                                            }
                                        }
                                    }
                                    // this.init(10,20);
                                }
                            }else {
                                if (this.listePlayerGame[j].getPlayerName() === name){
                                    this.listePlayerGame.splice(j,1);
                                }
                            }
                        }
                    }
                }
            }
            break;
        case "check":
            for (let i=0; i<this.listePlayerGame.length;i++) {
                if (this.listePlayerGame[i].getPlayerName() === name && this.listePlayerGame[i].allIn){
                    break;
                } else {
                    if (action === "check") {
                        this.canPlay = true;
                    }
                    if (action === "raise") {
                        this.actionPrec = action;
                        this.misePrec = miseMin;
                        this.tasHaut = this.misePrec;
                        for (let i = 0; i < this.listePlayerGame.length; i++) {
                            if (this.listePlayerGame[i].getPlayerName() === name) {
                                if (this.tasHaut - this.listePlayerGame[i].getTas() <= this.listePlayerGame[i].jetons) {
                                    this.listePlayerGame[i].jetons -= this.tasHaut - this.listePlayerGame[i].getTas();
                                    this.listePlayerGame[i].tas += this.tasHaut - this.listePlayerGame[i].getTas();
                                }
                            }
                        }
                    }
                    if (action === "all-in") {
                        this.actionPrec = action;
                        for (let i = 0; i < this.listePlayerGame.length; i++) {
                            if (this.listePlayerGame[i].getPlayerName() === name) {
                                this.misePrec = this.listePlayerGame[i].getJetons();
                                this.tasHaut = this.misePrec;
                                this.listePlayerGame[i].tas += this.listePlayerGame[i].jetons;
                                this.listePlayerGame[i].jetons = 0;
                                this.listePlayerGame[i].allIn = true;
                            }
                        }
                    }
                    if (action === "coucher"){
                        for (let j=0;j<this.listePlayerGame.length; j++){
                            if (this.listePlayerGame.length <3){
                                if (this.listePlayerGame[j].getPlayerName() !== name){
                                    this.listePlayerGame[j].jetons += this.tasHaut + this.listePlayerGame[j].getTas();
                                    let boolJoueur = false;
                                    for (let k =0; k<this.listePlayerTable.length; k++){
                                        for (let l = 0; l<this.listePlayerGame.length; l++){
                                            if(this.listePlayerTable[k].getPlayerName() !== this.listePlayerGame[l].getPlayerName()){
                                                boolJoueur = true;
                                            }
                                        }
                                        if (boolJoueur) {
                                            this.listePlayerGame.push(this.listePlayerTable[k]);
                                            boolJoueur=false;
                                            // this.canPlay=true;
                                            this.actionPrec=null;
                                        }
                                    }
                                    // this.init(10,20);
                                }
                            }else {
                                if (this.listePlayerGame[j].getPlayerName() === name){
                                    this.listePlayerGame.splice(j,1);
                                }
                            }
                        }
                    }
                }
            }
            break;
        case "suivre":
            for (let i=0; i< this.listePlayerGame.length;i++) {
                if (this.listePlayerGame[i].getPlayerName() === name && this.listePlayerGame[i].allIn){
                    this.canPlay=true;
                } else {
                    if (action === "raise") {
                        this.actionPrec = action;
                        this.misePrec = miseMin;
                        //a faire si plus de deux joueurs;
                    }
                    if (action === "all-in") {
                        this.actionPrec = action;
                        // this.canPlay=true;
                        for (let i = 0; i < this.listePlayerGame.length; i++) {
                            if (this.listePlayerGame[i].getPlayerName() === name) {
                                this.misePrec = this.listePlayerGame[i].getJetons();
                                this.tasHaut = this.misePrec;
                                this.listePlayerGame[i].tas += this.listePlayerGame[i].jetons;
                                this.listePlayerGame[i].jetons = 0;
                                this.listePlayerGame[i].allIn = true;
                            }
                        }
                    }
                    if (action === "coucher"){
                        for (let j=0;j<this.listePlayerGame.length; j++){
                            if (this.listePlayerGame.length <3){
                                if (this.listePlayerGame[j].getPlayerName() !== name){
                                    this.listePlayerGame[j].jetons += this.tasHaut + this.listePlayerGame[j].getTas();
                                    let boolJoueur = false;
                                    for (let k =0; k<this.listePlayerTable.length; k++){
                                        for (let l = 0; l<this.listePlayerGame.length; l++){
                                            if(this.listePlayerTable[k].getPlayerName() !== this.listePlayerGame[l].getPlayerName()){
                                                boolJoueur = true;
                                            }
                                        }
                                        if (boolJoueur) {
                                            this.listePlayerGame.push(this.listePlayerTable[k]);
                                            boolJoueur=false;
                                        }
                                    }
                                    // this.init(10,20);
                                }
                            }else {
                                if (this.listePlayerGame[j].getPlayerName() === name){
                                    this.listePlayerGame.splice(j,1);
                                }
                            }
                        }
                    }
                }
            }
            break;
        case "raise":
            for (let i=0; i<this.listePlayerGame.length;i++) {
                if (this.listePlayerGame[i].getPlayerName() === name && this.listePlayerGame[i].allIn){
                    this.canPlay=true;
                } else {
                    if (action === "suivre") {
                        this.actionPrec = action;
                        this.tasHaut = this.misePrec;
                        for (let i = 0; i < this.listePlayerGame.length; i++) {
                            if (this.listePlayerGame[i].getPlayerName() === name) {
                                this.listePlayerGame[i].jetons -= this.tasHaut - this.listePlayerGame[i].getTas();
                                this.listePlayerGame[i].tas += this.tasHaut - this.listePlayerGame[i].getTas();
                                // this.listePlayerGame[i].raise(this.tasHaut - this.listePlayerGame[i].getTas());
                            }
                        }
                        this.canPlay = true;
                    }
                    if (action === "raise") {
                        this.actionPrec = action;
                        bool = true;
                        this.misePrec = this.misePrec + miseMin;
                        this.tasHaut = this.misePrec;
                        for (let i = 0; i < this.listePlayerGame.length; i++) {
                            if (this.listePlayerGame[i].getPlayerName() === name) {
                                if (this.tasHaut - this.listePlayerGame[i].getTas() <= this.listePlayerGame[i].jetons) {
                                    this.listePlayerGame[i].jetons -= this.tasHaut - this.listePlayerGame[i].getTas();
                                    this.listePlayerGame[i].tas += this.tasHaut - this.listePlayerGame[i].getTas();
                                }
                            }
                        }
                    }
                    if (action === "all-in") {
                        this.actionPrec = action;
                        // this.canPlay=true;
                        for (let i = 0; i < this.listePlayerGame.length; i++) {
                            if (this.listePlayerGame[i].getPlayerName() === name) {
                                this.misePrec = this.listePlayerGame[i].getJetons();
                                this.tasHaut = this.misePrec;
                                this.listePlayerGame[i].tas += this.listePlayerGame[i].jetons;
                                this.listePlayerGame[i].jetons = 0;
                                this.listePlayerGame[i].allIn = true;
                            }
                        }
                    }
                    if (action === "coucher"){
                        for (let j=0;j<this.listePlayerGame.length; j++){
                            if (this.listePlayerGame.length <3){
                                if (this.listePlayerGame[j].getPlayerName() !== name){
                                    this.listePlayerGame[j].jetons += this.tasHaut + this.listePlayerGame[j].getTas();
                                    let boolJoueur = false;
                                    for (let k =0; k<this.listePlayerTable.length; k++){
                                        for (let l = 0; l<this.listePlayerGame.length; l++){
                                            if(this.listePlayerTable[k].getPlayerName() !== this.listePlayerGame[l].getPlayerName()){
                                                boolJoueur = true;
                                            }
                                        }
                                        if (boolJoueur) {
                                            this.listePlayerGame.push(this.listePlayerTable[k]);
                                            boolJoueur=false;
                                        }
                                    }
                                    // this.init(10,20);
                                }
                            }else {
                                if (this.listePlayerGame[j].getPlayerName() === name){
                                    this.listePlayerGame.splice(j,1);
                                }
                            }
                        }
                    }
                }
            }
            break;
        case "all-in":
            if (action === "suivre") {
                this.actionPrec = action;
                this.canPlay = true;
                this.tasHaut = this.misePrec;
                for (let i = 0; i < this.listePlayerGame.length; i++) {
                    if (this.listePlayerGame[i].getPlayerName() === name) {
                        if (this.tasHaut - this.listePlayerGame[i].getTas() <= this.listePlayerGame[i].jetons) {
                            this.listePlayerGame[i].jetons -= this.tasHaut - this.listePlayerGame[i].getTas();
                            this.listePlayerGame[i].pot += this.tasHaut - this.listePlayerGame[i].getTas();
                        }
                    }
                }
                boolTours = 6-this.tour;
            }
            if (action === "raise") {
                this.actionPrec = action;
                this.canPlay = true;
                this.misePrec = this.misePrec + miseMin;
                this.tasHaut = this.misePrec;
                for (let i = 0; i < this.listePlayerGame.length; i++) {
                    if (this.listePlayerGame[i].getPlayerName() === name) {
                        if (this.tasHaut - this.listePlayerGame[i].getTas() <= this.listePlayerGame[i].jetons) {
                            this.listePlayerGame[i].jetons -= this.tasHaut - this.listePlayerGame[i].getTas();
                            this.listePlayerGame[i].tas += this.tasHaut - this.listePlayerGame[i].getTas();
                        }
                    }
                }
            }
            if (action === "all-in") {
                this.actionPrec = action;
                for (let i = 0; i < this.listePlayerGame.length; i++) {
                    if (this.listePlayerGame[i].getPlayerName() === name) {
                        this.misePrec = this.listePlayerGame[i].getJetons();
                        this.tasHaut = this.misePrec;
                        this.listePlayerGame[i].tas += this.listePlayerGame[i].jetons;
                        this.listePlayerGame[i].jetons = 0;
                        this.listePlayerGame[i].allIn = true;
                    }
                }
                this.canPlay = true;
            }
            if (action === "coucher"){
                for (let j=0;j<this.listePlayerGame.length; j++){
                    if (this.listePlayerGame.length <3){
                        if (this.listePlayerGame[j].getPlayerName() !== name){
                            this.listePlayerGame[j].jetons += this.tasHaut + this.listePlayerGame[j].getTas();
                            this.tour=6;
                            let boolJoueur = false;
                            for (let k =0; k<this.listePlayerTable.length; k++){
                                for (let l = 0; l<this.listePlayerGame.length; l++){
                                    if(this.listePlayerTable[k].getPlayerName() !== this.listePlayerGame[l].getPlayerName()){
                                        boolJoueur = true;
                                    }
                                }
                                if (boolJoueur) {
                                    this.listePlayerGame.push(this.listePlayerTable[k]);
                                    boolJoueur=false;
                                }
                            }
                            // this.init(10,20);
                        }
                    }else {
                        if (this.listePlayerGame[j].getPlayerName() === name){
                            this.listePlayerGame.splice(j,1);
                            this.pot+=this.listePlayerGame[j].getTas();
                        }
                    }
                }
            }
            break;
        case "coucher":
            // if (action === "coucher"){
            //     for (let j=0;j<this.listePlayerGame.length; j++){
            //         if (this.listePlayerGame.length <3){
            //             if (this.listePlayerGame[j].getPlayerName() !== name){
            //                 this.listePlayerGame[j].jetons += this.tasHaut + this.listePlayerGame[j].getTas();
            //                 let boolJoueur = false;
            //                 for (let k =0; k<this.listePlayerTable.length; k++){
            //                     for (let l = 0; l<this.listePlayerGame.length; l++){
            //                         if(this.listePlayerTable[k].getPlayerName() !== this.listePlayerGame[l].getPlayerName()){
            //                             boolJoueur = true;
            //                         }
            //                     }
            //                     if (boolJoueur) {
            //                         this.listePlayerGame.push(this.listePlayerTable[k]);
            //                         boolJoueur=false;
            //                     }
            //                 }
            //                 this.continueGame(10,20);
            //             }
            //         }else {
            //             if (this.listePlayerGame[j].getPlayerName() === name){
            //                 this.listePlayerGame.splice(j,1);
            //             }
            //         }
            //     }
            // }
            break;

    }

    for (let i = 0; i < this.listePlayerGame.length; i++) {
        if (this.listePlayerGame[i].getPlayerName() === name) {
            indice = i;
            this.listePlayerGame[indice].setAjoue(true);
        } else {
            this.listePlayerGame[i].setAjoue(false);
        }
    }

    if (this.canPlay) {
        for (let i=0; i<boolTours;i++){
            this.incrementeTour();
        }
        // this.tour++;
        this.canPlay=false;
        this.actionPrec=null;
        this.misePrec=0;
        this.tasHaut=0;
        boolTours=1;
        for (let i=0; i<this.listePlayerGame.length;i++){
            this.pot+=this.listePlayerGame[i].getTas();
            this.listePlayerGame[i].tas=0;
        }
    }
    console.log(this.tour);
    console.log(this.pot)
};

Game.prototype.incrementeTour = function(){
    this.tour++;
};

Game.prototype.distribGains = function(name){
    let testName=false;
    for (let i=0; i<this.listePlayerGame.length;i++){
        if(this.listePlayerGame[i].getPlayerName()=== name){
            this.listePlayerGame[i].jetons+= this.pot+this.listePlayerGame[i].tas;
            testName=true;
        }
    }
    if (!testName){
        for (let i=0;i<this.listePlayerGame.length;i++){
            this.listePlayerGame[i].jetons+=this.pot/this.listePlayerGame.length + this.listePlayerGame[i].tas;
        }
    }
    this.pot=0;
};

Game.prototype.evalCarte = function (){
    for (let i = 0; i < this.listePlayerGame.length; i++) {
        this.allCards.push([
            this.listePlayerGame[i].getMain()[0],
            this.listePlayerGame[i].getMain()[1],
            this.getTapis()[0],
            this.getTapis()[1],
            this.getTapis()[2],
            this.getTapis()[3],
            this.getTapis()[4]
        ])
    }

    for (let i = 0; i < this.allCards.length; i++) {
        this.evalCards.push(PokerEvaluator.evalHand(this.allCards[i]));
    }

    let highestIndex = 0;
    let combiVainq = null;
    let combi = [];
    let highestVal = -999;
    if (this.tour > 5) {
        // let highestIndex = -1;
        for (let i = 0; i < this.evalCards.length; i++) {
            if (highestVal < this.evalCards[i].value) {
                highestVal = this.evalCards[i].value;
                highestIndex = i;
            }
        }
        console.log(highestVal);


    }

    return highestIndex;
};

    Game.prototype.init = function(petiteBlinde, grosseBlinde) {
            this.reset();

            // initialisation des blinds
            this.blind(petiteBlinde,grosseBlinde);

            //initialisation main + affichage main joueur
            for (let i=0 ; i<2 ;i++){
                for (let j=0 ; j<this.listePlayerGame.length ;j++){
                    this.listePlayerGame[j].addMain(this.cartes.giveCarte());
                }
            }
            this.tour=2;
            for (let i=0; i<5 ;i++){
                this.tapisCarte.push(this.cartes.giveCarte());
            }
    };

    Game.prototype.continueGameAfterTimeOut = function(){
        // this.continueGame(10,20);
    };

    Game.prototype.miseEnAttenteFinGame = function () {
        setTimeout(this.continueGameAfterTimeOut,5000);
    };