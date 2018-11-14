module.exports = class Player {
    constructor(nom, main, jetons){
        this.main = new Array();
        this._nom = nom;
        this._main = main;
        this._jetons = jetons;
    }


    static addCarte(carte){
        this.main.push(carte);
    }

    static removeCarte(){
        for (var i=0 ; i<this.main.length ;i++){
            this.main.pop();
        }
    }

    static createPlayer

    static printPlayer(){
        console.log(this.nom+" | "+this.main+" | "+this.jetons)
    }
}
