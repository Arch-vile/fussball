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
        return this.tournaments.get(id)
    }

    getTournaments() {
        return this.tournaments.values()
    }

}

module.exports = new Repository()