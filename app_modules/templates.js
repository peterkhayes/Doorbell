var temperature = require('./temperature');

exports.templates = {
  ring: function(data) {
    return {
      subject: data.name + " is at the door!",
      text: "It's currently " + temperature.getTemperature() + " outside."
    };
  },
  unring: function(data) {
    return {
      subject: "Never mind.",
      text: data.name + " found his or her way inside safely."
    };
  },
  help: function() {
    return {
      subject: 'How to doorbell:',
      text: "YOUR NAME: ringBell(); 'who': whosThere(); 'cancel': unringBell(); 'exit': leave();"
    };
  }
};