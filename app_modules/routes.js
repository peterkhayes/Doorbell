var actions = require('./actions');

exports.whosthere = function(req, res) {
  data = JSON.stringify(actions.whosthere());
  res.send(data);
};

exports.twilio = function(req, res){
  var contact = req.body.From.slice(1); // Remove initial + sign.
  var message = req.body.Body; // Body of the text message.

  console.log("Got a message from Twilio.", contact, message);

  var specialMsgs = {
    // Who's there messages
    'who': 'whosthere',
    'whosthere': 'whosthere',
    'present':'whosthere',

    // Unringing messages
    'unring': 'unring',
    'nvm': 'unring',
    'nevermind': 'unring',
    'never mind': 'unring',
    'ok': 'unring',
    'cancel': 'unring',
    'got it': 'unring',

    // Leaving messages.
    'leave': 'leave',
    'exit': 'leave',
    'left': 'leave',
    'bye': 'leave',
    'bye bye': 'leave',
    'byebye': 'leave',
    'l8r': 'leave',
    'leaving': 'leave'

    // Any other message is considered a 'ring'.
    // The body of the message should be the user's name.
  };

  // If both fields provided:
  if (contact && message) {
    if (specialMsgs[message]) {
      var type = specialMsgs[message];
      console.log("Performing", type);
      actions[type](contact, name);
    } else {
      console.log("Ringing");
      actions.ring(contact, name);
    }

    res.writeHead(200);
    res.end();
  // Otherwise error.
  } else {
    res.writeHead(400);
    res.end();
  }
};

exports.ring = function(req, res) {
  var contact = req.body.contact;
  var name = req.body.name;

  // If both fields provided:
  if (contact && name) {
    actions.ring(contact, name);
    res.writeHead(200);
    res.end();
  // Otherwise error.
  } else {
    res.writeHead(400);
    res.end();
  }
};

exports.unring = function(req, res) {
  var contact = req.body.contact;
  var name = req.body.name;

  // If both fields provided:
  if (contact && name) {
    actions.unring(contact, name);
    res.writeHead(200);
    res.end();
  // Otherwise error.
  } else {
    res.writeHead(400);
    res.end();
  }
};

exports.leave = function(req, res) {
  var contact = req.body.contact;

  console.log("Got a leave request for", contact);

  // If a contact is provided:
  if (contact) {
    actions.leave(contact);
    res.writeHead(200);
    res.end();
  // Otherwise error.
  } else {
    res.writeHead(400);
    res.end();
  }
};