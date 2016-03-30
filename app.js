var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var nconf = require('nconf');

var domoticz = require('./helpers/domoticz');

var system = require('./routes/system');
var devices = require('./routes/devices');
var rooms = require('./routes/rooms');

var app = express();

/* Configuration entries are read from command line, from environment and from Config file */
nconf.argv()
  .env();

nconf.add('user', {
  type: 'file',
  file: 'config.json'
});

nconf.add('package', {
  type: 'file',
  file: 'package.json'
});

nconf.load();

console.log("----------------------------------------------------------------------");
console.log("ISS-Gateway for Domoticz v" + nconf.get('version'));
console.log("Config file is " + path.resolve(__dirname, 'config.json'));
console.log("Domoticz is configured on " + domoticz.getURL());

console.log("----------------------------------------------------------------------");

if (nconf.get("debug") === true)
  app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

/* For all ImperiHome Standard System API routes */
/* See http://dev.evertygo.com/api/iss# */
app.use('/', system);
app.use('/system', system);
app.use('/devices', devices);
app.use('/rooms', rooms);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not found');
  err.status = 404;
  next(err);
});

// error handlers
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: err
  });
});


module.exports = app;
