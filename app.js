const express = require('express')
const app = express()
var bodyParser = require('body-parser');
const model = require('./model/Model.js')
const Repository = require('./model/Repository.js')

app.use(express.static('public'))
app.use(bodyParser())

app.post('/tournaments', function(req,res){
    Repository.createTournament(req.body,function(data){
        res.send(data)
    })
})

app.get('/tournaments', function(req,res){
    res.send({ 'tournaments': Repository.getTournaments() })
})

app.get('/tournaments/:id', function(req,res){
    res.send(Repository.getTournament(req.params.id))
})

app.put('/tournaments/:tId/games/:gId', function(req,res){
    res.send(Repository.reportGameResult(req.params.tId, req.params.gId, req.body))
})

 // views for UI
app.get('/tournaments/:id/views/scoreboard', function(req,res){
    res.send({ 'scores': Repository.calculateScoreBoard(req.params.id) })
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
