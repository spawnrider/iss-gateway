var express = require('express');
var router = express.Router();
var logging = require('../helpers/logging');
var domoticz = require('../helpers/domoticz');
var q = require('q');


/* GET devices listing. */
router.get('/', function (req, res, next) {

  // Get all devices (including "no room" devices)
  q.all([
      domoticz.getDevices().then(retrieveDevices),
      domoticz.getCameras().then(retrieveCamera),
      domoticz.getScenes().then(retrieveScene)
  ]).then(function (devices) {
    var arDevices = devices[0];
    arDevices.push.apply(arDevices, devices[1]);
    arDevices.push.apply(arDevices, devices[2]);

    // send response
    res.send({
      'devices': arDevices
    });
  });
});

/*

GET /devices/scene1/action/launchScene 404 1.051 ms - 46
GET /devices/3/action/setStatus/1 404 0.970 ms - 46
GET /devices/4/action/setStatus/1 404 1.334 ms - 46
GET /devices/9/action/setLevel/100 404 1.097 ms - 46
*/

/* GET devices actions (execute ImperiHome actions). */
router.get('/:id/action/:action/:param?', function (req, res, next) {
  var reqId = req.params.id;
  var reqAction = req.params.action;
  var reqParam = req.params.param;

  logging.log("Send action " + reqAction + " to id " + reqId + " with param " + reqParam);

  res.send(domoticz.parseAction(reqAction, reqId, reqParam));

});

/**
 * Retrieve (and sort/filter if needed) Domoticz devices
 * @param   {object} response JSON Response
 * @returns {Array}  ImperiHome device array
 */
function retrieveDevices(response) {
  logging.log("Retrieve devices");
  //logging.log('Response : ' + JSON.stringify(response));
  var devices = [];

  if (response.result) {
    var sDevices = response.result;
    for (var i = 0, len = sDevices.length; i < len; i++) {
      var device = sDevices[i];
      // Push new device array into existing one
      devices.push.apply(devices, domoticz.convertDevice(device));
    }
  }

  return devices;
};

/**
 * Retrieve (and sort/filter if needed) Domoticz camera devices
 * @param   {object} response JSON Response
 * @returns {Array}  ImperiHome camera device array
 */
function retrieveCamera(response) {
  logging.log("Retrieve cameras");
  //logging.log('Response : ' + JSON.stringify(response));
  var cameras = [];

  if (response.result) {
    var sDevices = response.result;
    for (var i = 0, len = sDevices.length; i < len; i++) {
      var camera = sDevices[i];
      // Push new camera into existing array
      cameras.push(domoticz.convertCamera(camera));
    }
  }

  return cameras;
};

/**
 * Retrieve (and sort/filter if needed) Domoticz scenes
 * @param   {object} response JSON Response
 * @returns {Array}  ImperiHome scenes array
 */
function retrieveScene(response) {
  logging.log("Retrieve scenes");
  //logging.log('Response : ' + JSON.stringify(response));
  var scenes = [];

  if (response.result) {
    var sDevices = response.result;
    for (var i = 0, len = sDevices.length; i < len; i++) {
      var scene = sDevices[i];
      // Push new scene into existing array
      scenes.push(domoticz.convertScene(scene));
    }
  }

  return scenes;
};

module.exports = router;
