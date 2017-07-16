var express = require('express');
var bondyParser = require('body-parser');
var app = express();
var server = require('http').Server(app);

var port = process.env.APP_PORT || 80;

app.use('/', express.static(__dirname + '/static'));

require('./routes')(app);

server.listen(port, function() {
    console.log('Server listening on port ' + port);
})