var express = require('express');
var port = process.env.PORT || 5000;
var app = express();

app.use('/', express.static(__dirname + '/public/'));

app.get('/', function(req, req) {
  response.sendfile(__dirname + '/public/index.html');
});

app.listen(port);
