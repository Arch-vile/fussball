const express = require('express')
var expressMongoDb = require('express-mongo-db');

const app = express()
var bodyParser = require('body-parser');
const model = require('./model/Model.js')
const Repository = require('./model/Repository.js')

app.use(expressMongoDb(process.env.mongoURI));
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
    new Repository(req.db).leaderBoard(req.params.id, function(err,leaderBoard) {
        res.send({ 'scores': leaderBoard })
    })
})

app.listen(process.env.PORT || 3000, function () {
  console.log('Fussball app listening on port ' + (process.env.PORT || 3000))
})
