const express = require('express');
const path = require('path');
var Game = require('./Game');
const Cartes = require('./Cartes');
const Player = require('./Player');

let game = new Game();


const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
io.set('log level',1);

let rooms = 0;
let id=0;

app.use(express.static('.'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'game.html'));
});

io.on('connection', (socket) => {

    // Create a new game room and notify the creator of game.
    socket.on('createGame', (data) => {
        socket.join(`${++rooms}`);
        socket.emit('newGame', { name: data.name, room: `${rooms}` });
        // game = new Game();
        game.addPlayer(id++, data.name, data.jeton);
    });

    // Connect the Player 2 to the room he requested. Show error if room full.
    socket.on('joinGame', function (data) {
        var room = io.nsps['/'].adapter.rooms[data.room];
        if (room && room.length <= 9) {
            socket.join(data.room);
            socket.broadcast.to(data.room).emit('player1', {});
            socket.emit('player2', { name: data.name, room: data.room });
            game.addPlayer(id++, data.name, data.jeton);
        } else {
            socket.emit('err', { message: 'La partie est pleine!' });
        }
    });

    // console.log(game);

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
        game.play(10,20);
        // console.log(game.pot);
        let idJoueur1;
        let idJoueur2;
        if (game.listePlayerGame[0].getNom() === data.playerName){
            idJoueur1=0;
            game.listePlayerGame[0].setAjoue(false);
            idJoueur2=1;
            game.listePlayerGame[1].setAjoue(true);
        }else {
            idJoueur1=1;
            game.listePlayerGame[1].setAjoue(false);
            idJoueur2=0;
            game.listePlayerGame[0].setAjoue(true);
        }
        socket.emit('1stR', {booleanCurrentTurn: !game.listePlayerGame[idJoueur1].getAjoue(), tour: game.getTour(), pot : game.pot, name: game.listePlayerGame[0].getPlayerName(), jetons1: game.listePlayerGame[0].getJetons(), jetons2:game.listePlayerGame[1].getJetons(), cartes: game.listePlayerGame[0].getMain(), cartesTapis: game.getTapis()});
        socket.broadcast.emit('1stR', {booleanCurrentTurn: !game.listePlayerGame[idJoueur2].getAjoue(), tour: game.getTour(), pot : game.pot, name: game.listePlayerGame[0].getPlayerName(), jetons1: game.listePlayerGame[1].getJetons(), jetons2:game.listePlayerGame[0].getJetons(), cartes: game.listePlayerGame[1].getMain(), cartesTapis: game.getTapis()});
        // socket.setBroadcast(true);
    });

    socket.on('check', (data) => {
        console.log(data.playerName);
        game.joueJoueur(data.playerName, 'check',10);
        let idJoueur1;
        let idJoueur2;
        if (game.listePlayerGame[0].getNom() === data.playerName){
            idJoueur1=0;
            idJoueur2=1;
        }else {
            idJoueur1=1;
            idJoueur2=0;
        }
        socket.emit('resultAction', {booleanCurrentTurn: !game.listePlayerGame[idJoueur1].getAjoue(), tour: game.getTour(), pot: game.pot, name: game.listePlayerGame[0].getPlayerName(), jetons1: game.listePlayerGame[0].getJetons(), jetons2: game.listePlayerGame[1].getJetons(), cartes: game.listePlayerGame[0].getMain(), cartesTapis: game.getTapis()});
        socket.broadcast.emit('resultAction', {booleanCurrentTurn: !game.listePlayerGame[idJoueur2].getAjoue(), tour: game.getTour(), pot: game.pot, name: game.listePlayerGame[0].getPlayerName(), jetons1: game.listePlayerGame[1].getJetons(), jetons2:game.listePlayerGame[0].getJetons(), cartes: game.listePlayerGame[1].getMain(), cartesTapis: game.getTapis()});
    });

});

server.listen(process.env.PORT || 5000);
