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
app.put('/users/:id/:name/:nickname/:wohnort', jsonParser, function (req, res) {

    var neu = req.body;
    neu.id = req.params.id;
    neu.name = req.params.name;
    neu.nickname = req.params.nickname;
    neu.wohnort = req.params.wohnort;

    client.set('user:' + req.params.id + req.params.name + req.params.nickname + req.params.wohnort, JSON.stringify(neu), function (err, rep) {
        res.status(200).type('json').send(neu);
    });

});




//Trade erstellen

app.post('/trade', function (req, res) {
    var newTrade = req.body;
    client.incr('trade:', function (err, rep) {
      var newTrade = req.body;
      newTrade.id = rep;

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
                return {id: trade.id, name: trade.name, user: trade.user, beschreibung: trade.beschreibung};
            });
            res.json(trades);
        });
    });
});

// Einen Trade abfragen
app.get('/trade/:id/:name/:user/:beschreibung', function (req, res) {

    client.get('trade:' + req.params.id + req.params.name + req.params.user + req.params.beschreibung, function (err, rep) {
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
app.put('/trade/:id/:name/:user/:beschreibung', jsonParser, function (req, res) {

    var neu = req.body;
    neu.id = req.params.id;
    neu.name = req.params.name;
    neu.user = req.params.user;
    neu.beschreibung = req.params.beschreibung;

    client.set('trade:' + req.params.id + req.params.name+ req.params.user + req.params.beschreibung , JSON.stringify(neu), function (err, rep) {
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
                return {id: bewertung.id, name: bewertung.name, user: bewertung.user, beschreibung: bewertung.bewertung};
            });
            res.json(bewertungen);
        });
    });
});

// Eine Bewertung abfragen
app.get('/bewertung/:id/:name/:user/:beschreibung', function (req, res) {

    client.get('bewertung:' + req.params.id + req.params.name + req.params.user + req.params.beschreibung, function (err, rep) {
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

// Aktualisiert eine Bwertung
app.put('/bewertung/:id/:name/:user/:bewertung', jsonParser, function (req, res) {

    var neu = req.body;
    neu.id = req.params.id;
    neu.name = req.params.name;
    neu.user = req.params.user;
    neu.bewertung = req.params.bewertung;

    client.set('bewertung:' + req.params.id + req.params.name + req.params.user + req.params.bewertung, JSON.stringify(neu), function (err, rep) {
        res.status(200).type('json').send(neu);
    });

});

// Message erstellen

app.post('/messages', function (req, res) {
    var newMessage = req.body;
    client.incr('message:', function (err, rep) {
      newMessage.id = rep;
        client.set('message:' + newMessage.id, JSON.stringify(newMessage), function (err, rep) {
            res.json(newMessage);

        });
    });
});

// Alle auflisten
app.get('/message', function (req, res) {
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
            messages = messages.map(function (message) {
                return {titel: message.titel, user: message.user, nachricht: message.nachricht};
            });
            res.json(bewertungen);
        });
    });
});

// Eine message abfragen
app.get('/message/:id/:titel/:user/:nachricht', function (req, res) {

    client.get('message:' + req.params.id + req.params.titel + req.params.user + req.params.nachricht, function (err, rep) {
        if (rep) {
            res.type('json').send(rep);
        } else {
            res.status(404).type('text').send('Die Bewertung mit der ID ' + req.params.id + ' existiert nicht');
        }
    });
});


// Löscht eine Message
app.delete('/message/:id', function (req, res) {

    client.get('message:' + req.params.id, function (err, rep) {
        var trade = JSON.parse(rep);
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

// Aktualisiert ein Notepad
app.put('/message/:id/:titel/:user/:nachricht', jsonParser, function (req, res) {

    var neu = req.body;
    neu.id = req.params.id;
    neu.titel = req.params.titel;
    neu.user = req.params.user;
    neu.nachricht = req.params.nachricht;

    client.set('message:' + req.params.id + req.params.titel + req.params.user + req.params.nachricht, JSON.stringify(neu), function (err, rep) {
        res.status(200).type('json').send(neu);
    });

});

//Notepad erstellen
app.post('/notepad', function (req, res) {
    var newNotepad = req.body;
    client.incr('notepad:', function (err, rep) {
      newNotepad.id = rep;
        client.set('notepad:' + newNotepad.id, JSON.stringify(newNotepad), function (err, rep) {
            res.json(newNotepad);

        });
    });
});

// Alle auflisten
app.get('/notepad', function (req, res) {
    client.keys('notepad:*', function (err, rep) {

        var notepads = [];

        if (rep.length === 0) {
            res.json(notepads);
            return;
        }
        client.mget(rep, function (err, rep) {

            rep.forEach(function (val) {
                notepads.push(JSON.parse(val));
            });
            notepads = notepads.map(function (notepad) {
                return {titel: notepad.titel, user: notepad.user, notiz: notepad.notiz};
            });
            res.json(notepads);
        });
    });
});

// Eine Notepad abfragen
app.get('/notepad/:id/:titel/:user/:notiz', function (req, res) {

    client.get('notepad' + req.params.id + req.params.titel + req.params.user + req.params.notiz, function (err, rep) {
        if (rep) {
            res.type('json').send(rep);
        } else {
            res.status(404).type('text').send('Das Notepad mit der ID ' + req.params.id + ' existiert nicht');
        }
    });
});


// Löscht ein Notepad
app.delete('/notepad/:id', function (req, res) {

    client.get('notepad:' + req.params.id, function (err, rep) {
        var trade = JSON.parse(rep);
        client.get('user:' + notepad.userID, function (err, rep) {
            var user = JSON.parse(rep);
            user.notepad = user.notepad.filter((value) >= value !== notepad.id);
            client.set('user:' + user.id, JSON.stringify(user), function (err, rep) {
                client.del('notepad:' + req.params.id, function (err, rep) {
                    if (rep === 1) {
                        res.status(200).type('text').send('Erfolgreich das Notepad mit der ID ' + req.params.id + ' gelöscht');
                    } else {
                        res.status(404).type('text').send('Das Notepad mit der ID ' + req.params.id + ' existiert nicht');
                    }
                });
            });
        });
    });
});

// Aktualisiert ein Notepad
app.put('/notepad/:id/:titel/:user/:notiz', jsonParser, function (req, res) {

    var neu = req.body;
    neu.id = req.params.id;
    neu.titel = req.params.titel;
    neu.user = req.params.user;
    neu.notiz = req.params.notiz;

    client.set('notepad:' + req.params.id + req.params.titel + req.params.user + req.params.notiz, JSON.stringify(neu), function (err, rep) {
        res.status(200).type('json').send(neu);
    });

});




app.listen(settings.port, function(){
    console.log("Service is running on port "+settings.port+".");
});
