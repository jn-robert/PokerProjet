const Player = require('./Player.js')
const jeuDeCarte = require('./JeuDeCarte.js')

module.exports = class Game {
    constructor(nbPlayer) {
        this.nbPlayer = nbPlayer;
        this.tabPlayer = new Array();
    }

    static createPlayer(){
        /*
        for (var i=0 ; i<this.nbPlayer ; i++){
            this.tabPlayer[i] = new Player(nom,null,jetons);
        }
        */
        this.tabPlayer[0] = new Player("toto",null,300);
        this.tabPlayer[1] = new Player("titi",null,300);
        this.tabPlayer[2] = new Player("tata",null,300);
    }

    static giveCarte

    static partie(){
        while (this.tabPlayer.length > 1){

        }
    }
}