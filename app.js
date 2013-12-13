var express = require('express');
var http = require('http');
var path = require('path');
var nodemailer = require("nodemailer");
var keys = require('./keys');
var escaper = require('jsesc');

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


// create reusable transport method (opens pool of SMTP connections)
var emailSender = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: keys.email.user,
        pass: keys.email.password
    }
});

var isPhoneNumber = function(input) {
  return (/^\d+$/).test(input);
};

var sendMessage = function(type, action, data) {
  var message = templates[action](data);
  if (type === 'email') {
    console.log("Emailing",message,"to",data.contact);
    // emailSender.sendMail(emailTemplates.ring(msgData), function(error, response){
    //   if(error){
    //       console.log(error);
    //   } else{
    //       console.log("Message sent: " + response.message);
    //   }
    // });
  } else if (type === 'text') {
    console.log("Texting",message,"to",data.contact);
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
      text: "It's currently " + (30 + ~~(Math.random()*30)) + " degrees outside."
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

    var name = escaper(req.body.name);
    // Send out emails to everyone currently present, other than our current user.
    for (var presentUser in usersPresent) {
      if (req.contact === presentUser.contact) continue; // Don't send an email to yourself.
      var msgData = {name: name, recipient: presentUser.email};
      console.log("Sent email with this data:", emailData);
      // emailSender.sendMail(emailTemplates.unring(emailData), function(error, response){
      //   if(error){
      //       console.log(error);
      //   } else{
      //       console.log("Message sent: " + response.message);
      //   }
      // });
    }
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

// Periodically wipe the server.
setInterval(checkAndWipe, 3600000);
