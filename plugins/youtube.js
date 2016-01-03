/* Retrieve Youtube title and duration, passively or by search */

'use strict';

function init (bot, nconf) {
  var APIKey = nconf.get('plugins').youtube.APIKey;
  var regex = /(?:^!youtube|^!yt)\s(.+)|(?:http(?:s|).{3}|)(?:www.|)(?:youtube.com\/watch\?.*v=|youtu.be\/)([\w-]{11})/i;

  bot.on('message', function (from, to, text) {
    if (to === bot.nick) { // pm instead of channel
      to = from;
    }
    var result = regex.exec(text);
    if (result && result[2]) { // normal link
      getYT(result[2], false, function (result) {
        bot.say(to, result);
      });
    } else if (result && result[1]) { // search
      searchYT(result[1], function (result) {
        bot.say(to, result);
      });
    }
  });

  function getYT (youtubeID, link, callback) {
    var request = require('request');
    var url = "https://www.googleapis.com/youtube/v3/videos?id=" + youtubeID + "&key=" + APIKey + "&fields=items(snippet(title),contentDetails(duration))&part=snippet,contentDetails";
    var durationRegex = /P(?:(?:(\d+)W)?(?:(\d+)DT|T))?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i;

    request(url, function (error, response, body) {
      function pad (n, width, z) {
        z = z || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
      }

      if (!error && response.statusCode == 200) {
          var youtube = JSON.parse(body);
          var title = youtube.items[0].snippet.title;
          var duration = durationRegex.exec(youtube.items[0].contentDetails.duration);

          var durationWeeks = (duration[1] ? duration[1] + "w " : "");
          var durationDays = (duration[2] ? duration[2] + "d " : "");
          var durationHours = (duration[3] ? duration[3] + ":" : "");
          var durationMins = (duration[4] ? pad(duration[4],2) + ":" : "00:");
          var durationSecs = (duration[5] ? pad(duration[5],2) : "00");

          callback("[YouTube] " + title + " (" + durationWeeks + durationDays + durationHours + durationMins + durationSecs + ")" + (link ? " https://www.youtube.com/watch?v=" + youtubeID : ""));
      }
    });
  };

  function searchYT (search, callback) {
    var request = require('request');
    var url = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=" + encodeURIComponent(search) + "&type=video&key=" + APIKey;

    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
          var youtube = JSON.parse(body);
          if (youtube.items[0]) {
            getYT(youtube.items[0].id.videoId, true, callback);
          } else {
            callback("No search results for '" + search + "'.")
          }
      }
    });
  };
};

module.exports = init;
