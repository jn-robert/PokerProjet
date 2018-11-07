var shuffle = require('shuffle-array');



var tabCarte = new Array();
var tabPlayer = new Array();

//=======================================================//
function Carte(nom, valeur, couleur) {
    this.nom = nom;
    this.valeur = valeur;
    this.couleur = couleur;
}



function jeuDeCarte() {
    for (j=0 ; j<4 ; j++) {
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
        for (i = 1; i <= 13; i++) {
            ;
            tabCarte.push(new Carte(i+"-"+couleur, i, 1));
        }
    }
}

function initJeuCarte() {
    shuffle(tabCarte);
}

function printJeuDeCarte() {
    for (i=0 ; i< tabCarte.length ; i++){
        console.log(tabCarte[i]);
    }
}

function donneCarte() {
    var carteD = tabCarte[0];
    tabCarte.shift();
    return carteD;
}

//=======================================================//
function Player(nom,main,jetons){
    this.nom = nom;
    this.main = main;
    this.jetons = jetons;
}


function createPlayer(nbPlayer){
    /*
    for (i=0 ; i<nbPlayer ; i++) {
        tabPlayer[i] = new Player(nom,main,jetons)
    }
    */
    tabPlayer[0] = new Player("P1",null,300);
    tabPlayer[1] = new Player("P2",null,300);
    tabPlayer[2] = new Player("P3",null,300);
    tabPlayer[3] = new Player("P4",null,300);
}

function printTabPlayer(){
    for (i=0 ; i<tabPlayer.length ; i++){
        console.log(tabPlayer[i]);
    }
}




//=======================================================//
jeuDeCarte(); // cree le paquet de carte
initJeuCarte(); // melange les cartes
donneCarte(); // return: carte  et la supprime
printJeuDeCarte(); //affiche l'etat du paquet

createPlayer();
printTabPlayer();