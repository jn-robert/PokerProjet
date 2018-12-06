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



    socket.on('start', () => {
        console.log(game.listePlayerTable);
        game.play(10,20);
        // console.log(game.pot);
        socket.emit('1stR', {pot : game.pot});
        socket.broadcast.emit('1stR', {pot : game.pot});
        // socket.setBroadcast(true);
    });

});

server.listen(process.env.PORT || 5000);
