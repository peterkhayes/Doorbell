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
  it('shouldn\'t be able to leave without contact', function(){
    var test1 = false;
    runs(function(){
      var data;
      ajax({method: "POST", host: host, url: '/leave', data: data, success: function(){
        test1 = false;
      }, error: function(){
        test1 = true;
      }
    });
    waitsFor(function(){
      return test1;
    });
  });
});

  it('should be able to leave with contact info', function(){
    var test2 = false;
    runs(function(){
      var data = JSON.stringify({name: 'NAME', contact: 'foo@bar.com'});
      ajax({method: "POST", host: host, url: '/leave', data: data, success: function(){
        test2 = true;
      }, error: function(e){
        test2 = false;
      }
    });
    });
    waitsFor(function(){
      return test2;
    }, "contact info fail", time);
  });
});

describe('whosthere', function(){
  var numbers = {};
  console.log('about to run who\'s there');
  //whosthere is lowercase for consistency with server code
  var whosthere = function(variable){
    var request = http.request({hostname: host, path: '/whosthere', method: "GET", headers: {'Content-Type': 'application/JSON'} }, function(response){
      console.log('within whosthere');
      var peeps = '';
      var numPeeps = 0;

      response.on('data', function(chunk){
        peeps += chunk;
      });

      response.on('end', function(){
        peeps = JSON.parse(peeps);
        console.log(peeps);
        for (var key in peeps){
          numPeeps++;
        }
        numbers[variable] = numPeeps;
        console.log(variable, numPeeps);
      });

      response.on('error', function(){
        console.log(":( error!");
      });
    });
    request.end();
  };

  it('should get list of users (shouldn\'t need login)', function(){
    runs(function(){
      whosthere('thereBeforeLogin');
    });

    waitsFor(function(){
      return (typeof numbers.thereBeforeLogin === "number");
    }, "didn't get list from server", time);
  });

  it('should update list of users after login request', function(){
    runs(function(){
      var data = JSON.stringify({name: 'NAME', contact: 'foo@bar.com'});
      ajax({host: host, path: '/ring', data: data, method: "POST",
        success: function(){
          console.log('successfully rang');
          console.log(numbers['thereBeforeLogin'], ' are there before login');
          whosthere('thereAfterLogin');
      }, error: function(){
          console.log('something went wrong');
      }});
    });

    waitsFor(function(){
      return (numbers.thereAfterLogin === (numbers.thereBeforeLogin + 1));
    }, "login didn't update the list. :(", time);
  });

  // it('should update list of users after logout request', function(){
  //   runs(function(){
  //     var data = JSON.stringify({name: 'NAME', contact: 'foo@bar.com'});
  //     ajax({host: host, path: '/leave', data: data, method: "POST",
  //       success: function(){
  //         console.log('successfully logged out');
  //         whosthere('thereAfterLogout');
  //     }, error: function(){
  //       console.log('something went wrong');
  //     }});
  //   });

  //   waitsFor(function(){
  //     return (numbers.thereAfterLogin === numbers.thereAfterLogout + 1);
  //   }, "logout didn't update the list. Oh noes! :(", time);
  // });
  // setTimeout(function(){
  //   for (var stuff in numbers){
  //     console.log(stuff, numbers[stuff]);
  //   }
  // }, 10000);
});