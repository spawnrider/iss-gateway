var nconf = require('nconf');
var request = require('./request');
var logging = require('./logging');

var domoticz = {};

/**
 * Return the Domoticz URL
 * @returns {[[Type]]} Domoticz URL string
 */
domoticz.getURL = function () {
  var protocole = nconf.get('domoticz:ssl') === true ? 'https' : 'http';
  var host = nconf.get('domoticz:host');
  var port = nconf.get('domoticz:port');
  var path = nconf.get('domoticz:path');
  var cmd = "json.htm";

  // In case of AUTH Basic authentication
  var secure = false;
  if (nconf.get('domoticz:auth') && nconf.get('domoticz:auth:username') && nconf.get('domoticz:auth:password')) {
    var secure = nconf.get('domoticz:auth:username') + ":" + nconf.get('domoticz:auth:password') + "@";
  }

  if (secure) {
    var url = protocole + '://' + secure + host + ':' + port + path + cmd;
  } else {
    var url = protocole + '://' + host + ':' + port + path + cmd;
  }

  return url;
};

/**
 * Convert Domoticz scene to an ImperiHome scene
 * @param   {object} scene Domoticz scene
 * @returns {object} ImperiHome scene object
 */
domoticz.convertScene = function (scene) {
  var device = {};

  device.id = 'scene-' + scene.idx,
    device.name = scene.Name,
    device.type = 'DevScene',
    device.room = '',
    device.params = [];
  device.params.push({
    'key': 'LastRun',
    'value': scene.LastUpdate
  });

  return device;
}

/**
 * Convert Domoticz camera device to an ImperiHome camera device.
 * @param   {object} camera Domoticz camera device
 * @returns {object} ImperiHome camera device object
 */
domoticz.convertCamera = function (camera) {
  var device = {};

  device.id = 'camera-' + camera.idx;
  device.name = camera.Name;
  device.type = 'DevCamera';
  device.room = ""; //no room by default
  device.params = [];

  // FIXME: Seems to currently not working with D-Link DCS 932L.
  //var cameraURL = "http://" + camera.Username + ":" + camera.Password + "@" + camera.Address + ':' + camera.Port + '/';
  var cameraURL = "http://" + camera.Address + ':' + camera.Port + '/';
  //var cameraURL = "http://" + camera.Address + '/';

  device.params.push({
    'key': 'localjpegurl',
    'value': cameraURL + camera.ImageURL
  });

  device.params.push({
    'key': 'remotejpegurl',
    'value': cameraURL + camera.ImageURL
  });

  // "url_cam_video": "video/mjpg.cgi"
  if (nconf.get('domoticz:url_cam_video')) {
    device.params.push({
      'key': 'localmjpegurl',
      'value': cameraURL + nconf.get('domoticz:url_cam_video')
    });

    device.params.push({
      'key': 'remotemjpegurl',
      'value': cameraURL + nconf.get('domoticz:url_cam_video')
    });
  }
  device.params.push({
    'key': 'Login',
    'value': camera.Username
  });

  device.params.push({
    'key': 'Password',
    'value': camera.Password
  });

  return device;
}

/**
 * Convert Domoticz device(s) to ImperiHome device(s).
 * It can return multiples devices for specific sensors (Temperature, Humidity, & Barometer).
 * @param {object} device Domoticz device
 * @returns {Array} ImperiHome device array
 */
domoticz.convertDevice = function (device) {
  var arDevices = [];

  // TODO: Add history system and change graphable attribue to true
  switch (device.Type) {
  case 'Temp':
    var newDevice = {};
    newDevice.id = device.idx + '-t';
    newDevice.name = device.Name;
    newDevice.type = 'DevTemperature';
    newDevice.room = device.PlanID != 0 ? device.PlanID : "";
    newDevice.params = [];
    var param = {};
    param.key = 'Value';
    param.value = device.Temp;
    param.unit = '°C';
    param.graphable = false;
    newDevice.params.push(param);
    arDevices.push(newDevice);
    break;
  case 'Temp + Humidity':
    var newDevice = {};
    newDevice.id = device.idx + '-t';
    newDevice.name = device.Name;
    newDevice.type = 'DevTemperature';
    newDevice.room = device.PlanID != 0 ? device.PlanID : "";
    newDevice.params = [];
    var param = {};
    param.key = 'Value';
    param.value = device.Temp;
    param.unit = '°C';
    param.graphable = false;
    newDevice.params.push(param);
    arDevices.push(newDevice);

    var newDevice = {};
    newDevice.id = device.idx + '-h';
    newDevice.name = device.Name;
    newDevice.type = 'DevHygrometry';
    newDevice.room = device.PlanID != 0 ? device.PlanID : "";
    newDevice.params = [];
    var param = {};
    param.key = 'Value';
    param.value = device.Humidity;
    param.unit = '%';
    param.graphable = false;
    newDevice.params.push(param);
    arDevices.push(newDevice);
    break;
  case 'Temp + Humidity + Baro':
    var newDevice = {};
    newDevice.id = device.idx + '-t';
    newDevice.name = device.Name;
    newDevice.type = 'DevTemperature';
    newDevice.room = device.PlanID != 0 ? device.PlanID : "";
    newDevice.params = [];
    var param = {};
    param.key = 'Value';
    param.value = device.Temp;
    param.unit = '°C';
    param.graphable = false;
    newDevice.params.push(param);
    arDevices.push(newDevice);

    var newDevice = {};
    newDevice.id = device.idx + '-h';
    newDevice.name = device.Name;
    newDevice.type = 'DevHygrometry';
    newDevice.room = device.PlanID != 0 ? device.PlanID : "";
    newDevice.params = [];
    var param = {};
    param.key = 'Value';
    param.value = device.Humidity;
    param.unit = '%';
    param.graphable = false;
    newDevice.params.push(param);
    arDevices.push(newDevice);

    var newDevice = {};
    newDevice.id = device.idx + '-b';
    newDevice.name = device.Name;
    newDevice.type = 'DevPressure';
    newDevice.room = device.PlanID != 0 ? device.PlanID : "";
    newDevice.params = [];
    var param = {};
    param.key = 'Value';
    param.value = device.Barometer;
    param.unit = 'mbar';
    param.graphable = false;
    newDevice.params.push(param);
    arDevices.push(newDevice);
    break;
  default: // others devices
    var newDevice = {};
    newDevice.id = device.idx;
    newDevice.name = device.Name;
    newDevice.type = this.convertDeviceType(device);
    newDevice.room = device.PlanID != 0 ? device.PlanID : "";
    newDevice.params = this.convertDeviceStatus(device);
    arDevices.push(newDevice);
    break;
  }

  return arDevices;
};

/**
 * Conver a domoticz device status to an ImperiHome device status
 * @param   {object} device Domoticz device
 * @returns {Array}  ImperiHome device status array
 */
domoticz.convertDeviceStatus = function (device) {
  var output = [];
  switch (device.Type) {
  case "Light/Switch":
  case "Lighting Limitless/Applamp":
  case "Lighting 1":
  case "Lighting 2":
    switch (device.SwitchType) {
    case 'On/Off':
      output.push({
        'key': 'Status',
        'value': 'Off' == device.Status ? '0' : '1',
      });
      break;
    case 'Push On Button':
      output.push({
        'key': 'Status',
        'value': 'Off' == device.Status ? '0' : '1',
      });
      break;
    case 'Push Off Button':
      output.push({
        'key': 'Status',
        'value': 'Off' == device.Status ? '0' : '1',
      });
      break;
    case 'Smoke Detector':
      output.push({
        'key': 'Tripped',
        'value': 'Off' == device.Status ? '0' : '1',
      });
      output.push({
        'key': 'Armed',
        'value': '1',
      });
      output.push({
        'key': 'Ackable',
        'value': '1',
      });
      output.push({
        'key': 'Armable',
        'value': '1',
      });
      break;
    case 'Door Lock':
      output.push({
        'key': 'Tripped',
        'value': 'Closed' == device.Status ? '0' : '1',
      });
      output.push({
        'key': 'Armed',
        'value': '1',
      });
      output.push({
        'key': 'Ackable',
        'value': '1',
      });
      output.push({
        'key': 'Armable',
        'value': '1',
      });
      break;
    case 'Motion Sensor':
      output.push({
        'key': 'Tripped',
        'value': 'Off' == device.Status ? '0' : '1',
      });
      output.push({
        'key': 'Armed',
        'value': '1',
      });
      output.push({
        'key': 'Ackable',
        'value': '1',
      });
      output.push({
        'key': 'Armable',
        'value': '1',
      });
      break;
    case 'Blinds Inverted':
      output.push({
        'key': 'Level',
        'value': 'Closed' == device.Status ? '0' : '100',
      });
      output.push({
        'key': 'stopable',
        'value': '0',
      });
      output.push({
        'key': 'pulseable',
        'value': '0',
      });
      break;
    case 'Blinds':
      output.push({
        'key': 'Level',
        'value': 'Closed' == device.Status ? '0' : '100',
      });
      output.push({
        'key': 'stopable',
        'value': '0',
      });
      output.push({
        'key': 'pulseable',
        'value': '0',
      });
      break;
    case 'Blinds Percentage':
      output.push({
        'key': 'Level',
        'value': 'Closed' == device.Status ? '0' : '100',
      });
      output.push({
        'key': 'stopable',
        'value': '1',
      });
      output.push({
        'key': 'pulseable',
        'value': '0',
      });
      break;
      break;
    case 'Dimmer':
      output.push({
        'key': 'Level',
        'value': 'Off' == device.Status ? '0' : '100',
      });
      output.push({
        'key': 'Status',
        'value': 'Off' == device.Status ? '0' : '1',
      });
      break;
    case 'Dusk Sensor':
      output.push({
        'key': 'Value',
        'value': device.Data,
      });
      break;
    default:
      output.push({
        'key': 'Status',
        'value': 'Off' == device.Status ? '0' : '1',
      });
    }
    break;
  case 'General':
    switch (device['Name']) {
    case (0 === device.Name.indexOf('Freebox')):
      var dataDevice = device.Data.split('.');
      var ddDevice = dataDevice[0];
      output.push({
        'key': 'Value',
        'value': ddDevice,
        'unit': 'rpm',
      });
      break;
    default:
      output.push({
        'key': 'Value',
        'value': device.Data,
        'unit': '',
      });
      break;
    }
    break;
  case 'RFY':
    output.push({
      'key': 'Level',
      'value': 'Closed' == device.Status ? '0' : '100',
    });
    output.push({
      'key': 'stopable',
      'value': '0',
    });
    output.push({
      'key': 'pulseable',
      'value': '0',
    });
    break;
  case 'UV':
    output.push({
      'key': 'Value',
      'value': device['UVI'],
      'unit': 'UVI',
    });
    break;
  case 'Lux':
    var words = device.Data.split(/\s+/);
    var data = words[0];
    output.push({
      'key': 'Value',
      'value': data,
      'unit': 'lux',
    });
    break;
  case 'Rain':
    output.push({
      'key': 'Value',
      'value': device.RainRate,
      'unit': 'mm/h',
    });
    output.push({
      'key': 'Accumulation',
      'value': device.Rain,
      'unit': 'mm',
    });
    break;
  case 'Wind':
    output.push({
      'key': 'Speed',
      'value': device.Speed,
      'unit': 'km/h',
    });
    break;
  case 'Usage':
    var words = device.Data.split(/\s+/);
    var data = words[0];
    output.push({
      'key': 'Watts',
      'value': data,
      'unit': 'Watt',
    });
    output.push({
      'key': 'ConsoTotal',
      'value': data,
      'unit': 'kWh',
    });
    break;
  case 'Current/Energy':
    var words = device.Data.split(/\s+/);
    var data = words[0];
    output.push({
      'key': 'Watts',
      'value': data,
      'unit': 'Watt',
    });
    output.push({
      'key': 'ConsoTotal',
      'value': data,
      'unit': 'kWh',
    });
    break;
  case 'Energy':
    var wordsUsage = device.Usage.split(/\s+/);
    var dataUsage = wordsUsage[0];
    var wordsData = device.Data.split(/\s+/);
    var dataData = wordsData[0];
    output.push({
      'key': 'Watts',
      'value': dataUsage,
      'unit': 'Watt',
    });
    output.push({
      'key': 'ConsoTotal',
      'value': dataData,
      'unit': 'kWh',
    });
    break;
  case 'P1 Smart Meter':
    var wordsUsage = device.Usage.split(/\s+/);
    var dataUsage = wordsUsage[0];
    var wordsData = device.CounterToday.split(/\s+/);
    var dataData = wordsData[0];
    output.push({
      'key': 'Watts',
      'value': dataUsage,
      'unit': 'Watt',
    });
    output.push({
      'key': 'ConsoTotal',
      'value': dataData,
      'unit': 'kWh',
    });
    break;
  case 'Thermostat':
    // TODO: Manage mode, current mode, and all values of Thermostat
    output.push({
      'key': 'curmode',
      'value': 'Off',
    });
    output.push({
      'key': 'curtemp',
      'value': device.Data,
    });
    output.push({
      'key': 'cursetpoint',
      'value': device.Data,
    });
    output.push({
      'key': 'step',
      'value': '0.5',
    });
    output.push({
      'key': 'minVal',
      'value': '12.0',
    });
    output.push({
      'key': 'maxVal',
      'value': '28.0',
    });
    output.push({
      'key': 'availablemodes',
      'value': 'On, Off',
    });
    break;
  case 'Security':
    switch (device.SwitchType) {
    case 'Smoke Detector':
      output.push({
        'key': 'Tripped',
        'value': 'Normal' == device.Status ? '0' : '1',
      });
      output.push({
        'key': 'Armed',
        'value': '1',
      });
      output.push({
        'key': 'Ackable',
        'value': '1',
      });
      output.push({
        'key': 'Armable',
        'value': '1',
      });
      break;
    }
  }

  return output;

}


/**
 * Conver a domoticz device type to an ImperiHome device type
 * @param {object}   device Domoticz device
 * @returns {string} ImperiHome device type
 */
domoticz.convertDeviceType = function (device) {
  switch (device.Type) {
  case "Light/Switch":
  case "Lighting Limitless/Applamp":
  case "Lighting 1":
  case "Lighting 2":
    switch (device.SwitchType) {
    case 'On/Off':
      type = 'DevSwitch';
      break;
    case 'Push On Button':
      type = 'DevSwitch';
      break;
    case 'Push Off Button':
      type = 'DevSwitch';
      break;
    case 'Smoke Detector':
      type = 'DevSmoke';
      break;
    case 'Door Lock':
      type = 'DevDoor';
      break;
    case 'Motion Sensor':
      type = 'DevMotion';
      break;
    case 'Blinds Inverted':
      type = 'DevShutter';
      break;
    case 'Blinds':
      type = 'DevShutter';
      break;
    case 'Blinds Percentage':
      type = 'DevShutter';
      break;
    case 'Dimmer':
      type = 'DevDimmer';
      break;
    case 'Dusk Sensor':
      type = 'DevLuminosity';
      break;
    default:
      type = 'DevSwitch';
      break;
    }
    break;
  case 'Temp':
    type = 'DevTemperature';
    break;
  case 'Wind':
    type = 'DevWind';
    break;
  case 'Rain':
    type = 'DevRain';
    break;
  case 'General':
    type = 'DevGenericSensor';
    break;
  case 'UV':
    type = 'DevUV';
    break;
  case 'RFY':
    type = 'DevShutter';
    break;
  case 'Energy':
    type = 'DevElectricity';
    break;
  case 'P1 Smart Meter':
    type = 'DevElectricity';
    break;
  case 'Usage':
    type = 'DevElectricity';
    break;
  case 'Lux':
    type = 'DevLuminosity';
    break;
  case 'Current/Energy':
    type = 'DevElectricity';
    break;
  case 'Thermostat':
    type = 'DevThermostat';
    break;
  case 'Security':
    switch (device.SwitchType) {
    case 'Smoke Detector':
      type = 'DevSmoke';
      break;
    default:
      type = 'DevGenericSensor';
      break;
    }
    break;
  default:
    type = 'DevGenericSensor';
    break;
  }

  logging.log("Type '" + device.Type + "' -> '" + type + "'");

  return type;
};

/**
 * Parse an action and send it to an Domoticz device
 * @param {string} action   Action name
 * @param {string} deviceId Device ID
 * @param {string} param    Action parameter (may be undefined)
 * @returns {Object} JSON response
 */
domoticz.parseAction = function (action, deviceId, param) {
  logging.log('SendAction');
  var status = false;
  var retMessage = 'An error occured...';

  // NOTE: Specific dimmer value is not taken in account.
  // This command is ignored : type=command&param=switchlight&idx=99&switchcmd=Set%20Level&level=6
  // See FYI https://www.domoticz.com/wiki/Domoticz_API/JSON_URL's#Turn_a_light.2Fswitch_on
  if (action && deviceId) {
    switch (action) {
    case 'setLevel':
    case 'setStatus':
      action = 'switchlight';
    case 'pulseShutter':
      param = (param && param == '0') ? 'Off' : 'On';
      break;
    case 'launchScene':
      action = "switchscene";
      param = 'On'; // Scene can only be turn On
      // Split scene id (scene-XX)
      deviceId = deviceId.split("-")[1];
      break;
    }
  }

  // Build query string
  var query = {
    'idx': deviceId,
    'param': action
  };

  // if defined, add parameter as switchcmd
  if (param) query.switchcmd = param;

  this.sendAction(query).then(function (response) {
    logging.log('Response : ' + JSON.stringify(response));

    // return  response
    return {
      'success': status,
      'errormsg': status ? '' : retMessage
    };
  });;

};


domoticz.sendAction = function (queryString) {
  logging.log("SendAction with query " + JSON.stringify(queryString));

  var options = {
    uri: this.getURL(),
    qs: queryString,
    headers: {
      'User-Agent': nconf.get('domoticz:user-agent')
    },
    json: true
  };

  // Add 'type=command' parameter
  options.qs.type = 'command';

  return request.sendRequest(options);
};

/**
 * Get Domoticz rooms list
 * @returns {Promise} Request promise
 */
domoticz.getRooms = function () {
  logging.log("GetRooms");

  var options = {
    uri: this.getURL(),
    qs: {
      type: 'plans',
      order: 'name',
      'used': 'true'
    },
    headers: {
      'User-Agent': nconf.get('domoticz:user-agent')
    },
    json: true
  };

  return request.sendRequest(options);
};

/**
 * Get Domoticz scenes list
 * @returns {Promise} Request promise
 */
domoticz.getScenes = function () {
  logging.log("GetScenes");

  var options = {
    uri: this.getURL(),
    qs: {
      type: 'scenes' // -> uri + '?type=scenes'
    },
    headers: {
      'User-Agent': nconf.get('domoticz:user-agent')
    },
    json: true
  };

  return request.sendRequest(options);
};

/**
 * Get Domoticz camera list
 * @returns {Promise} Request promise
 */
domoticz.getCameras = function () {
  logging.log("GetCameras");

  var options = {
    uri: this.getURL(),
    qs: {
      type: 'cameras' // -> uri + '?type=cameras'
    },
    headers: {
      'User-Agent': nconf.get('domoticz:user-agent')
    },
    json: true
  };

  return request.sendRequest(options);
};

/**
 * Get Domoticz devices list
 * @param {String} Room ID (leave null for all devices)
 * @returns {Promise} Request promise
 */
domoticz.getDevices = function (room) {
  logging.log("GetDevices");

  var options = {
    uri: this.getURL(),
    qs: {
      type: 'devices' // -> uri + '?type=device'
    },
    headers: {
      'User-Agent': nconf.get('domoticz:user-agent')
    },
    json: true
  };

  // Add plan parameter in query string if room number is present
  if (room) options.qs.plan = room;

  return request.sendRequest(options);
};

module.exports = domoticz;
