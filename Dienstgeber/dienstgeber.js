var express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var redis = require('redis');

var client = redis.createClient();
var app = express();

//Settings for given Port

const settings = {
    port: process.env.PORT || 3000
};

app.use(bodyParser.json());

// User anlegen
app.post('/users', function (req, res) {
    var newUser = req.body;
    client.incr('nextUserID', function (err, rep) {
        newUser.id = rep;
        newUser.notepad = [];
        newUser.bewertung = [];
        newUser.trade = [];
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
app.get('/users/:id', function (req, res) {

    client.get('user:' + req.params.id, function (err, rep) {
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
                    .send('Der user mit der ID ' + req.params.id + ' existiert nicht');
            }
        });
    });
});

// Aktualisiert einen User
app.put('/users/:id', jsonParser, function (req, res) {

    var neu = req.body;
    neu.id = req.params.id;

    client.set('user:' + req.params.id, JSON.stringify(neu), function (err, rep) {
        res.status(200).type('json').send(neu);
    });

});

// erstellt einen Trade
app.post('/trade', function (req, res) {

    var newTrade = req.body;

    client.incr('nextTRADEID', function (err, rep) {

        newTrade.id = rep;
        client.set('trade:' + newTrade.id, JSON.stringify(newTrade), function (err, rep) {
            client.get('user:' + newTrade.userID, function (err, rep) {
                var user = JSON.parse(rep);
                user.trade.push(newTrade.id);
                client.set('user:' + user.id, JSON.stringify(user), function (err, rep) {
                    res.json(newTrade)
                });
            });
        });

    });
});

// einen Trade erfragen
app.get('/trade/:id', function (req, res) {

    client.get('trade:' + req.params.id, function (err, rep) {

        if (rep) {
            res.type('json').send(rep);
        }
        else {
            res.status(404).type('text').send('Der Trade mit der ID ' + req.params.id + ' existiert nicht');
        }
    });
});

// einen Trade bearbeiten
app.put('/trade/:id', jsonParser, function (req, res) {

    var neu = req.body;
    neu.id = req.params.id;


    client.set('trade:' + req.params.id, JSON.stringify(neu), function (err, rep) {
        res.status(200).type('json').send(neu);
    });

});

// alle ausgeben
app.get('/trade', function (req, res) {
    client.keys('trade:*', function (err, rep) {

        var trade = [];

        if (rep.length == 0) {
            res.json(trade);
            return;
        }
        client.mget(rep, function (err, rep) {

            rep.forEach(function (val) {
                trade.push(JSON.parse(val));
            });
            trade = trade.map(function (trade) {
                return {id: trade.id, name: trade.name};
            });
            res.json(articles);
        });

    });
});

// löscht einen Trade
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


// erstellt eine Bewertung
app.post('/bewertung', function (req, res) {

    var newBewertung = req.body;

    client.incr('nextBewertungID', function (err, rep) {

        newBewertung.id = rep;
        client.set('bewertung:' + newBewertung.id, JSON.stringify(newBewertung), function (err, rep) {
            client.get('user:' + newBewertung.userID, function (err, rep) {
                var user = JSON.parse(rep);
                user.bewertung.push(newBewertung.id);
                client.set('user:' + user.id, JSON.stringify(user), function (err, rep) {
                    res.json(newBewertung)
                });
            });
        });
    });
});

// einen erfragen
app.get('/bewertung/:id', function (req, res) {

    client.get('bewertung:' + req.params.id, function (err, rep) {

        if (rep) {
            res.type('json').send(rep);
        }
        else {
            res.status(404).type('text').send('Die Bewertung mit der ID ' + req.params.id + ' existiert nicht');
        }
    });
});

// einen bearbeiten
app.put('/bewertung/:id', jsonParser, function (req, res) {

    var neu = req.body;
    neu.id = req.params.id;


    client.set('bewertung:' + req.params.id, JSON.stringify(neu), function (err, rep) {
        res.status(200).type('json').send(neu);
    });

});

// alle ausgeben
app.get('/bewertung', function (req, res) {
    client.keys('bewertung:*', function (err, rep) {

        var bewertungen = [];

        if (rep.length == 0) {
            res.json(bewertungen);
            return;
        }
        client.mget(rep, function (err, rep) {

            rep.forEach(function (val) {
                bewertungen.push(JSON.parse(val));
            });
            bewertungen = bewertungen.map(function (bewertung) {
                return {id: bewertung.id, bewertung: bewertung.bewertung};
            });
            res.json(bewertungen);
        });

    });
});

// löscht eine Bewertung
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

// erstellt eine Message
app.post('/messages', function (req, res) {

    var newMessage = req.body;

    client.incr('nextMessageID', function (err, rep) {

        newMessage.id = rep;
        client.set('message:' + newMessage.id, JSON.stringify(newMessage), function (err, rep) {
            client.get('user:' + newMessage.userID, function (err, rep) {
                var user = JSON.parse(rep);
                user.message.push(newMessage.id);
                client.set('user:' + user.id, JSON.stringify(user), function (err, rep) {
                    res.json(newMessage)
                });
            });
        });
    });
});

// eine Message erfragen
app.get('/messages/:id', function (req, res) {

    client.get('message:' + req.params.id, function (err, rep) {

        if (rep) {
            res.type('json').send(rep);
        }
        else {
            res.status(404).type('text').send('Die Message mit der ID ' + req.params.id + ' existiert nicht');
        }
    });
});

// eine Message bearbeiten
app.put('/messages/:id', jsonParser, function (req, res) {

    var neu = req.body;
    neu.id = req.params.id;


    client.set('message:' + req.params.id, JSON.stringify(neu), function (err, rep) {
        res.status(200).type('json').send(neu);
    });

});

// alle ausgeben
app.get('/messages', function (req, res) {
    client.keys('message:*', function (err, rep) {

        var messages = [];

        if (rep.length === 0) {
            res.json(messages);
            return;
        }
        client.mget(rep, function (err, rep) {

            rep.forEach(function (val) {
                messages.push(JSON.parse(val));
            });
            messages = messages.map(function (article) {
                return {id: message.id, name: message.name};
            });
            res.json(message);
        });

    });
});

// löscht eine Message
app.delete('/messages/:id', function (req, res) {

    client.get('message:' + req.params.id, function (err, rep) {
        var message = JSON.parse(rep);
        client.get('user:' + message.userID, function (err, rep) {
            var user = JSON.parse(rep);
            user.message = user.message.filter((value) >= value !== message.id);
            client.set('user:' + user.id, JSON.stringify(user), function (err, rep) {
                client.del('message:' + req.params.id, function (err, rep) {
                    if (rep === 1) {
                        res.status(200).type('text').send('Erfolgreich die Message mit der ID ' + req.params.id + ' gelöscht');
                    } else {
                        res.status(404).type('text').send('Die Message mit der ID ' + req.params.id + ' existiert nicht');
                    }
                });
            });
        });
    });
});

// erstellt einen Eintrag im Notepad
// {"userID":"<der wo es eingetragen werden soll>","articleID":"<welcher gemerkt wird>"}
app.post('/notepad', function (req, res) {
    var newEintrag = req.body;
    client.get('user:' + newEintrag.userID, function (err, rep) {
        var user = JSON.parse(rep);
        user.notepad.push(newEintrag.tradeID);
        client.set('user:' + user.id, JSON.stringify(user), function (err, rep) {
            res.json(user.notepad);
        });
    });
});


// löscht einen Eintrag im Merkzettel
app.delete('/notepad/:userID/:tradeID', function (req, res) {
    client.get('user:' + req.params.userID, function (err, rep) {
        var user = JSON.parse(rep);
        user.notepad = user.notepad.filter((value) >= value !== req.params.tradeID);
        client.set('user:' + user.id, JSON.stringify(user), function (err, rep) {
            res.json(user.notepad);
        });
    });
});

// alle ausgeben
app.get('/notepad/:userID', function (req, res) {

    client.get('user:' + req.params.userID, function (err, rep) {
        var user = JSON.parse(rep);
        var trade = [];
        if (user.notepad.length === 0) {
            res.json(trade);
            return;
        }
        client.mget(user.notepad.map(function(zettel){
            return "notepad:"+zettel
        }), function(err, rep){
            rep.forEach(function (val) {
                trade.push(JSON.parse(val));
            });
            trade = trade.map(function (trade) {
                return {id: trade.id, text: trade.text};
            });
            res.json(trade);
        });
    });
});

app.listen(settings.port, function(){
    console.log("Service is running on port "+settings.port+".");
});
