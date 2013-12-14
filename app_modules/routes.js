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
    // Who's there words
    'who': 'whosthere',
    'whosthere': 'whosthere',
    'present':'whosthere',

    // Unringing words
    'unring': 'unring',
    'nvm': 'unring',
    'nevermind': 'unring',
    'never': 'unring',
    'ok': 'unring',
    'cancel': 'unring',
    'got it': 'unring',

    // Leaving messages.
    'leave': 'leave',
    'exit': 'leave',
    'left': 'leave',
    'bye': 'leave',
    'byebye': 'leave',
    'leaving': 'leave',

    // Ring messages.
    'ring': 'ring'

    // A message without one of these words first is considered a 'ring'.
    // The rest of the message is the user's name.
  };

  // If both fields are provided:
  if (contact && message) {
    // The first word of the message might indicate a special action like 'leave'.
    var messageWords = message.split(" ");
    var first = messageWords[0];
    var rest = messageWords.slice(1).join(' ');
    if (specialMsgs[first]) {
      var type = specialMsgs[first];
      console.log("Performing", type);
      actions[type](contact, rest);
    // But maybe the whole message is just their name.
    } else {
      console.log("Ringing");
      actions.ring(contact, message);
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