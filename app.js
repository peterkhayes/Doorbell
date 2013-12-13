var express = require('express');
var http = require('http');
var path = require('path');
var nodemailer = require("nodemailer");
var escaper = require('jsesc');
var querystring = require('querystring');

var app = express();
app.set('port', process.env.PORT || 3000);
app.use(express.favicon());

app.use(express.static(path.join(__dirname, '/client')));
app.use(express.bodyParser());

// List of users currently inside.
// Key: email.  Val: name.
var usersPresent = {};

// Time of the last wipe of all present users (4 AM each day).
var lastWipe = ~~((Date.now() - 14400000) / 86400000);
// Wipes the server if we've passed more 4 AMs since 1970 than last time.
var checkAndWipe = function() {
  var now = ~~((Date.now() - 14400000) / 86400000);
  if (now > lastWipe) {
    lastWipe = now;
    usersPresent = {};
  }
};
// Periodically wipe the server.
setInterval(checkAndWipe, 3600000);


var temperature;
// Get the weather outside of Hack Reactor.
var getTemperature = function() {
  var url = 'http://api.wunderground.com/api/'+process.env.WUNDERGROUND_KEY+'/conditions/q/CA/San_Francisco.json';
  http.get(url, function(res){
    console.log("weather data:", res.body);
    temperature = res.body.temp_f;
  }).on('error', function(err) {
    console.log("Error getting weather:", err);
  });
};
// Current temperature outside of Hack Reactor.
// Periodically update the weather.
getTemperature();
setInterval(getTemperature, 1800000);

// create reusable transport method (opens pool of SMTP connections)
var emailSender = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD
    }
});

var isPhoneNumber = function(input) {
  return (/^\d+$/).test(input);
};

var sendMessage = function(type, action, data) {
  var message = templates[action](data);
  if (type === 'email') {
    console.log("Emailing",message,"to",data.recipient);
    var options = {
      from: "Door <hackreactordoorbell@gmail.com>",
      to: data.recipient,
      subject: message.subject,
      text: message.text
    };
    emailSender.sendMail(options, function(error, response){
      if(error){
          console.log(error);
      } else{
          console.log("Message sent: " + response.message);
      }
    });
  } else if (type === 'text') {
    console.log("Texting",message,"to",data.recipient);

    var params = querystring.stringify({
      from: '4157671437',
      to: data.recipient,
      body: message.subject + ' ' + message.text
    });

    var options = {
      hostname: 'https://api.twilio.com/',
      path: '/2010-04-01/Accounts/'+process.env.TWILIO_KEY+'/Messages',
      method: 'POST'
    };

    var req = http.request(options, function(res) {
      console.log("Set text message!");
    });

    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });

    // write data to request body
    req.write(params);
    req.end();
  }
};

var messageAllUsers = function(data) {
  for (var userContact in usersPresent) {
    var msgData = {name: data.name, recipient: userContact};
    if (isPhoneNumber(userContact)) {
      sendMessage('text', data.action, msgData);
    } else {
      sendMessage('email', data.action, msgData);
    }
  }
};

var templates = {
  ring: function(data) {
    return {
      subject: data.name + " is at the door!",
      text: "It's currently " + temperature + " degrees outside."
    };
  },
  unring: function(data) {
    return {
      subject: fields.name + " found their way inside safely.",
      text: "And it's no thanks to you."
    };
  }
};

app.get('/whosthere', function(req, res) {
  var data = [];
  for (var contact in usersPresent) {
    data.push(usersPresent[contact]);
  }
  console.log("users here:", data);
  data = JSON.stringify(data);
  res.send(data);
});

app.post('/ring', function(req, res) {
  // Req.body is an email and a name.
  console.log(req.body);
  // If the user provided a name and an email...
  if (req.body && req.body.contact && req.body.name) {

    var contact = escaper(req.body.contact);
    var name = escaper(req.body.name);

    // Send out messages to everyone currently present.
    messageAllUsers({action: 'ring', name: name});


    // Then log in the current user.
    usersPresent[contact] = name;
    res.writeHead(200);
    res.end();
  // Otherwise error.
  } else {
    res.writeHead(400);
    res.end();
  }

});

app.post('/unring', function(req, res) {
  // Req.body is an email and a name.

  // If the user provided a name and an email...
  if (req.body && req.body.contact && req.body.name) {

    var contact = escaper(req.body.contact);
    var name = escaper(req.body.name);

    // Send out messages to everyone currently present.
    messageAllUsers({action: 'ring', name: name});

    res.writeHead(200);
    res.end();

  // Otherwise error.
  } else {
    res.writeHead(400);
    res.end();
  }
});

app.post('/leave', function(req, res) {
  delete usersPresent[req.email];
  console.log("users:", usersPresent);
  res.writeHead(200);
  res.end();
});

// Start server
app.listen(app.get('port'), function() {
  console.log(
    'Express server listening on port ' + app.get('port'),
    '\nPress Ctrl+C to shutdown'
  );
});

