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
        this.db.insertOne(tournament, function (err, tournament) {
            cb(err, tournament)
        })
    }

    addPlayer(tournamentId, player, cb) {
        this.db.update({
            _id: ObjectId(tournamentId)
        }, {
                $push: { players: player.email }
            }, function (err, result) {
                if (result) {
                    cb();
                }
            })
    }

    getTournament(id, cb) {
        this.db.findOne({ _id: ObjectId(id) }, function (err, tournament) {
            cb(err, tournament)
        })
    }

    getTournaments(cb) {
        this.db.find({}).toArray(function (err, tournaments) {
            cb(err, tournaments)
        })
    }

    updateGame(tournamentId, game, cb) {
        const self = this
        game.udpdatedAt = new Date()

        // Handle finale as special case for best out of three games
        if(game.isFinale) {
            // Add another game if only one
            if(game.games.length == 1 && game.games[0].team1Score && game.games[0].team2Score) { 
                game.games.push({})
            }

            // If draw, add a third game
            if(game.games.length == 2) {
                if( 
                    (game.games[0].team1Score > game.games[0].team2Score && game.games[1].team1Score < game.games[1].team2Score) || 
                    (game.games[0].team1Score < game.games[0].team2Score && game.games[1].team1Score > game.games[1].team2Score)) {
                    game.games.push({})
                }
            }
        }


        this.db.updateOne(
            {
                _id: ObjectId(tournamentId),
                'games.id': { $eq: game.id }
            },
            { $set: { "games.$": game } },
            function (err, result) {
                if (result) {
                    // Lets check if we completed the last pending game (non-finale)
                    if (!game.isFinale) {
                        self.getTournament(tournamentId, function (err, tournament) {
                            const pendingGames = _.filter(tournament.games, function (game) { return !game.team1Score && !game.team2Score })
                            if (pendingGames.length == 0) {
                                self.createFinale(tournamentId, function() { cb(undefined, game) })
                            }
                        })
                    } else {
                        cb(undefined, game)
                    }
                }
            })
    }

    createFinale(tournamentId, cb) {
        const self = this
        self.leaderBoard(tournamentId, function (err, ranked) {
            const finale = new model.Game(ranked.shift().player, ranked.shift().player, ranked.shift().player, ranked.shift().player)
            finale.isFinale = true
            finale.games = [ { } ]
            self.db.update({
                _id: ObjectId(tournamentId)
            }, {
                    $push: { games: finale }
                }, function (err, result) {
                    if (result) {
                        cb();
                    }
                })
        })
    }

    leaderBoard(tournamentId, cb) {
        const self = this
        this.getTournament(tournamentId, function (err, tournament) {
            cb(err, self.playerRanking(tournament))
        })
    }

    playerRanking(tournament) {
        const scores = new HashMap()
        const players = tournament.players
        const games = _.filter(tournament.games, function(game) { return !game.isFinale;})

        players.forEach(function (player) {
            scores.set(player, {
                player: player,
                gameCount: 0,
                score: 0,
                goalDifference: 0
            })
        })

        function update(scores, player, teamScore, goalDiff) {
            const scoreEntry = scores.get(player)
            scoreEntry.gameCount++;
            scoreEntry.score += teamScore
            scoreEntry.goalDifference += goalDiff
        }

        games.forEach(function (game) {
            if (game.team1Score && game.team2Score) {

                const team1Score = game.team1Score > game.team2Score ? game.team1Score : Math.floor(game.team1Score / 2)
                const team1GoalDiff = game.team1Score - game.team2Score
                const team2Score = game.team2Score > game.team1Score ? game.team2Score : Math.floor(game.team2Score / 2)
                const team2GoalDiff = game.team2Score - game.team1Score

                update(scores, game.team1Player1, team1Score, team1GoalDiff)
                update(scores, game.team1Player2, team1Score, team1GoalDiff)
                update(scores, game.team2Player1, team2Score, team2GoalDiff)
                update(scores, game.team2Player2, team2Score, team2GoalDiff)
            }
        })

        const sorted = _(scores.values())
            .chain()
            .sortBy('goalDifference')
            .sortBy('score')
            .reverse()
            .value()

        // And ranking number
        sorted.forEach(function (value, i) { value.rank = i + 1 })
        return sorted;
    }

    generateGames(tournament) {
        assert(tournament.players.length >= 4, 'Tournament needs atleast four players')
        assert(tournament.gamesPerPlayer * tournament.players.length % 4 == 0, 'Number of games per player multiplied by number of players needs to divisable with four')

        console.log(`Generating games for ${tournament.players.length} players with ${tournament.gamesPerPlayer} games per player`)

        var randomOrderedNamePool = []
        const games = []
        // Until we have as many games as we asked for
        while (games.length < tournament.gamesPerPlayer * tournament.players.length / 4) {

            // If there is not enough players left for a game
            while (randomOrderedNamePool.length < 4) {
                const newNamePool = _.clone(_.shuffle(tournament.players))

                // We need to inspect the next four players as there is change that the remaining players of previous pool include the first players of the new pool
                if (this.hasUniquePlayers(this.takeFirstFour(randomOrderedNamePool, newNamePool))) {
                    randomOrderedNamePool = randomOrderedNamePool.concat(newNamePool)
                }

            }
            games.push(new model.Game(randomOrderedNamePool.shift(), randomOrderedNamePool.shift(), randomOrderedNamePool.shift(), randomOrderedNamePool.shift()))
        }

        return games;
    }

    takeFirstFour(array1, array2) {
        return array1.concat(array2).slice(0, 4)
    }

    hasUniquePlayers(players) {
        return new Set(players).size == 4;
    }

}

module.exports = Repository