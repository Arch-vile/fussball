const HashMap = require('hashmap')

class Repository {

    constructor() {
        this.players = new HashMap()
    }

    createPlayer(player) {
        this.players.set(player.id, player)
        return player;
    }

    getPlayer(id) {
        return this.players.get(id)
    }

}

module.exports = new Repository()