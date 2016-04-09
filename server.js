var express = require('express');
var port = process.env.PORT || 5000;
var app = express();

app.get('/', function(req, req) {
  response.sendfile(__dirname + '/public/index.html');
}).configure(function() {
  app.use('/', express.static(__dirname + '/public/'));
}).listen(port);
