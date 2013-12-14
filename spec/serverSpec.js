var request = require('request');
var http    = require('http');
var ajax    = require('./easyAjax.js').module;

var host = 'hackreactordoorbell.azurewebsites.net';
var time = 3000;

describe('requests to /ring', function(){
  it('should respond only to requests to ring that have contact info and name', function(){
    var test1 = false;
    runs(function(){
      var request = http.request({hostname: host, path: '/ring', method: "POST", headers: {'Content-Type': 'application/JSON'}}, function(response){
        if (response.statusCode === 400){
          test1 = true;
        }
      });
      request.end();
    });
    waitsFor(function(){
      return test1;
    }, "allowed post to ring without contact info", time);

    test2 = false;
    runs(function(){
      var data = JSON.stringify({name: 'NAME', contact: 'foo@bar.com'});
      var request = http.request({hostname: host, path:'/ring', method: "POST", data: data, headers: {'Content-Type': 'application/JSON'}}, function(response){
        if (response.statusCode === 200){
          test2 = true;
        }
      });
      request.write(data);
      request.end();
    });
    waitsFor(function(){
      return test2;
    }, "needs name and contact info", time);
  });
});

describe('leaving request format', function(){
  it('shouldn\'t require contact info and name to requests to /leave (COOKIES)', function(){
    var test1 = false;
    runs(function(){
      //This is testing without any user information, so should fail
      ajax({method: "GET", data: undefined, success: function(){
        test1 = true;
      }, error: function(){
        test1 = false;
      }, host: host, url: '/leave'});
    });
    waitsFor(function(){
      return test1;
    }, "rejected because of lack of data", time);
  });
});

describe('whosthere should update', function(){
  var thereBeforeLogin, thereAfterLogin, thereAfterLogout;

  //whosthere is lowercase for consistency with server code
  var whosthere = function(){
    var request = http.request({hostname: host, path: '/whosthere', method: "GET"}, function(response){
      var peeps = '';
      var numPeeps = 0;

      response.on('data', function(chunk){
        peeps += chunk;
      });
      response.on('end', function(){
        var peeps = JSON.parse(peeps);
        console.log('data has finished');
        console.log(peeps);
        for (var key in peeps){
          numPeeps++;
        }
        console.log(numPeeps);
        return numPeeps;
      });
      response.on('error', function(){
        console.log(error);
      });

    });

    request.end();
  };

  it('should get list of users', function(){
    var test1 = false;
    runs(function(){
      var data = JSON.stringify({name: 'NAME', contact: 'foo@bar.com'});
      var request = http.request({hostname: host, path: '/ring', method: "POST", headers: {'Content-Type': 'application/JSON'}}, function(response){
        var num = whosthere();
        thereBeforeLogin = num;
        test1 = true;
      });
      request.write(data);
      request.end();
    });
    waitsFor(function(){
      return test1;
    }, "didn't get response from server", time);
  });

  it('should update list of users after login request', function(){
    test2 = false;
    runs(function(){
      var data = JSON.stringify({name: 'NAME', contact: 'foo@bar.com'});
      ajax({host: host, url: '/ring', data: data, success: function(){
        var num = whosthere();
        thereAfterLogin = num;
        console.log(thereAfterLogin, thereBeforeLogin);
        if (thereAfterLogin === thereBeforeLogin + 1){
          test2 = true;
        }
      }});
    });
    waitsFor(function(){
      return test2;
    }, "List of people present didn't update" , time);
  });

  it('should update list of users after login', function(){
    test3 = false;
    runs(function(){
      ajax({host:host, url: '/leave', success: function(){
        thereAfterLogout = whosthere();
        if (thereAfterLogout < thereAfterLogin){
          test3 = true;
        }
      }});
    });
    waitsFor(function(){
      return test3;
    });
  });
});