var app = express.Router();

//Liefert eine Collection aller Austragungsorte im System
app.get('/',function(req,res){

    //Speichert alle Austragungsort
    var response=[];

    //returned ein Array aller Keys die das Pattern Austragungsort* matchen
    client.keys('Standort *', function (err, key) {

        //Collection ist leer, zeige dies mit leerem Array im Body
        //Abruf war dennoch erfolgreich , daher 200-OK
        if(key.length == 0) {
            res.status(200).json(response).end();
            return;
        }

        var sorted =  key.sort();

        //Lese austragungsorte aus Redis
        client.mget(sorted, function (err, standort) {

            //Pushe alle Antworten in ein Array, bevor Sie zurück gegeben werden
            standort.forEach(function (val) {
                response.push(JSON.parse(val));
            });

            res.status(200).set("Content-Type","application/json").json(response).end();
        });
    });
});

//Liefert eine Repräsentation eines Austragungsortes
app.get('/:StandortId', function(req, res) {

    //Angefragte Id extrahieren
    var standortId = req.params.StandortId;

    //Exists returns 0 wenn der angegebe Key nicht existiert, 1 wenn er existiert
    client.exists('Standort ' + standortId, function(err, IdExists) {

        //Die Lokalitaet existiert im System und ist nicht für den Zugriff von außen gesperrt
        if (!IdExists) {
            res.status(404);
            res.end();
        }

        //Angefragte Ressource existiert
        else{

            var acceptedTypes = req.get('Accept');

            //Frage Content types die der client verarbeiten kann ab
            switch (acceptedTypes) {

                    //Client erwartet content type application/json
                case "application/json":

                    client.mget('Standort ' + standortId, function(err,standortdata){

                        var Standortdaten = JSON.parse(standortdata);

                        //Setze Contenttype der Antwort auf application/json
                        res.set("Content-Type", 'application/json').status(200).json(Standortdaten).end();
                    });
                    break;

                    //Service kann keinen im Accept header angegebenen content Type unterstützen
                default:
                    //Der gesendete Accept header enthaelt kein unterstuetztes Format
                    res.status(406).end();
                    break;
            }
        }
    });
});

//Fügt der Collection aller Austragungsorte einen neuen hinzu
app.post('/',function(req, res) {

    //Abruf eines Tisches, nur dann wenn client html verarbeiten kann
    var contentType = req.get('Content-Type');

    //Wenn kein json geliefert wird antwortet der Server mit 415 - unsupported Media Type und zeigt über accepts-Header gütlige ContentTypes
    if (contentType != "application/json") {
        //Teile dem Client einen unterstuetzten Type mit
        res.set("Accepts", "application/json").status(415).end();
    }

    else{

        //Post liefert eine Repräsentation der angelegten Ressource zurück, daher muss der Client JSON verarbeiten können
        var acceptedTypes = req.get('Accept');

        //Frage Content types die der client verarbeiten kann ab
        switch (acceptedTypes) {

                //Client erwartet content type application/json
            case "application/json":

                var Standort = req.body;

                // AustragungsortId in redis erhöhen, atomare Aktion
                client.incr('StandortId', function(err, id) {

                    //In redis abgelegtes Objekt
                    var standortObj={
                        'id' : id,
                        'Name': Standort.Name,
                        'Adresse': Standort.Adresse,
                        'Beschreibung': Standort.Beschreibung
                    };

                    //Pflege daten in DB
                    client.set('Standort ' + id, JSON.stringify(standortObj));

                    //Setze Contenttype der Antwort auf application/json
                    res.set("Content-Type", 'application/json').set("Location", "/Standort/" + id).status(201).json(standortObj).end();
                });

                break;

                //Service kann keinen im Accept header angegebenen content Type unterstützen
            default:
                //Der gesendete Accept header enthaelt kein unterstuetztes Format
                res.status(406).end();
                break;
        }
    }
});

//Ändert die Daten eines Austragungsortes, Alle Daten können geändert werden , da der Austragungsort über keine Read-Only Felder verfügt.
app.put('/:StandortId', function(req, res) {

    //Abruf eines Tisches, nur dann wenn client html verarbeiten kann
    var contentType = req.get('Content-Type');

    //Wenn kein json geliefert wird antwortet der Server mit 415 - unsupported Media Type und zeigt über accepts-Header gütlige ContentTypes
    if (contentType != "application/json") {
        //Teile dem Client einen unterstuetzten Type mit
        res.set("Accepts", "application/json").status(415).end();
    }

    else {

        //Post liefert eine Repräsentation der angelegten Ressource zurück, daher muss der Client JSON verarbeiten können
        var acceptedTypes = req.get('Accept');

        //Frage Content types die der client verarbeiten kann ab
        switch (acceptedTypes) {

                //Client erwartet content type application/json
            case "application/json":

                //Extrahiere Id aus der Anfrage
                var standortId = req.params.StandortId;
                var Standort = req.body;

                //Exists returns 0 wenn der angegebe Key nicht existiert, 1 wenn er existiert
                client.exists('Standort ' + standortId, function(err, IdExists) {

                    //client.exists hat false geliefert
                    if (!IdExists) {
                        res.status(404).end();
                    }

                    //Ressource existiert
                    else {

                        //Lese aktuellen Zustand des Turniers aus DB
                        client.mget('Standort '+standortId,function(err,standortdata){

                            var Standortdaten = JSON.parse(standortdata);

                            //Aktualisiere änderbare Daten
                            Standortdaten.Name = Standort.Name;
                            Standortdaten.Adresse = Standort.Adresse;
                            Standortdaten.Beschreibung = Standort.Beschreibung;


                            //Schreibe Turnierdaten zurück
                            client.set('Standort ' + standortId,JSON.stringify(Standortdaten));


                            //Antorte mit Erfolg-Statuscode und schicke geänderte Repräsentation
                            res.set("Content-Type", 'application/json').status(200).json(Standortdaten).end();
                        });
                    }
                });
                break;

                //Service kann keinen im Accept header angegebenen content Type unterstützen
            default:
                //Der gesendete Accept header enthaelt kein unterstuetztes Format
                res.status(406).end();
                break;
        }
    }
});

//Löscht einen Austragungsort aus dem System
app.delete('/:StandortId', function(req, res) {

    //Extrahiere Id aus der Anfrage
    var standortId = req.params.StandortId;

    //Prüfe ob Lokalitaet existiert
    client.exists('Standortt ' + standortId, function(err, IdExists) {

        //Lokalitaet existiert
        if(IdExists) {

            //Speichert die alle Benutzer
            var response=[];

            //returned ein Array aller Keys die das Pattern Match* matchen , der gelöschte AUstragungsort wird aus allen
            //Matches entfernt , die bei ihm ausgetragen werden sollten
            client.keys('Trade *', function (err, key) {

                if(key.length == 0) {
                    client.del('Standort ' + standortId);
                    res.status(200).json(response).end();
                    return;
                }

                client.mget(key, function (err, match) {

                    //Frage alle diese Keys aus der Datenbank ab und pushe Sie in die Response
                    trade.forEach(function (val) {

                        var dieserTrade = JSON.parse(val);

                        if(dieserTrade.Standort) {

                            var ortURI = "/Standort/"+standortId;

                            var ortURI2 = dieserTrade.Standort.split("/");

                            var ortmittrade = ortURI+'/'+ortURI2[3]+'/'+ortURI2[4];

                            if(dieserTrade.Standort == ortURI || dieserTrade.Standort == ortmittrade) {

                                dieserTrade.Standort = null;

                                client.set('Trade '+dieserTrade.id,JSON.stringify(dieserTrade));

                                //Entferne EIntrag aus der Datenbank
                                client.del('Standort ' + standortId);

                                //Alles ok , sende 200
                                res.status(200);
                                //Antwort beenden
                                res.end();
                            }
                        }
                        else {
                            client.del('Standort ' + standortId);

                            //Alles ok , sende 200
                            res.status(200);
                            //Antwort beenden
                            res.end();
                        }
                    });
                });

            });
        }

        else {
            res.status(404);
            res.end();
        }

    });
});

module.exports = app;
