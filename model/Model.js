const assert = require('assert');
const _ = require('underscore')

class Game {

    constructor(team1Player1, team1Player2, team2Player1, team2Player2) {
        this.id = createId()
        this.team1Player1 = team1Player1
        this.team1Player2 = team1Player2
        this.team2Player1 = team2Player1
        this.team2Player2 = team2Player2
        this.team1Score = undefined
        this.team2Score = undefined
        this.date = undefined
    }

}

function createId() {
    return Math.random().toString(16).slice(2)
}

module.exports = {
    Game : Game
}
