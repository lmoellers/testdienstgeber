var app = express.Router();

//Liefert eine Collection aller existierenden Benutzer
//Hier werden ganze Repräsentationen übertragen , man hätte auch lediglich Links übertragen können .
//Da die Benutzer jedoch IDs in ihren Repräsentationen haben , können die Locations ihre Locations darüber ermittelt werden
app.get('/',function(req,res){

    //Headerfeld Accept abfragen
    var acceptedTypes = req.get('Accept');

    //Service kann bislang nur mit json-repräsentationen antworten
    switch (acceptedTypes) {

            //client kann application/json verarbeiten
        case "application/json":

            //Speichert die alle Benutzer
            var response=[];

            //returned ein Array aller Keys die das Pattern Benutzer* matchen
            client.keys('User *', function (err, key) {

                //Es gibt keine Benutzer in dieser Collection , liefere leeres array
                if(key.length == 0) {
                    //Dennoch war der Abruf erfolgreich , liefere leere Collection
                    res.status(200).json(response).end();
                    return;
                }

                var sorted = key.sort();

                //Sortiere die Keys
                client.mget(sorted, function (err, user) {

                    //Frage alle diese Keys aus der Datenbank ab und pushe Sie in die Response
                    benutzer.forEach(function (val) {

                        var einUser = JSON.parse(val);

                        //Benutzer soll nur ereichbare sein ,wenn er nicht gesperrt ist
                        if(einUser.isActive != 0) {

                            //Pushe Daten
                            response.push(JSON.parse(val));
                        }
                    });

                    //Abfrage war erfolgreich
                    res.status(200).set("Content-Type","application/json").json(response).end();
                });
            });
            break;

        default:
            res.status(406).end();
            break;
    }
});

//Liefert eine Repräsentation eines Benutzers mit <BenutzerId>
app.get('/:UserId', function(req, res) {

    //BenutzerId aus der URI extrahieren
    var userId = req.params.BenutzerId;

    //Exists returns 0 wenn der angegebe Key nicht existiert, 1 wenn er existiert
    client.exists('User ' + userId, function(err, IdExists) {

        if(IdExists){

            client.mget('User ' + benutzerId, function(err, userData) {

                var userObj=JSON.parse(userData);

                //Es soll zukünftig möglich sein Benutzerseiten für den Zugriff von außen zu Sperren , daher das Flag "isActive"
                //in diesem Fall existiert der Benutzer und ist nicht gesperrt
                if(IdExists==1 && userObj.isActive == 1) {

                    //Headerfeld Accept abfragen
                    var acceptedTypes = req.get('Accept');

                    //Service kann bislang nur mit json-repräsentationen antworten
                    switch (acceptedTypes) {

                            //client kann application/json verarbeiten
                        case "application/json":

                            //Lese Benutzerdaten aus DB
                            client.mget('User ' + userId, function(err,userdata){

                                //Parse redis Antwort
                                var Userdaten = JSON.parse(userdata);

                                //Setze Contenttype der Antwort auf application/json, zeige mit 200-OK erfolg
                                res.set("Content-Type", 'application/json').status(200).json(Userdaten).end();
                            });
                            break;

                        default:
                            //Der gesendete Accept header enthaelt kein unterstuetztes Format , 406 - Notacceptable
                            //Includiere Servicedokument oder Benutzercollection Link um dem Client einen Hinweis zu geben wie das Problem
                            //zu beheben ist.
                            var userRel={
                                "href":"/User",
                            };
                            res.status(406).json(userRel).end();
                            break;
                    }
                }

                //Ressource für den Zugriff von außen gesperrt ,aber vorhanden , hier könnte in der Zukunft
                //etwas anderes als 404 passieren
                else if(IdExists == 1 && userObj.isActive == 0) {
                    res.status(404).end();
                }
            });
        }

        //Ressource nicht gefunden
        else {
            res.status(404).end();
        }
    });
});


//Ändert die Informationen eines Benutzers
app.put('/:UserId', function(req, res) {

    var contentType = req.get('Content-Type');

    //Wenn kein json geliefert wird antwortet der Server mit 415-unsupported media type und zeigt über accepts-Header gütlige ContentTypes
    if (contentType != "application/json") {
        res.set("Accepts", "application/json").status(415).end();
    }

    //Content type war OK
    else {
        var userId = req.params.userId;

        //Exists returns 0 wenn der angegebe Key nicht existiert, 1 wenn er existiert
        client.exists('User ' + userId, function(err, IdExists) {

            //client.exists hat false geliefert
            if (!IdExists) {
                res.status(404).end();
            }

            //Benutzer ist vorhanden
            else {

                //Lese aktuellen Zustand des Benutzers aus der DB
                client.mget('User '+userId,function(err,userdata){


                    //Parse Redis Antwort
                    var Userdaten = JSON.parse(userdata);


                    if(Userdaten.isActive == 0) {
                        res.status(404).end();
                        return;
                    }

                    //Aktualisiere änderbare Daten
                    Userdaten.nickname = req.body.nickname;


                    //Schreibe Turnierdaten zurück
                    client.set('User ' + benutzerId,JSON.stringify(Userdaten));

                    //Antorte mit Erfolg-Statuscode und schicke geänderte Repräsentation
                    res.set("Content-Type", 'application/json').json(Userdaten).status(200).end();

                });
            }
        });
    }
});

//Fügt der Benutzer/ Collection ein neues Element hinzu
app.post('/', function(req, res) {

    //Content Type der Anfrage abfragen
    var contentType = req.get('Content-Type');

    //Check ob der Content Type der Anfrage json ist
    if (contentType != "application/json") {
        res.set("Accepts", "application/json").status(415).end();
    }

    //Content type war in Ordnung (application/json)
    else{

        //Lese request body aus
        var User=req.body;

        // BenutzerId in redis erhöhen, atomare Aktion
        client.incr('UserId', function(err, id) {

            //JSON Objekt das als String in redis eingefügt wird
            var userObj={
                'id' : id,
                'Name': User.Name,
                'Nickname': User.Nickname;
                'isActive': 1
            };

            //Füge JSON-String in DB ein
            client.set('User ' + id, JSON.stringify(userObj));

            //Setze Contenttype der Antwort auf application/json und sende 201-created bei erfolgreichem POST
            //Includiere Location Header mit URL der neu angelegten Ressource
            res.set("Content-Type", 'application/json').set("Location", "/User/" + id).status(201).json(userObj).end();
        });
    }
});

//Löscht einen Benutzer aus dem System
app.delete('/:UserId', function(req, res) {

    var userId = req.params.userId;

    //Gibt des den Benutzer mit dieser Id?
    client.exists('User ' + userId, function(err, IdExists) {

        //Der Benutzer existiert
        if(IdExists == 1){

            //Benutzerdaten sollen für statistische Zwecke auch beim löschen erhalten
            //bleiben , da hier evtl. noch Informationen über gewonnene Matches o.Ä eingepflegt werden
            client.mget('User ' + userId, function(err, userData) {

                //Parse redis antwort
                var userObj=JSON.parse(userData);

                //Benutzer existiert und ist nicht gesperrt
                if(userObj.isActive == 0) {
                    res.status(404).end();
                    return;
                }


                userObj.isActive = 0;


                //Schreibe Benutzerdaten zurück
                client.set('User ' + userId,JSON.stringify(userObj));

                //Alles ok , sende 204-No content für erfolgreiches löschen
                res.status(204).end();
            });
        }
        else {
            // Benutzer existiert nicht
            res.status(404).end();
        }
    });
});

module.exports = app;
