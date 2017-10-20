const express = require('express')
var expressMongoDb = require('express-mongo-db');

const app = express()
var bodyParser = require('body-parser');
const model = require('./model/Model.js')
const Repository = require('./model/Repository.js')

app.use(expressMongoDb('mongodb://admin:admin2admin@ds119685.mlab.com:19685/fussball'));
app.use(express.static('public'))
app.use(bodyParser())

app.post('/tournaments', function(req,res){
    new Repository(req.db).createTournament(req.body,function(err,data){
        res.send({"id": data.insertedId})
    })
})

app.get('/tournaments', function(req,res){
    new Repository(req.db).getTournaments(function(err,data){
        res.send({ 'tournaments': data })
    })
})

app.get('/tournaments/:id', function(req,res){
    new Repository(req.db).getTournament(req.params.id,function(err,data){
        res.send(data)
    })
})

app.put('/tournaments/:tId/games/:gId', function(req,res){
    new Repository(req.db).updateGame(req.params.tId, req.body, function(err,data){
        if(err)
            res.send(500)
        else
            res.send(data)
    })
})

 // views for UI
app.get('/tournaments/:id/views/scoreboard', function(req,res){
    res.send({ 'scores': Repository.calculateScoreBoard(req.params.id) })
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
