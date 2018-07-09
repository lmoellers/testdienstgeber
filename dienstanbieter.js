var express = require ('express');
//var redis = require ('redis');
//var client = redis.createClient();
//var util = require ('util');

var client = require('redis').createClient(process.env.REDIS_URL);
var Redis = require('ioredis');
var redis = new Redis(process.env.REDIS_URL);

var app = express();
var bodyParser = require ('body-parser');

app.use(bodyParser.json());

app.set('port', process.env.PORT || 3000);

app.get('/', function(req,res){

  var acceptedTypes = req.get('Accept');

  switch (acceptedTypes) {
    case "application/json":

    var response = [];

    client.keys('User *', function(err, key){
      if(key.length == 0){
        res.status(200).json(response).end();
        return;
      }

      var sorted = key.sort();
      client.mget(sorted, function (err, user){
        user.forEach(function(val){
          var user = JSON.parse(val);

          if (user.isActive != 0){
            response.push(JSON.parse(val));
          }
        });

        res.status(200).set("Content-Type", "application/json").json(response).end();

      });
    });

      break;
    default:
    res.status(406).end();

  }
});

app.get('/user/:id', function(req, res){

var id = req.params.id;

// client.exists('User ' + id, function(err, Idexists){
//
//   if(Idexists){
//     client.mget('User ' + id, function(err, userdata){
//
//       var userObj = JSON.parse(userdata);
//
//       if(Idexists==1 && userObj.isActive == 1){
//         var acceptedTypes = req.get('Accept');
//         switch (acceptedTypes) {
//           case "application/json":
//
//           client.mget('User ' + id, function(err, userdata){
//
//             var userData = JSON.parse(userdata);
//             res.set("Content-Type", 'application/json').status(200).json(userData).end();
//           });
//
//             break;
//           default:
//
//             var userRel={
//               "href":"/user",
//             };
//             res.status(406).json(userRel).end();
//         }
//       }else if (Idexists==1 && userObj.isActive == 0){
//         res.status(404).end();
//       }
//     });
//   }else {
//     res.status(404).end();
//   }
//
// });


client.get('User ' + id, function(req, res){
  if(rep){
    res.type('json').send(rep);
  }else{
    res.status(404).type('text').send('Der User mit der ID ' + id + ' existiert nicht.');
  }
});

});


app.post('/', function(req, res){

var contentType = req.get('Content-Type');

if (contentType != "application/json"){
  res.set("Accepts", "application/json").status(415).end();
}else{
  var User = req.body;

  client.incr('id', function(err, id){
    var userObj={
      'id' : id,
      'nickname' : User.nickname,
      'trade' : [],
      'notepad' : [],
      'bewertung' : [],
      'isActive' : 1
    };
    client.set('User ' + id, JSON.stringify(userObj));
    res.set("Content-Type", 'application/json').set("Location", "/User/" + id).status(201).json(userObj).end();
  });
}

});

app.put('/user/:id', function (req, res){

  var contentType = req.get('Content-Type');

  if (contentType != "application/json"){
    res.set("Accepts", "application/json").status(415).end();
  }else{
    var id = req.params.id;

    client.exists('User ' + id, function (err, Idexists){
      if(!Idexists){
        res.status(404).end();
      }else{

        client.mget('User ' + id, function(err, userData){
        var userData = JSON.parse(userData);

        if(userData.isActive == 0){
          res.status(404).end();
          return;
        }

        userData.nickname = req.body.nickname;
        client.set('User ' + id, JSON.stringify(userData));
        res.set("Content-Type", 'application/json').json(userData).status(200).end();

      });

      }
    });
  }
});

app.delete('/user/:id', function(req, res){
  var id = req.params.id;

  client.exists('User ' + id, function(err, Idexists){
    if(Idexists == 1){
      client.mget('User ' + id, function(err, userData){
        var userObj = JSON.parse(userData);

        if(userObj.isActive == 0){
          res.status(404).end();
          return;
        }
        userObj.isActive = 0;
        client.set('User ' + id, JSON.stringify(userObj));
        res.status(404).end();
      });
    }else{
      res.status(404).end();
    }
  });
});







client.on('error' , function (err){
  console.log(err);
  process.exit(1);
});

app.listen(app.get('port'), function(){
  console.log('Server is running on port ' + app.get('port'));
});
