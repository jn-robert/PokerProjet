const express = require('express');
const path = require('path');
const app = express();
const server = require('http').Server(app);
const mysql = require('mysql');
const socket = require("socket.io");

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
});

let listener = socket.listen(server, {log: false});

function start(socket) {
    socket.on('callListJoueur', function () {

        con.query("SELECT * FROM player", (err, rows) => {
            if (err) throw err;

            console.log("Requête envoyee");
            console.log(rows);
            socket.emit('listJoueur', {
                tab: rows
            });
        });
    });


    /*
        socket.emit('listJoueur', {
            tab: tab
        });
        */
}

listener.sockets.on('connection', function (socket) {
    start(socket);
});

server.listen(8888);