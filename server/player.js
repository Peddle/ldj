const Currency = require('./currency.js');
const Board = require('./board.js');

const BASE_SPEED = 4;
const SPEED_SCALAR = 1;
const SIZE_SCALAR = 5;
const BASE_SIZE = 20;

const bound = (val, lo, hi) => {
  return Math.min(Math.max(val, lo), hi);
}

class Player {
  constructor(playerStruct, id){
    this.playerStruct_ = playerStruct;
    this.playerStruct_.position = {
        x: Math.random()*Board.width-Board.width*0.5, 
        y: Math.random()*Board.height-Board.height*0.5
      };
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
    const speed = this.speedLvl_*SPEED_SCALAR + BASE_SPEED;
    const newX = this.playerStruct_.position.x + this.moveVector_.x*speed;
    const newY = this.playerStruct_.position.y + this.moveVector_.y*speed;
    const sizeOffset = this.playerStruct_.size * 0.5;
    
    this.playerStruct_.position.x = 
      bound(newX, -Board.width*0.5 + sizeOffset, Board.width*0.5 - sizeOffset);
    this.playerStruct_.position.y = 
      bound(newY, -Board.height*0.5 + sizeOffset, Board.height*0.5 - sizeOffset);
  }

  setMoveVector(v){
    const magnitude = Math.sqrt(v.x*v.x + v.y*v.y);
    console.log(magnitude);
    const radius = this.playerStruct_.size*0.5;

    if(magnitude > radius*0.2){
      const maxSpeedDistance = radius*4;
      const multiplier = Math.min(magnitude/maxSpeedDistance, 1)/magnitude;
      this.moveVector_.x = v.x*multiplier
      this.moveVector_.y = v.y*multiplier
    }
    else{
      this.moveVector_.x = 0;
      this.moveVector_.y = 0;
    }
      
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
