var request = require('request');

var temperature;
// Get the weather outside of Hack Reactor.
var callWeatherAPI = function() {
  request('http://api.wunderground.com/api/' + process.env.WUNDERGROUND_KEY + '/conditions/q/CA/San_Francisco.json', function (error, response, body) {
    if (error) {
      console.log(error);
    } else {
      temperature = JSON.parse(response.body).current_observation.feelslike_string;
    }
  });
};

// Current temperature outside of Hack Reactor.
// Periodically update the weather.
callWeatherAPI();
setInterval(callWeatherAPI, 1800000);

exports.getTemperature = function() {
  return temperature;
};