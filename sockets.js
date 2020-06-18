exports = module.exports = function(io){
  io.on('connection', function(socket){
    console.log('user connected: '+socket.id);
    socket.on('disconnect', function(){
      console.log('user disconnectd: ' + socket.id);
    });
  });
}
