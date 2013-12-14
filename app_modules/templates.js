/*
  Templates for response messages.
  If messages are sent out as texts, subject is simply the first sentence.
*/

var temperature = require('./temperature');

exports.ring = function(data) {
  return {
    subject: data.name + " is at the door!",
    text: "It's currently " + temperature.getTemperature() + " outside."
  };
};

exports.unring = function(data) {
  return {
    subject: "Never mind.",
    text: data.name + " found his or her way inside safely."
  };
};

exports.help = function() {
  return {
    subject: 'How to doorbell:',
    text: "YOUR NAME: ringBell(); 'who': whosThere(); 'cancel': unringBell(); 'exit': leave();"
  };
};