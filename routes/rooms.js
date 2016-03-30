var express = require('express');
var router = express.Router();
var logging = require('../helpers/logging');
var domoticz = require('../helpers/domoticz');

/* GET Rooms listing. */
router.get('/', function (req, res, next) {
  domoticz.getRooms().then(function (response) {
    //logging.log('Response : ' + JSON.stringify(response));

    var rooms = [];

    if (response.result) {
      var sRooms = response.result;
      for (var i = 0, len = sRooms.length; i < len; i++) {
        var room = sRooms[i];
        logging.log("Room : " + JSON.stringify(room));
        rooms.push({
          "id": room.idx,
          "name": room.Name
        });
      }
    }

    res.send({
      'rooms': rooms
    });

  });
});

module.exports = router;
