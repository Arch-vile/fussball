const express = require('express')
const app = express()
var bodyParser = require('body-parser');
const model = require('./model/Model.js')
const Repository = require('./model/Repository.js')


app.use(bodyParser())

app.post('/players', function(req,res){

    req.body.players.forEach(function(element) {
        Repository.createPlayer(element)
    });
    
    res.send(201)
})

app.get('/players/:id', function(req,res){
    res.send(Repository.getPlayer(req.params.id) || 404)
})

app.post('/tournaments', function(req,res){
    res.send(Repository.createTournament(new model.Tournament(req.body)))
})

app.get('/tournaments', function(req,res){
    res.send({ 'tournaments': Repository.getTournaments() })
})

app.get('/tournaments/:id', function(req,res){
    res.send(Repository.getTournament(req.params.id))
})

app.put('/tournaments/:tId/games/:gId/result', function(req,res){
    res.send(Repository.reportGameResult(req.params.tId, req.params.gId, req.body))
})

app.get('/tournaments/:id/scoreboard', function(req,res){
    res.send({ 'scores': Repository.calculateScoreBoard(req.params.id) })
})


app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
