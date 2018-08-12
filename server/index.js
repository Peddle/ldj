const io = require('socket.io')();
const Currency = require('./currency.js');
const Player = require('./player.js');
const Board = require('./board.js');
const {TICK_PERIOD} = require( './tick.js' );

io.listen(3001)

const playerStructs = []
const players = [];
const sockets = [];
const minPlayers = 5;

//Player state update
const game = io.on('connection', (socket) => {
  const playerStruct = {};
  const index = players.length;
  const player = new Player(playerStruct, index);

  playerStructs.push(playerStruct);
  players.push(player);
  sockets.push(socket);

  socket.on('disconnect', () => {
    players[index].kill();
  });

  socket.on('updateMoveVector', (v) => {
    players[index].setMoveVector(v);
  });

  socket.on('upgradeSize', () => {
    players[index].upgradeSize();
  });

  socket.on('upgradeSpeed', () => {
    players[index].upgradeSpeed();
  });

  socket.on('nickname', (nickname) => {
    players[index].setNickname(nickname);
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

  if(distance <= touchingDistance&&  Math.abs(p1.size - p2.size)> 2){
    const bigger = p1.size > p2.size ? players[i] : players[j];
    const smaller = p1.size < p2.size ? players[i] : players[j];

    bigger.eat(smaller);
  }
};

makeBot = () => {
  var mockSocket = {}
  mockSocket.connected = true;
  mockSocket.emit = function(a, b) {};

  const playerStruct = {};
  const index = players.length;
  const player = new Player(playerStruct, index);

  playerStructs.push(playerStruct);
  players.push(player);
  sockets.push(mockSocket);

  setInterval(function() {
    players[index].setMoveVector({x:Math.random()*2 - 1, y:Math.random()*2 - 1})
    let lottery = Math.random();
    lottery > 0.95 ? players[index].upgradeSpeed() : null;
    lottery < 0.05 ? players[index].upgradeSize() : null
  }, 300);
}

const newGame = () => {
  Board.init();
  let playerCount = 0;
  for(let i = 0; i < players.length; i++){
    if(!sockets[i].connected) {
      continue;
    } else {
      playerCount++;
    }
    players[i] = new Player(playerStructs[i], i);
  }

  for(let i = playerCount; i < minPlayers; i++) {
    makeBot();
  }
}



//send tick
setInterval(() => {
  const totalCurrency = Currency.getTotalCurrency();
  Board.tick();
  const boardSize = {height: Board.height, width: Board.width};

  let playerCount = 0;
  for(let i=0; i<sockets.length; i++){
    //tick sockets
    players[i].tickMove();
    const balance = Currency.getBalance(i);
    sockets[i].emit('tick', 
      {players: playerStructs, index: i, boardSize, balance, totalCurrency});

    if(playerStructs[i].alive){
      playerCount++;
    }
    else{
      //don't need to do anything with dead players
      continue;
    }

    for(let j=i+1; j< sockets.length; j++){
      if(!playerStructs[j].alive){
        //don't need to do anything with dead players
        continue;
      }

      checkForCollision(i, j);
    }
  }

  if(playerCount <= 1){
    newGame();
  }

}, TICK_PERIOD);


