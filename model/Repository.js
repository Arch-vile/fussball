const model = require('./Model.js')
const HashMap = require('hashmap')
var assert = require('assert')
const _ = require('underscore')
var ObjectId = require('mongodb').ObjectID;

class Repository {

    constructor(dbConnection) {
        this.db = dbConnection.collection('tournaments')
    }

    createTournament(tournament, cb) {
        tournament.createdAt = new Date()
        tournament.games = this.generateGames(tournament)
        this.db.insertOne(tournament, function(err, tournament){
            cb(err,tournament)
        })
    }

    getTournament(id, cb) {
        this.db.findOne({_id: ObjectId(id)}, function(err,tournament){
            cb(err,tournament)
        })
    }

    getTournaments(cb) {
        this.db.find({}).toArray(function(err,tournaments){
            cb(err,tournaments)
        })
    }

    updateGame(tournamentId, game, cb) {
        game.udpdatedAt = new Date()
        this.db.updateOne(
            {
                _id: ObjectId(tournamentId),
                'games.id': { $eq: game.id }
            }, 
            { $set: { "games.$" : game } },
            function(err,result){
                cb(err || result.matchedCount != 1, game)
            })
    }

    leaderBoard(tournamentId, cb) {
        
        this.getTournament(tournamentId, function(err,tournament){
            const scores = new HashMap()
            const players = tournament.players
            const games = tournament.games
    

            function update(scores, player, teamScore, goalDiff) {
                const scoreEntry = scores.get(player) || { 
                    player: player, 
                    gameCount: 0, 
                    score: 0,
                    goalDifference: 0 }

                scoreEntry.gameCount ++;
                scoreEntry.score += teamScore
                scoreEntry.goalDifference += goalDiff
                scores.set(player,scoreEntry)
            }

            games.forEach(function(game) {
                if(game.team1Score && game.team2Score) {

                    const team1Score = game.team1Score > game.team2Score ? game.team1Score : Math.floor(game.team1Score / 2)
                    const team1GoalDiff = game.team1Score - game.team2Score
                    const team2Score = game.team2Score > game.team1Score ? game.team2Score : Math.floor(game.team2Score / 2)
                    const team2GoalDiff = game.team2Score - game.team1Score

                    update(scores,game.team1Player1,team1Score,team1GoalDiff)
                    update(scores,game.team1Player2,team1Score,team1GoalDiff)
                    update(scores,game.team2Player1,team2Score,team2GoalDiff)
                    update(scores,game.team2Player2,team2Score,team2GoalDiff)
                }
            })

            cb(err,scores.values())
        })
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

module.exports = Repository