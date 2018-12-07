module.exports = Player;
function Player(id,name,jetons, idRoom) {
        this.id = id;
        this.name = name;
        this.jetons = jetons;
        this.main = [];
        this.tas = 0;
        this.ajoue = false;
        this.idRoom = idRoom;
    }

    // Set the currentTurn for player to turn and update UI to reflect the same.
    Player.prototype.setCurrentTurn = function(turn) {
        this.currentTurn = turn;
        const message = turn ? 'A votre tour' : 'A votre adversaire';
        $('#turn').text(message);
    };

Player.prototype.setAjoue = function(value){
    this.ajoue = value;
};

Player.prototype.getAjoue = function(){
    return this.ajoue;
};

    Player.prototype.getId = function(){
        return this.id;
    };

    Player.prototype.getPlayerName = function() {
        return this.name;
    };


    Player.prototype.getCurrentTurn = function() {
        return this.currentTurn;
    };

    Player.prototype.getAction = function(){

    };

    Player.prototype.getJetons = function(){
        return this.jetons;
    };

Player.prototype.addMain = function(carte){
        this.main.push(carte);
    };

Player.prototype.getMain = function(){
        return this.main;
    };

Player.prototype.getTas = function(){
        return this.tas;
    };

Player.prototype.coucher = function(){
        this.main=[];
    };

Player.prototype.fold = function(mise) {
        if (mise <= this.jetons){
            this.jetons -= mise;
            this.tas += mise;
        }
    };

Player.prototype.allin = function() {
        this.tas += this.jetons;
        this.jetons = 0;
    };

Player.prototype.callCheck = function() {

    };

Player.prototype.raise = function(mise,miseJoueur) {
        if (mise <= this.jetons && miseJoueur <= this.jetons && miseJoueur > mise ){
            this.jetons -= miseJoueur;
            this.tas += miseJoueur;
        }
    };

Player.prototype.reset = function() {
        this.main = [];
        this.tas = 0;
    };

Player.prototype.getNom = function () {
    return this.name;
};
