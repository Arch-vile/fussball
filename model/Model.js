class Player {

    constructor(email, alias) {
        this.id = email
        this.alias = alias
    }
}

    
class Match {

    constructor(payer1, player) {
        this.id = Math.random().toString(16).slice(2)
        this.player1 = player1
        this.player2 = player2
        this.player1score = undefined
        this.player2score = undefined
        this.matchDate = undefined
    }

}

module.exports = {
    Player : Player,
    Match : Match
}
