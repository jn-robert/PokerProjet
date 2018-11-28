var Game= require('./Game');
var game = new Game();
var readlineSync = require('readline-sync');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/index.html', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/poker.html', function (req, res) {
    res.sendFile(__dirname + '/public/poker.html');
});

app.post('/getNom', function (req, res) {
    var nom = req.body.nom;
    game.addPlayer(1,nom,4000);
    res.redirect('/poker.html')
});

app.post('/getJeu', function (req, res) {
    var action = req.body.action;
    // passer action
});