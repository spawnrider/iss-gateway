var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var nconf = require('nconf');
var basicAuth = require('basic-auth');

var domoticz = require('./helpers/domoticz');

var system = require('./routes/system');
var devices = require('./routes/devices');
var rooms = require('./routes/rooms');

var path = require('path');
var directory = path.resolve(__dirname);

var app = express();

var globalConfigFile = '/etc/iss-gateway.json';

/* Configuration entries are read from :
- Command line, 
- Environment,
- User config file /etc/iss-gateway.json
- Finally from Global config file 
*/

nconf.argv()
    .env();

nconf.file('user', {
    type: 'file',
    file: globalConfigFile
});

nconf.file('global', {
    type: 'file',
    file: directory + '/config.json'
});

nconf.file('package', {
    type: 'file',
    file: directory + '/package.json'
});

console.log("------------------------------------------------------------------------------------");
console.log("ISS-Gateway for Domoticz v" + nconf.get('version'));
console.log("Global config file is " + path.resolve(__dirname, 'config.json'));
console.log("User config must be placed in " + globalConfigFile);
console.log("Domoticz is configured on " + domoticz.getURL());
console.log("------------------------------------------------------------------------------------");

if (nconf.get("debug") === true)
    app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

/**
 * Authentication method for all API routes
 * @param {object}   req  Request
 * @param {object}   res  Result
 * @param {[[Type]]} next Next function
 */
var auth = function (req, res, next) {
    if (!nconf.get("auth") || nconf.get("auth") === null) {
        console.log("No authentication provided");
        next();
        return;
    }

    var username = nconf.get("auth:username");
    var password = nconf.get("auth:password");

    var user = basicAuth(req);
    if (!user || !user.name || !user.pass) {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        res.sendStatus(401);
        return;
    }
    if (user.name === username && user.pass === password) {
        next();
    } else {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        res.sendStatus(401);
        return;
    }
}

/* For all ImperiHome Standard System API routes */
/* See http://dev.evertygo.com/api/iss# */
app.use('/', auth, system);
app.use('/system', auth, system);
app.use('/devices', auth, devices);
app.use('/rooms', auth, rooms);

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