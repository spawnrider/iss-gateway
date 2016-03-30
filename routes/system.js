var express = require('express');
var nconf = require('nconf');
var router = express.Router();

/* GET System info */
router.get('/', function(req, res, next) {
    res.send({ id: 'ISS-Gateway v'+nconf.get('version') , apiversion: 1});
});

module.exports = router;
