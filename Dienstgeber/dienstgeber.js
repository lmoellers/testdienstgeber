var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
//var redis = require('redis');

var client = require('redis').createClient(process.env.REDIS_URL);
var Redis = require('ioredis');
var redis = new Redis(process.env.REDIS_URL);

var app = express();

//app.set('port', process.env.PORT || 3000);
const settings = {
  port: process.env.PORT || 3000,
  datafile: "./testdata.json"
};

app.use(bodyParser.json());

app.use('/User', require('./routes/user_ressource'));
app.use('/Standort', require('./routes/standort_ressource'));
app.use('/Trade', require('./routes/trade_ressource'));
app.use('/Bewertung', require('./routes/bewertung_ressource'));
app.use('/Notepad', require('./routes/notepad_ressource'));
app.use('/',require('./routes/servicedokument_ressource'));


// client.on('error', function (err) {
//     console.log(err);
//     process.exit(1);
// });

// Start the server
// app.listen(app.get('port', function () {
//   console.log('Server is listening on port ' + app.get('port'));
// });
app.listen(settings.port, function () {
  console.log('Server is listening on port ' + settings.port +".");
});
