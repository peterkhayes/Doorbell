var express = require('express');
var http = require('http');
var path = require('path');
var routes = require('./app_modules/routes');

var app = express();
app.set('port', process.env.PORT || 3000);
app.use(express.favicon());

app.use(express.static(path.join(__dirname, '/client')));
app.use(express.bodyParser());

app.get('/whosthere', routes.whosthere);
app.post('/twilio', routes.twilio);
app.post('/ring', routes.ring);
app.post('/unring', routes.unring);
app.post('/leave', routes.leave);

// Start server
app.listen(app.get('port'), function() {
  console.log(
    'Express server listening on port ' + app.get('port'),
    '\nPress Ctrl+C to shutdown'
  );
});

