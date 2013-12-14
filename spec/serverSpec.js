var request = require('request');
var http    = require('http');
var ajax    = require('./easyAjax.js');

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
  it('should require contact info and name to requests to /leave', function(){
    var test1 = false;
    runs(function(){
      //This is testing without any user information, so should fail
      var request = http.request({hostname: host, path: '/leave', method: "POST", headers: {'Content-Type': 'application/JSON'}}, function(response){
        if (response.statusCode === 400){
          test1 = true;
        }
      });
      request.end();
    });
    waitsFor(function(){
      return test1;
    }, "allowed post to logout without contact info", time);

    test2 = false;
    runs(function(){
      //this test is including user information, so should succeed
      var data = JSON.stringify({name: 'NAME', contact: 'foo@bar.com'});
      var request = http.request({host: host, path:'/leave', method: "POST", data: data, headers: {'Content-Type': 'application/JSON'}}, function(response){
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

describe('whosthere should update', function(){
it('should update users there when user leaves', function(){
    //Used for multiple tests
    var whosThere = function(){
      console.log('in whosThere function');
      var request = http.request({hostname: host, path: '/whosthere', method: "GET"}, function(response){
        console.log('made request successfully');
        var peeps = '';
        response.on('data', function(chunk){
          peeps += chunk;
        });
        response.on('end', function(){
          console.log(peeps);
          return JSON.parse(peeps);
        });
        response.on('error', function(){
          console.log(error);
        });
      });
      request.end();
    };

    var test1 = false;
    runs(function(){
      var data = JSON.stringify({name: 'NAME', contact: 'foo@bar.com'});
      var request = http.request({hostname: host, path: '/leave', method: "POST", headers: {'Content-Type': 'application/JSON'}}, function(response){
        console.log('going to run whosThere');
        whosThere();
      });
      request.write(data);
      request.end();
    });
    waitsFor(function(){
      return test1;
    }, "number of people logged in didn't change :(", time);

    test2 = false;
    runs(function(){
      //this test is including user information, so should succeed
      var data = JSON.stringify({name: 'NAME', contact: 'foo@bar.com'});
      var request = http.request({host: host, path:'/leave', method: "POST", data: data, headers: {'Content-Type': 'application/JSON'}}, function(response){
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