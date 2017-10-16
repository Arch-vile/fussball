const assert = require('assert');

class Player {

    constructor(email, alias) {
        this.id = email
        this.email = email
        this.alias = alias
    }
}

    
class Match {

    constructor(team1Player1, team1Player2, team2Player1, team2Player2) {
        this.id = createId()
        this.team1Player1 = team1Player1
        this.team1Player2 = team1Player2
        this.team2Player1 = team2Player1
        this.team2Player2 = team2Player2
        this.team1Score = undefined
        this.team2Score = undefined
        this.matchDate = undefined
    }

}

class Tournament {

    constructor(data) {
        Object.assign(this, data);
        this.id = createId()  // Set/override the id
        this.started = false
        this.matches = this.generateMatches()
    }

    generateMatches() {
        assert(this.players.length >= 4, 'Tournament needs atleast four players')

        const matchesPerPlayer = 4;
        console.log(`Generating matches for ${this.players.length} players with ${matchesPerPlayer} matches per player`)
        assert(matchesPerPlayer % 2 == 0, 'Matches per player must be even number')
        
       


        var playerPool = [];
        for(var i = 0; i < matchesPerPlayer; i++) {
            playerPool = playerPool.concat(this.players)
        }
        console.log("PlayerPool: " + playerPool)

        const matches = []
        while(playerPool.length > 0) {
            const team1Player1 = this.removeRandom(playerPool);
            const team1Player2 = this.removeRandom(playerPool, team1Player1);
            const team2Player1 = this.removeRandom(playerPool, team1Player1, team1Player2);
            const team2Player2 = this.removeRandom(playerPool, team1Player1, team1Player2, team2Player1);

            matches.push(new Match(team1Player1,team1Player2,team2Player1,team2Player2))
            console.log(playerPool.length)
        }

        return matches;
    }

    removeRandom(from, ...notAcceptedPlayers) {
        var index = Math.floor(Math.random()*from.length)
        while( this.contains(notAcceptedPlayers, from[index]) ) {
            console.log(`Failed to select from ${from} so that it is not in ${notAcceptedPlayers}`)
            index = Math.floor(Math.random()*from.length)
        }

        // Removes the element from source array too
        return from.splice( index, 1)
    }

    // FIXME: For some reason array.includes seem not to work
    contains(array,element) {
        for(var i = 0; i < array.length; i++) {
            if(array[i] == element) return true
        }
        return false
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
