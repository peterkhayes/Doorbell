var express = require('express');
var http = require('http');
var path = require('path');
var nodemailer = require("nodemailer");
var keys = require('./keys');

var app = express();
app.set('port', process.env.PORT || 3000);
app.use(express.favicon());

app.use(express.static(path.join(__dirname, '/client')));

// List of users currently inside.
// Key: email.  Val: name.
var usersPresent = {};

// create reusable transport method (opens pool of SMTP connections)
var emailSender = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: keys.email.user,
        pass: keys.email.password
    }
});

var emailTemplates = {
  ring: function(fields) {
    return {
      from: "Door <hackreactordoorbell@gmail.com>",
      to: fields.recipient,
      subject: fields.user + " is at the door!",
      text: "It's currently " + (30 + ~~(Math.random()*30)) + " degrees outside."
    };
  },
  unring: function(fields) {
    return {
      from: "Door <hackreactordoorbell@gmail.com>",
      to: fields.recipient,
      subject: fields.user + " found their way inside safely.",
      text: "And it's no thanks to you."
    };
  }
};

app.get('/whosthere', function(req, res) {
  var data = [];
  for (var email in usersPresent) {
    data.push(usersPresent[key]);
  }
  console.log("users here:", data);
  res.writeHead(200);
  res.send(data);
});

app.post('/ring', function(req, res) {
  // Req.body is an email and a name.

  // If the user provided a name and an email...
  if (req.body && req.body.email && req.body.name) {
    console.log
    // Send out emails to everyone currently present.
    for (var presentUser in usersPresent) {
      var emailData = {user: req.email, recipient: presentUser.email};
      console.log("Sent email with this data:", emailData);
      // emailSender.sendMail(emailTemplates.ring(emailData), function(error, response){
      //   if(error){
      //       console.log(error);
      //   } else{
      //       console.log("Message sent: " + response.message);
      //   }
      // });
    }

    // Then log in the current user.
    usersPresent[req.body.email] = req.body.name;
    res.send(200);
  // Otherwise error.
  } else {
    res.send(400);
  }

});

app.post('/unring', function(req, res) {
  // Req.body is an email and a name.

  // If the user provided a name and an email...
  if (req.body && req.body.email && req.body.name) {
    // Send out emails to everyone currently present, other than our current user.
    for (var presentUser in usersPresent) {
      if (req.email === presentUser.email) continue; // Don't send an email to yourself.
      var emailData = {user: req.email, recipient: presentUser.email};
      console.log("Sent email with this data:", emailData);
      // emailSender.sendMail(emailTemplates.unring(emailData), function(error, response){
      //   if(error){
      //       console.log(error);
      //   } else{
      //       console.log("Message sent: " + response.message);
      //   }
      // });
    }
    res.send(200);
  // Otherwise error.
  } else {
    res.send(400);
  }
});

app.post('/leave', function(req, res) {
  delete usersPresent[req.email];
  console.log("users:", usersPresent);
  res.send(200);
});

// Start server
http.createServer(app).listen(app.get('port'), function() {
  console.log(
    'Express server listening on port ' + app.get('port'),
    '\nPress Ctrl+C to shutdown'
  );
});
