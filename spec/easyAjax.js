// This module allows you to use $.ajax type syntax to make http requests on the server
// Needs hostname and path to work
var http = require('http');

var ajax = function(options){
  if (!typeof (options.data === 'string')){
    options.data = JSON.stringify(options.data);
  }
  options.contentType = options.contentType || 'application/JSON';
  options.method = options.method || 'GET';
  options.callback = function(response){
    if (options.success && response.statusCode < 400){
      options.success();
    }
    if (options.error && response.statusCode > 399){
      options.error(response);
    }
    if (options.then){
      options.then();
    }
  };

  var request = http.request({
    hostname: options.host,
    path: options.path,
    headers: {'Content-Type': options.contentType},
    method: options.method
  }, options.callback);
  request.write(options.data);
  request.end();
};

exports.module = ajax;