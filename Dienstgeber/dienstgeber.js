var express = require('express');
var redis = require('redis');
var client = redis.createClient();
// nur zum debug
var util = require('util');

var app = express();
var bodyParser = require('body-parser');

app.set('port', process.env.PORT || 3000);

app.use(bodyParser.json());

app.use('/User', require('./routes/user_ressource'));
app.use('/Standort', require('./routes/standort_ressource'));
app.use('/Trade', require('./routes/trade_ressource'));
app.use('/Bewertung', require('./routes/bewertung_ressource'));
app.use('/Notepad', require('./routes/notepad_ressource'));
app.use('/',require('./routes/servicedokument_ressource'));

app.get('/', function (req, res){
  response.render('index', {
    title: 'Tradinggameapplication'
  });
});

client.on('error', function (err) {
    console.log(err);
    process.exit(1);
});

// Start the server
app.listen(app.get('port'), function () {
  console.log('Server is listening on port ' + app.get('port'));
});
