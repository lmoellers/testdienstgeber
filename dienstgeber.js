var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
//var redis = require('redis');

var client = require('redis').createClient(process.env.REDIS_URL);
var Redis = require('ioredis');
var redis = new Redis(process.env.REDIS_URL);

var app = express();

//Settings for given Port

const settings = {
    port: process.env.PORT || 3000
};

app.use(bodyParser.json());

// User anlegen
app.post('/users', function (req, res) {
    var newUser = req.body;
    client.incr('user:', function (err, rep) {
      newUser.id = rep;
        client.set('user:' + newUser.id, JSON.stringify(newUser), function (err, rep) {
            res.json(newUser);

        });
    });
});

// Alle auflisten
app.get('/users', function (req, res) {
    client.keys('user:*', function (err, rep) {

        var users = [];

        if (rep.length === 0) {
            res.json(users);
            return;
        }
        client.mget(rep, function (err, rep) {

            rep.forEach(function (val) {
                users.push(JSON.parse(val));
            });
            users = users.map(function (user) {
                return {id: user.id, name: user.name, nickname: user.nickname, wohnort: user.wohnort, passwort: user.passwort};
            });
            res.json(users);
        });
    });
});

// Einen User abfragen
app.get('/users/:id/:name', function (req, res) {

    client.get('user:' + req.params.id + req.params.name, function (err, rep) {
        if (rep) {
            res.type('json').send(rep);
        } else {
            res.status(404).type('text').send('Der User mit der ID ' + req.params.id + ' existiert nicht');
        }
    });
});

// user werden alle ausgegeben, dann wird name und pw gefiltert, sobald sich ein user registriert hat wird er in der db gespeichert, filter funk überprüft ob ein user verfügbar ist (name = name, pw = pw )
app.get('/users/:name/:passwort', function (req, res){

    client.keys('user:*', function (err, rep) {

        var users = [];


        if (rep.length === 0) {
            res.json({exist:"no"});
            return;
        }
        client.mget(rep, function (err, rep) {

            rep.forEach(function (val) {
                users.push(JSON.parse(val));
            });
            users = users.map(function (user) {
                return {name: user.name, passwort: user.passwort};
            });

            users = users.filter((user) >= user.name === req.params.name && user.passwort === req.params.passwort)

            if (users.length === 1){
                res.json({exist:"yes"});
            } else{
                res.json({exist:"no"});
            }

        });
    });
});

// Löscht einen Benutzer
app.delete('/users/:id', function (req, res) {

    client.get('user:' + req.params.id, function (err, rep) {
        var trade = JSON.parse(rep).trade;
        for (var i = 0; i < trade.length; i++)
            client.del("trade:" + trade[i]);
        /*user.trade.forEach(function(id){
         client.del("trade:"+id);
         });*/
        client.del('user:' + req.params.id, function (err, rep) {
            if (rep == 1) {
                res.status(200).type('text')
                    .send('Erfolgreich den User mit der ID ' + req.params.id + ' gelöscht');
            } else {
                res.status(404).type('text')
                    .send('Der User mit der ID ' + req.params.id +  'existiert nicht');
            }
        });
    });
});

// Aktualisiert einen User
app.put('/users/:id/:name', jsonParser, function (req, res) {

    var neu = req.body;
    neu.id = req.params.id;
    neu.name = req.params.name;

    client.set('user:' + req.params.id + req.params.name, JSON.stringify(neu), function (err, rep) {
        res.status(200).type('json').send(neu);
    });

});




//Trade erstellen

app.post('/trade', function (req, res) {
    var newTrade = req.body;
    client.incr('trade:', function (err, rep) {
      newTrade.id = rep;
      //newTrade.name = req.params.name;

        client.set('trade:' + rep, JSON.stringify(newTrade), function (err, rep) {
            res.json(newTrade);

        });
    });
});

// Alle auflisten
app.get('/trade', function (req, res) {
    client.keys('trade:*', function (err, rep) {

        var trades = [];

        if (rep.length === 0) {
            res.json(trades);
            return;
        }
        client.mget(rep, function (err, rep) {

            rep.forEach(function (val) {
                trades.push(JSON.parse(val));
            });
            trades = trades.map(function (trade) {
                return {id: trade.id, name: trade.name, nickname: trade.beschreibung};
            });
            res.json(trades);
        });
    });
});

// Einen Trade abfragen
app.get('/trade/:id/:name/:beschreibung', function (req, res) {

    client.get('trade:' + req.params.id + req.params.name + req.params.beschreibung, function (err, rep) {
        if (rep) {
            res.type('json').send(rep);
        } else {
            res.status(404).type('text').send('Der Trade mit der ID ' + req.params.id + ' existiert nicht');
        }
    });
});


// Löscht einen Trade
app.delete('/trade/:id', function (req, res) {

    client.get('trade:' + req.params.id, function (err, rep) {
        var trade = JSON.parse(rep);
        client.get('user:' + trade.userID, function (err, rep) {
            var user = JSON.parse(rep);
            user.trade = user.trade.filter((value) >= value !== trade.id);
            client.set('user:' + user.id, JSON.stringify(user), function (err, rep) {
                client.del('trade:' + req.params.id, function (err, rep) {
                    if (rep === 1) {
                        res.status(200).type('text').send('Erfolgreich den Trade mit der ID ' + req.params.id + ' gelöscht');
                    } else {
                        res.status(404).type('text').send('Der Trade mit der ID ' + req.params.id + ' existiert nicht');
                    }
                });
            });
        });
    });
});

// Aktualisiert einen Trade
app.put('/trade/:id/:name', jsonParser, function (req, res) {

    var neu = req.body;
    neu.id = req.params.id;
    neu.name = req.params.name;

    client.set('trade:' + req.params.id + req.params.name, JSON.stringify(neu), function (err, rep) {
        res.status(200).type('json').send(neu);
    });

});


//Bewertung
app.post('/bewertung', function (req, res) {
    var newBewertung = req.body;
    client.incr('bewertung:', function (err, rep) {
      newBewertung.id = rep;
        client.set('bewertung:' + newBewertung.id, JSON.stringify(newBewertung), function (err, rep) {
            res.json(newBewertung);

        });
    });
});

// Alle auflisten
app.get('/bewertung', function (req, res) {
    client.keys('bewertung:*', function (err, rep) {

        var bewertungen = [];

        if (rep.length === 0) {
            res.json(bewertungen);
            return;
        }
        client.mget(rep, function (err, rep) {

            rep.forEach(function (val) {
                bewertungen.push(JSON.parse(val));
            });
            bewertungen = bewertungen.map(function (bewertung) {
                return {id: bewertung.id, name: bewertung.name, beschreibung: bewertung.beschreibung};
            });
            res.json(bewertungen);
        });
    });
});

// Eine Beschreibung abfragen
app.get('/bewertung/:id/:name/:beschreibung', function (req, res) {

    client.get('trade:' + req.params.id + req.params.name + req.params.beschreibung, function (err, rep) {
        if (rep) {
            res.type('json').send(rep);
        } else {
            res.status(404).type('text').send('Die Bewertung mit der ID ' + req.params.id + ' existiert nicht');
        }
    });
});


// Löscht eine Bewertung
app.delete('/bewertung/:id', function (req, res) {

    client.get('bewertung:' + req.params.id, function (err, rep) {
        var trade = JSON.parse(rep);
        client.get('user:' + bewertung.userID, function (err, rep) {
            var user = JSON.parse(rep);
            user.bewertung = user.bewertung.filter((value) >= value !== bewertung.id);
            client.set('user:' + user.id, JSON.stringify(user), function (err, rep) {
                client.del('bewertung:' + req.params.id, function (err, rep) {
                    if (rep === 1) {
                        res.status(200).type('text').send('Erfolgreich die Bewertung mit der ID ' + req.params.id + ' gelöscht');
                    } else {
                        res.status(404).type('text').send('Die Bewertung mit der ID ' + req.params.id + ' existiert nicht');
                    }
                });
            });
        });
    });
});

// Aktualisiert einen Trade
app.put('/bewertung/:id/:name', jsonParser, function (req, res) {

    var neu = req.body;
    neu.id = req.params.id;
    neu.name = req.params.name;

    client.set('bewertung:' + req.params.id + req.params.name, JSON.stringify(neu), function (err, rep) {
        res.status(200).type('json').send(neu);
    });

});




app.listen(settings.port, function(){
    console.log("Service is running on port "+settings.port+".");
});
