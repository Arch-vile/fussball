const HashMap = require('hashmap')
const model = require('./Model.js')


class Repository {

    constructor() {
        this.tournaments = new HashMap()
    }

    createTournament(tournament) {
        const toCreate = new model.Tournament(tournament)
        this.tournaments.set(toCreate.id, toCreate)
        return this.tournaments.get(toCreate.id)
    }

    getTournament(id) {
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

    calculateScoreBoard(tournamentId) {
        const self = this
        const scores = new HashMap()
        const tournament = this.tournaments.get(tournamentId)
        const players = tournament.players
        const games = tournament.games

        players.forEach(function(player) {
            scores.set(player, new model.ScoreEntry(player,0,0))
        });

        games.forEach(function(game) {
            if(game.team1Score && game.team2Score) {
                scores.get(game.team1Player1).gameCount ++;
                scores.get(game.team1Player1).score += game.team1Score
                
                scores.get(game.team1Player2).gameCount ++;
                scores.get(game.team1Player2).score += game.team1Score
                
                scores.get(game.team2Player1).gameCount ++;
                scores.get(game.team2Player1).score += game.team2Score
                
                scores.get(game.team2Player2).gameCount ++;
                scores.get(game.team2Player2).score += game.team2Score
            }
        })

        return scores.values();
    }
}

module.exports = new Repository()