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
    //console.log(req.params.id);
    //res.send(new model.Player('mikko.ravimo@foo.bar','mixu'))
    res.send(Repository.getPlayer(req.params.id))
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
