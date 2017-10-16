const express = require('express')
const app = express()
var bodyParser = require('body-parser');
const model = require('./model/Model.js')
const Repository = require('./model/Repository.js')


app.use(bodyParser())
app.get('/', function (req, res) {
  res.send('Hello World!')
})


app.post('/players', function(req,res){
    console.log(req.body)
    res.send(Repository.createPlayer(req.body))
})

app.get('/players/:id', function(req,res){
    res.send(Repository.getPlayer(req.params.id) || 404)
})

app.post('/tournaments', function(req,res){
    console.log(req.body)
    res.send(Repository.createTournament(new model.Tournament(req.body)))
})

app.get('/tournaments', function(req,res){
    res.send({ 'tournaments': Repository.getTournaments() })
})

app.get('/tournaments/:id', function(req,res){
    res.send(Repository.getTournament(req.params.id) || 404)
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
