/* jshint node: true */
/* Currency converter */

'use strict';

var request = require('request');

module.exports = {
  "message": {
    "regex": /^!(?:curr|cur|currency)\s+(.+)?([a-z]{3}).*([a-z]{3})$/i,
    "handler": function (params) {
      var amount = parseFloat(params.result[1]) || 1;
      var base = params.result[2];
      var to = params.to;
      var convert = params.result[3];
      var callback = params.callback;
      var url = "https://api.fixer.io/latest?base=" + base.toUpperCase() + "&symbols=" + convert.toUpperCase();

      request(url, function (error, response, body) {
        if (!error && response.statusCode === 200) {
          var currencies = JSON.parse(body);
          if (Object.keys(currencies.rates).length > 0) {
            var conversion = Math.round((amount * currencies.rates[convert.toUpperCase()]) * 100) / 100;
            callback.say(to, amount + " " + base.toUpperCase() + " = " + conversion + " " + convert.toUpperCase());
          } else {
            callback.say(to, "User error");
          }
        }
      });
    }
  }
};
