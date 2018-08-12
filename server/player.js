const Currency = require('./currency.js');
const Board = require('./board.js');

const SPEED_SCALAR = 20;
const SIZE_SCALAR = 5;
const BASE_SIZE = 20;

const bound = (val, lo, hi) => {
  return Math.min(Math.max(val, lo), hi);
}

class Player {
  constructor(playerStruct, id){
    this.playerStruct_ = playerStruct;
    this.playerStruct_.position = 
      {x: Math.random()*Board.width, y: Math.random()*Board.height};
    this.playerStruct_.alive = true;
    this.playerStruct_.size = BASE_SIZE;
    this.id_ = id;
    this.moveVector_ = {x: 1, y: 1};
    this.speedLvl_ = 1;
    this.sizeLvl_ = 1;

    Currency.initAccount(this.id_);
  }

  kill(){
    Currency.deleteAccount(this.id_);
    this.playerStruct_.alive = false;
  }

  tickMove(){
    const speed = this.speedLvl_*SPEED_SCALAR;
    const newX = this.playerStruct_.position.x + this.moveVector_.x*speed;
    const newY = this.playerStruct_.position.y + this.moveVector_.y*speed;
    const sizeOffset = this.playerStruct_.size * 0.5;
    
    this.playerStruct_.position.x = 
      bound(newX, 0 + sizeOffset, Board.width - sizeOffset);
    this.playerStruct_.position.y = 
      bound(newY, 0 + sizeOffset, Board.height - sizeOffset);

  }

  setMoveVector(v){
    const divisor = Math.sqrt(v.x*v.x + v.y*v.y);
    
    this.moveVector_.x = v.x/divisor;
    this.moveVector_.y = v.y/divisor;
  }

  upgradeSpeed(){
    if(Currency.debitUpgrade(this.id_, this.speedLvl_)){
      this.speedLvl_++;
    }
  }
  
  upgradeSize(){
    if(Currency.debitUpgrade(this.id_, this.sizeLvl_)){
      this.sizeLvl_++;
      this.playerStruct_.size = (this.sizeLvl_ - 1) * SIZE_SCALAR + BASE_SIZE;
    }
  }

  eat(target){
    Currency.transfer(target.id_, this.id_);
    target.kill();
  }
}

module.exports = Player;
