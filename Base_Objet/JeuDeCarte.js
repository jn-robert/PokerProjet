var shuffle = require('shuffle-array');
const Carte = require('./Carte.js');

module.exports = class JeuDeCarte {
    constructor(tabCarte){
        this.tabCarte = new Array();
        this.createJeuDeCarte(tabCarte);
    }

    static createJeuDeCarte(tabCarte) {
        tabCarte = new Array();
        for (var j=0 ; j<4 ; j++) {
            var couleur;
            switch (j){
                case 1:
                    couleur = "Piques"
                    break;
                case 2:
                    couleur = "Carreaux"
                    break;
                case 3:
                    couleur = "Trefles"
                    break;
                default:
                    couleur = "Coeurs"
            }
            for (var i=1; i <= 13; i++) {
                tabCarte.push(new Carte(i+"_"+couleur,i,j));
            }
        }
        this.tabCarte = tabCarte;
    }

    static initJeuCarte() {
        shuffle(this.tabCarte);
    }

    static printJeuDeCarte() {
        for (var i=0 ; i< 52 ; i++){
            console.log(this.tabCarte[i]);
        }
    }

    donneCarte() {
        var carteD = tabCarte[0];
        tabCarte.shift();
        return carteD;
    }
}