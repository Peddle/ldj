const {TICK_PERIOD} = require( './tick.js' );
const START_SIZE = 1000
const SHRINK_RATE = 3;

const board = {
  height: START_SIZE,
  width: START_SIZE,
};

board.init = () => {
  board.height = START_SIZE;
  board.width = START_SIZE;
};

board.tick = () => {
  board.height -= SHRINK_RATE;
  board.width -= SHRINK_RATE;

  if(board.height < 0){
    board.height = START_SIZE;
    board.width = START_SIZE;
  }
};

module.exports = board;

