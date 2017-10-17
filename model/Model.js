const assert = require('assert');
const _ = require('underscore')

class Player {

    constructor(email, alias) {
        this.id = email
        this.email = email
        this.alias = alias
    }
}

    
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

class ScoreEntry {

    constructor(player,score,gameCount) {
        this.player = player
        this.score = score
        this.gameCount = gameCount
    }

}

class Tournament {

    constructor(data) {
        Object.assign(this, data);
        this.id = createId()  // Set/override the id
        this.games = this.generateGames()
    }

    generateGames() {
        assert(this.players.length >= 4, 'Tournament needs atleast four players')
        assert(this.gamesPerPlayer * this.players.length % 4 == 0, 'Number of games per player multiplied by number of players needs to divisable with four')

        console.log(`Generating games for ${this.players.length} players with ${this.gamesPerPlayer} games per player`)
        
        var randomOrderedNamePool = []
        const games = []
        // Until we have as many games as we asked for
        while(games.length < this.gamesPerPlayer * this.players.length / 4) {

            // If there is not enough players left for a game
            while(randomOrderedNamePool.length < 4) {
                const newNamePool = _.clone(_.shuffle(this.players))

                // We need to inspect the next four players as there is change that the remaining players of previous pool include the first players of the new pool
                if(this.hasUniquePlayers(this.takeFirstFour(randomOrderedNamePool, newNamePool))) {
                    randomOrderedNamePool = randomOrderedNamePool.concat(newNamePool) 
                }

            }
            games.push(new Game(randomOrderedNamePool.shift(),randomOrderedNamePool.shift(),randomOrderedNamePool.shift(),randomOrderedNamePool.shift()))
        }
    
        return games;
    }

    takeFirstFour(array1, array2) {
        return array1.concat(array2).slice(0,4)
    }

    hasUniquePlayers(players) {
        return new Set(players).size == 4;
    }

}



function createId() {
    return Math.random().toString(16).slice(2)
}




module.exports = {
    Player : Player,
    Game : Game,
    Tournament : Tournament,
    ScoreEntry : ScoreEntry
}
