var nodemailer = require('nodemailer');
var twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
var escaper = require('jsesc');
var users = require('./users');
var templates = require('./templates');

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

var sendMessage = function(action, data) {
  var message = templates[action](data);
  var type = (isPhoneNumber(data.recipient) ? 'text' : 'email');
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

    //Send an SMS text message
    twilio.sendMessage({

      to: "+" + data.recipient, // Twilio likes the +.
      from: '+14157671437', // Twilio number.
      body: message.subject + ' ' + message.text

    }, function(err, data) { // Response from Twilio.
      if (err) console.log("Message sending error:", err);
    });

  }
};

var messageAllUsers = function(data) {
  var userList = users.getUserList();
  for (var contact in userList) {
    if (data.except && data.except.indexOf(contact) !== -1) continue;
    var msgData = {name: data.name, recipient: contact};
    sendMessage(data.action, msgData);
  }
};

exports.help = function(contact) {
  sendMessage('help', {recipient: contact});
};
exports.whosthere = function() {
  var data = [];
  var userList = users.getUserList();
  for (var contact in userList) {
    data.push({contact: contact, name: userList[contact]});
  }
  console.log("users here:", data);
  return data;
};
exports.ring = function(contact, name) {
  contact = escaper(contact.trim());
  name = escaper(name.trim());

  // Send out messages to everyone currently present.
  messageAllUsers({action: 'ring', name: name, except:[contact]});

  // Then log in the current user.
  users.login(contact, name);
};
exports.unring = function(contact) {
  contact = escaper(contact.trim());
  users.getUserName(contact);

  // Send out messages to everyone currently present.
  if (name) messageAllUsers({action: 'unring', name: name, except: [contact]});
};
exports.leave = function(contact) {
  contact = escaper(contact.trim());
  users.logout(contact);
};