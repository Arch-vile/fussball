const assert = require('assert');
const _ = require('underscore')

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
        
        var randomOrderedNamePool = []
        for(var i = 0; i < matchesPerPlayer; i++) {
            randomOrderedNamePool = randomOrderedNamePool.concat(_.shuffle(this.players))
        }

        var matches = []
        for(var i = 0; i < randomOrderedNamePool.length; i+=4) {
            matches.push(new Match(randomOrderedNamePool[i],randomOrderedNamePool[i+1],randomOrderedNamePool[i+2],randomOrderedNamePool[i+3]))
        }

        // There is a small change for one player to end up twice in same match, and as I am lazy and stupid lets just brute force
        if( this.anyDuplicatePlayers(matches)  ) {
            return this.generateMatches();
        } else {
            return matches;
        }
    }

    anyDuplicatePlayers(matches) {
        for(var m = 0; m < matches.length; m++) {
            const match = matches[m]
            const players = [ match.team1Player1, match.team1Player2, match.team2Player1, match.team2Player2 ]
            if(new Set(players).size != 4) {
                console.log("SAME")
                return true
            } 
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
