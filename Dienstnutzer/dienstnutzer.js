global.express = require('express');
global.redis = require('redis');
global.client = redis.createClient();
global.http = require('http');
global.faye = require('faye');
global.async = require('async');
global.moment = require('moment');
// debug
global.util = require('util');

var app = express();
var server = http.createServer(app);
var bodyParser = require('body-parser');

app.set('port', process.env.PORT || 3001);

app.use(bodyParser.json());

app.use(express.static(__dirname + '/views'));

// set the view engine to ejs
app.set('view engine', 'ejs');

var bayeux = new faye.NodeAdapter({
    mount: '/faye',
})

bayeux.attach(server);

// use res.render to load up an ejs view file

// index page
app.get('/', function(req, res) {
    res.render('pages/index');
});


app.use('/User', require('./routes/user_ressource'));
app.use('/Standort', require('./routes/standort_ressource'));
app.use('/Trade', require('./routes/trade_ressource'));
// app.use('/Bewertung', require('./routes/bewertung_ressource'));
// app.use('/Notepad', require('./routes/notepad_ressource'));

// Objekte erstellen und Demodaten in DB legen
app.route('/startdemo').get(function(req, res) {
    // User
    var user1Obj={
        'id' : 1,
        'Name': 'Hanna',
        'Nickname': 'hanna2',
        'isActive': 1
    };

    var user2Obj={
        'id' : 2,
        'Name': 'Sebastian',
        'Nickname': 'seb33',
        'isActive': 1
    };
    var user3Obj={
        'id' : 3,
        'Name': 'Alice',
        'Nickname': 'alicewunderland',
        'isActive': 1
    };
    var user4Obj={
        'id' : 4,
        'Name': 'Tom',
        'Nickname': 'tom81',
        'isActive': 1
    };
    var user5Obj={
        'id' : 5,
        'Name': 'Jan',
        'Nickname': 'jan12',
        'isActive': 1
    };
    var user6Obj={
        'id' : 6,
        'Name': 'Anna',
        'Nickname': 'ann',
        'isActive': 1
    };
    var user7Obj={
        'id' : 7,
        'Name': 'Chris',
        'Nickname': 'Starlord',
        'isActive': 1
    };
    var user8Obj={
        'id' : 8,
        'Name': 'Markus',
        'Nickname': 'markus95',
        'isActive': 1
    };

    var standort1Obj={
        'id' : 1,
        'Name': 'Willingen',
        'Adresse': 'Birkenweg 1',
        'Beschreibung': 'Wohnort'
    };
       var stando2Obj={
        'id' : 2,
        'Name': 'Wuppertal',
        'Adresse': 'Hesselnberg 87',
        'Beschreibung': 'Wohnort'
    };

    client.set('Standortort 1', JSON.stringify(standort1Obj));
    client.set('Standortort 2', JSON.stringify(standort2Obj));


    client.set('User 1', JSON.stringify(user1Obj));
    client.set('User 2', JSON.stringify(user2Obj));
    client.set('User 3', JSON.stringify(user3Obj));
    client.set('User 4', JSON.stringify(user4Obj));
    client.set('User 5', JSON.stringify(user5Obj));
    client.set('User 6', JSON.stringify(user6Obj));
    client.set('User 7', JSON.stringify(user7Obj));
    client.set('User 8', JSON.stringify(user8Obj));
    client.set('UserId',8);
    client.set('StandortId',2);

    res.status(200).render('pages/demo');
});

app.use(function(req, res, next) {
    res.status(404).render('pages/404');
});

client.on('error', function (err) {
    console.log(err);
    process.exit(1);
});

// Start the server
app.listen(app.get('port'), function () {
    console.log('User is listening on port ' + app.get('port'));
});

server.listen(8000, function() {
    console.log("Dienstnutzer listens on Port 8000.");
});
