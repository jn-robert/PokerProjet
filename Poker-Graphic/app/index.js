define(function (require) {
    var Game= require('./Game');
    var game = new Game();
    var readlineSync = require('readline-sync');

    var petiteBlinde = 5;
    var grosseBlinde = 10;

    var nom1 = readlineSync.question('Entrez votre nom Joueur 1 : ');
    var nom2 = readlineSync.question('Entrez votre nom Joueur 2 : ');
    var nom3 = readlineSync.question('Entrez votre nom Joueur 3 : ');

    game.addPlayer(1,nom1,5000);
    game.addPlayer(2,nom2,4000);
    game.addPlayer(3,nom3,2500);

    game.play(petiteBlinde,grosseBlinde);

});