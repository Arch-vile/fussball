const HashMap = require('hashmap')
const model = require('./Model.js')


class Repository {

    constructor() {
        this.players = new HashMap()
        this.tournaments = new HashMap()
    }

    createPlayer(player) {
        this.players.set(player.id, player)
        return this.players.get(player.id)
    }

    getPlayer(id) {
        return this.players.get(id)
    }

    createTournament(tournament) {
        const toCreate = new model.Tournament(tournament)
        this.tournaments.set(toCreate.id, toCreate)
        return this.tournaments.get(toCreate.id)
    }

    getTournament(id) {
        console.log(id)
        console.log(this.tournaments.get(id))
        return this.tournaments.get(id)
    }

    getTournaments() {
        return this.tournaments.values()
    }

    reportGameResult(tournamentId, gameId, result) {
        const games = this.tournaments.get(tournamentId).games
        for(var i = 0; i < games.length; i++) {
            if(games[i].id == gameId) {
                games[i].team1Score = result.team1Score
                games[i].team2Score = result.team2Score
                return games[i]
            }
        }
    }
}

module.exports = new Repository()