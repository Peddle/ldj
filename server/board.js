const {TICK_PERIOD} = require( './tick.js' );
const START_SIZE = 1000

const board = {
  height: START_SIZE,
  width: START_SIZE,
};

board.init = () => {
  board.height = START_SIZE;
  board.width = START_SIZE;
};

//Shrink game board
setInterval(() => {
  board.height -= 5;
  board.width -= 5;

  if(board.height < 0){
    board.height = START_SIZE;
    board.width = START_SIZE;
  }
}, TICK_PERIOD); 

module.exports = board;

