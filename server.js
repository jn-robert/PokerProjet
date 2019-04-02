const express = require('express');
const path = require('path');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const mysql = require('mysql');
const socket = require("socket.io");
let Game = require('./Game');
io.set('log level', 1);

let rooms = 0;
var id = 0;
var idPartie = 0;
let game;
let idJoueur = [];
let compteurRestartGame = 0;
let nombreJoueurPartiePrec = 0;

app.use(express.static('.'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

app.get('/stat', (req, res) => {
    res.sendFile(path.join(__dirname, 'stats.html'));
});


/**
 * Partie statistique
 */

const con = mysql.createConnection({
    host: 'localhost',
    database: 'poker',
    user: 'root',
    port: '3306',
    password: '',
});

con.connect((err) => {
    if (err) {
        console.log('Error connecting to Db');
        return;
    }
    console.log('Connection established');
       con.query("DELETE FROM partie", (err, rows) =>{
        if (err) throw err;
    });
});

/**
 * connection a la socket puis execution des demandes et renvoi de valeurs du jeu pour 2 personnes
 */

io.on('connection', (socket) => {

    // Create a new game room and notify the creator of game.
    socket.on('createGame', (data) => {
        socket.join(`${++rooms}`);
        game = new Game();
        game.addPlayer(id++, data.name, data.jeton);
        idPartie++;
        con.query("INSERT INTO partie VALUES("+idPartie+" ,NULL ,NULL ,1)", (err, rows) =>{
            if (err) throw err;
        });
        socket.emit('newGame', {name: data.name, room: `${rooms}`});
    });
//
    // Connect the Player to the room he requested. Show error if room full.
    socket.on('joinGame', function (data) {
        var room = io.nsps['/'].adapter.rooms[data.room];
        if (room && room.length <= 9) {
            socket.join(data.room);
            game.addPlayer(id++, data.name, data.jeton);
            con.query("UPDATE partie SET nbJoueur = nbJoueur + 1 WHERE idPartie="+data.room, (err, rows) =>{
                if (err) throw err;
            });
            socket.emit('player', {name: data.name, room: `${rooms}`});
        } else {
            socket.emit('err', {message: 'La partie est pleine!'});
        }
    });

    /**
     * Socket pour les stats et les diff requetes
     */
    socket.on('callListJoueur', function () {
        con.query("SELECT * FROM player", (err, rows) => {
            if (err) throw err;
            socket.emit('listJoueur', {
                tab: rows
            });
        });
    });

    socket.on('checkUserLogin', (data) => {
        let pass = data.pwd;
        let pseudo = data.pseudo;
        con.query("SELECT * FROM player", (err, rows) => {
            if (err) throw err;
            for (let i = 0; i < rows.length; i++) {
                if((rows[i].pseudo == pseudo) && (rows[i].password == pass)){
                    socket.emit('loginSucces', {pseudo: pseudo});
                }
            }
        });
    });

    socket.on('createNewUSer', (data) => {
        let nom = data.nomUser;
        let prenom = data.prenom;
        let pseudo = data.pseudo;
        let pwd = data.pass;
        con.query("INSERT INTO `player` (`idPlayer`, `nom`, `prenom`, `pseudo`, `password`, `dateInscription`, `jetons`) VALUES (NULL, " + mysql.escape(nom) + ", " + mysql.escape(prenom) + ", " + mysql.escape(pseudo) + ", " + mysql.escape(pwd) + ", now(), '100')", (err, rows) => {
            if (err) throw err;
            socket.emit('RegisterSucces', {pseudo: pseudo, pass: pwd});
        });
        con.query("SELECT idPlayer FROM player WHERE pseudo="+mysql.escape(pseudo), (err, rows) =>{
            if (err) throw err;
            con.query("INSERT INTO `action` (`idPlayer`, `nbAllIn`, `nbCheck`, `nbFold`, `nbRaise`, `nbSuivre`) VALUES ("+ rows[0].idPlayer +", '0', '0', '0', '0', '0')", (err, rows) => {
                if (err) throw err;
            });
        });
    });


    socket.on('getStatsPlayer', (pseudo) => {
        let idPlayer = pseudo.id;
        con.query("SELECT * FROM player WHERE idPlayer ="+idPlayer, (err, rows) => {
            if (err) throw err;

            socket.emit('ReturnStatsPlayer', {
                tab: rows
            })
        });

        con.query("SELECT * FROM action WHERE idPlayer="+idPlayer, (err, rows) =>{
            socket.emit('ResturnStatsActionPlayer', {
                tab: rows
            });
        });
    });

    /**
     * Get information for table join
     */
    socket.on('callPartie', function (){

        con.query('SELECT * FROM partie', (err, rows) =>{
            if (err) throw err;
            socket.emit('partieJoueur', {
                tab: rows
            });
        });
    });

    /**
     * Handle the turn played by either player and notify the other.
     */
    socket.on('playTurn', (data) => {
        socket.broadcast.to(data.room).emit('turnPlayed', {
            room: data.room
        });
    });

    /**
     * Notify the players about the victor.
     */
    socket.on('gameEnded', (data) => {
        socket.broadcast.to(data.room).emit('gameEnd', data);
    });


    socket.on('start', (data) => {
        game.init(10, 20);
        let indicePlayerStart;
        for (let i = 0; i < game.listePlayerGame.length; i++) {
            idJoueur[i] = i;
        }

        let listeCartes = [];
        let listeNoms = [];
        let listeJetons = [];
        for (let i = 0; i < game.listePlayerGame.length; i++) {
            listeCartes[i] = game.listePlayerGame[i].getMain();
            listeNoms[i] = game.listePlayerGame[i].getPlayerName();
            listeJetons[i] = game.listePlayerGame[i].getJetons();
        }
        // console.log(listeCartes);
        console.log("indice dealer : " + game.dealer);

        let idJoueurCurrentBooleanTour;
        for (let i = 0; i < game.listePlayerGame.length; i++) {
            if (game.listePlayerGame[i].getPlayerName() === data.playerName) {
                idJoueurCurrentBooleanTour = (i+1)%game.listePlayerGame.length;
            }
        }

        switch (data.playerName) {
            case game.listePlayerGame[0].getPlayerName():
                game.listePlayerGame[0].setAjoue(false);
                indicePlayerStart = 0;
                for (let i = 0; i < game.listePlayerGame.length && i !== 0; i++) {
                    game.listePlayerGame[i].setAjoue(true);
                }
                break;
            case game.listePlayerGame[1].getPlayerName():
                game.listePlayerGame[1].setAjoue(false);
                indicePlayerStart = 1;
                for (let i = 0; i < game.listePlayerGame.length && i !== 1; i++) {
                    game.listePlayerGame[i].setAjoue(true);
                }
                break;
            case game.listePlayerGame[2].getPlayerName():
                game.listePlayerGame[2].setAjoue(false);
                indicePlayerStart = 2;
                for (let i = 0; i < game.listePlayerGame.length && i !== 2; i++) {
                    game.listePlayerGame[i].setAjoue(true);
                }
                break;
            case game.listePlayerGame[3].getPlayerName():
                game.listePlayerGame[3].setAjoue(false);
                indicePlayerStart = 3;
                for (let i = 0; i < game.listePlayerGame.length && i !== 3; i++) {
                    game.listePlayerGame[i].setAjoue(true);
                }
                break;
            case game.listePlayerGame[4].getPlayerName():
                game.listePlayerGame[4].setAjoue(false);
                indicePlayerStart = 4;
                for (let i = 0; i < game.listePlayerGame.length && i !== 4; i++) {
                    game.listePlayerGame[i].setAjoue(true);
                }
                break;
            case game.listePlayerGame[5].getPlayerName():
                game.listePlayerGame[5].setAjoue(false);
                indicePlayerStart = 5;
                for (let i = 0; i < game.listePlayerGame.length && i !== 5; i++) {
                    game.listePlayerGame[i].setAjoue(true);
                }
                break;
            case game.listePlayerGame[6].getPlayerName():
                game.listePlayerGame[6].setAjoue(false);
                indicePlayerStart = 6;
                for (let i = 0; i < game.listePlayerGame.length && i !== 6; i++) {
                    game.listePlayerGame[i].setAjoue(true);
                }
                break;
            case game.listePlayerGame[7].getPlayerName():
                game.listePlayerGame[7].setAjoue(false);
                indicePlayerStart = 7;
                for (let i = 0; i < game.listePlayerGame.length && i !== 7; i++) {
                    game.listePlayerGame[i].setAjoue(true);
                }
                break;
            default:
                break;
        }

        socket.emit('1stR', {
            currentTurn: game.listePlayerGame[idJoueurCurrentBooleanTour].getPlayerName(),
            tour: game.getTour(),
            pot: game.pot,
            nbJoueurs: game.listePlayerGame.length,
            name: listeNoms,
            jetons: listeJetons,
            cartes: listeCartes,

            cartesTapis: game.getTapis()
        });

        socket.broadcast.emit('1stR', {
            currentTurn: game.listePlayerGame[idJoueurCurrentBooleanTour].getPlayerName(),
            name: listeNoms,
            nbJoueurs: game.listePlayerGame.length,
            tour: game.getTour(),
            pot: game.pot,
            jetons: listeJetons,
            cartes: listeCartes,
            cartesTapis: game.getTapis()
        });
    });

    socket.on('check', (data) => {
        con.query("SELECT idPlayer FROM player WHERE pseudo="+mysql.escape(data.playerName), (err, rows) =>{
            if (err) throw err;
            con.query("UPDATE action SET nbCheck = nbCheck + 1 WHERE idPlayer="+rows[0].idPlayer, (err, rows) =>{
                if (err) throw err;
            });
        });

        game.joueJoueur(data.playerName, "check", 10);
        let idJoueurCurrentBooleanTour;
        for (let i = 0; i < game.listePlayerGame.length; i++) {
            if (game.listePlayerGame[i].getPlayerName() === data.playerName) {
                idJoueurCurrentBooleanTour = (i+1)%game.listePlayerGame.length;
            }
        }

        let listeCartes = [];
        let listeNoms = [];
        let listeJetons = [];
        for (let i = 0; i < game.listePlayerGame.length; i++) {
            listeCartes[i] = game.listePlayerGame[i].getMain();
            listeNoms[i] = game.listePlayerGame[i].getPlayerName();
            listeJetons[i] = game.listePlayerGame[i].getJetons();
        }

        let name = "";
        let highestIndex = 0;
        let combi = "";
        highestIndex = game.evalCarte();
        if (game.tour > 5) {
            if (highestIndex < game.listePlayerGame.length) {
                name = game.afficheJoueurName(highestIndex);
                combi = game.evalCards[highestIndex].handName;
            } else {
                name = "egalite";
            }
            game.distribGains(name);
        }

        socket.emit('resultAction', {
            vainqueur: name,
            combiVainq: combi,
            tasHaut: game.tasHaut,
            jetonsRecolt: game.getRecoltJetons(),
            choixJoueurs: game.actionPrec,
            currentTurn: game.listePlayerGame[idJoueurCurrentBooleanTour].getPlayerName(),
            tour: game.getTour(),
            pot: game.pot,
            nbJoueurs: game.listePlayerGame.length,
            name: listeNoms,
            jetons: listeJetons,
            cartes: listeCartes,
            cartesTapis: game.getTapis()
        });
        socket.broadcast.emit('resultAction', {
            vainqueur: name,
            combiVainq: combi,
            tasHaut: game.tasHaut,
            jetonsRecolt: game.getRecoltJetons(),
            choixJoueurs: game.actionPrec,
            currentTurn: game.listePlayerGame[idJoueurCurrentBooleanTour].getPlayerName(),
            tour: game.getTour(),
            pot: game.pot,
            nbJoueurs: game.listePlayerGame.length,
            name: listeNoms,
            jetons: listeJetons,
            cartes: listeCartes,
            cartesTapis: game.getTapis()
        });
    });

    socket.on('suivre', (data) => {
        con.query("SELECT idPlayer FROM player WHERE pseudo="+mysql.escape(data.playerName), (err, rows) =>{
            if (err) throw err;
            con.query("UPDATE action SET nbSuivre = nbSuivre + 1 WHERE idPlayer="+rows[0].idPlayer, (err, rows) =>{
                if (err) throw err;
            });
        });
        game.joueJoueur(data.playerName, "suivre", 10);
        let idJoueurCurrentBooleanTour;
        for (let i = 0; i < game.listePlayerGame.length; i++) {
            if (game.listePlayerGame[i].getPlayerName() === data.playerName) {
                idJoueurCurrentBooleanTour = (i+1)%game.listePlayerGame.length;
            }
        }

        let listeCartes = [];
        let listeNoms = [];
        let listeJetons = [];
        for (let i = 0; i < game.listePlayerGame.length; i++) {
            listeCartes[i] = game.listePlayerGame[i].getMain();
            listeNoms[i] = game.listePlayerGame[i].getPlayerName();
            listeJetons[i] = game.listePlayerGame[i].getJetons();
        }

        let name = "";
        let highestIndex = 0;
        let combi = "";
        highestIndex = game.evalCarte();
        console.log("tour : "+game.tour);
        if (game.tour > 5) {
            if (highestIndex < game.listePlayerGame.length) {
                name = game.afficheJoueurName(highestIndex);
                combi = game.evalCards[highestIndex].handName;
            } else {
                name = "egalite";
            }
            game.distribGains(game.listePlayerGame[highestIndex].getPlayerName());
        }

        socket.emit('resultAction', {
            vainqueur: name,
            combiVainq: combi,
            tasHaut: game.tasHaut,
            jetonsRecolt: game.getRecoltJetons(),
            choixJoueurs: game.actionPrec,
            currentTurn: game.listePlayerGame[idJoueurCurrentBooleanTour].getPlayerName(),
            tour: game.getTour(),
            pot: game.pot,
            nbJoueurs: game.listePlayerGame.length,
            name: listeNoms,
            jetons: listeJetons,
            cartes: listeCartes,
            cartesTapis: game.getTapis()
        });
        socket.broadcast.emit('resultAction', {
            vainqueur: name,
            combiVainq: combi,
            tasHaut: game.tasHaut,
            jetonsRecolt: game.getRecoltJetons(),
            choixJoueurs: game.actionPrec,
            currentTurn: game.listePlayerGame[idJoueurCurrentBooleanTour].getPlayerName(),
            tour: game.getTour(),
            pot: game.pot,
            nbJoueurs: game.listePlayerGame.length,
            name: listeNoms,
            jetons: listeJetons,
            cartes: listeCartes,
            cartesTapis: game.getTapis()
        });
    });

    socket.on('raise', (data) => {
        con.query("SELECT idPlayer FROM player WHERE pseudo="+mysql.escape(data.playerName), (err, rows) =>{
            if (err) throw err;
            con.query("UPDATE action SET nbRaise = nbRaise + 1 WHERE idPlayer="+rows[0].idPlayer, (err, rows) =>{
                if (err) throw err;
            });
        });
        game.joueJoueur(data.playerName, "raise", 20);
        let idJoueurCurrentBooleanTour=0;
        for (let i = 0; i < game.listePlayerGame.length; i++) {
            if (game.listePlayerTable[i].getPlayerName() === data.playerName) {
                idJoueurCurrentBooleanTour = (i+1)%game.listePlayerGame.length;
            }
        }

        let listeCartes = [];
        let listeNoms = [];
        let listeJetons = [];
        for (let i = 0; i < game.listePlayerGame.length; i++) {
            listeCartes[i] = game.listePlayerGame[i].getMain();
            listeNoms[i] = game.listePlayerGame[i].getPlayerName();
            listeJetons[i] = game.listePlayerGame[i].getJetons();
        }

        let name = "";
        let highestIndex = 0;
        let combi = "";
        highestIndex = game.evalCarte();
        if (game.tour > 5) {
            if (highestIndex < game.listePlayerGame.length) {
                name = game.afficheJoueurName(highestIndex);
                combi = game.evalCards[highestIndex].handName;
            } else {
                name = "egalite";
            }
            game.distribGains(game.listePlayerGame[highestIndex].getPlayerName());
        }

        socket.emit('resultAction', {
            vainqueur: name,
            combiVainq: combi,
            tasHaut: game.tasHaut,
            jetonsRecolt: game.getRecoltJetons(),
            choixJoueurs: game.actionPrec,
            currentTurn: game.listePlayerGame[idJoueurCurrentBooleanTour].getPlayerName(),
            tour: game.getTour(),
            pot: game.pot,
            nbJoueurs: game.listePlayerGame.length,
            name: listeNoms,
            jetons: listeJetons,
            cartes: listeCartes,
            cartesTapis: game.getTapis()
        });
        socket.broadcast.emit('resultAction', {
            vainqueur: name,
            combiVainq: combi,
            tasHaut: game.tasHaut,
            jetonsRecolt: game.getRecoltJetons(),
            choixJoueurs: game.actionPrec,
            currentTurn: game.listePlayerGame[idJoueurCurrentBooleanTour].getPlayerName(),
            tour: game.getTour(),
            pot: game.pot,
            nbJoueurs: game.listePlayerGame.length,
            name: listeNoms,
            jetons: listeJetons,
            cartes: listeCartes,
            cartesTapis: game.getTapis()
        });
    });

    socket.on('all-in', (data) => {
        con.query("SELECT idPlayer FROM player WHERE pseudo="+mysql.escape(data.playerName), (err, rows) =>{
            if (err) throw err;
            con.query("UPDATE action SET nbAllIn = nbAllIn + 1 WHERE idPlayer="+rows[0].idPlayer, (err, rows) =>{
                if (err) throw err;
            });
        });
        console.log("test"+data.playerName);
        let mise;
        for (let i = 0; i < game.listePlayerGame.length; i++) {
            if (data.playerName === game.listePlayerGame[i].getPlayerName()){
                mise = game.listePlayerGame[i].getJetons();
            }
        }
        game.joueJoueur(data.playerName, "all-in", mise);


        let idJoueurCurrentBooleanTour=0;
        for (let i = 0; i < game.listePlayerGame.length; i++) {
            if (game.listePlayerTable[i].getPlayerName() === data.playerName) {
                idJoueurCurrentBooleanTour = (i+1)%game.listePlayerGame.length;
            }
        }

        let listeCartes = [];
        let listeNoms = [];
        let listeJetons = [];
        for (let i = 0; i < game.listePlayerGame.length; i++) {
            listeCartes[i] = game.listePlayerGame[i].getMain();
            listeNoms[i] = game.listePlayerGame[i].getPlayerName();
            listeJetons[i] = game.listePlayerGame[i].getJetons();
        }

        let name = "";
        let highestIndex = 0;
        let combi = "";
        highestIndex = game.evalCarte();
        if (game.tour > 5) {
            if (highestIndex < game.listePlayerGame.length) {
                name = game.afficheJoueurName(highestIndex);
                combi = game.evalCards[highestIndex].handName;
            } else {
                name = "egalite";
            }
            game.distribGains(game.listePlayerGame[highestIndex].getPlayerName());
        }

        socket.emit('resultAction', {
            vainqueur: name,
            combiVainq: combi,
            tasHaut: game.tasHaut,
            jetonsRecolt: game.getRecoltJetons(),
            choixJoueurs: game.actionPrec,
            currentTurn: game.listePlayerGame[idJoueurCurrentBooleanTour].getPlayerName(),
            tour: game.getTour(),
            pot: game.pot,
            nbJoueurs: game.listePlayerGame.length,
            name: listeNoms,
            jetons: listeJetons,
            cartes: listeCartes,
            cartesTapis: game.getTapis()
        });
        socket.broadcast.emit('resultAction', {
            vainqueur: name,
            combiVainq: combi,
            tasHaut: game.tasHaut,
            jetonsRecolt: game.getRecoltJetons(),
            choixJoueurs: game.actionPrec,
            currentTurn: game.listePlayerGame[idJoueurCurrentBooleanTour].getPlayerName(),
            tour: game.getTour(),
            pot: game.pot,
            nbJoueurs: game.listePlayerGame.length,
            name: listeNoms,
            jetons: listeJetons,
            cartes: listeCartes,
            cartesTapis: game.getTapis()
        });
    });

    socket.on('coucher', (data) => {
        con.query("SELECT idPlayer FROM player WHERE pseudo="+mysql.escape(data.playerName), (err, rows) =>{
            if (err) throw err;
            con.query("UPDATE action SET nbFold = nbFold + 1 WHERE idPlayer="+rows[0].idPlayer, (err, rows) =>{
                if (err) throw err;
            });
        });
        game.joueJoueur(data.playerName, "coucher", 10);

        let idJoueurCurrentBooleanTour=0;
        for (let i = 0; i < game.listePlayerGame.length; i++) {
            if (game.listePlayerTable[i].getPlayerName() === data.playerName) {
                idJoueurCurrentBooleanTour = (i+1)%game.listePlayerGame.length;
            }
        }

        let listeCartes = [];
        let listeNoms = [];
        let listeJetons = [];
        for (let i = 0; i < game.listePlayerGame.length; i++) {
            listeCartes[i] = game.listePlayerGame[i].getMain();
            listeNoms[i] = game.listePlayerGame[i].getPlayerName();
            listeJetons[i] = game.listePlayerGame[i].getJetons();
        }

        let name = "";
        let highestIndex = 0;
        let combi = "";
        highestIndex = game.evalCarte();
        if (game.listePlayerGame.length === 1) {
            highestIndex = game.evalCarte();
            name = game.afficheJoueurName(highestIndex);
            combi = game.evalCards[highestIndex].handName;
            game.distribGains(game.listePlayerGame[highestIndex].getPlayerName());
        }else if (game.tour > 5 ) {
            if (highestIndex < game.listePlayerGame.length) {
                name = game.afficheJoueurName(highestIndex);
                combi = game.evalCards[highestIndex].handName;
            } else {
                name = "egalite";
            }
            game.distribGains(game.listePlayerGame[highestIndex].getPlayerName());
        }

        socket.emit('resultAction', {
            vainqueur: name,
            combiVainq: combi,
            tasHaut: game.tasHaut,
            jetonsRecolt: game.getRecoltJetons(),
            choixJoueurs: game.actionPrec,
            currentTurn: game.listePlayerGame[idJoueurCurrentBooleanTour].getPlayerName(),
            tour: game.getTour(),
            pot: game.pot,
            nbJoueurs: game.listePlayerGame.length,
            name: listeNoms,
            jetons: listeJetons,
            cartes: listeCartes,
            cartesTapis: game.getTapis()
        });
        socket.broadcast.emit('resultAction', {
            vainqueur: name,
            combiVainq: combi,
            tasHaut: game.tasHaut,
            jetonsRecolt: game.getRecoltJetons(),
            choixJoueurs: game.actionPrec,
            currentTurn: game.listePlayerGame[idJoueurCurrentBooleanTour].getPlayerName(),
            tour: game.getTour(),
            pot: game.pot,
            nbJoueurs: game.listePlayerGame.length,
            name: listeNoms,
            jetons: listeJetons,
            cartes: listeCartes,
            cartesTapis: game.getTapis()
        });
    });
    socket.on('continueGame', (data) => {
        compteurRestartGame++;
        if (compteurRestartGame === game.listePlayerGame.length) {
            game.init(10, 20);
            console.log(game.listePlayerGame[0].getJetons());
            let indicePlayerStart;
            for (let i = 0; i < game.listePlayerGame.length; i++) {
                idJoueur[i] = i;
            }

            let listeCartes = [];
            let listeNoms = [];
            let listeJetons = [];
            for (let i = 0; i < game.listePlayerGame.length; i++) {
                listeCartes[i] = game.listePlayerGame[i].getMain();
                listeNoms[i] = game.listePlayerGame[i].getPlayerName();
                listeJetons[i] = game.listePlayerGame[i].getJetons();
            }

            let idJoueurCurrentBooleanTour=(game.dealer+1)%game.listePlayerTable.length;

            console.log("indice dealer : " + game.dealer);
            console.log("data.playerName : "+data.playerName);
            game.listePlayerGame[game.dealer].setAjoue(false);
            indicePlayerStart = game.dealer;
            for (let i = 0; i < game.listePlayerGame.length && i !== game.dealer; i++) {
                game.listePlayerGame[i].setAjoue(false);
            }


            socket.emit('1stR', {
                currentTurn: game.listePlayerGame[idJoueurCurrentBooleanTour].getPlayerName(),
                tour: game.getTour(),
                pot: game.pot,
                nbJoueurs: game.listePlayerGame.length,
                name: listeNoms,
                jetons: listeJetons,
                cartes: listeCartes,

                cartesTapis: game.getTapis()
            });

            console.log("------card player " + game.listePlayerGame[idJoueur[0]].getPlayerName() + "-----");
            console.log(game.listePlayerGame[idJoueur[0]].getMain());

            socket.broadcast.emit('1stR', {
                currentTurn: game.listePlayerGame[idJoueurCurrentBooleanTour].getPlayerName(),
                name: listeNoms,
                nbJoueurs: game.listePlayerGame.length,
                tour: game.getTour(),
                pot: game.pot,
                jetons: listeJetons,
                cartes: listeCartes,
                cartesTapis: game.getTapis()
            });
            compteurRestartGame = 0;
        }
    });


    socket.on('message', (data) => {
        socket.emit('afficheMessage', {room: `${rooms}`, pseudo: data.pseudo, message: data.message});
        socket.broadcast.emit('afficheMessage', {room: `${rooms}`, pseudo: data.pseudo, message: data.message});
    });

    socket.on('exit', (data) => {
        game.exit(data.playerName);
        con.query("UPDATE partie SET nbJoueur = nbJoueur - 1 WHERE idPartie="+`${rooms}`, (err, rows) =>{
            if (err) throw err;
        });
        con.query("SELECT nbJoueur FROM partie WHERE idPartie="+`${rooms}`, (err, rows) =>{
            if (err) throw err;
            if(rows[0].nbJoueur == 0){
                con.query("DELETE FROM partie WHERE idPartie="+`${rooms}`, (err, rows) =>{
                    if (err) throw err;
                });
            }
        });
    });
});
server.listen(process.env.PORT || 5000);