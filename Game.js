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
    this.tasHaut = 0;
    this.allCards = [];
    this.evalCards = [];
    this.combiGagnante = [];
    this.start = true;
}

// Create the Game board by attaching event listeners to the buttons.
// Remove the menu from DOM, display the gameboard and greet the player.
Game.prototype.displayBoard = function (message) {
    $('.menu').css('display', 'none');
    $('.gameBoard').css('display', 'block');
    $('#userHello').html(message);
};

Game.prototype.getRecoltJetons = function () {
    return this.recoltJetons;
};

Game.prototype.afficheJoueurName = function (index) {
    return this.listePlayerGame[index].getPlayerName();
};

Game.prototype.getRoomId = function () {
    return this.roomId;
};

Game.prototype.playTurn = function () {
    socket.emit('playTurn', {room: this.getRoomId()});
};

/**
 * affiche le tapis de cartes
 */
Game.prototype.getTapis = function () {
    return this.tapisCarte;
};

/**
 * ajoute un joueur avec son nom, ses jetons et son id
 */
Game.prototype.addPlayer = function (id, name, jetons) {
    let newPlayer = new Player(id, name, jetons);
    newPlayer.game = this;
    this.listePlayerTable.push(newPlayer);
    // this.listePlayerGame.push(newPlayer);
};

Game.prototype.getTour = function () {
    return this.tour;
};

/**
 * reinitialise le jeu
 * */
Game.prototype.reset = function () {
    this.pot = 0;
    if (!this.start) {
        this.cartes = new Cartes();
        this.start = true;
    }

    for (let i = 0; i < this.listePlayerTable.length; i++) {
        if (i >= this.listePlayerGame.length) {
            this.listePlayerGame.push(this.listePlayerTable[i]);
        }
        this.listePlayerGame[i].resetPlayer();
    }
    this.tour = 0;
    // this.actionPrec = null;
};

/**
 * initialise les blindes du debut de jeu
 */
Game.prototype.blind = function (petiteBlinde, grosseBlinde) {
    //console.log("dealer+1: " + this.listePlayerGame[(this.dealer+1) % this.listePlayerGame.length].jetons);
    //console.log("dealer+2: " + this.listePlayerGame[(this.dealer+2) % this.listePlayerGame.length].jetons);
    this.listePlayerTable[(this.dealer + 1) % this.listePlayerTable.length].jetons -= petiteBlinde;
    this.listePlayerTable[(this.dealer + 2) % this.listePlayerTable.length].jetons -= grosseBlinde;
    this.pot = petiteBlinde + grosseBlinde;

    console.log("dealer : " + this.listePlayerTable[this.dealer].getPlayerName());
};

/**
 * permet d'executer les actions demandees par le joueur
 */
Game.prototype.joueJoueur = function (name, action, miseMin) {
    let indice;
    let bool = false;

    let boolTours = 1;
    let testTousJoue = true;

    switch (this.actionPrec) {
        case null:
            this.actionPrec = action;
            // console.log("name parametre : "+name);
            for (let i = 0; i < this.listePlayerGame.length; i++) {
                this.listePlayerGame[i].setAjoue(false);
            }
            for (let i = 0; i < this.listePlayerGame.length; i++) {
                if (this.listePlayerGame[i].getPlayerName() === name) {
                    this.listePlayerGame[i].setAjoue(true);
                    // console.log("test true");
                }
                // console.log("joueur "+i+" : "+this.listePlayerGame[i].getAjoue());
                // console.log("");
            }
            if (action === "check") {

            }

            if (action === "raise") {
                this.actionPrec = action;
                this.misePrec = miseMin;
                this.tasHaut = this.misePrec;
                for (let i = 0; i < this.listePlayerGame.length; i++) {
                    if (this.listePlayerGame[i].getPlayerName() === name) {
                        // if (this.tasHaut - this.listePlayerGame[i].getTas() <= this.listePlayerGame[i].jetons) {
                        this.listePlayerGame[i].jetons -= this.tasHaut - this.listePlayerGame[i].getTas();
                        this.listePlayerGame[i].tas += this.tasHaut - this.listePlayerGame[i].getTas();
                        // }
                    } else {
                        this.listePlayerGame[i].tas = 0;
                    }
                }
            }
            if (action === "all-in") {
                this.actionPrec = action;
                for (let i = 0; i < this.listePlayerGame.length; i++) {
                    if (this.listePlayerGame[i].getPlayerName() === name) {
                        this.misePrec = this.listePlayerGame[i].jetons;
                        this.tasHaut = this.misePrec;
                        this.listePlayerGame[i].tas += this.listePlayerGame[i].jetons;
                        this.listePlayerGame[i].jetons = 0;
                        this.listePlayerGame[i].allIn = true;
                    }
                }
            }
            if (action === "coucher") {
                for (let i = 0; i < this.listePlayerGame.length; i++) {
                    if (this.listePlayerGame.length < 3) {
                        if (this.listePlayerGame[i].getPlayerName() !== name) {
                            this.listePlayerGame[i].ietons += this.tasHaut + this.listePlayerGame[i].getTas();
                            let boolioueur = false;
                            for (let k = 0; k < this.listePlayerTable.length; k++) {
                                for (let l = 0; l < this.listePlayerGame.length; l++) {
                                    if (this.listePlayerTable[k].getPlayerName() !== this.listePlayerGame[l].getPlayerName()) {
                                        boolioueur = true;
                                    }
                                }
                                if (boolioueur) {
                                    this.listePlayerGame.push(this.listePlayerTable[k]);
                                    boolioueur = false;
                                    // this.canPlay=true;
                                    this.actionPrec = null;
                                    this.misePrec = 0;
                                    this.tasHaut = 0;
                                    boolTours = 1;
                                    for (let i = 0; i < this.listePlayerGame.length; i++) {
                                        this.listePlayerGame[i].tas = 0;
                                    }
                                }
                            }
                            // this.init(10,20);
                        }
                    } else {
                        if (this.listePlayerGame[i].getPlayerName() === name) {
                            this.listePlayerGame.splice(i, 1);
                        }
                    }
                }
            }
            break;
        case "check":
            // for (let i=0; i<this.listePlayerGame.length;i++) {
            //     if (this.listePlayerGame[i].getPlayerName() === name && this.listePlayerGame[i].allIn){
            //         break;
            //     } else if (this.listePlayerGame[i].getPlayerName() === name && !this.listePlayerGame[i].allIn) {
            for (let i = 0; i < this.listePlayerGame.length; i++) {
                if (this.listePlayerGame[i].getPlayerName() === name) {
                    this.listePlayerGame[i].setAjoue(true);
                }
            }

            if (action === "check") {
                for (let j = 0; j < this.listePlayerGame.length; j++) {
                    if (this.listePlayerGame[j].getPlayerName() === name) {

                        for (let i = 0; i < this.listePlayerGame.length; i++) {
                            if (!this.listePlayerGame[i].getAjoue()) {
                                testTousJoue = false;
                            }
                        }
                        if (!testTousJoue) {
                            //console.log("joueur n°" + j + " a joué");
                        } else {
                            //console.log("dernier joueur qui a joue");
                            this.canPlay = true;
                        }
                    }

                }
            }
            if (action === "raise") {
                this.actionPrec = action;
                this.misePrec = miseMin;
                this.tasHaut = this.misePrec;
                this.resetSetAjoue();
                for (let i = 0; i < this.listePlayerGame.length; i++) {
                    if (this.listePlayerGame[i].getPlayerName() === name) {
                        this.listePlayerGame[i].setAjoue(true);
                        for (let j = 0; j < this.listePlayerGame.length; j++) {
                            if (!this.listePlayerGame[j].getAjoue()) {
                                testTousJoue = false;
                            }
                        }
                        if (!testTousJoue) {
                            if (this.tasHaut - this.listePlayerGame[i].getTas() <= this.listePlayerGame[i].jetons) {
                                this.listePlayerGame[i].jetons -= this.tasHaut - this.listePlayerGame[i].getTas();
                                this.listePlayerGame[i].tas += this.tasHaut - this.listePlayerGame[i].getTas();
                            }
                            //console.log("joueur n°" + i + " a joué");
                        } else {
                            if (this.tasHaut - this.listePlayerGame[i].getTas() <= this.listePlayerGame[i].jetons) {
                                this.listePlayerGame[i].jetons -= this.tasHaut - this.listePlayerGame[i].getTas();
                                this.listePlayerGame[i].tas += this.tasHaut - this.listePlayerGame[i].getTas();
                            }
                            //console.log("dernier joueur qui a joue");
                            this.canPlay = true;
                        }

                    }
                }
            }
            if (action === "all-in") {
                this.actionPrec = action;
                this.resetSetAjoue();
                for (let i = 0; i < this.listePlayerGame.length; i++) {
                    if (this.listePlayerGame[i].getPlayerName() === name) {
                        for (let j = 0; j < this.listePlayerGame.length; j++) {
                            if (!this.listePlayerGame[j].getAjoue()) {
                                testTousJoue = false;
                            }
                        }
                        if (!testTousJoue) {
                            this.misePrec = this.listePlayerGame[i].getJetons();
                            this.tasHaut = this.misePrec;
                            this.listePlayerGame[i].tas += this.listePlayerGame[i].jetons;
                            this.listePlayerGame[i].jetons = 0;
                            this.listePlayerGame[i].allIn = true;

                            //console.log("joueur n°" + i + " a joué");
                        } else {
                            this.misePrec = this.listePlayerGame[i].getJetons();
                            this.tasHaut = this.misePrec;
                            this.listePlayerGame[i].tas += this.listePlayerGame[i].jetons;
                            this.listePlayerGame[i].jetons = 0;
                            this.listePlayerGame[i].allIn = true;

                            //console.log("dernier joueur qui a joue");
                            this.canPlay = true;
                        }

                    }
                }
            }
            if (action === "coucher") {
                for (let j = 0; j < this.listePlayerGame.length; j++) {
                    if (this.listePlayerGame.length < 3) {
                        if (this.listePlayerGame[j].getPlayerName() !== name) {
                            this.listePlayerGame[j].jetons += this.tasHaut + this.listePlayerGame[j].getTas();
                            let boolJoueur = false;
                            for (let k = 0; k < this.listePlayerTable.length; k++) {
                                for (let l = 0; l < this.listePlayerGame.length; l++) {
                                    if (this.listePlayerTable[k].getPlayerName() !== this.listePlayerGame[l].getPlayerName()) {
                                        boolJoueur = true;
                                    }
                                }
                                if (boolJoueur) {
                                    this.listePlayerGame.push(this.listePlayerTable[k]);
                                    boolJoueur = false;
                                    // this.canPlay=true;
                                    this.actionPrec = null;
                                }
                            }
                            // this.init(10,20);
                        }
                    } else {
                        if (this.listePlayerGame[j].getPlayerName() === name) {
                            this.listePlayerGame.splice(j, 1);
                        }
                    }
                }
                // }
                // }
            }
            break;
        case "suivre":
            // for (let i=0; i< this.listePlayerGame.length;i++) {
            //     if (this.listePlayerGame[i].getPlayerName() === name && this.listePlayerGame[i].allIn){
            //         this.canPlay=true;
            //     } else {
            for (let i = 0; i < this.listePlayerGame.length; i++) {
                if (this.listePlayerGame[i].getPlayerName() === name) {
                    this.listePlayerGame[i].setAjoue(true);
                }
            }

            if (action === "suivre") {
                for (let j = 0; j < this.listePlayerGame.length; j++) {
                    if (this.listePlayerGame[j].getPlayerName() === name) {
                        for (let i = 0; i < this.listePlayerGame.length; i++) {
                            if (!this.listePlayerGame[i].getAjoue()) {
                                testTousJoue = false;
                            }
                        }
                        if (!testTousJoue) {
                            if (this.tasHaut - this.listePlayerGame[j].getTas() <= this.listePlayerGame[j].jetons) {
                                this.listePlayerGame[j].jetons -= this.tasHaut - this.listePlayerGame[j].getTas();
                                this.listePlayerGame[j].tas += this.tasHaut - this.listePlayerGame[j].getTas();
                            }

                            //console.log("joueur n°" + j + " a joué");
                        } else {
                            if (this.tasHaut - this.listePlayerGame[j].getTas() <= this.listePlayerGame[j].jetons) {
                                this.listePlayerGame[j].jetons -= this.tasHaut - this.listePlayerGame[j].getTas();
                                this.listePlayerGame[j].tas += this.tasHaut - this.listePlayerGame[j].getTas();
                            }

                            //console.log("dernier joueur qui a joue");
                            this.canPlay = true;
                        }
                    }

                }

            }
            if (action === "raise") {
                this.actionPrec = action;
                this.misePrec = miseMin;
                this.tasHaut = this.misePrec;
                this.resetSetAjoue();
                for (let i = 0; i < this.listePlayerGame.length; i++) {
                    if (this.listePlayerGame[i].getPlayerName() === name) {
                        for (let j = 0; j < this.listePlayerGame.length; j++) {
                            if (!this.listePlayerGame[j].getAjoue()) {
                                testTousJoue = false;
                            }
                        }
                        if (!testTousJoue) {
                            //console.log("joueur n°" + i + " a joué");
                            if (this.tasHaut - this.listePlayerGame[i].getTas() <= this.listePlayerGame[i].jetons) {
                                this.listePlayerGame[i].jetons -= this.tasHaut - this.listePlayerGame[i].getTas();
                                this.listePlayerGame[i].tas += this.tasHaut - this.listePlayerGame[i].getTas();
                            }
                        } else {
                            //console.log("dernier joueur qui a joue");
                            if (this.tasHaut - this.listePlayerGame[i].getTas() <= this.listePlayerGame[i].jetons) {
                                this.listePlayerGame[i].jetons -= this.tasHaut - this.listePlayerGame[i].getTas();
                                this.listePlayerGame[i].tas += this.tasHaut - this.listePlayerGame[i].getTas();
                            }
                            this.canPlay = true;
                        }
                    }
                }
            }
            // if (action === "raise") {
            //     this.actionPrec = action;
            //     this.misePrec = miseMin;
            //     //a faire si plus de deux joueurs;
            // }
            // if (action === "all-in") {
            //     this.actionPrec = action;
            //     // this.canPlay=true;
            //     for (let i = 0; i < this.listePlayerGame.length; i++) {
            //         if (this.listePlayerGame[i].getPlayerName() === name) {
            //             this.misePrec = this.listePlayerGame[i].getJetons();
            //             this.tasHaut = this.misePrec;
            //             this.listePlayerGame[i].tas += this.listePlayerGame[i].jetons;
            //             this.listePlayerGame[i].jetons = 0;
            //             this.listePlayerGame[i].allIn = true;
            //         }
            //     }
            // }
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
            //                 // this.init(10,20);
            //             }
            //         }else {
            //             if (this.listePlayerGame[j].getPlayerName() === name){
            //                 this.listePlayerGame.splice(j,1);
            //             }
            //         }
            //     }
            // }
            break;

        case "raise":
            // for (let i=0; i<this.listePlayerGame.length;i++) {
            //     if (this.listePlayerGame[i].getPlayerName() === name && this.listePlayerGame[i].allIn){
            //         this.canPlay=true;
            //     } else {
            // this.resetSetAjoue();
            for (let i = 0; i < this.listePlayerGame.length; i++) {
                if (this.listePlayerGame[i].getPlayerName() === name) {
                    this.listePlayerGame[i].setAjoue(true);
                }
                console.log(this.listePlayerGame[i].getAjoue());
            }
            if (action === "suivre") {
                for (let j = 0; j < this.listePlayerGame.length; j++) {
                    if (this.listePlayerGame[j].getPlayerName() === name) {
                        for (let i = 0; i < this.listePlayerGame.length; i++) {
                            console.log("2 " + this.listePlayerGame[i].getAjoue());
                            if (!this.listePlayerGame[i].getAjoue()) {
                                testTousJoue = false;
                            }
                        }
                        if (!testTousJoue) {
                            //console.log("joueur n°" + j + " a joué");
                            if (this.tasHaut - this.listePlayerGame[j].getTas() <= this.listePlayerGame[j].jetons) {
                                this.listePlayerGame[j].jetons -= this.tasHaut - this.listePlayerGame[j].getTas();
                                this.listePlayerGame[j].tas += this.tasHaut - this.listePlayerGame[j].getTas();
                            }
                        } else {
                            //console.log("dernier joueur qui a joue");
                            if (this.tasHaut - this.listePlayerGame[j].getTas() <= this.listePlayerGame[j].jetons) {
                                this.listePlayerGame[j].jetons -= this.tasHaut - this.listePlayerGame[j].getTas();
                                this.listePlayerGame[j].tas += this.tasHaut - this.listePlayerGame[j].getTas();
                            }
                            this.canPlay = true;
                        }
                    }

                }
            }
            if (action === "raise") {
                this.actionPrec = action;
                this.misePrec = miseMin;
                this.tasHaut = this.misePrec;
                this.resetSetAjoue();
                for (let i = 0; i < this.listePlayerGame.length; i++) {
                    if (this.listePlayerGame[i].getPlayerName() === name) {
                        for (let j = 0; j < this.listePlayerGame.length; j++) {
                            if (!this.listePlayerGame[j].getAjoue()) {
                                testTousJoue = false;
                            }
                        }
                        if (!testTousJoue) {
                            if (this.tasHaut - this.listePlayerGame[i].getTas() <= this.listePlayerGame[i].jetons) {
                                this.listePlayerGame[i].jetons -= this.tasHaut - this.listePlayerGame[i].getTas();
                                this.listePlayerGame[i].tas += this.tasHaut - this.listePlayerGame[i].getTas();
                            }

                            //console.log("joueur n°" + i + " a joué");
                        } else {
                            if (this.tasHaut - this.listePlayerGame[i].getTas() <= this.listePlayerGame[i].jetons) {
                                this.listePlayerGame[i].jetons -= this.tasHaut - this.listePlayerGame[i].getTas();
                                this.listePlayerGame[i].tas += this.tasHaut - this.listePlayerGame[i].getTas();
                            }

                            //console.log("dernier joueur qui a joue");
                            this.canPlay = true;
                        }
                    }
                }
            }
            if (action === "all-in") {
                this.actionPrec = action;
                this.resetSetAjoue();
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
            //                 // this.init(10,20);
            //             }
            //         }else {
            //             if (this.listePlayerGame[j].getPlayerName() === name){
            //                 this.listePlayerGame.splice(j,1);
            //             }
            //         }
            //     }
            // }
            break;
        case "all-in":
            this.resetSetAjoue();
            for (let i = 0; i < this.listePlayerGame.length; i++) {
                if (this.listePlayerGame[i].getPlayerName() === name) {
                    this.listePlayerGame[i].setAjoue(true);
                }
            }

            if (action === "suivre") {
                // this.actionPrec = action;
                // this.canPlay = true;
                // this.tasHaut = this.misePrec;
                // for (let i = 0; i < this.listePlayerGame.length; i++) {
                //     if (this.listePlayerGame[i].getPlayerName() === name) {
                //         if (this.tasHaut - this.listePlayerGame[i].getTas() <= this.listePlayerGame[i].jetons) {
                //             this.listePlayerGame[i].jetons -= this.tasHaut - this.listePlayerGame[i].getTas();
                //             this.listePlayerGame[i].pot += this.tasHaut - this.listePlayerGame[i].getTas();
                //             boolTours = 6-this.tour;
                //         }
                //     }
                // }
                this.actionPrec = action;
                this.tasHaut = this.misePrec;
                for (let i = 0; i < this.listePlayerGame.length; i++) {
                    if (this.listePlayerGame[i].getPlayerName() === name) {
                        //console.log("jetons : "+this.listePlayerGame[i].jetons+" tas : "+this.listePlayerGame[i].getTas());
                        //console.log("tasHAut : "+this.tasHaut);
                        //console.log("operation");
                        this.listePlayerGame[i].jetons -= this.tasHaut - this.listePlayerGame[i].getTas();
                        this.listePlayerGame[i].tas += this.tasHaut - this.listePlayerGame[i].getTas();
                        boolTours = 6 - this.tour;
                        //console.log("jetons : "+this.listePlayerGame[i].jetons+" tas : "+this.listePlayerGame[i].getTas());
                    }
                }
                this.canPlay = true;
            }
            if (action === "raise") {
                this.actionPrec = action;
                this.canPlay = true;
                this.misePrec = this.misePrec + miseMin;
                this.tasHaut = this.misePrec;
                this.resetSetAjoue();
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
            if (action === "coucher") {
                for (let j = 0; j < this.listePlayerGame.length; j++) {
                    if (this.listePlayerGame.length < 3) {
                        if (this.listePlayerGame[j].getPlayerName() !== name) {
                            this.listePlayerGame[j].jetons += this.tasHaut + this.listePlayerGame[j].getTas();
                            this.tour = 6;
                            let boolJoueur = false;
                            for (let k = 0; k < this.listePlayerTable.length; k++) {
                                for (let l = 0; l < this.listePlayerGame.length; l++) {
                                    if (this.listePlayerTable[k].getPlayerName() !== this.listePlayerGame[l].getPlayerName()) {
                                        boolJoueur = true;
                                    }
                                }
                                if (boolJoueur) {
                                    this.listePlayerGame.push(this.listePlayerTable[k]);
                                    boolJoueur = false;
                                }
                            }
                            // this.init(10,20);
                        }
                    } else {
                        if (this.listePlayerGame[j].getPlayerName() === name) {
                            this.listePlayerGame.splice(j, 1);
                            this.pot += this.listePlayerGame[j].getTas();
                        }
                    }
                }
            }
            break;
        case "coucher":
            for (let i = 0; i < this.listePlayerGame.length; i++) {
                if (this.listePlayerGame[i].getPlayerName() === name) {
                    this.listePlayerGame[i].setAjoue(true);
                }
            }
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

    // for (let i = 0; i < this.listePlayerGame.length; i++) {
    //     if (this.listePlayerGame[i].getPlayerName() === name) {
    //         indice = i;
    //         this.listePlayerGame[indice].setAjoue(true);
    //     } else {
    //         this.listePlayerGame[i].setAjoue(false);
    //     }
    // }
    /**
     * reinitialise le tour apres que chaque joueurs aient fini
     */
    if (this.canPlay) {
        for (let i = 0; i < this.listePlayerGame.length; i++) {
            this.pot += this.listePlayerGame[i].getTas();
            this.listePlayerGame[i].tas = 0;
            this.listePlayerGame[i].setAjoue(false);
        }
        for (let i = 0; i < boolTours; i++) {
            this.incrementeTour();
        }
        // this.tour++;
        this.canPlay = false;
        this.actionPrec = null;
        this.misePrec = 0;
        this.tasHaut = 0;
        boolTours = 1;
        testTousJoue = true;
    }
    //console.log(this.tour);
    //console.log(this.pot);
};

Game.prototype.resetSetAjoue = function () {
    for (let i = 0; i < this.listePlayerGame.length; i++) {
        this.listePlayerGame[i].setAjoue(false);
    }
};

Game.prototype.incrementeTour = function () {
    this.tour++;
    //console.log("tour suivant");
};

/**
 * fait la distribution des gains pour le(s) vainqueur(s)
 */
Game.prototype.distribGains = function (name) {
    let testName = false;
    for (let i = 0; i < this.listePlayerGame.length; i++) {
        if (this.listePlayerGame[i].getPlayerName() === name) {
            //console.log("pot : "+this.pot);
            this.listePlayerGame[i].jetons += this.pot + this.listePlayerGame[i].tas;
            testName = true;
        }
    }
    if (!testName) {
        for (let i = 0; i < this.listePlayerGame.length; i++) {
            this.listePlayerGame[i].jetons += this.pot / this.listePlayerGame.length + this.listePlayerGame[i].tas;
        }
    }
    this.pot = 0;
    this.dealer=(this.dealer+1)%this.listePlayerTable.length;
};

/**
 * evalue les mains de chaque joueurs et retourne l'indice du joueur qui a la main la plus forte
 */
Game.prototype.evalCarte = function () {
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

    //console.log(this.allCards);

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
        //console.log("game.js highestIndex : "+highestIndex);
    }

    this.allCards = [];

    return highestIndex;
};

/**
 * initialise le debut du jeu
 */
Game.prototype.init = function (petiteBlinde, grosseBlinde) {
    console.log("init");
    this.reset();
    //console.log(this.cartes);
    // initialisation des blinds
    for (let i = 0; i < this.listePlayerGame.length; i++) {
        console.log("joueur "+i+" : "+this.listePlayerGame[i].getAjoue());
        console.log("");
    }
    this.blind(petiteBlinde, grosseBlinde);

    //initialisation main + affichage main joueur
    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < this.listePlayerGame.length; j++) {
            this.listePlayerGame[j].addMain(this.cartes.giveCarte());
        }
    }
    this.tour = 2;
    for (let i = 0; i < 5; i++) {
        this.tapisCarte.push(this.cartes.giveCarte());
    }
};

Game.prototype.continueGameAfterTimeOut = function () {
    // this.continueGame(10,20);
    // this.init(10,20);
};

Game.prototype.miseEnAttenteFinGame = function () {
    setTimeout(this.continueGameAfterTimeOut, 5000);
};