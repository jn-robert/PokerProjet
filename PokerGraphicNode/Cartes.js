module.exports = Cartes;

function Cartes() {
    this.suits = ['s', 'h', 'd', 'c'];
    this.ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    this.cards = [];

    this.init();
    this.shuffle();
}

Cartes.prototype.giveCarte = function () {
    // return this.cards.pop();
    return this.cards[Math.floor(Math.random() * (this.cards.length - 1))];
};

Cartes.prototype.init = function () {
    var suitsLen = this.suits.length;
    var ranksLen = this.ranks.length;
    var i, j;

    for (i = 0; i < suitsLen; i++) {
        for (j = 0; j < ranksLen; j++) {
            this.cards.push(this.ranks[j] + this.suits[i]);
        }
    }
};

Cartes.prototype.shuffle = function () {
    var currentIndex = this.cards.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = this.cards[currentIndex];
        this.cards[currentIndex] = this.cards[randomIndex];
        this.cards[randomIndex] = temporaryValue;
    }
};

Cartes.prototype.drawCard = function () {
    return this.cards.pop();
};
