module.exports = Game;

var Player = require('./Player.js');
var Cartes = require('./Cartes.js');
var readlineSync = require('readline-sync');

function Game() {
    this.listePlayer = [];
    this.pot = 0;
    this.cartes = new Cartes();
    this.tapisCarte = [];
    this.dealer = 0;
    this.tour = 1;
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

Game.prototype.blind = function(petiteBlinde, grosseBlinde){

    if (this.dealer>=this.listePlayer.length){
        this.dealer=0;
    }
    this.listePlayer[this.dealer+1].fold(petiteBlinde);
    if (this.dealer+2<this.listePlayer.length) {
        this.listePlayer[this.dealer + 2].fold(grosseBlinde);
    }else {
        this.listePlayer[0].fold(grosseBlinde);
    }
    this.pot=petiteBlinde+grosseBlinde;
    this.dealer++;
};

Game.prototype.affichage = function(){
    console.log();
    console.log();

    console.log('Tapis : ');

    if (this.tour>=3 && this.tour<5) {
        for (i=0;i<this.tour;i++){
            console.log(this.tapisCarte[i]);
        }
        this.tour++;
    }

    console.log();
    console.log('Joueurs :');
    for (i=0;i<this.listePlayer.length;i++){
        console.log(+this.listePlayer[i].getNom()+" : "+this.listePlayer[i].getMain()+", "+this.listePlayer[i].getJetons()+" coins");
    }
};

/**
 * affiche les options mise, check, coucher, all-in
 * selectionne l'option choisi et fait l'action liée
 */
Game.prototype.option = function(miseMin){

    for (i=0;i<this.listePlayer.length;i++) {
        console.log(this.listePlayer[i].getNom()+' :');
        var action = readlineSync.question('action : check, mise min(' + miseMin + '), relancer, all-in : ');
        if (action === 'relancer') {
            do {
                var miseRel = readlineSync.question('mise Relance : ');
            } while (miseRel >this.listePlayer[i].getJetons());

        }
        console.log();
    }
};

Game.prototype.play = function (petiteBlinde, grosseBlinde) {
    // while (this.listePlayer.length > 1){ sur affichage web oui mais pas sur console
        this.reset();

        // initialisation des blinds
        this.affichage();
        this.blind(petiteBlinde,grosseBlinde);
        this.affichage();

        //initialisation main + affichage main joueur
        for (i=0 ; i<2 ;i++){
            for (j=0 ; j<this.listePlayer.length ;j++){
                this.listePlayer[j].addMain(this.cartes.giveCarte());
            }

        }

        this.affichage();

        this.option(grosseBlinde);

        for (i=0; i<5 ;i++){
            this.tapisCarte.push(this.cartes.giveCarte());
        }

        this.tour=3;
        this.affichage()
        this.option(grosseBlinde);

        /***********************************************/
    // }
};

