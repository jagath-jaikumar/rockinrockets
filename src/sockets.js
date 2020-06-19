exports = module.exports = function(io){
  var game = require('./gameData');
  io.on('connection', function(socket){

    console.log(socket.id);

    game.players[socket.id] = {
      x: Math.floor(Math.random() * 1000) + 200,
      y: Math.floor(Math.random() * 1000) + 200,
      playerId: socket.id,
      team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue',
      angle:0,
    };

    socket.emit('currentPlayers', game.players);
    socket.broadcast.emit('newPlayer', game.players[socket.id]);


    socket.on('disconnect', function(){
      console.log('user disconnectd: ' + socket.id);
      delete game.players[socket.id];
      io.emit('disconnect', socket.id);
    });


    socket.on('playerMovement', function (movementData) {
      game.players[socket.id].x = movementData.x;
      game.players[socket.id].y = movementData.y;
      game.players[socket.id].angle = movementData.angle;
      if (movementData.move === 'yes'){
        game.players[socket.id].move = 'yes';
      } else {
        game.players[socket.id].move = 'no';
      }
      // emit a message to all players about the player that moved
      socket.broadcast.emit('playerMoved', game.players[socket.id]);



    });



  });
}
