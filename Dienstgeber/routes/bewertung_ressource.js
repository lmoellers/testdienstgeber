var express = require('express');

var app = express();
//var app = express.Router();

//Liefert eine Collection aller Matches
app.get('/',function(req,res){

    //Frage Accepted Types vom Client ab
    var acceptedTypes = req.get('Accept');

    switch (acceptedTypes) {

            //Client kann application/json verarbeiten
        case "application/json":

            //Speichert die Matchollection
            var response=[];

            //returned ein Array aller Keys die das Pattern Match* matchen
            client.keys('Bewertung *', function (err, key) {

                //Abruf erfolgreich , zeige mit leerem Array im Body sowie Statuscode 200-OK das die Operation funktioniert hat
                if(key.length == 0) {
                    res.status(200).json(response);
                    return;
                }

                var sorted =  key.sort();

                //Rufe daten aller Matches ab
                client.mget(sorted, function (err, trade) {

                    //Frage alle diese Keys aus der Datenbank ab und pushe Sie in die Response
                    trade.forEach(function (val) {

                        response.push(JSON.parse(val));
                    });

                    res.status(200).set("Content-Type","application/json").json(response).end();
                });
            });
            break;

            //Der Client kann keine vom Service angebotenen Content types verarbeiten
        default:
            res.status(406).end();
            break;
    }
});

//Liefert eine Repräsentation eines Matches
app.get('/:BewertungId', function(req, res) {

    var bewertungId = req.params.BewertungId;

    //Exists returns 0 wenn der angegebe Key nicht existiert, 1 wenn er existiert
    client.exists('Bewertung ' + bewertungId, function(err, IdExists) {

        //Das Match existiert nicht im System
        if (!IdExists) {
            res.status(404).end();
        }

        //Das Match existiert
        else{

            //Welchen Content Type kann der client verarbeiten?
            var acceptedTypes = req.get('Accept');

            switch (acceptedTypes) {

                    //Client empfängt JSON
                case "application/json":

                    //Rufe Matchdaten aus DB ab
                    client.mget('Bewertung ' + bewertungId, function(err,bewertungdata){

                        var bewertungDaten = JSON.parse(bewertungdata);
                        //Setze Contenttype der Antwort auf application/json
                        res.set("Content-Type", 'application/json').status(200).json(bewertungDaten).end();
                    });
                    break;

                default:
                    //Der gesendete Accept header enthaelt kein unterstuetztes Format
                    res.status(406).end();
                    break;
            }
        }
    });
});

//Fügt der MatchCollection ein neues Element hinzu
app.post('/',function(req, res) {

    //Anlegen eines Matches, Anfrage muss den Content Type application/atom+xml haben
    var contentType = req.get('Content-Type');

    //Content type ist nicht application/json , zeige im Accept Header gültige content types
    if (contentType != "application/json") {
        //Teile dem Client einen unterstuetzten Type mit
        res.set("Accepts", "application/json").status(415).end();
    }

    //Content Type OK
    else {

        //Erhöhe MatchIds in der DB , atomare Aktion
        client.incr('BewertungId', function(err, id) {

            var bewertung=req.body;

            //Daten des matches
            var bewertungObj={
                //Set von Benutzern required
                'id':id,
                'Einstellungsdatum' : bewertung.Einstellungsdatum,
                'Nickname' : bewertung.Nickname,
                'Bewertung':bewertung.Bewertung,
                'bewertung':null
            };

            //Füge JSON-String des Matches in DB ein
            client.set('Bewertung ' + id, JSON.stringify(bewertungObj));

            //Setze Contenttype der Antwort auf application/json , Location der neuen Ressource in den Header sowie 201-Created mit einer Respräsentation des
            //neuen Matches im Body
            res.set("Content-Type", 'application/json').set("Location", "/Bewertung/" + id).status(201).json(bewertungObj).end();
        });
    }
});

//Ändert die Informationen eines Matches
// app.put('/:BewertungId',function(req, res) {
//
//     var contentType = req.get('Content-Type');
//
//     //Wenn kein json geliefert wird antwortet der Server mit 406- Not acceptable und zeigt über accepts-Header gütlige ContentTypes
//     if (contentType != "application/json") {
//
//         //Teile dem Client einen unterstuetzten Type mit
//         res.set("Accepts", "application/json").status(415).end();
//     }
//
//     else {
//
//         var bewertungId = req.params.BewertungId;
//
//         //Exists returns 0 wenn der angegebe Key nicht existiert, 1 wenn er existiert
//         client.exists('Bewertung ' + bewertungId, function(err, IdExists) {
//
//             //client.exists hat false geliefert
//             if (!IdExists) {
//                 res.status(404).end();
//             }
//
//             //Match existiert
//             else {
//
//                 //Lese aktuellen Zustand des Turniers aus DB
//                 client.mget('Bewertung '+ bewertungId,function(err,bewertungdata){
//
//                     var bewertungdaten = JSON.parse(bewertungdata);
//
//                     //Aktualisiere änderbare Daten
//
//                     Bewertungdaten.Einstellungsdatum = req.body.Einstellungsdatum;
//                     Bewertungdaten.Nickname = req.body.Nickname;
//                     Bewertungdaten.Bewertung = req.body.Bewertung;
//
//                     //Schreibe Turnierdaten zurück
//                     client.set('Trade ' + tradeId,JSON.stringify(Tradedaten));
//
//                     //Antworte mit Erfolg-Statuscode und schicke geänderte Repräsentation
//                     res.set("Content-Type", 'application/json').status(200).json(Tradedaten).end();
//
//                 });
//             }
//         });
//     }
// });

//Löscht eine Match
app.delete('/:BewertungId', function(req, res) {

    var bewertungId = req.params.BewertungId;

    client.exists('Bewertung ' + bewertungId, function(err, IdExists) {

        // Match unter der angegebenen ID existiert in der DB
        if(IdExists == 1) {

            //Lösche Eintrag aus der DB
            client.del('TBewertung ' + bewertungId);

            //Alles ok , sende 200
            res.status(204).end();
        }

        // Match existierte nicht
        else {
            res.status(404).end();
        }
    });
});

module.exports = app;
