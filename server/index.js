const io = require('socket.io')();
const Currency = require('./currency.js');

io.listen(3001)

const TICK_PERIOD = 300;
const players = []
const START_SIZE = 1000
const boardSize = {
  height: START_SIZE,
  width: START_SIZE
}
const SPEED_SCALAR = 20;


//Shrink game board
setInterval(() => {
  boardSize.height -= 5;
  boardSize.width -= 5;

  if(boardSize.height < 0){
    boardSize.height = START_SIZE;
    boardSize.width = START_SIZE;
  }
}, TICK_PERIOD); 

//Player state update
const game = io.on('connection', (socket) => {
  const player = {
    position: {x: Math.random()*500, y: Math.random()*500},
    alive: true,
  };
  const index = players.length;
  let moveVector = {x: 1, y: 1};
  let speedLvl = 1;
  Currency.initAccount(index);

  players.push(player)
    
  const kill = () => {
    Currency.deleteAccount(index);
    player.alive = false;
  }

  //send tick
  setInterval(() => {
    const speed = speedLvl*SPEED_SCALAR;
    player.position.x = Math.max(
      Math.min(player.position.x + moveVector.x*speed, boardSize.width),
      0);
    player.position.y = Math.max(
      Math.min(player.position.y + moveVector.y*speed, boardSize.height), 
      0);

    const balance = Currency.getBalance(index);
    const totalCurrency = Currency.getTotalCurrency();


    socket.emit('tick', {players, index, boardSize, balance, totalCurrency});
  }, TICK_PERIOD);

  socket.on('disconnect', () => {
    kill();
  });

  socket.on('updateMoveVector', (v) => {
    divisor = Math.sqrt(v.x*v.x + v.y*v.y);
    
    moveVector.x = v.x/divisor;
    moveVector.y = v.y/divisor;
  });

  socket.on('upgradeSpeed', () => {
    console.log('upgrade speed');
    if(Currency.debitUpgrade(index, speedLvl)){
      speedLvl++;
    }
  });
});


