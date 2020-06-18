var express = require('express');
var app = express();
var server = require('http').Server(app);
var nunjucks = require('nunjucks');
var io = require('socket.io').listen(server)
var view = require('./view');
var errors = require('./errors');
var socket = require('./sockets')(io);

/* Middleware */
nunjucks.configure('views', {
    autoescape: true,
    express: app
});

/* Public folder */
app.use(express.static(__dirname + '/public'));

/* Routes */
app.get('/', view.home);


/* Error Handling */
app.use(errors.e404);
app.use(errors.e500);

/* Run */
server.listen(5000, function() {
  console.log(`Listening on ${server.address().port}`);
});

/*Powered by bee*/
