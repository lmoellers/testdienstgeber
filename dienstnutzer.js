var faye = require('faye');
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

var ejs = require('ejs');
var fs = require('fs');

//Server erstellen
var app = express();
var server = http.createServer(app);
app.use(bodyParser.json());

const settings = {
  port: process.env.PORT || '3001'
};



app.use(function (req, res) {
    res.type('text/plain');
    res.status(404);
    res.send('404 - not found');
    });

app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.type('text/plain');
    res.status(500);
    res.send('500 - internal error');
});


//Adapter konfigurieren
var bayeux = new faye.NodeAdapter({
    mount: '/faye'
});
//Adapter zum Server hinzufügen
bayeux.attach(server);

var client = new faye.Client("http://localhost:3001/faye");



var subscription = client.subscribe('/messages', function (message) {
    console.log("Neue Nachricht von " + JSON.stringify(message.userID));
    var options = {
        host: 'https://tradinggameapplication.herokuapp.com/messages',
        port: '3000',
        path: '/bewertung',
        method: 'POST'
    };
    var externalRequest = http.request(options, function (externalResponse) {
        console.log('Bewertung erstellt');
        externalResponse.on("data", function (chunk) {
            console.log("body: " + chunk);
        });
    });
    externalRequest.setHeader("content-type", "application/json");
    externalRequest.write(JSON.stringify(message));
    externalRequest.end();
});

var tradeOderAnders = client.subscribe('/trade', function (message) {
    console.log("Neuer Trade von " + JSON.stringify(message.userID));
    var options = {
        host: 'https://tradinggameapplication.herokuapp.com/trade',
        port: '3000',
        path: '/articles',
        method: 'POST'
    };
    var externalRequest = http.request(options, function (externalResponse) {
        console.log('Trade erstellt');
        externalResponse.on("data", function (chunk) {
            console.log("body: " + chunk);
        });
    });
    externalRequest.setHeader("content-type", "application/json");
    externalRequest.write(JSON.stringify(message));
    externalRequest.end();
});

var User = client.subscribe('/users', function (message) {
    console.log("User erstellt " + JSON.stringify(message));
    var options = {
        host: 'https://tradinggameapplication.herokuapp.com/users',
        port: '3000',
        path: '/users',
        method: 'POST'
    };
    var externalRequest = http.request(options, function (externalResponse) {
        console.log('User erstellt');
        externalResponse.on("data", function (chunk) {
            console.log("body: " + chunk);
        });
    });
    externalRequest.setHeader("content-type", "application/json");
    externalRequest.write(JSON.stringify(message));
    externalRequest.end();
});

//POST auf das ressourcen bewertung


app.post('/bewertung', function (req, res) {

    var publication = client.publish('/bewertung', {
        "bewertung": req.body.bewertung
    });

    var newBewertung = JSON.stringify(req.body);
    console.log(newBewertung);

    var options = {
        host: 'https://tradinggameapplication.herokuapp.com/bewertung',
        port: '3000',
        path: '/bewertung',
        method: 'POST'
    };

    var externalRequest = http.request(options, function (externalResponse) {
        console.log('Bewertung erstellt');
        externalResponse.on("data", function (chunk) {
            console.log("body: " + chunk);
            user = JSON.parse(chunk);

            res.json(newBewertung);
            res.end();
        });
    });
    externalRequest.setHeader("content-type", "application/json");
    externalRequest.write(JSON.stringify(req.body));
    externalRequest.end();
});

//GET auf die Ressource Bewertung bezogen


app.get('/bewertung', jsonParser, function (req, res) {

    var options = {
        host: 'https://tradinggameapplication.herokuapp.com/bewertung',
        port: '3000',
        path: '/bewertung',
        method: 'GET'
    };


    var externalRequest = http.request(options, function (externalResponse) {
        console.log('Bewertung nach Id');
        externalResponse.on('data', function (chunk) {

            var bewertung = JSON.parse(chunk);
            var bubblesort = function (a) {
                var swapped;
                do {
                    swapped = false;
                    for (var i = 0; i < a.length - 1; i++) {
                        if (a[i].id < a[i + 1].id) {
                            var temp = a[i];
                            a[i] = a[i + 1];
                            a[i + 1] = temp;
                            swapped = true;
                        }
                    }
                } while (swapped);
            };
            bubblesort(bewertung);
            console.log(bewertung);

            res.json(bewertung);
            res.end();
        });
    });
    externalRequest.setHeader("content-type", "text/plain");
    externalRequest.end();
});

//POST auf Ressource Trade

app.post('/trade', function (req, res) {

    var newArticle = JSON.stringify(req.body);
    console.log("Neuer Trade von " + JSON.stringify(newTrade.userID));

    var options = {
        host: 'https://tradinggameapplication.herokuapp.com/trade',
        port: '3000',
        path: '/articles',
        method: 'POST'
    };

    var externalRequest = http.request(options, function (externalResponse) {
        console.log('Trade eingestellt');
        externalResponse.on("data", function (chunk) {
            console.log("body: " + chunk);
            user = JSON.parse(chunk);

            res.json(newTrade);
            res.end();
        });
    });
    externalRequest.setHeader("content-type", "application/json");
    externalRequest.write(JSON.stringify(newTrade));
    externalRequest.end();
});

//GET auf Ressource Trade

app.get('/trade/:id', jsonParser, function (req, res) {

    var options = {
        host: 'https://tradinggameapplication.herokuapp.com/trade',
        port: '3000',
        path: '/trade',
        method: 'GET'
    };

    var externalRequest = http.request(options, function (externalResponse) {
        console.log('Trade nach Id');
        externalResponse.on('data', function (chunk) {

            var artikel = JSON.parse(chunk);


            res.json(trade);
            res.end();
        });
    });

    externalRequest.setHeader("content-type", "text/plain");
    externalRequest.end();
});

app.post('/users', function (req, res) {

    var newUser = JSON.stringify(req.body);
    console.log("Neuer User "+ JSON.stringify(newUser.id + newUser.name));

    var options = {
        host: 'https://tradinggameapplication.herokuapp.com/users',
        port: '3000',
        path: '/users',
        method: 'POST'
    };

    var externalRequest = http.request(options, function (externalResponse) {
        console.log('User erstellt');
        externalResponse.on("data", function (chunk) {
            console.log("body: " + chunk);
            user = JSON.parse(chunk);

            res.json(newUser);
            res.end();
        });
    });
    externalRequest.setHeader("content-type", "application/json");
    externalRequest.write(JSON.stringify(req.body));
    externalRequest.end();
});


app.get('/users/:id', jsonParser, function (req, res) {

    var options = {
        host: 'https://tradinggameapplication.herokuapp.com/users',
        port: '3000',
        path: '/users',
        method: 'GET'
    };

    var externalRequest = http.request(options, function (externalResponse) {
        console.log('Users nach Id');
        externalResponse.on('data', function (chunk) {

            var users = JSON.parse(chunk);


            res.json(users);
            res.end();
        });
    });

    externalRequest.setHeader("content-type", "text/plain");
    externalRequest.end();
});


server.listen(settings.port, function () {
    console.log("Server listens on Port "+settings.port+".");
});
