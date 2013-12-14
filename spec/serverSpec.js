var request = require('request');
var http    = require('http');

var host = 'hackreactordoorbell.azurewebsites.net';
var time = 3000;

describe('server routes', function(){
  it('should respond only to requests to ring that have contact info and name', function(){
    var test1 = false;
    runs(function(){ 
      var request = http.request({host: host, path: '/ring', method: "POST"}, function(response){
        console.log(response.statusCode, 'fail');
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
      var request = http.request({host: host, path:'/ring', method: "POST", data: data}, function(response){
        console.log(response.statusCode);
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

  it('should log users out with requests to leave', function(){
    var test1 = false;
    runs(function(){ 
      var request = http.request({host: host, path: '/ring', method: "POST"}, function(response){
        console.log(response.statusCode, 'fail');
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
      var request = http.request({host: host, path:'/ring', method: "POST", data: data}, function(response){
        console.log(response.statusCode);
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