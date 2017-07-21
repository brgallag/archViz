var express = require('express');
var bondyParser = require('body-parser');
var app = express();
var server = require('http').Server(app);
io = require('socket.io')(server);

var port = process.env.APP_PORT || 80;

app.use('/', express.static(__dirname + '/static'));
app.use('/uploads', express.static(__dirname + '/uploads'));

io.on('connection', function (socket) {

    var connectedSockets = []

    for ( let client in io.sockets.connected )
    {
        connectedSockets.push(client)
    }

    var socketData = {
        sockets: connectedSockets,
        socketId: socket.id
    }
    
    socket.emit('socketIdSet', socketData);
    
	socket.broadcast.emit('userJoined', socket.id);
    
	socket.on('disconnect', function(data) {
        io.emit('userDisconnected', socket.id);
	});
    
    socket.on('updateModel', function(objectData) {
        socket.broadcast.emit('modelUpdated', objectData);
	});    
    
    socket.on('requestModel', function(data) {
        console.log('model requested from ' + data.socketId);
        io.sockets.in(data.socketId).emit('modelRequested', data);
	});
});

require('./routes')(app);

app.get('/programming', function(req, res){
  return res.redirect('/#programming');
});

app.get('*', function(req, res){
  return res.redirect('/');
});

server.listen(port, function() {
    console.log('Server listening on port ' + port);
})