const express = require('express');
const path = require('path');
var Game = require('./Game');
const Cartes = require('./Cartes');
const Player = require('./Player');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
io.set('log level', 1);

let rooms = 0;
let id = 0;
let game;
let idJoueur = [];

let compteurRestartGame = 0;

app.use(express.static('.'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'game.html'));
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
        socket.emit('newGame', {name: data.name, room: `${rooms}`});
    });

    // Connect the Player to the room he requested. Show error if room full.
    socket.on('joinGame', function (data) {
        var room = io.nsps['/'].adapter.rooms[data.room];
        if (room && room.length <= 9) {
            socket.join(data.room);
            game.addPlayer(id++, data.name, data.jeton);
            socket.emit('player', {name: data.name, room: data.room});
        } else {
            socket.emit('err', {message: 'La partie est pleine!'});
        }
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
        console.log(game.listePlayerGame[0].getJetons());
        game.init(10, 20);

        for (let i = 0; i < game.listePlayerGame.length; i++) {
            idJoueur[i] = i;
        }

        switch (data.playerName) {
            case game.listePlayerGame[0].getPlayerName():
                game.listePlayerGame[0].setAjoue(false);
                for (let i = 0; i < game.listePlayerGame.length && i !== 0; i++) {
                    game.listePlayerGame[i].setAjoue(true);
                }
                break;
            case game.listePlayerGame[1].getPlayerName():
                game.listePlayerGame[1].setAjoue(false);
                for (let i = 0; i < game.listePlayerGame.length && i !== 1; i++) {
                    game.listePlayerGame[i].setAjoue(true);
                }
                break;
            case game.listePlayerGame[2].getPlayerName():
                game.listePlayerGame[2].setAjoue(false);
                for (let i = 0; i < game.listePlayerGame.length && i !== 2; i++) {
                    game.listePlayerGame[i].setAjoue(true);
                }
                break;
            case game.listePlayerGame[3].getPlayerName():
                game.listePlayerGame[3].setAjoue(false);
                for (let i = 0; i < game.listePlayerGame.length && i !== 3; i++) {
                    game.listePlayerGame[i].setAjoue(true);
                }
                break;
            case game.listePlayerGame[4].getPlayerName():
                game.listePlayerGame[4].setAjoue(false);
                for (let i = 0; i < game.listePlayerGame.length && i !== 4; i++) {
                    game.listePlayerGame[i].setAjoue(true);
                }
                break;
            case game.listePlayerGame[5].getPlayerName():
                game.listePlayerGame[5].setAjoue(false);
                for (let i = 0; i < game.listePlayerGame.length && i !== 5; i++) {
                    game.listePlayerGame[i].setAjoue(true);
                }
                break;
            case game.listePlayerGame[6].getPlayerName():
                game.listePlayerGame[6].setAjoue(false);
                for (let i = 0; i < game.listePlayerGame.length && i !== 6; i++) {
                    game.listePlayerGame[i].setAjoue(true);
                }
                break;
            case game.listePlayerGame[7].getPlayerName():
                game.listePlayerGame[7].setAjoue(false);
                for (let i = 0; i < game.listePlayerGame.length && i !== 7; i++) {
                    game.listePlayerGame[i].setAjoue(true);
                }
                break;
            default:
                break;
        }

        socket.emit('1stR', {
            booleanCurrentTurn: !game.listePlayerGame[idJoueur[0]].getAjoue(),
            tour: game.getTour(),
            pot: game.pot,
            name: game.listePlayerGame[idJoueur[0]].getPlayerName(),

            /*
            jetons1: game.listePlayerGame[idJoueur[i]].getJetons(),
            */

            cartes: game.listePlayerGame[idJoueur[0]].getMain(),
            cartesTapis: game.getTapis()
        });

        console.log("------card player " + game.listePlayerGame[idJoueur[0]].getPlayerName() + "-----");
        console.log(game.listePlayerGame[idJoueur[0]].getMain());

        game.listePlayerGame.forEach(joueur => {
            if(joueur !== game.listePlayerGame[idJoueur[0]]){
                socket.broadcast.emit('1stR', {
                    booleanCurrentTurn: !joueur.getAjoue(),
                    tour: game.getTour(),
                    pot: game.pot,
                    name: joueur.getPlayerName(),

                    /*
                    jetons1: game.listePlayerGame[idJoueur[j]].getJetons(),
                    */

                    cartes: joueur.getMain(),
                    cartesTapis: game.getTapis()
                });
                console.log("------card player " + joueur.getPlayerName() + "-----");
                console.log(joueur.getMain());
            }
        });
    });

    socket.on('check', (data) => {
        game.joueJoueur(data.playerName, "check", 10);

        let idJoueur1;
        let idJoueur2;
        if (game.listePlayerGame[0].getPlayerName() === data.playerName) {
            idJoueur1 = 0;
            idJoueur2 = 1;
        } else {
            idJoueur1 = 1;
            idJoueur2 = 0;
        }

        let name = "";
        let highestIndex = 0;
        let combi = "";
        highestIndex = game.evalCarte();
        if (game.tour > 5) {
            // console.log(game.listePlayerGame);
            console.log(highestIndex);
            if (highestIndex < game.listePlayerGame.length) {
                name = game.afficheJoueurName(highestIndex);
                combi = game.evalCards[highestIndex].handName;
            } else {
                name = "egalite";
            }
            console.log(name);
            game.distribGains(game.listePlayerGame[highestIndex].getPlayerName());
        }
        socket.emit('resultAction', {
            vainqueur: name,
            combiVainq: combi,
            allInJoueur1: game.listePlayerGame[idJoueur1].allIn,
            allInJoueur2: game.listePlayerGame[idJoueur2].allIn,
            tasHaut: game.tasHaut,
            tasJoueur1: game.listePlayerGame[idJoueur1].tas,
            tasJoueur2: game.listePlayerGame[idJoueur2].tas,
            jetonsRecolt: game.getRecoltJetons(),
            booleanCurrentTurn: !game.listePlayerGame[idJoueur1].getAjoue(),
            tour: game.getTour(),
            pot: game.pot,
            name: game.listePlayerGame[idJoueur1].getPlayerName(),
            jetons1: game.listePlayerGame[idJoueur1].getJetons(),
            jetons2: game.listePlayerGame[idJoueur2].getJetons(),
            cartes: game.listePlayerGame[idJoueur1].getMain(),
            cartesTapis: game.getTapis()
        });
        socket.broadcast.emit('resultAction', {
            vainqueur: name,
            combiVainq: combi,
            allInJoueur1: game.listePlayerGame[idJoueur2].allIn,
            allInJoueur2: game.listePlayerGame[idJoueur1].allIn,
            tasHaut: game.tasHaut,
            tasJoueur1: game.listePlayerGame[idJoueur1].tas,
            tasJoueur2: game.listePlayerGame[idJoueur2].tas,
            jetonsRecolt: game.getRecoltJetons(),
            choixJoueurs: game.actionPrec,
            booleanCurrentTurn: !game.listePlayerGame[idJoueur2].getAjoue(),
            tour: game.getTour(),
            pot: game.pot,
            name: game.listePlayerGame[idJoueur2].getPlayerName(),
            jetons1: game.listePlayerGame[idJoueur2].getJetons(),
            jetons2: game.listePlayerGame[idJoueur1].getJetons(),
            cartes: game.listePlayerGame[idJoueur2].getMain(),
            cartesTapis: game.getTapis()
        });
    });

    socket.on('suivre', (data) => {
        console.log(data.playerName);
        game.joueJoueur(data.playerName, "suivre", 10);

        let idJoueur1;
        let idJoueur2;
        if (game.listePlayerGame[0].getPlayerName() === data.playerName) {
            idJoueur1 = 0;
            idJoueur2 = 1;
        } else {
            idJoueur1 = 1;
            idJoueur2 = 0;
        }

        let name = "";
        let highestIndex = 0;
        let combi = "";
        highestIndex = game.evalCarte();
        if (game.tour > 5) {
            // console.log(game.listePlayerGame);
            console.log(highestIndex);
            if (highestIndex < game.listePlayerGame.length) {
                name = game.afficheJoueurName(highestIndex);
                combi = game.evalCards[highestIndex].handName;
            } else {
                name = "egalite";
            }
            console.log(name);
            game.distribGains(game.listePlayerGame[highestIndex].getPlayerName());
        }

        socket.emit('resultAction', {
            vainqueur: name,
            combiVainq: combi,
            allInJoueur1: game.listePlayerGame[idJoueur1].allIn,
            allInJoueur2: game.listePlayerGame[idJoueur2].allIn,
            tasHaut: game.tasHaut,
            tasJoueur1: game.listePlayerGame[idJoueur1].tas,
            tasJoueur2: game.listePlayerGame[idJoueur2].tas,
            jetonsRecolt: game.getRecoltJetons(),
            booleanCurrentTurn: !game.listePlayerGame[idJoueur1].getAjoue(),
            tour: game.getTour(),
            pot: game.pot,
            name: game.listePlayerGame[0].getPlayerName(),
            jetons1: game.listePlayerGame[idJoueur1].getJetons(),
            jetons2: game.listePlayerGame[idJoueur2].getJetons(),
            cartes: game.listePlayerGame[idJoueur1].getMain(),
            cartesTapis: game.getTapis()
        });
        socket.broadcast.emit('resultAction', {
            vainqueur: name,
            combiVainq: combi,
            allInJoueur1: game.listePlayerGame[idJoueur2].allIn,
            allInJoueur2: game.listePlayerGame[idJoueur1].allIn,
            tasHaut: game.tasHaut,
            tasJoueur1: game.listePlayerGame[idJoueur1].tas,
            tasJoueur2: game.listePlayerGame[idJoueur2].tas,
            jetonsRecolt: game.getRecoltJetons(),
            choixJoueurs: game.actionPrec,
            booleanCurrentTurn: !game.listePlayerGame[idJoueur2].getAjoue(),
            tour: game.getTour(),
            pot: game.pot,
            name: game.listePlayerGame[0].getPlayerName(),
            jetons1: game.listePlayerGame[idJoueur2].getJetons(),
            jetons2: game.listePlayerGame[idJoueur1].getJetons(),
            cartes: game.listePlayerGame[idJoueur2].getMain(),
            cartesTapis: game.getTapis()
        });
    });

    socket.on('raise', (data) => {
        console.log(data.playerName);
        game.joueJoueur(data.playerName, "raise", 20);

        let idJoueur1;
        let idJoueur2;
        if (game.listePlayerGame[0].getPlayerName() === data.playerName) {
            idJoueur1 = 0;
            idJoueur2 = 1;
        } else {
            idJoueur1 = 1;
            idJoueur2 = 0;
        }

        let name = "";
        let highestIndex = 0;
        let combi = "";
        highestIndex = game.evalCarte();
        if (game.tour > 5) {
            // console.log(game.listePlayerGame);
            console.log(highestIndex);
            if (highestIndex < game.listePlayerGame.length) {
                name = game.afficheJoueurName(highestIndex);
                combi = game.evalCards[highestIndex].handName;
            } else {
                name = "egalite";
            }
            console.log(name);
            game.distribGains(game.listePlayerGame[highestIndex].getPlayerName());
        }

        socket.emit('resultAction', {
            vainqueur: name,
            combiVainq: combi,
            allInJoueur1: game.listePlayerGame[idJoueur1].allIn,
            allInJoueur2: game.listePlayerGame[idJoueur2].allIn,
            tasHaut: game.tasHaut,
            tasJoueur1: game.listePlayerGame[idJoueur1].tas,
            tasJoueur2: game.listePlayerGame[idJoueur2].tas,
            jetonsRecolt: game.getRecoltJetons(),
            booleanCurrentTurn: !game.listePlayerGame[idJoueur1].getAjoue(),
            tour: game.getTour(),
            pot: game.pot,
            name: game.listePlayerGame[0].getPlayerName(),
            jetons1: game.listePlayerGame[idJoueur1].getJetons(),
            jetons2: game.listePlayerGame[idJoueur2].getJetons(),
            cartes: game.listePlayerGame[idJoueur1].getMain(),
            cartesTapis: game.getTapis()
        });
        socket.broadcast.emit('resultAction', {
            vainqueur: name,
            combiVainq: combi,
            allInJoueur1: game.listePlayerGame[idJoueur2].allIn,
            allInJoueur2: game.listePlayerGame[idJoueur1].allIn,
            tasHaut: game.tasHaut,
            tasJoueur1: game.listePlayerGame[idJoueur2].tas,
            tasJoueur2: game.listePlayerGame[idJoueur1].tas,
            jetonsRecolt: game.getRecoltJetons(),
            choixJoueurs: game.actionPrec,
            booleanCurrentTurn: !game.listePlayerGame[idJoueur2].getAjoue(),
            tour: game.getTour(),
            pot: game.pot,
            name: game.listePlayerGame[0].getPlayerName(),
            jetons1: game.listePlayerGame[idJoueur2].getJetons(),
            jetons2: game.listePlayerGame[idJoueur1].getJetons(),
            cartes: game.listePlayerGame[idJoueur2].getMain(),
            cartesTapis: game.getTapis()
        });
    });

    socket.on('all-in', (data) => {
        console.log(data.playerName);
        game.joueJoueur(data.playerName, "all-in", 10);
        let idJoueur1;
        let idJoueur2;
        if (game.listePlayerGame[0].getPlayerName() === data.playerName) {
            idJoueur1 = 0;
            idJoueur2 = 1;
        } else {
            idJoueur1 = 1;
            idJoueur2 = 0;
        }

        let name = "";
        let highestIndex = 0;
        let combi = "";
        highestIndex = game.evalCarte();
        if (game.tour > 5) {
            // console.log(game.listePlayerGame);
            console.log(highestIndex);
            if (highestIndex < game.listePlayerGame.length) {
                name = game.afficheJoueurName(highestIndex);
                combi = game.evalCards[highestIndex].handName;
            } else {
                name = "egalite";
            }
            console.log(name);
            game.distribGains(game.listePlayerGame[highestIndex].getPlayerName());
        }

        socket.emit('resultAction', {
            vainqueur: name,
            combiVainq: combi,
            allInJoueur1: game.listePlayerGame[idJoueur1].allIn,
            allInJoueur2: game.listePlayerGame[idJoueur2].allIn,
            tasHaut: game.tasHaut,
            tasJoueur1: game.listePlayerGame[idJoueur1].tas,
            tasJoueur2: game.listePlayerGame[idJoueur2].tas,
            jetonsRecolt: game.getRecoltJetons(),
            booleanCurrentTurn: !game.listePlayerGame[idJoueur1].getAjoue(),
            tour: game.getTour(),
            pot: game.pot,
            name: game.listePlayerGame[0].getPlayerName(),
            jetons1: game.listePlayerGame[idJoueur1].getJetons(),
            jetons2: game.listePlayerGame[idJoueur2].getJetons(),
            cartes: game.listePlayerGame[idJoueur1].getMain(),
            cartesTapis: game.getTapis()
        });
        socket.broadcast.emit('resultAction', {
            vainqueur: name,
            combiVainq: combi,
            allInJoueur1: game.listePlayerGame[idJoueur2].allIn,
            allInJoueur2: game.listePlayerGame[idJoueur1].allIn,
            tasHaut: game.tasHaut,
            tasJoueur1: game.listePlayerGame[idJoueur2].tas,
            tasJoueur2: game.listePlayerGame[idJoueur1].tas,
            jetonsRecolt: game.getRecoltJetons(),
            choixJoueurs: game.actionPrec,
            booleanCurrentTurn: !game.listePlayerGame[idJoueur2].getAjoue(),
            tour: game.getTour(),
            pot: game.pot,
            name: game.listePlayerGame[0].getPlayerName(),
            jetons1: game.listePlayerGame[idJoueur2].getJetons(),
            jetons2: game.listePlayerGame[idJoueur1].getJetons(),
            cartes: game.listePlayerGame[idJoueur2].getMain(),
            cartesTapis: game.getTapis()
        });
    });

    socket.on('coucher', (data) => {
        console.log(data.playerName);
        game.joueJoueur(data.playerName, "coucher", 10);

        let idJoueur1;
        let idJoueur2;
        if (game.listePlayerGame[0].getPlayerName() === data.playerName) {
            idJoueur1 = 0;
            idJoueur2 = 1;
        } else {
            idJoueur1 = 1;
            idJoueur2 = 0;
        }

        let name = "";
        let highestIndex = 0;
        let combi = "";
        highestIndex = game.evalCarte();
        if (game.tour > 5) {
            // console.log(game.listePlayerGame);
            console.log(highestIndex);
            if (highestIndex < game.listePlayerGame.length) {
                name = game.afficheJoueurName(highestIndex);
                combi = game.evalCards[highestIndex].handName;
            } else {
                name = "egalite";
            }
            console.log(name);
            game.distribGains(game.listePlayerGame[highestIndex].getPlayerName());
        }

        socket.emit('resultAction', {
            vainqueur: name,
            tasHaut: game.tasHaut,
            tasJoueur1: game.listePlayerGame[idJoueur1].tas,
            tasJoueur2: game.listePlayerGame[idJoueur2].tas,
            jetonsRecolt: game.getRecoltJetons(),
            booleanCurrentTurn: !game.listePlayerGame[idJoueur1].getAjoue(),
            tour: game.getTour(),
            pot: game.pot,
            name: game.listePlayerGame[0].getPlayerName(),
            jetons1: game.listePlayerGame[idJoueur1].getJetons(),
            jetons2: game.listePlayerGame[idJoueur2].getJetons(),
            cartes: game.listePlayerGame[idJoueur1].getMain(),
            cartesTapis: game.getTapis()
        });
        socket.broadcast.emit('resultAction', {
            vainqueur: name,
            tasHaut: game.tasHaut,
            tasJoueur1: game.listePlayerGame[idJoueur1].tas,
            tasJoueur2: game.listePlayerGame[idJoueur2].tas,
            jetonsRecolt: game.getRecoltJetons(),
            choixJoueurs: game.actionPrec,
            booleanCurrentTurn: !game.listePlayerGame[idJoueur2].getAjoue(),
            tour: game.getTour(),
            pot: game.pot,
            name: game.listePlayerGame[0].getPlayerName(),
            jetons1: game.listePlayerGame[idJoueur2].getJetons(),
            jetons2: game.listePlayerGame[idJoueur1].getJetons(),
            cartes: game.listePlayerGame[idJoueur2].getMain(),
            cartesTapis: game.getTapis()
        });
    });
    socket.on('continueGame', (data) => {
        compteurRestartGame++;
        if (compteurRestartGame === game.listePlayerTable.length) {
            console.log(game.listePlayerGame[0].getJetons());
            game.init(10, 20);
            let idJoueur1;
            let idJoueur2;
            if (game.dealer === 0) {
                idJoueur1 = 0;
                game.listePlayerGame[0].setAjoue(false);
                idJoueur2 = 1;
                game.listePlayerGame[1].setAjoue(true);
            } else {
                idJoueur1 = 1;
                game.listePlayerGame[1].setAjoue(false);
                idJoueur2 = 0;
                game.listePlayerGame[0].setAjoue(true);
            }
            socket.emit('1stR', {
                booleanCurrentTurn: !game.listePlayerGame[idJoueur1].getAjoue(),
                tour: game.getTour(),
                pot: game.pot,
                name: game.listePlayerGame[idJoueur1].getPlayerName(),
                jetons1: game.listePlayerGame[idJoueur1].getJetons(),
                jetons2: game.listePlayerGame[idJoueur2].getJetons(),
                cartes: game.listePlayerGame[idJoueur1].getMain(),
                cartesTapis: game.getTapis()
            });
            socket.broadcast.emit('1stR', {
                booleanCurrentTurn: !game.listePlayerGame[idJoueur2].getAjoue(),
                tour: game.getTour(),
                pot: game.pot,
                name: game.listePlayerGame[idJoueur2].getPlayerName(),
                jetons1: game.listePlayerGame[idJoueur2].getJetons(),
                jetons2: game.listePlayerGame[idJoueur1].getJetons(),
                cartes: game.listePlayerGame[idJoueur2].getMain(),
                cartesTapis: game.getTapis()
            });
            compteurRestartGame = 0;
        }
    });


    socket.on('message', (data) => {
        console.log(data.message);
        socket.emit('afficheMessage', {pseudo: data.pseudo, message: data.message});
        socket.broadcast.emit('afficheMessage', {pseudo: data.pseudo, message: data.message});
    });
});
server.listen(process.env.PORT || 5000);