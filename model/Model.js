class Player {

    constructor(email, alias) {
        this.id = email
        this.email = email
        this.alias = alias
    }
}

    
class Match {

    constructor(payer1, player) {
        this.id = createId()
        this.player1 = player1
        this.player2 = player2
        this.player1score = undefined
        this.player2score = undefined
        this.matchDate = undefined
    }

}

class Tournament {

    /*constructor(name, players) {
        this.id = createId()
        this.name = name;
        this.players = players;
    }*/

    constructor(data) {
        Object.assign(this, data);
        this.id = createId()  // Set/override the id
    }
}

function createId() {
    return Math.random().toString(16).slice(2)
}

module.exports = {
    Player : Player,
    Match : Match,
    Tournament : Tournament
}
