module.exports = Game;

var Player = require('./Player.js');
var Cartes = require('./Cartes.js');
var readlineSync = require('readline-sync');

function Game() {
    this.listePlayerTable = [];
    this.listePlayerGame = [];
    this.pot = 0;
    this.cartes = new Cartes();
    this.tapisCarte = [];
    this.dealer = 0;
    this.tour = 0;
}

Game.prototype.addPlayer = function(id,name,jetons) {
    let newPlayer = new Player(id, name, jetons);
    newPlayer.game = this;
    this.listePlayerTable.push(newPlayer);
    this.listePlayerGame.push(newPlayer);
};

Game.prototype.reset = function() {
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
    this.listePlayerGame[this.dealer+1].fold(petiteBlinde);
    if (this.dealer+2<this.listePlayerGame.length) {
        this.listePlayerGame[this.dealer + 2].fold(grosseBlinde);
    }else {
        this.listePlayerGame[0].fold(grosseBlinde);
    }
    this.pot=petiteBlinde+grosseBlinde;
    this.dealer++;
};

Game.prototype.affichage = function(){
    console.log();
    console.log();

    console.log('Pot : '+this.pot);
    console.log('Tapis : ');

    if (this.tour<=5) {
        for (let i = 0; i<this.tour; i++){
            console.log(this.tapisCarte[i]);
        }
    }

    console.log();
    console.log('Joueurs :');
    for (let i=0;i<this.listePlayerGame.length;i++){
        console.log(''+this.listePlayerGame[i].getNom()+" : "+this.listePlayerGame[i].getMain()+", "+this.listePlayerGame[i].getJetons()+" coins");
    }
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
                action = readlineSync.question('action : coucher, check, mise min/suivre(' + miseMin + '), relancer, all-in : ');
                break;
            case 'suivre':
                do{
                    action = readlineSync.question('action : coucher, mise min/suivre(' + miseMin + '), relancer, all-in : ');
                }while (action==='check') ;

                break;
            case 'relancer':
                if (miseMin >this.listePlayerGame[i].getJetons()){
                    do {
                        action = readlineSync.question('action : coucher, all-in : ');
                    } while (action === 'check' || action === 'relancer' || action ==='suivre');
                }else if(miseMin === this.listePlayerGame[i].getJetons()){
                    do {
                        action = readlineSync.question('action : coucher, mise min/suivre(' + miseMin + '), all-in : ');
                    } while (action === 'check' || action === 'relancer');
                } else {
                    do {
                        action = readlineSync.question('action : coucher, mise min/suivre(' + miseMin + '), relancer, all-in : ');
                    } while (action === 'check');
                }
                break;
            case 'all-in':
                do {
                    action = readlineSync.question('action : coucher, all-in : ');
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
                this.fold(miseMin);
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

Game.prototype.play = function (petiteBlinde, grosseBlinde) {
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

        /*for (let i=0;i<5;i++){
            console.log(this.tapisCarte[i]);
        }*/

        for (let i=0;i<3;i++){
            this.tour++;
            /*console.log('tour : '+this.tour);*/
            this.affichage();
            this.option(grosseBlinde);
        }

        /***********************************************/
    }
};