var app = angular.module('doorbellApp', [])
.directive('ngEnter', function() {
  return function(scope, element, attrs) {
    element.bind("keydown keypress", function(event) {
      if(event.which === 13) {
        scope.$apply(function(){
          scope.$eval(attrs.ngEnter);
        });
        event.preventDefault();
      }
    });
  };
})
.factory('cookies', function() {
  var service = {};

  // create cookie at document.cookie
  service.create = function(name, value, days) {
    var expires;
    if (days) {
      var date = new Date();
      date.setTime(date.getTime()+(days*24*60*60*1000));
      expires = "; expires="+date.toGMTString();
    }
    else expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
  };

  service.add = service.create;

  service.write = service.create;

  // read property of cookie at document.cookie
  service.read = function(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
  };

  // erase property of cookie at document.cookie
  service.erase = function(name) {
    createCookie(name,"",-1);
  };

  service.remove = service.erase;

  return service;
})
.factory('bell', function($http) {
  var service = {};

  service.ring = function() {
    var sound = new Audio('doorbell.mp3');
    sound.play();
  };

  return service;
})
.factory('ajax', function($q, $http){
  var service = {};

  service.call = function(url, method, data) {
    var p = $q.defer();

    $http({
      method: method,
      url: url,
      data: data
    }).success(function(data) {
      p.resolve(data);
    }).error(function(err) {
      p.reject(err);
    });

    return p.promise;
  };

  service.ring = function(data){
    return service.call('/ring', 'post', data);
  };

  service.unring = function(data){
    return service.call('/unring', 'post', data);
  };

  service.leave = function(data){
    return service.call('/leave', 'post', data);
  };

  service.whosthere = function(){
    var toReturn = service.call('/whosthere', 'get');
    return toReturn;
  };

  return service;
})
.controller('doorbell', function($scope, $timeout, ajax, bell, cookies) {

  // Read properties saved in the cookie.
  $scope.name = cookies.read('name') || '';
  $scope.contact = cookies.read('contact') || '';

  var contactInfoExists = function() {
    return ($scope.name && $scope.contact);
  };

  // Checks if a given input looks like an email or a phone number.
  var checkContactInfo = function(){
    if ($scope.name.length < 2) return false;
    var contact = $scope.contact;
    if ( contact && contact.match(/.+\@.+\..+/) ){
      return true;
    } else {
      $scope.contact = contact.replace(/[^\d]*/g, '', 'g');
      if (contact.length > 9){
         return true;
      }
    }
    return false;
  };

  // Button bindings.
  $scope.ring = function() {
    if (contactInfoExists()) {
      if (checkContactInfo()) {
        var data = {name: $scope.name, contact: $scope.contact};
        ajax.ring(data).then(
          function() {
            refreshUserList();
            cookies.write('name', $scope.name);
            cookies.write('contact', $scope.contact);
            $scope.state.hasRung = true;
            $scope.state.inside = false;
            $scope.message = "Rang that bell! Click 'got inside' if you get let in.";
          },
          function(err) {
            $scope.message = "Error logging in. Try again.";
          }
        );
      } else {
        $scope.message = "What kind of name and contact is that?";
      }
    } else {
      $scope.message = "Whoa there! Don't try to shirk your responsibilities!";
    }
  };

  $scope.unring = function() {
    if (contactInfoExists()) {
      if (checkContactInfo()) {
        var data = {name: $scope.name, contact: $scope.contact};
        ajax.unring(data).then(
          function() {
            refreshUserList();
            $scope.state.hasRung = true;
            $scope.state.inside = true;
            $scope.message = "Great! Thanks for keeping everyone posted.";
          },
          function(err) {
            $scope.message = "Error unringing bell. Try again.";
          }
        );
      } else {
        $scope.message = "What kind of name and contact is that?";
      }
    } else {
      $scope.message = "We need your name and info to look you up.";
    }
  };

  $scope.leave = function() {
    if (contactInfoExists()) {
      if (checkContactInfo()) {
        var data = {contact: $scope.contact};
        ajax.leave(data).then(
          function() {
            $scope.state.hasRung = false;
            $scope.state.inside = false;
            $scope.message = "See you next time!";
            refreshUserList();
          },
          function(err) {
            $scope.message = "Error leaving. Try again, or you'll keep getting messages.";
          }
        );
      } else {
        $scope.message = "What kind of name and contact is that?";
      }
    } else {
      $scope.message = "We need your name and info to log you out.";
    }
  };

  // Get a list of present users.
  // If there has been a change, ring the bell.
  var refreshUserList = function() {
    ajax.whosthere().then(
      function(data) {
        if ($scope.userList) {
          var change = false;
          for (var contact in data) {
            if ($scope.userList[contact] !== data[contact]) {
              change = true;
            }
          }
          if (change) {
            ringBell();
          }
        }
        if (data) $scope.userList = data;
        updateState(); // If the user is logged in, buttons should change
      }
    );
  };

  $scope.toggleMute = function() {
    $scope.muted = !$scope.muted;
  };

  var ringBell = function() {
    if (!$scope.muted) {
      bell.ring();
    }
  };

  // If the info from the cookie is currently logged into the server,
  // we should update the view accordingly.
  var updateState = function() {
    // Initialize variables.
    $scope.state = $scope.state || {};
    var cookieName = cookies.read('name');
    var cookieContact = cookies.read('contact');
    if ($scope.userList && $scope.userList[cookieContact] === cookieName) {
      $scope.state.hasRung = true;
    } else {
      $scope.state.hasRung = false;
    }
  };

  // Durned Angular don't got no set-interval.
  var interval = function() {
    refreshUserList();
    $timeout(interval, 10000);
  };
  interval();

});