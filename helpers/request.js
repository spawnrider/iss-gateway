var rp = require('request-promise');
var logging = require('./logging');

var request = {};

request.sendRequest = function (options) {
  return rp(options)
    .then(function (response) {
      return response;
    })
    .catch(this.handleError);
};

function handleError() {
  logging.log("Request failure");
  switch (err.statusCode) {
  case 401:
    logging.log("Missing or bad credentials");
    break;
  default:
    logging.log(err.message);
  }
};

module.exports = request;
