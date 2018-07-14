var app = express.Router();

//Präsentationslogik

//Unterseite zum hinzufügen eines Benutzers
app.get('/addUser', function(req, res) {
    res.render('pages/addUser');
});

//Unterseite die die Liste aller Benutzer darstellt
app.get('/alleUser', function(req, res) {

    var options = {
        host: "localhost",
        port: 3000,
        path: "/User",
        method:"GET",
        headers:{
            accept:"application/json"
        }
    }
    var externalRequest = http.request(options, function(externalResponse){

        externalResponse.on("data", function(chunk){

            var userAll = JSON.parse(chunk);
            res.render('pages/alleuser',{userAll:userAll});
            res.end();
        });
    });
    externalRequest.end();
});

//Unterseite die die Ansicht eines Benutzers darstellt
app.get('/:BenutzerId', function(req, res) {

    var options = {
        host: 'localhost',
        port: 3000,
        path: '/User/'+req.params.UserId,
        method: 'GET',
        headers: {
            accept: 'application/json'
        }
    };
    var x = http.request(options, function(externalres){

        externalres.on('data', function(chunk){

            var user = JSON.parse(chunk);

            var options = {
                host: "localhost",
                port: 3000,
                path: "/Trade",
                method:"GET",
                headers:{
                    accept:"application/json"
                }
            }

            var options2 = {
                host: "localhost",
                port: 3000,
                path: "/Standort",
                method:"GET",
                headers:{
                    accept:"application/json"
                }
            }


            var externalRequest = http.request(options, function(externalResponse){

                externalResponse.on("data", function(chunk){

                    var matches = JSON.parse(chunk);

                    var z = http.request(options2, function(externalrep){

                        externalrep.on("data", function(chunk){

                            var standorte = JSON.parse(chunk);

                            res.render('pages/einuser', { user: user,trade:trade,standorte:standorte});
                        });
                    });
                    z.end();
                });
            });
            externalRequest.end();
        });
    });
    x.end();
});

/*
// Ressourcen des Dienstnutzers ,
// die ebenfalls über REST-methoden zugänglich sind und damit in gewisser weise
// eine Erweiterung der Dienstgeber Capability zugeschnitten auf Kickersport darstellen
//
//
*/

//Leitet eine POST-Benutzer Anfrage an den Dienstgeber weiter
app.post('/', function(req, res) {

    // Speichert req.body
    var UserAnfrage = req.body;


    // HTTP Header setzen
    var headers = {
        'Accept' : 'application/json',
        'Content-Type': 'application/json'
    };

    // Mit Server verbinden
    var options = {
        host: 'localhost',
        port: 3000,
        path: '/User',
        method: 'POST',
        headers: headers
    };

    var externalRequest = http.request(options, function(externalResponse) {

        //console.log(JSON.stringify(externalResponse.headers.location));

        if(externalResponse.statusCode == 400){
            res.status(400).end();
        };

        externalResponse.on('data', function (chunk) {

            var user = JSON.parse(chunk);
            res.json(user);
            res.end();
        });

    });

    externalRequest.write(JSON.stringify(UserAnfrage));
    externalRequest.end();
});

//Leitet eine Benutzer - PUT anfrage an den Dienstgeber weiter
app.put('/:UserId', function(req, res) {

    var UserDaten = req.body;
    var userId = req.params.UserId;


    // console.log(util.inspect(BenutzerDaten, false, null));

    // HTTP Header setzen
    var headers = {
        'Accept' : 'application/json',
        'Content-Type': 'application/json'
    };

    // Mit Server verbinden
    var options = {
        host: 'localhost',
        port: 3000,
        path: '/User/'+benutzerId,
        method: 'PUT',
        headers: headers
    };

    var externalRequest = http.request(options, function(externalResponse) {


        externalResponse.on('data', function (chunk) {

            var changeUser = JSON.parse(chunk);

            //   console.log(util.inspect(changeBenutzer, false, null));

            res.json(changeUser);
            res.end();


        });

    });

    externalRequest.write(JSON.stringify(UserDaten));

    externalRequest.end();

});

//Löscht einen Benutzer
app.delete('/:UserId', function(req, res) {

    var userId = req.params.UserId;

    // Mit Server verbinden
    var options = {
        host: 'localhost',
        path: '/Benutzer/'+benutzerId,
        port: 3000,
        method: 'DELETE'
    };

    var externalRequest = http.request(options, function(externalResponse) {
        externalResponse.on('data', function (chunk) {

        });

        externalResponse.on('end',function(){
            res.status(200).end();
        });
    });
    externalRequest.end();
});


//Löscht eine Herausforderung an einen Nutzer
app.delete('/:UserId/Trade/:TradeId', function(req, res) {

    //Extrahiere Id's aus der Anfrage
    var userId = req.params.UserId;
    var TradeId = req.params.TradeId;

    //Prüfe ob die Herausforderung existiert
    client.exists('einUser '+ userId +' Trade ' + TradeId, function(err, IdExists) {

        //Wenn die ID existiert..
        if(IdExists) {

            //Entferne Eintrag aus der Datenbank
            client.del('einUser '+userId+' Trade ' + TradeId);

            //Löschen hat geklappt , sende 204
            res.status(204).end();
        }

        // Die Herausforderung existiert nicht
        else {
            res.status(404).end();
        }
    });

});

//Unterseite um einen Benutzer Herauszufordern
app.get('/:TradeId/addTrade', function(req, res) {

    //Id aus URI extrahieren
    var userId = req.params.UserId;

    //JSON Objekte für verschiedene Requests
    var options1 = {
        host: "localhost",
        port: 3000,
        path: "/User",
        method:"GET",
        headers:{
            accept:"application/json"
        }
    }

    var options2 = {
        host: "localhost",
        port: 3000,
        path: "/Standort",
        method:"GET",
        headers:{
            accept:"application/json"
        }
    }

    var options3 = {
        host: "localhost",
        port: 3000,
        path: "/User/"+userId,
        method:"GET",
        headers:{
            accept:"application/json"
        }
    }

    var x = http.request(options1, function(externalResponse){

        externalResponse.on("data", function(chunk){

            var userAll = JSON.parse(chunk);

            var y = http.request(options2, function(externalRes){

                externalRes.on("data", function(chunks){

                    var standorte = JSON.parse(chunks);

                    var z = http.request(options3, function(exres){

        exres.on("data", function(userdata){

                var user = JSON.parse(userdata);

                    var tradeMapping = [];

                    async.each(standorte, function(listItem, next) {

                        var listenKey="Standort " +listItem.id+ " Trades";

                        //Frage Liste aller Kickertische dieses ortes ab
                        client.lrange(listenKey, 0, -1, function(err,items) {

                            //Wenn die Liste nicht leer ist
                            if(items.length!=0){
                                tradeMapping.push({"Standort" : listItem.Name, "Trades": items.length});
                            }
                            next();
                        });

                    },
                               function(err) {

                        res.render('pages/addTrade',{user:user,userAll:userAll,standorte:standorte, tradeMapping: tradeMapping});

                    });
                });
            });
z.end();

        })
    })
            y.end();
        });
    });
    x.end();
});


//Liefert alle Herausforderungen für einen Bestimmten Benutzer
app.get('/:UserId/alleTrades', function(req, res) {

    //Id's extrahieren
    var userId = req.params.UserId;
    //Speichert alle Herausforderungen
    var response=[];

    //returned ein Array aller Keys die das Pattern einBenutzerBenuterIDHerausforderung* matchen
    client.keys('einUser '+userId+' Trades *', function (err, key) {

        var options1 = {
            host: "localhost",
            port: 3000,
            path: "/User/"+userId,
            method:"GET",
            headers:{
                accept:"application/json"
            }
        }


        var y = http.request(options1, function(externalResponse){

            externalResponse.on("data", function(chunk){


                var user = JSON.parse(chunk);

                //Wenn kein Key das Pattern Herausforderung* gematcht hat
                if(key.length == 0) {
                    res.render('pages/alleTrades',{user:user,response:response});
                    return;
                }

                var sorted =  key.sort();

                client.mget(sorted, function (err, Trade) {

                    //Frage alle diese Keys aus der Datenbank ab und pushe Sie in die Response
                    Trade.forEach(function (val) {
                        response.push(JSON.parse(val));
                    });


                    var options2 = {
                        host: "localhost",
                        port: 3000,
                        path: "/Standort",
                        method:"GET",
                        headers:{
                            accept:"application/json"
                        }
                    }

                    var options3 = {
                        host: "localhost",
                        port: 3000,
                        path: "/User/",
                        method:"GET",
                        headers:{
                            accept:"application/json"
                        }
                    }


                    var ab = http.request(options3, function(externalResponse){

                        externalResponse.on("data", function(chunks){


                            var userAll = JSON.parse(chunks);

                            var z = http.request(options2, function(externalrep){

                                externalrep.on("data", function(chunk){

                                    var standorte = JSON.parse(chunk);

                                    res.render('pages/alleTrades',{response:response,user:user,userAll:userAll,standorte:standorte});

                                });
                            });
                            z.end();
                        });
                    });
                    ab.end();
                });
            });

        });
         y.end();
    });
});

app.get('/:UserId/Trade/:TradeId', function(req, res) {

    //Extrahiere Id's
    var tradeId = req.params.TradeId;
    var userId = req.params.UserId;

    //Exists returns 0 wenn der angegebe Key nicht existiert, 1 wenn er existiert
    client.exists('einUser '+userId+' Trade ' + tradeId, function(err, IdExists) {

        //Lokalitaet kennt einen Tisch mit dieser TischId
        if (IdExists) {
            client.mget('einUser '+userId+' Trade ' + tradeId, function(err,tradedata){

                var TradeDaten= JSON.parse(tradedata);
                //Setze Contenttype der Antwort auf application/json, sende Statuscode 200.

                var options1 = {
                    host: "localhost",
                    port: 3000,
                    path: "/User",
                    method:"GET",
                    headers:{
                        accept:"application/json"
                    }
                }

                var options2 = {
                    host: "localhost",
                    port: 3000,
                    path: "/Standort",
                    method:"GET",
                    headers:{
                        accept:"application/json"
                    }
                }


                var y = http.request(options1, function(externalResponse){

                    externalResponse.on("data", function(chunk){

                        var userAll = JSON.parse(chunk);

                        var z = http.request(options2, function(externalrep){

                            externalrep.on("data", function(chunk){

                                var standorte = JSON.parse(chunk);

                                res.render('pages/eintrade',{TradeDaten:TradeDaten,userAll:userAll,standorte:standorte});

                            });
                        });
                        z.end();
                    });
                });
                y.end();
            });
        }
        //Es gibt die angefragte Herausforderung nicht
        else {
            res.status(404).end();
        }
    });

});

//Poste eine Herausforderung
app.post('/:UserId/Trade', function(req, res) {

   // console.log("POST HERAUSFORDERUNG");

    var Trade = req.body;
    var userId = req.params.UserId;


    var contentType = req.get('Content-Type');


    //Check ob der Content Type der Anfrage json ist
    if (contentType != "application/json") {
        res.set("Accepts", "application/json").status(406).end();
    }

    else {

        //Inkrementiere  in der DB
        client.incr('TradeId', function(err, id) {

            //Baue JSON zusammen
            var TradeObj={
              'id':id,
              'Einstellungsdatum' : Trade.Einstellungsdatum,
              'Zeitraum': Trade.Zeitraum,
              'Konsole' : Trade.Konsole,
              'Spiele':Trade.Spiele,
              'Standort': Trade.Standort,
              'Status':Trade.Status,
              'trade':null
            };

            //Pflege Daten über den Kickertisch in die DB ein
            client.set('einUser '+userId+' Trade ' + id, JSON.stringify(TradeObj));

            //Teile dem Client die URI der neu angelegten Ressource mit, Setze Content-Type der Antwort
            res.set("Location", "/User/"+userId+"/Trade/" + id).set("Content-Type","application/json");

            //Zeige dem Client mit Statuscode 201 Erfolg beim anlegen an, und Schreibe JSON in den Body
            res.json(TradeObj).status(201).end();
        });
});

module.exports = app;
