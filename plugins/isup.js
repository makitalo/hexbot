/* jshint node: true */
/* Check if website is up */

'use strict';

var request = require('request');

module.exports = {
  "message": {
    "regex": /^!isup\s+(?:https|http)?(?:\:|\/)*(.+\..+)/i,
    "handler": function (params) {
      var result = params.result;
      var to = params.to;
      var callback = params.callback;
      var testURI = 'http://' + result[1];

      request(testURI, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          callback.say(to, testURI + ' seems to be up!');
        } else {
          callback.say(to, testURI + ' is down for me as well');
        }
      });
    }
  }
};
