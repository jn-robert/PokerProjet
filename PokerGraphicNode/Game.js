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
        this.cartes = new Cartes();
        for (let i=0; i<this.listePlayerGame.length; i++) {
            this.listePlayerGame[i].reset();
        }
        this.tour=0;
        // this.actionPrec = null;
};


Game.prototype.blind = function(petiteBlinde, grosseBlinde){
        if (this.dealer+1>=this.listePlayerGame.length){
            this.dealer=0;
            this.listePlayerGame[this.dealer+1].jetons -= grosseBlinde;
            this.listePlayerGame[this.dealer].jetons -= petiteBlinde;
        }else {
            this.listePlayerGame[this.dealer].jetons -= grosseBlinde;
            this.listePlayerGame[this.dealer+1].jetons -= petiteBlinde;
            // this.listePlayerGame[this.dealer+1].raise(grosseBlinde);
            // this.listePlayerGame[this.dealer].raise(petiteBlinde);
        }
        this.pot=petiteBlinde+grosseBlinde;
        this.dealer++;
};

// Game.prototype.affichage = function () {
//         var compteur = 0;
//         var compteur2 = 0;
//         console.log();
//         console.log();
//
//
//
//         // window.document.getElementById('pot').innerHTML ="Pot : " +this.pot;
//         console.log('Pot : '+this.pot);
//         console.log('Tapis : ');
//
//         if (this.tour<=5) {
//             for (let i = 0; i<this.tour; i++){
//                 console.log(this.tapisCarte[i]);
//             }
//             this.getTapis().forEach(function (entry) {
//                 switch (compteur) {
//                     case 0:
//                         // document.T1.src = "image/" + entry +".PNG" ;
//                         compteur++;
//                         break;
//                     case 1:
//                         // document.T2.src = "image/" + entry +".PNG" ;
//                         compteur++;
//                         break;
//                     case 2:
//                         // document.T3.src = "image/" + entry +".PNG" ;
//                         compteur++;
//                         break;
//                     case 3:
//                         // document.T4.src = "image/" + entry +".PNG" ;
//                         compteur++;
//                         break;
//                     case 4:
//                         // document.T5.src = "image/" + entry +".PNG" ;
//                         compteur++;
//                         break;
//                 }
//             });
//         }
//         console.log();
//         console.log('Joueurs :');
//         for (let i=0;i<this.listePlayerGame.length;i++){
//             label = "label".concat(i.toString());
//             // document.getElementById(label).innerHTML = this.listePlayerGame[i].getJetons().toString() + " jetons";
//             this.listePlayerGame[i].getMain().forEach(function (entry) {
//                 switch (compteur2) {
//                     case 0:
//                         // document.CarteJoueur1.src = "image/" + entry +".PNG" ;
//                         compteur2++;
//                         break;
//                     case 1:
//                         // document.CarteJoueur2.src = "image/" + entry +".PNG" ;
//                         compteur2++;
//                         break;
//                 }
//             });
//             console.log(''+this.listePlayerGame[i].getPlayerName()+" : "+this.listePlayerGame[i].getMain()+", "+this.listePlayerGame[i].getJetons()+" coins");
//         }
// };

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
                                if (this.tasHaut - this.listePlayerGame[j].getTas() <= this.listePlayerGame[j].jetons) {
                                    this.listePlayerGame[j].jetons -= this.tasHaut - this.listePlayerGame[j].getTas();
                                    this.listePlayerGame[j].tas += this.tasHaut - this.listePlayerGame[j].getTas();
                                }
                            } else {
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
                                            this.canPlay=true;
                                            this.actionPrec=null;
                                        }
                                    }
                                    this.continueGame(10,20);
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
                                            this.canPlay=true;
                                            this.actionPrec=null;
                                        }
                                    }
                                    this.continueGame(10,20);
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
                                    this.continueGame(10,20);
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
                                    this.continueGame(10,20);
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
                        this.listePlayerGame[i].raise(this.tasHaut - this.listePlayerGame[i].getTas());
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
                            this.continueGame(10,20);
                        }
                    }else {
                        if (this.listePlayerGame[j].getPlayerName() === name){
                            this.listePlayerGame.splice(j,1);
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
            this.listePlayerGame[i].tas=0;
        }
    }
    console.log(this.tour);
};

Game.prototype.incrementeTour = function(){
    this.tour++;
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
        // while (this.listePlayerGame.length > 1){
            this.reset();

            // initialisation des blinds
            // this.affichage();
            this.blind(petiteBlinde,grosseBlinde);
            // this.affichage();

            //initialisation main + affichage main joueur
            for (let i=0 ; i<2 ;i++){
                for (let j=0 ; j<this.listePlayerGame.length ;j++){
                    this.listePlayerGame[j].addMain(this.cartes.giveCarte());
                }
            }
            // this.affichage();
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

    Game.prototype.continueGame = function (petiteBlinde, grosseBlinde) {
        this.reset();
        // this.affichage();
        this.blind(petiteBlinde,grosseBlinde);
        // this.affichage();

        //initialisation main + affichage main joueur
        for (let i=0 ; i<2 ;i++){
            for (let j=0 ; j<this.listePlayerGame.length ;j++){
                this.listePlayerGame[j].addMain(this.cartes.giveCarte());
            }
        }
        // this.affichage();
        this.tour=2;
        /*this.option(grosseBlinde);
        this.tour++;*/
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