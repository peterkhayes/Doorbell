// List of users currently inside.
// Key: contact (email/phone).  Val: name.
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

exports.getUserList = function() {
  return usersPresent;
};

exports.clearUserList = function() {
  usersPresent = {};
};