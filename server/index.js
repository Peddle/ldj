const io = require('socket.io')();

io.listen(3001)

const players = []
const MAX_WIDTH = 500;
const MAX_HEIGHT = 500;

const game = io.on('connection', (socket) => {
  const player = {
    position: {x: Math.random()*500, y: Math.random()*500},
    alive: true,
  };
  const index = players.length;
  let moveVector = {x: 1, y: 1};
  const speed = 20;

  players.push(player)
    
  //send tick
  setInterval(() => {
    player.position.x = Math.max(
      Math.min(player.position.x + moveVector.x*speed, MAX_WIDTH),
      0);
    player.position.y = Math.max(
      Math.min(player.position.y + moveVector.y*speed, MAX_HEIGHT), 
      0);

    socket.emit('tick', {players, index});
  }, 300);

  socket.on('disconnect', () => {
    player.alive = false;
  });

  socket.on('updateMoveVector', (v) => {
    divisor = Math.sqrt(v.x*v.x + v.y*v.y);
    
    moveVector.x = v.x/divisor;
    moveVector.y = v.y/divisor;
  });
});


