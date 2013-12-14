// List of users currently inside.
// Key: contact (email/phone).  Val: name.
var users = {};

// Time of the last wipe of all present users (4 AM each day).
var lastWipe = ~~((Date.now() - 14400000) / 86400000);
// Wipes the server if we've passed more 4 AMs since 1970 than last time.
var checkAndWipe = function() {
  var now = ~~((Date.now() - 14400000) / 86400000);
  if (now > lastWipe) {
    lastWipe = now;
    users = {};
  }
};
// Periodically wipe the server.
setInterval(checkAndWipe, 3600000);

exports.login = function(contact, name) {
  users[contact] = name;
};

exports.logout = function(contact) {
  delete usersPresent[contact];
  console.log("Logged out!  Users left:", users);
};

exports.getUserName = function(contact) {
  return users[contact] || null;
};

exports.getUserContact = function(name) {
  for (var contact in users) {
    if (users[contact] === name) return contact;
  }
  return null;
};

exports.getUserList = function() {
  return users;
};

exports.clearUserList = function() {
  users = {};
};