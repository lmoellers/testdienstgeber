var app = express.Router();
var clientFaye = new faye.Client("http://localhost:8000/faye");

//Präsentationslogik

//Unterseite zum hinzufügen eines Matches
app.get('/addTrade', function(req, res) {

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
        path: "/Stanort",
        method:"GET",
        headers:{
            accept:"application/json"
        }
    }

    var x = http.request(options1, function(externalResponse){

        externalResponse.on("data", function(chunks){

            var userAll = JSON.parse(chunks);

            var y = http.request(options2, function(externalrep){

                externalrep.on("data", function(chunk){

                    var standorte = JSON.parse(chunk);



                    var tradeMapping = [];

                    async.each(standorte, function(listItem, next) {

                        var listenKey="Standort " +listItem.id+ " Trade";

                        //Frage Liste aller Kickertische dieses ortes ab
                        client.lrange(listenKey, 0, -1, function(err,items) {

                            //Wenn die Liste nicht leer ist
                            if(items.length!=0){

                                tradeMapping.push({"Standort" : listItem.Name, "Trades": items.length});
                            }
                            next();
                        });
                    }, function(err) {

                        res.render('pages/addTrade',{userAll:userAll,standorte:standorte, tradeMapping: tradeMapping});

                    });
                });

            });
            y.end();
        });

    });
    x.end();

});


//Unterseite für alle Matches
app.get('/alleTrades', function(req, res) {

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

            var trades = JSON.parse(chunk);

            var z = http.request(options2, function(externalrep){

                externalrep.on("data", function(chunk){

                    var standorte = JSON.parse(chunk);


                    res.render('pages/alletrades',{trades:trades,standorte:standorte});
                    res.end();
                });

            });

            z.end();
        });
    });
    externalRequest.end();


});

//Unterseite für ein einzelnes Match
app.get('/:TradeId', function(req, res) {


    var belegungen=[];

    // Hole alle Belegungen der Kickertische eines Ortes aus der Datenbank
    client.keys('Belegung *', function (err, key) {

        if(key.length == 0) {
            return;
        }

        client.mget(key,function(err,belegung){


            //Frage alle diese Keys aus der Datenbank ab und pushe Sie in die Response
            belegung.forEach(function (val) {

                belegungen.push(JSON.parse(val));

            });

        });
    });

    var options1 = {
        host: 'localhost',
        port: 3000,
        path: '/Match/'+req.params.MatchId,
        method: 'GET',
        headers: {
            accept: 'application/json'
        }
    };

    var x = http.request(options1, function(externalres){


        externalres.on('data', function(chunk){

            var match = JSON.parse(chunk);

            // Wenn das Attribut Austragungsort des Matches nicht "NULL" ist
            if(match.Austragungsort) {

                //  console.log(match.Austragungsort);

                var ortURI = match.Austragungsort.split("/");
                var ort = "/"+ortURI[1]+"/"+ortURI[2];

                //      console.log(ort);


                // Frage alle Kickertische des Ortes ab
                var options2 = {
                    host: "localhost",
                    port: 3001,
                    path: ort+"/Kickertisch/",
                    method:"GET",
                    headers:{
                        accept:"application/json"
                    }
                }

                // Frage den Austragungsort selber ab
                var options3 = {
                    host: "localhost",
                    port: 3000,
                    path: ort,
                    method:"GET",
                    headers:{
                        accept:"application/json"
                    }
                }

                // Frage den Spielstand eines Matches ab
                var options4 = {
                    host: 'localhost',
                    port: 3001,
                    path: '/Match/'+req.params.MatchId+"/Spielstand",
                    method: 'GET',
                    headers: {
                        accept: 'application/json'
                    }
                };



                var y = http.request(options2, function(externalrep){

                    externalrep.on("data", function(chunks){

                        var kickertische = JSON.parse(chunks);

                        var z = http.request(options3, function(externalrepz){

                            externalrepz.on("data", function(chunkz){

                                var austragungsort = JSON.parse(chunkz);

                                var w = http.request(options4, function(externalrepw){

                                    externalrepw.on("data", function(chunkw){

                                        var spielstand = JSON.parse(chunkw);

                                        var teilnehmerAusMatchAnfrage = [];

                                        if(match.Teilnehmer[0].Team2.Teilnehmer1) {
                                            teilnehmerAusMatchAnfrage.push(match.Teilnehmer[0].Team2.Teilnehmer1);
                                        }
                                        if(match.Teilnehmer[0].Team2.Teilnehmer2) {
                                            teilnehmerAusMatchAnfrage.push(match.Teilnehmer[0].Team2.Teilnehmer2);
                                        }
                                        if(match.Teilnehmer[0].Team1.Teilnehmer1) {
                                            teilnehmerAusMatchAnfrage.push(match.Teilnehmer[0].Team1.Teilnehmer1);
                                        }
                                        if(match.Teilnehmer[0].Team1.Teilnehmer2) {
                                            teilnehmerAusMatchAnfrage.push(match.Teilnehmer[0].Team1.Teilnehmer2);
                                        }

                                        // console.log(teilnehmerAusMatchAnfrage);

                                        var benutzerAll = [];

                                        var myAgent = new http.Agent({maxSockets: 1});

                                        // Sende für jeden Teilnehmer des Matches eine Anfrage an die Benutzer-Ressource
                                        // um den Namen des Teilnehmers zu erhalten
                                        async.each(teilnehmerAusMatchAnfrage, function(listItem, next) {

                                            var options = {
                                                host: "localhost",
                                                port: 3000,
                                                agent: myAgent,
                                                path: listItem,
                                                method:"GET",
                                                headers:{
                                                    accept : "application/json"
                                                }
                                            }

                                            var exreq = http.request(options, function(externalrep){

                                                externalrep.on("data", function(chunks){

                                                    var user = JSON.parse(chunks);
                                                    // Pushe jeden erhaltenen Benutzer in das Array benutzerAll
                                                    benutzerAll.push(user);
                                                    next();
                                                });
                                            });

                                            exreq.end();

                                        }, function(err) {

                                            // console.log(match.Teilnehmer);

                                            res.render('pages/einmatch', { benutzerAll : benutzerAll, match: match, kickertische: kickertische, austragungsort: austragungsort, spielstand:spielstand, belegungen: belegungen });

                                        });


                                    });

                                });
                                w.end();

                            });
                        });
                        z.end();

                    });

                });
                y.end();
            }
            else {

                // Wenn der Match Austragungsort "null" ist

                var options4 = {
                    host: 'localhost',
                    port: 3001,
                    path: '/Match/'+req.params.MatchId+"/Spielstand",
                    method: 'GET',
                    headers: {
                        accept: 'application/json'
                    }
                };

                var w = http.request(options4, function(externalrepw){

                    externalrepw.on("data", function(chunkw){

                        var spielstand = JSON.parse(chunkw);

                        var benutzerAll = [];
                        var teilnehmerAusMatchAnfrage = [];


                        if(match.Teilnehmer[0].Team2.Teilnehmer1) {
                            teilnehmerAusMatchAnfrage.push(match.Teilnehmer[0].Team2.Teilnehmer1);
                        }
                        if(match.Teilnehmer[0].Team2.Teilnehmer2) {
                            teilnehmerAusMatchAnfrage.push(match.Teilnehmer[0].Team2.Teilnehmer2);
                        }
                        if(match.Teilnehmer[0].Team1.Teilnehmer1) {
                            teilnehmerAusMatchAnfrage.push(match.Teilnehmer[0].Team1.Teilnehmer1);
                        }
                        if(match.Teilnehmer[0].Team1.Teilnehmer2) {
                            teilnehmerAusMatchAnfrage.push(match.Teilnehmer[0].Team1.Teilnehmer2);
                        }

                        //  console.log(teilnehmerAusMatchAnfrage);


                        var myAgent = new http.Agent({maxSockets: 1});

                        // Sende für jeden Teilnehmer des Matches eine Anfrage an die Benutzer-Ressource
                        // um den Namen des Teilnehmers zu erhalten
                        async.each(teilnehmerAusMatchAnfrage, function(listItem, next) {

                            var options = {
                                host: "localhost",
                                port: 3000,
                                agent: myAgent,
                                path: listItem,
                                method:"GET",
                                headers:{
                                    accept : "application/json"
                                }
                            }


                            var exreq = http.request(options, function(externalrep){

                                externalrep.on("data", function(chunks){

                                    var user = JSON.parse(chunks);
                                    // Pushe jeden erhaltenen Benutzer in das Array benutzerAll
                                    benutzerAll.push(user);
                                    next();
                                });


                            });

                            exreq.end();


                        }, function(err) {


                            res.render('pages/einmatch', { benutzerAll : benutzerAll, match: match, spielstand:spielstand });

                        });


                    });

                });
                w.end();

            }
        });

    });

    x.end();


});

//Leitet eine Match-POST anfrage an den Dienstgeber weiter
app.post('/', function(req, res) {

    // Speichert req.body
    var TradeAnfrage = req.body;

    // HTTP Header setzen
    var headers = {
        'Accept' : 'application/json',
        'Content-Type': 'application/json'
    };

    // Mit Server verbinden
    var options = {
        host: 'localhost',
        port: 3000,
        path: '/Trade',
        method: 'POST',
        headers: headers
    };

    var externalRequest = http.request(options, function(externalResponse) {

        if(externalResponse.statusCode == 400){
            res.status(400).end();
        };

        externalResponse.on('data', function (chunk) {

            var trade = JSON.parse(chunk);

            // Extrahiere aus dem Antwort-Header die ID des Matches und erstelle auf dem Dienstnutzer einen Spielstand für
            // dieses Match
            var loc = externalResponse.headers.location.split("/");

            var idm = loc[2];

            var TradeStatus = {
                spielstandT1 : 0,
                spielstandT2: 0,
                Modus: 'Klassisch',
                Gewinner: null
            }

            //Schreibe Turnierdaten zurück
            client.set('Spielstand ' + idm,JSON.stringify(MatchSpielstand));


            res.json(match).end();

        });

    });

    // Schreibe das Kicker-spezifische Regelwerk für das Match in die Repräsentation

    externalRequest.write(JSON.stringify(MatchAnfrage));

    externalRequest.end();

});

//Leitet eine Match-PUT anfrage an den Dienstgeber weiter
app.put('/:MatchId', function(req, res) {

    var MatchDaten = req.body;
    var matchId = req.params.MatchId;


    // console.log(util.inspect(MatchDaten, false, null));

    // HTTP Header setzen
    var headers = {
        'Accept' : 'application/json',
        'Content-Type': 'application/json'
    };

    // Mit Server verbinden
    var options = {
        host: 'localhost',
        port: 3000,
        path: '/Match/'+matchId,
        method: 'PUT',
        headers: headers
    };

    var externalRequest = http.request(options, function(externalResponse) {


        externalResponse.on('data', function (chunk) {

            var changeMatch = JSON.parse(chunk);

            if(changeMatch.Status == 'aktiv') {
                //Path of the Topic
                var path = "/liveticker/"+matchId;

                //Publish to the specific topic path
                var publication = clientFaye.publish(path,{
                    'MatchLocation':"Match/"+matchId,
                    'MatchLive':'gestartet'
                });


            }
            else if(changeMatch.Status == 'abgebrochen') {
                var path = "/liveticker/"+matchId;


                //Publish to the specific topic path
                var publication = clientFaye.publish(path,{
                    'MatchLocation':"Match/"+matchId,
                    'MatchCanc':'abgebrochen'
                });

            }
            // console.log(util.inspect(changeMatch, false, null));

            res.json(changeMatch);
            res.end();


        });

    });

    externalRequest.write(JSON.stringify(MatchDaten));

    externalRequest.end();

});




module.exports = app;
