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
        tournament.players = []
        this.db.insertOne(tournament, function (err, tournament) {
            cb(err, tournament)
        })
    }

    addPlayer(tournamentId, player, cb) {
        var self = this
        this.db.findOne({ _id: ObjectId(tournamentId) }, function (err, tournament) {
            if(tournament.games) {
                cb("Cannot add player to tournament already having games!")
                return
            }
            self.db.update({
                _id: ObjectId(tournamentId)
            }, {
                    $push: { players: player.email }
                }, function (err, result) {
                    if (result) {
                        cb();
                    }
                })
        })

        
    }

    updateTournament(tournament, cb) {
        this.db.update({
            _id: ObjectId(tournament._id)
        }, tournament, function (err, result) {
                cb(err,result)
        })
    }

    getTournament(id, cb) {
        this.db.findOne({ _id: ObjectId(id) }, function (err, tournament) {
            cb(err, tournament)
        })
    }

    getTournaments(cb) {
        this.db.find({}).sort({ createdAt: -1}).toArray(function (err, tournaments) {
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

    startTournament(tournamentId, cb) {
        const self = this
        this.getTournament(tournamentId, function (err, tournament) {
            if(tournament.games)  throw "Tournament already has games!"

            try {
                
                var gamesPerPlayer = 6;
                while(gamesPerPlayer * tournament.players.length % 4 != 0) {
                    gamesPerPlayer++
                }
                console.log("Games per player: " + gamesPerPlayer)

                tournament.gamesPerPlayer = gamesPerPlayer

                // Some bruteforce to optimize the uniqueness of games
                const optimazedValue = tournament.players.length * gamesPerPlayer * 10000 + tournament.players.length * gamesPerPlayer * 2
                console.log("Aiming for optimized score of: " + optimazedValue)
                var bestScore = 0;
                var games
                for(var i = 0; i < 3000 && bestScore < optimazedValue; i++) {
                    const generatedGames = self.generateGames(tournament)
                    const stats = calculateStats(generatedGames)
                    var score = 0
                    stats.forEach(function(stat){
                        score += stat.uniqueTeamMates * 10000 + stat.uniqueOpponents
                    })
                    if(score > bestScore) {
                        console.log("Found better score:" + score)
                        bestScore = score
                        games = generatedGames
                    }
                    if(i % 100 == 0) console.log("Iteration: " + i)
                }

                const stats = calculateStats(games)
                logStats(stats)


                tournament.games = games
                logStats(calculateStats(tournament.games))
                self.updateTournament(tournament, cb)
            } catch(e) {
                console.log(e)
                cb(e)
            }
        })

        function logStats(byPlayer) {
            byPlayer.keys().forEach(function(key){
                const stats = byPlayer.get(key)
                console.log("Games played: " + stats.gameCount + " Unique team mates: " + stats.uniqueTeamMates + " Unique opponents: " + stats.uniqueOpponents + " " + key)
            })
        }

        function calculateStats(games) {

            const byPlayer = new HashMap()
            games.forEach(function(game) {
                [game.team1Player1, game.team1Player2, game.team2Player1, game.team2Player2].forEach(function(player){
                    if(!byPlayer.has(player)) {
                        byPlayer.set(player, { 
                            gameCount: 0,
                            playedAgainst: [],
                            playedWith: [] 
                        })
                    } 
                })
                
                updateStats(byPlayer, game.team1Player1, game.team1Player2, game.team2Player1, game.team2Player2)
                updateStats(byPlayer, game.team1Player2, game.team1Player1, game.team2Player1, game.team2Player2)
                updateStats(byPlayer, game.team2Player1, game.team2Player2, game.team1Player1, game.team1Player2)
                updateStats(byPlayer, game.team2Player2, game.team2Player1, game.team1Player1, game.team1Player2)
            })

            byPlayer.keys().forEach(function(key){
                const stats = byPlayer.get(key)
                stats.uniqueTeamMates = uniqueCount(stats.playedWith)
                stats.uniqueOpponents = uniqueCount(stats.playedAgainst)
            })

            return byPlayer

            function updateStats(map, player, partner, opponent1, opponent2) {
                map.get(player).gameCount++
                map.get(player).playedAgainst.push(opponent1)
                map.get(player).playedAgainst.push(opponent2)
                map.get(player).playedWith.push(partner)
            }

            function uniqueCount(array) {
                return new Set(array).size
            }

        }
    }

    generateGames(tournament) {
        assert(tournament.players.length >= 4, 'Tournament needs atleast four players')
        assert(tournament.gamesPerPlayer * tournament.players.length % 4 == 0, 'Number of games per player multiplied by number of players needs to divisable with four')
        
        // Pool of players so that each player is as many times as there should be games for each player
        const playerPool = _createPlayerPool(tournament)

        // Loop until all players are matched to games
        const games = []
        while(playerPool.length != 0) {
            const p1 = pickP1(playerPool, games)
            const p2 = pickP2(p1, playerPool, games)
            const p3 = pickP3(p1, p2, playerPool, games)
            const p4 = pickP4(p1, p2, p3, playerPool, games)
            games.push([p1,p2,p3,p4])
        }

        const gameList = []
        games.forEach(function(game) {
            gameList.push(new model.Game(game[0], game[1], game[2], game[3]))
        })
        
        return gameList

        // Choose player 1 for game. Finds the player with lowest score.
        // Score is calculated by sum of:
        // - number of games played
        // Will modify the playerpool
        function pickP1(playerPool, games) {
            var minScore = Number.MAX_SAFE_INTEGER
            var bestIndex = -1
            for(var i = 0; i < playerPool.length; i++) {
                var score = _gameCount(playerPool[i], games)
                if(score < minScore) {
                    bestIndex = i
                    minScore = score
                }
            }

            return playerPool.splice(bestIndex,1)[0]
        }


        // Chooose player 2 for game. Finds the player with lowest score.
        // Score is calculated by sum of:
        // - number of games played with p1 * 100
        // - number of games played against p1 * 10
        // - number of games played
        function pickP2(p1, playerpool, games) {
            var minScore = Number.MAX_SAFE_INTEGER
            var bestIndex = -1

            for(var i = 0; i < playerPool.length; i++) {
                const candidate = playerPool[i]

                if(candidate === p1) continue

                const playedWith = _playedWith(p1, candidate, games)
                const playedAgains = _playedAgainst(p1, candidate, games) 
                const gameCount = _gameCount(candidate, games)
                const score = playedWith * 100 + playedAgains * 10 + gameCount
                if(score < minScore) {
                    bestIndex = i
                    minScore = score
                }
            }

            return playerPool.splice(bestIndex,1)[0]
        }

        // Chooose player 3 for game. Finds the player with lowest score.
        // Score is calculated by sum of:
        // - number of games played against p1 or p2 * 100
        // - number of games played with p1 or p2 * 10
        // - number of games played
        function pickP3(p1, p2, playerpool, games) {
            var minScore = Number.MAX_SAFE_INTEGER
            var bestIndex = -1

            for(var i = 0; i < playerPool.length; i++) {
                const candidate = playerPool[i]

                if(candidate === p1 || candidate === p2) continue

                const playedWith = _playedWith(p1, candidate, games) + _playedWith(p2, candidate, games)
                const playedAgains = _playedAgainst(p1, candidate, games) + _playedAgainst(p2, candidate, games) 
                const gameCount = _gameCount(candidate, games)
                const score = playedAgains * 100 + playedWith * 10 + gameCount
                if(score < minScore) {
                    bestIndex = i
                    minScore = score
                }
            }

            return playerPool.splice(bestIndex,1)[0]
        }

        // Chooose player 4 for game. Finds the player with lowest score.
        // Score is calculated by sum of:
        // - number of games played with p3 * 100
        // - number of games played against p1 or p2 * 10
        // - number of games played
        function pickP4(p1, p2, p3, playerpool, games) {
            var minScore = Number.MAX_SAFE_INTEGER
            var bestIndex = -1

            for(var i = 0; i < playerPool.length; i++) {
                const candidate = playerPool[i]

                if(candidate === p1 || candidate === p2 || candidate === p3) continue

                const playedWith = _playedWith(p3, candidate, games)
                const playedAgains = _playedAgainst(p1, candidate, games) + _playedAgainst(p2, candidate, games) 
                const gameCount = _gameCount(candidate, games)
                const score = playedWith * 100 + playedAgains * 10 + gameCount
                if(score < minScore) {
                    bestIndex = i
                    minScore = score
                }
            }

            return playerPool.splice(bestIndex,1)[0]
        }

        function _playedWith(player1, player2, games) {
            var count = 0;
            games.forEach(function(game) {
                const team1 = [game[0], game[1]]
                const team2 = [game[2], game[3]]
                if(team1.includes(player1) && team1.includes(player2)) count++
                if(team2.includes(player1) && team2.includes(player2)) count++
            })
            return count;
        }

        function _playedAgainst(player1, player2, games) {
            var count = 0;
            games.forEach(function(game) {
                const team1 = [game[0], game[1]]
                const team2 = [game[2], game[3]]
                if(team1.includes(player1) && team2.includes(player2)) count++
                if(team1.includes(player2) && team2.includes(player1)) count++
            })
            return count;
        }

        function _gameCount(player, games) {
            var count = 0;
            games.forEach(function(game) {
                if(game.includes(player)) count++
            })
            return count;
        }

        function _createPlayerPool(tournament) {
            var players = []
            for(var i = 0; i < tournament.gamesPerPlayer; i++) {
                players = players.concat(tournament.players)
            }
            return _.shuffle(players);
        }

    }


}

module.exports = Repository