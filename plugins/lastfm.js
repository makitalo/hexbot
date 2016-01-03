/* Get Last.fm recently played track */

'use strict';

function init (bot, nconf) {
  var APIKey = nconf.get('plugins').lastfm.APIKey;
  var regex = /^!(?:lastfm|lfm)(?:\s+(.+))?$/i;

  bot.on('message', function(from, to, text) {
    var result = regex.exec(text);
    if (result) {
      if (to === bot.nick) { // pm instead of channel
        to = from;
      }
      lastfm((result[1] ? result[1] : from), function (result) {
        bot.say(to, result);
      });
    }
  });

  function lastfm (user, callback) {
    var request = require('request');
    var url = "http://ws.audioscrobbler.com/2.0/?method=user.getRecentTracks&user=" + encodeURIComponent(user) + "&nowplaying=true&limit=1&extended=0&format=json&api_key=" + APIKey;

    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
          var lastfm = JSON.parse(body);
          if (lastfm.error) {
            callback('Error: ' + lastfm.message);
          } else {
            if (lastfm.recenttracks.track.length > 0) {
              var np = lastfm.recenttracks.track[0].artist['#text'] + ' - ' + lastfm.recenttracks.track[0].name;
              callback(lastfm.recenttracks['@attr'].user + (lastfm.recenttracks.track[0]['@attr'] ? ' np: ' : ' lp: ') + np);
            }
          }
      }
    });
  };
};

module.exports = init;
