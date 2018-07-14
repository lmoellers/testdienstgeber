var app = express.Router();

//Präsentationslogik

//Unterseite zum hinzufügen eines Austragungsortes
app.get('/addStandort', function(req, res) {
    res.render('pages/addStandort');
});

//Unterseite die die Liste aller Austragungsorte darstellt
app.get('/alleStandorte', function(req, res) {

    var options = {
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

            var standorte = JSON.parse(chunk);
            res.render('pages/allestandorte',{standorte:standorte});
        });
    });
    externalRequest.end();
});

//Unterseite die die Ansicht eines Austragungsortes darstellt
app.get('/:StandortId', function(req, res) {

    var options = {
        host: 'localhost',
        port: 3000,
        path: '/Standort/'+req.params.StandortId,
        method: 'GET',
        headers: {
            accept: 'application/json'
        }
    };

    var x = http.request(options, function(externalres){

        externalres.on('data', function(chunk){

            var standort = JSON.parse(chunk);

            res.render('pages/einstandort', { standort: standort });
        });
    });
    x.end();
});

//Unterseite die die Daten aller Kickertische darstellt
// app.get('/:StandortId/Trade', function(req, res) {
//
//     var trades = [];
//     var belegungen = [];
//
//     var austragungsortId = req.params.AustragungsortId;
//
//     // Ermittle den Key unter dem die Linkliste der Kickertische dieser Lokalitaet in der DB abgelegt ist
//     var listenKey="Ort " +austragungsortId+ " Tische";
//
//      var options = {
//         host: 'localhost',
//         port: 3000,
//         path: '/Austragungsort/'+austragungsortId,
//         method: 'GET',
//         headers: {
//             accept: 'application/json'
//         }
//     };
//
//     var x = http.request(options, function(externalres){
//
//         externalres.on('data', function(ort){
//
//             var austragungsort = JSON.parse(ort);
//
//         client.lrange(listenKey, 0, -1, function(err,items) {
//
//             // für jeden Kickertisch in der Liste
//             async.each(items, function(listItem, next) {
//
//                 client.mget('Kickertisch '+listItem,function(err,resp){
//
//                     // Hole dessen Belegung
//                     client.mget('Belegung '+listItem,function(err,bel){
//                         // und pushe die Belegung der einzelnen Tische in ein Array
//                         kickertische.push(JSON.parse(resp));
//                         belegungen.push(JSON.parse(bel));
//                         next();
//                     });
//                 });
//             }, function(err) {
//
//                 var acceptedTypes = req.get('Accept');
//
//                 switch (acceptedTypes) {
//
//                         //Client erwartet content type application/json
//                     case "application/json":
//
//                         //Setze Contenttype der Antwort auf application/json
//                         res.set("Content-Type", 'application/json').status(200).json(kickertische).end();
//
//
//                         break;
//
//                     default:
//                         res.render('pages/allekickertische', { kickertische: kickertische, belegungen: belegungen, austragungsort: austragungsort });
//                         //Antwort beenden
//                         res.end();
//                         break;
//
//                 }
//
//             });
//         });
//     });
// });
//     x.end();
// });


/*
// Ressourcen des Dienstnutzers ,
// die ebenfalls über REST-methoden zugänglich sind und damit in gewisser weise
// eine Erweiterung der Dienstgeber Capability zugeschnitten auf Kickersport darstellen
//
//
*/


//Leitet eine POST-Austragungsort Anfrage an den Dienstgeber weiter
app.post('/', function(req, res) {

    // Speichert req.body
    var StandortAnfrage = req.body;


    // HTTP Header setzen
    var headers = {
        'Accept' : 'application/json',
        'Content-Type': 'application/json'
    };

    // Mit Server verbinden
    var options = {
        host: 'localhost',
        port: 3000,
        path: '/Standort',
        method: 'POST',
        headers: headers
    };

    var externalRequest = http.request(options, function(externalResponse) {

        if(externalResponse.statusCode == 400){
            res.status(400).end();
        };

        externalResponse.on('data', function (chunk) {

            var standort = JSON.parse(chunk);
            res.json(standort);
            res.end();
        });
    });

    externalRequest.write(JSON.stringify(StandortAnfrage));
    externalRequest.end();
});

//Leitet eine Austragungsort - PUT anfrage an den Dienstgeber weiter
app.put('/:StandortId', function(req, res) {

    var StandortDaten = req.body;
    var standortId = req.params.StandortId;

    // HTTP Header setzen
    var headers = {
        'Accept' : 'application/json',
        'Content-Type': 'application/json'
    };

    // Mit Server verbinden
    var options = {
        host: 'localhost',
        port: 3000,
        path: '/Standort/'+standortId,
        method: 'PUT',
        headers: headers
    };

    var externalRequest = http.request(options, function(externalResponse) {

        externalResponse.on('data', function (chunk) {

            var changeStandort = JSON.parse(chunk);
            res.json(changeStandort);
            res.end();

        });
    });
    externalRequest.write(JSON.stringify(StandortDaten));
    externalRequest.end();
});

//Löscht einen Austragungsort und alle auf dem Dienstnutzer assoziierten Kickertische (Subressource)
// aktuell nicht komplett funktionsfähig, Tische werden nicht gelöscht
app.delete('/:StandortId', function(req, res) {

    var standortId = req.params.StandortId;

    // Mit Server verbinden
    var options = {
        host: 'localhost',
        port: 3000,
        path: '/Standort/'+standortId,
        method: 'DELETE'
    };

    //Stelle Delete Request
    var externalRequest = http.request(options, function(externalResponse) {

        //Warte bis Antwort beendet ist
        externalResponse.on('end', function() {

            //Listenkey für die Liste aller Kickertische dieses ortes
            var listenKey="Standort " +standortId+ " Trades";

            //Frage Liste aller Kickertische dieses ortes ab
            client.lrange(listenKey, 0, -1, function(err,items) {

                //Wenn die Liste nicht leer ist
                if(items.length!=0){

                    //Lösche alle Einträge
                    items.foreach(function(entry){
                        //Lösche Eintrag aus der DB
                        client.del('Trade ' +entry);
                    });

                    //Lösche den Listenkey
                    client.del("Standort " +standortId+ " Trades");

                    //Löschen hat Funktioniert , liefere 200
                    res.status(200).end();
                }

                //Liste war leer, löschen hat dennoch funktioniert
                else {
                    res.status(200).end();
                }
            });
        });
    });
    externalRequest.end();
});


/*
//Subressource Kickertisch
//
//
//
*/


//Liefert eine Repräsentation eines Tisches eines Austragungsortes
app.get('/:StandortId/Trade/:TradeId', function(req, res) {

    //Extrahiere TischId
    var tradeId = req.params.TradeId;
    var standortId = req.params.StandortId;

    //Exists returns 0 wenn der angegebe Key nicht existiert, 1 wenn er existiert
    client.exists('Trade ' + tradeId, function(err, IdExists) {

        //Lokalitaet kennt einen Tisch mit dieser TischId
        if (IdExists) {

            var options1 = {
                host: "localhost",
                port: 3000,
                path: "/User",
                method:"GET",
                headers:{
                    accept:"application/json"
                }
            }

            var y = http.request(options1, function(externalResponse){

                externalResponse.on("data", function(chunk){

                    var userAll = JSON.parse(chunk);

                    var options = {
        host: 'localhost',
        port: 3000,
        path: '/Standort/'+standortId,
        method: 'GET',
        headers: {
            accept: 'application/json'
        }
    };

    var x = http.request(options, function(externalres){

        externalres.on('data', function(resp){

            var austr = JSON.parse(resp);

                        client.mget('Austausch '+tradeId,function(err,aust){

                            var austausch = JSON.parse(aust);

                            client.mget('Trade ' + tradeId, function(err,tradedata){

                                var trade = JSON.parse(tradedata);


                                var acceptedTypes = req.get('Accept');

                                switch (acceptedTypes) {

                                        //Client erwartet content type application/json
                                    case "application/json":

                                        //Setze Contenttype der Antwort auf application/json
                                        res.set("Content-Type", 'application/json').status(200).json(tisch).end();


                                        break;

                                    default:
                                        res.render('pages/eintrade', { trade: trade, standort:standort, austausch: austausch, userAll:userAll });
                                        //Antwort beenden
                                        res.end();
                                        break;

                                }
                            });

                        });
                    });

                });
                    x.end();
                });
            });
            y.end();
        }

    });
});

//Fügt der Collection aller Kickertische eines Ortes einen weiteren Hinzu
app.post('/:StandortId/Trade/',function(req, res){

    //Anlegen eines Tisches geht nur mit Content Type application/atom+xml
    var contentType = req.get('Content-Type');

    //Check ob der Content Type der Anfrage JSON ist
    if (contentType != "application/json" && contentType != "application/json; charset=UTF-8") {
        res.set("Accepts", "application/json");
        res.status(415).end();
    }

    else {
        //extrahiere Id des Austragungsortes
        var standortId = req.params.StandortId;

        //Inkrementiere Kickertischids in der DB , atomare Aktion
        client.incr('TradeId', function(err, id) {

            //Lese Request Body aus
            var Trade = req.body;

            //Kickertisch Objekt
            var tradeObj={
                //Set von Benutzern required
                'id': id,
                'Trader': Trade.Trader,
                'Konsole' : Trade.Konsole,
                'Spiele': Trade.Spiele,
                'Merkmale': Trade.Merkmale
            };

            //Speise Daten des Kickertisches in Datenhaltung des Dienstnutzers ein
            client.set('Trade ' + id, JSON.stringify(tradeObj));

            //Füge die ID des Tisches in die Liste aller Tische dieses Ortes ein
            client.LPUSH('Standort '+standortId+' Trades',id);

            //Setze Contenttype der Antwort auf application/json
            res.set("Content-Type", 'application/json').set("Location", "/Standort/"+standortId+"/Trade/" + id).status(201).json(tradeObj).end();
        });
    }
});


//Ändert die Daten eines Kickertisches , es können das Bild eines Kickertischs und/oder seine Zustandsbeschreibung geändert werden*/
// app.put('/:StandortId/Trade/:TradeId/', function(req, res) {
//
//     var contentType = req.get('Content-Type');
//
//     if (contentType != "application/json" && contentType != "application/json; charset=UTF-8") {
//         //Teile dem Client einen unterstuetzten Type mit
//         res.set("Accepts", "application/json");
//         //Zeige über den Statuscode und eine Nachricht
//         res.status(415).end();
//     }
//
//     //Content type OK
//     else {
//
//         var tradeId = req.params.TradeId;
//
//         //Exists returns 0 wenn der angegebe Key nicht existiert, 1 wenn er existiert
//         client.exists('Trade ' + tradeId, function(err, IdExists) {
//
//             //client.exists hat false geliefert
//             if (!IdExists) {
//                 res.status(404).send("Die Ressource wurde nicht gefunden.");
//                 res.end();
//             }
//
//             //Ressource existiert
//             else {
//
//                 var Trade = req.body;
//
//                 //Lese aktuellen Zustand des Tisches aus DB
//                 client.mget('Trade '+tradeId,function(err,tradedata){
//
//                     //Parse Redis Antwort
//                     var Tradedaten = JSON.parse(tradedata);
//
//                     //Setze Daten des Tisches
//                     Tradedaten.Konsole = Trade.Konsole;
//                     Tradedaten.Spiele = Trade.Spiele;
//                     Tradedaten.Merkmale = Trade.Merkmale;
//
//                     //Schreibe Tischdaten zurück
//                     client.set('Trade ' + tradeId,JSON.stringify(Tradedaten));
//
//                     //Antorte mit Erfolg-Statuscode und schicke geänderte Repräsentation
//                     res.set("Content-Type", 'application/json').status(200).json(Tradedaten).end();
//                 });
//             }
//         });
//     }
// });

//Ändert die Daten eines Standorts
app.put('/:StandortId/', function(req, res) {

    var contentType = req.get('Content-Type');

    if (contentType != "application/json" && contentType != "application/json; charset=UTF-8") {
        //Teile dem Client einen unterstuetzten Type mit
        res.set("Accepts", "application/json");
        //Zeige über den Statuscode und eine Nachricht
        res.status(415).end();
    }

    //Content type OK
    else {

        var standortId = req.params.StandortId;

        //Exists returns 0 wenn der angegebe Key nicht existiert, 1 wenn er existiert
        client.exists('Standort ' + standortId, function(err, IdExists) {

            //client.exists hat false geliefert
            if (!IdExists) {
                res.status(404).send("Die Ressource wurde nicht gefunden.");
                res.end();
            }

            //Ressource existiert
            else {

                var Standort = req.body;

                //Lese aktuellen Zustand des Tisches aus DB
                client.mget('Standort '+standortId,function(err,standortdata){

                    //Parse Redis Antwort
                    var Standortdaten = JSON.parse(standortdata);

                    //Setze Daten des Tisches
                    Standortdaten.Name = Standort.Name;
                    Standortdaten.Adresse = Standort.Adresse;
                    Standortdaten.Beschreibung = Standort.Beschreibung;

                    //Schreibe Tischdaten zurück
                    client.set('Standort ' + standortId,JSON.stringify(Standortdaten));

                    //Antorte mit Erfolg-Statuscode und schicke geänderte Repräsentation
                    res.set("Content-Type", 'application/json').status(200).json(Standortdaten).end();
                });
            }
        });
    }
});

app.delete('/:StandortId/Trade/:TradeId/', function(req, res) {

    var tradeId = req.params.TradeId;
    var standortId = req.params.StandortId;

    //Exists returns 0 wenn der angegebe Key nicht existiert, 1 wenn er existiert
    client.exists('Trade ' + tradeId, function(err, IdExists) {

        //client.exists hat false geliefert
        if (!IdExists) {

            res.status(404).send("Die Ressource wurde nicht gefunden.");
            res.end();

        } else {

            var listenKey="Ort " +standortId+ " Trades";

            client.lrem(listenKey,-1,tradeId);

            client.del('Trade ' + tradeId);

            //Alles ok , sende 200
            res.status(204).end();

            //Antwort beenden
            res.end();
        }
    });
});








module.exports = app;
