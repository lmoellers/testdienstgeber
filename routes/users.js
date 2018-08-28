var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var assert = require('assert');

var url = 'mongodb://localhost:27017/test';

/*GET Users*/

router.get('/', function(req, res, next){
  //res.render('index');
  res.send({type:'GET'});
  res.send(console.log('GET Rückgabe'));
});

router.get('/get-data', function(req, res, next){
  var resultArray = [];
  mongo.connect(url, function(err, db){
    assert.equal(null, err);
    var cursor = db.collection('user-data').find();
    newUser.forEach(function(doc, err){
      assert.equal(null, err);
      resultArray.push(doc);
    }, function(){
      db.close();
      res.render('index', {items: resultArray});
    });
  });
});

//Neu einfügen in die Datenbank
router.post('/insert', function(req, res, next){
  var userItem = {
    name: req.body.name,
    alter: req.body.alter,
    nickname: req.body.nickname,
    wohnort: req.body.wohnort
  };
  mongo.connect(url, function(err, db){
    assert.equal(null, err);
    db.collection('user-data').insertOne(userItem, function(err, result){
      assert.equal(null, err);
      console.log('User Item inserted');
      db.close();
    });
  });
  res.redirect('/');
});

//Object aktualisieren
router.post('/update', function(req, res, next){

});

//Objekt aus der Datenbank entfernen
router.post('/delete', function(req, res, next){

});

console.log('Alles super!');
module.exports = router;
