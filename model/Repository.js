const model = require('./Model.js')
const HashMap = require('hashmap')
const MongoClient = require('mongodb').MongoClient
var assert = require('assert')
const _ = require('underscore')

class Repository {

    constructor() {
        this.mongoUrl = 'mongodb://admin:admin2admin@ds119685.mlab.com:19685/fussball'
    }

    createTournament(tournament, cb) {
        tournament.games = this.generateGames(tournament)

        MongoClient.connect(this.mongoUrl, function(err, db) {
            assert.equal(null, err);
            console.log("Connected correctly to server.");
            db.collection('tournaments').insertOne( tournament, function(err, result) {
                assert.equal(err, null)
                console.log("Inserted a document into the tournaments collection.")
                db.close()
                 cb({ "id": result.insertedId })
              });
          });
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

    generateGames(tournament) {
        assert(tournament.players.length >= 4, 'Tournament needs atleast four players')
        assert(tournament.gamesPerPlayer * tournament.players.length % 4 == 0, 'Number of games per player multiplied by number of players needs to divisable with four')

        console.log(`Generating games for ${tournament.players.length} players with ${tournament.gamesPerPlayer} games per player`)
        
        var randomOrderedNamePool = []
        const games = []
        // Until we have as many games as we asked for
        while(games.length < tournament.gamesPerPlayer * tournament.players.length / 4) {

            // If there is not enough players left for a game
            while(randomOrderedNamePool.length < 4) {
                const newNamePool = _.clone(_.shuffle(tournament.players))

                // We need to inspect the next four players as there is change that the remaining players of previous pool include the first players of the new pool
                if(this.hasUniquePlayers(this.takeFirstFour(randomOrderedNamePool, newNamePool))) {
                    randomOrderedNamePool = randomOrderedNamePool.concat(newNamePool) 
                }

            }
            games.push(new model.Game(randomOrderedNamePool.shift(),randomOrderedNamePool.shift(),randomOrderedNamePool.shift(),randomOrderedNamePool.shift()))
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

module.exports = new Repository()