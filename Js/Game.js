module.exports = Game;

var Player = require('./Player.js');
var Cartes = require('./Cartes.js');

function Game() {
    this.listePlayer = [];
    this.pot = 0;
    this.cartes = new Cartes();
    this.tapisCarte = [];
}

Game.prototype.addPlayer = function(id,name,jetons) {
    var newPlayer = new Player(id,name,jetons);
    newPlayer.game = this;
    this.listePlayer.push(newPlayer);
};

Game.prototype.reset = function() {
    this.pot = 0;
    this.cartes = new Cartes();
    for (var i=0; i<this.listePlayer.length; i++) {
        this.listePlayer[i].reset();
    }
};

Game.prototype.play = function () {
    while (this.listePlayer.length > 1){
        this.reset();
        for (i=0 ; i<2 ;i++){
            for (j=0 ; j<this.listePlayer.length ;j++){
                this.listePlayer[j].addMain(this.cartes.giveCarte());
            }
        }
        for (i=0; i<5 ;i++){
            this.tapisCarte.push(this.cartes.giveCarte());
        }




        /***********************************************/
    }
}

