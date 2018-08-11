const io = require('socket.io')();
const Currency = require('./currency.js');
const Player = require('./player.js');
const Board = require('./board.js');
const {TICK_PERIOD} = require( './tick.js' );

io.listen(3001)

const playerStructs = []
const players = [];
const sockets = [];

//Player state update
const game = io.on('connection', (socket) => {
  const playerStruct = {};
  const index = players.length;
  const player = new Player(playerStruct, index);

  playerStructs.push(playerStruct);
  players.push(player);
  sockets.push(socket);

  socket.on('disconnect', () => {
    player.kill();
  });

  socket.on('updateMoveVector', (v) => {
    player.setMoveVector(v);
  });

  socket.on('upgradeSize', () => {
    player.upgradeSize();
  });

  socket.on('upgradeSpeed', () => {
    player.upgradeSpeed();
  });
});

const calculateDistance = (pos1, pos2) => {
  const x = pos1.x - pos2.x;
  const y = pos1.y - pos2.y;
  return Math.sqrt(x*x + y*y);
}

const checkForCollision = (i, j) => {
  const p1 = playerStructs[i];
  const p2 = playerStructs[j];
  const distance = calculateDistance(p1.position, p2.position);
  const touchingDistance = p1.size*0.5 + p2.size*0.5;

  if(distance <= touchingDistance*0.6 &&  Math.abs(p1.size - p2.size)> 2){
    const bigger = p1.size > p2.size ? players[i] : players[j];
    const smaller = p1.size < p2.size ? players[i] : players[j];

    bigger.eat(smaller);
  }
};

//send tick
setInterval(() => {
  const totalCurrency = Currency.getTotalCurrency();
  const boardSize = {height: Board.height, width: Board.width};

  for(let i=0; i<sockets.length; i++){
    //tick sockets
    players[i].tickMove();
    const balance = Currency.getBalance(i);
    sockets[i].emit('tick', 
      {players: playerStructs, index: i, boardSize, balance, totalCurrency});

    for(let j=i+1; j< sockets.length; j++){
      checkForCollision(i, j);
    }
  }

}, TICK_PERIOD);


