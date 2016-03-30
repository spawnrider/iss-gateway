var nconf = require('nconf');

var logging = {};

logging.log = function (message) {
  if(nconf.get('debug') === true) {
    console.log(message);
  }
};


module.exports = logging;
