// This module allows you to use $.ajax type syntax to make http requests on the server
// Needs hostname and path to work
var http = require('http');

var ajax = function(options){
  //If user tries to pass non-string, automatically stringifies it
  if (!typeof (options.data === 'string')){
    options.data = JSON.stringify(options.data);
  }
  // Default method and contentType
  options.contentType = options.contentType || 'application/JSON';
  options.method = options.method || 'GET';

  //allowing success and error functionality (unless already has callback)
  options.callback = options.callback || function(response){
    if (options.success && response.statusCode < 400) options.success();
    if (options.error && response.statusCode > 399) options.error(response);
    if (options.then) options.then();
  };

  //Making the request
  var request = http.request({
    hostname: options.host,
    path: options.path,
    headers: {'Content-Type': options.contentType},
    method: options.method
  }, options.callback);
  if (options.data) request.write(options.data);
  request.end();
};

exports.module = ajax;