var express = require('express');
var router = express.Router();
var mongo = require('mongodb').MongoClient;
var objectID = require('mongodb').ObjectID;
var assert = require('assert');

var url = 'mongodb://localhost:27017/test';

/*GET Users*/

router.get('/', function(req, res, next){
  //res.render('index');
});

//Alle User ausgeben
router.get('/get-user-data', function(req, res, next){
  mongo.connect(url, { useNewUrlParser: true }, function(err, db){
    //res.send({type: 'GET'});
    assert.equal(null, err);
    var dbo = db.db("test");
    dbo.collection("user-data").find({}).toArray(function(err, allUser) {
      console.log(allUser);
      db.close();
      res.setHeader("Content-Type", "application/json");
      res.send({allUser});
      res.end();
    });
  });
});

//Neuen User einfügen
router.post('/get-user-data', function(req, res, next){
  mongo.connect(url, { useNewUrlParser: true }, function(err, db){
    assert.equal(null, err);
    var dbo = db.db("test");
    var userItem = {
     name: req.body.name,
     alter: req.body.alter,
     nickname: req.body.nickname,
     wohnort: req.body.wohnort
   };
   dbo.collection("user-data").insertOne(userItem, function(err, res){
     console.log(" New User inserted");
     //console.log(res.userItem);
     db.close();

   });
  });
  res.send({userItem});
});



//Object aktualisieren

router.put('/get-user-data/:id', function(req, res, next){
  //assert.equal(null, err);
  var userItem = {
    name: req.body.name,
    alter: req.body.alter,
    nickname: req.body.nickname,
    wohnort: req.body.wohnort
  };
  var id = req.params.id;
  mongo.connect(url, {useNewUrlParser: true}, function (err, db){
    assert.equal(null, err);
    var dbo = db.db("test");
    dbo.collection("user-data").updateOne({"_id": objectID(id)}, {$set: userItem}, function(err, result){
      console.log("User updated!");
      db.close();
    });
  });
  res.send(userItem);
});




//Objekt aus der Datenbank entfernen
router.delete('/get-user-data/:id', function(req, res, next){
  var id = req.params.id;
  mongo.connect(url, {useNewUrlParser: true}, function (err, db){
    assert.equal(null, err);
    var dbo = db.db("test");
    dbo.collection("user-data").deleteOne({"_id": objectID(id)}, function(err, result){
      console.log("User delete!");
      db.close();
    });
  });
  res.send("User mit der Id: " + req.params.id + " wurde gelöscht");
});

console.log('User läuft!');
module.exports = router;
