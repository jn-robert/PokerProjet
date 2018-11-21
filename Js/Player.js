module.exports = Player;

function Player(id,name,jetons) {
    this.id = id;
    this.name = name;
    this.jetons = jetons;
    this.main = [];
    this.tas = 0;
}

Player.prototype.getNom = function(){
    return this.name;
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

Player.prototype.fold = function (mise) {
    if (mise <= this.jetons){
        this.jetons -= mise;
        this.tas += mise;
    } 
};

Player.prototype.allin = function () {
    this.tas += this.jetons;
    this.jetons = 0;
};

Player.prototype.callCheck = function () {

};

Player.prototype.raise = function (mise,miseJoueur) {
    if (mise <= this.jetons && miseJoueur <= this.jetons && miseJoueur > mise ){
        this.jetons -= miseJoueur;
        this.tas += miseJoueur;
    }
};

Player.prototype.reset = function () {
    this.main = [];
    this.tas = 0;
};