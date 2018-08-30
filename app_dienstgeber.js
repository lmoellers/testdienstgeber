var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('express-handlebars');

var users = require('./routes/users');
var app = express();


app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cookieParser());


app.use('/users', users);



app.listen(process.env.PORT || 8080, () => console.log('App_Dienstgeber läuft!'));
