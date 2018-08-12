import React, { Component } from 'react';
import './App.css';
import {socket} from './Sockets.js';
import Player from './Player.js';
import Balance from './Balance.js';

const TICK_PERIOD = 100;

const linearLerp = (a, b, ratio) => {
  return a*(1-ratio) + b*ratio;
};

const playerLerp = (playerA, playerB, ratio) => {
  const position = {
    x: linearLerp(playerA.position.x, playerB.position.x, ratio),
    y: linearLerp(playerA.position.y, playerB.position.y, ratio),
  }

  return Object.assign({}, playerB, {position});
};

const playersLerp = (playersA, playersB, ratio) => {
  return playersB.map((nextPlayer, index) => {
    if(index >= playersA.length)
      return nextPlayer;
    const previousPlayer = playersA[index];
    return playerLerp(previousPlayer, nextPlayer, ratio);
  });
};

const boardSizeLerp = (boardA, boardB, ratio) => {
  return {
    height: linearLerp(boardA.height, boardB.height, ratio),
    width: linearLerp(boardA.width, boardB.width, ratio),
  }
};

const emptyTickState = () => {
  return {
    players: [],
    boardSize: {
      height: 0,
      width: 0,
    },
  };
};

const calculatePlayspaceOffset = () => {
  const playSpace = document.getElementById('PlaySpace');
  const styles = window.getComputedStyle(playSpace);

  return {
    x: parseFloat(styles.marginLeft),
    y: parseFloat(styles.marginTop),
  };
}

class App extends Component {

  constructor(props){
    super(props);
    this.state  = {
      next: emptyTickState(),
      previous: emptyTickState(),
      startTimestamp: new Date().getTime(),
      endTimestamp: new Date().getTime() + TICK_PERIOD,
      lerped: emptyTickState(),
    };

    this.mousePos = {};
    this.mousePos.x = 0;
    this.mousePos.y = 0;

    this.startLerp_();
    this.listenForTicks_();
    this.startMousePoll_();
  }

  listenForTicks_(){
    socket.on('tick', (tickState) => {
      const previous = this.state.next;
      const next = tickState;
      const startTimestamp = new Date().getTime();
      const endTimestamp = new Date().getTime() + TICK_PERIOD;
      const update = {lerped: previous, previous, next, startTimestamp, endTimestamp};
      const newState = Object.assign(this.state, update);

      this.setState(newState);
    });
  }

  startLerp_(){
    setInterval(() => {
      const startTimestamp = this.state.startTimestamp;
      const endTimestamp = this.state.endTimestamp;
      const deltaTime = new Date().getTime() - startTimestamp;
      const totalTime = endTimestamp - startTimestamp;
      const ratio = Math.min(deltaTime / totalTime, 1);

      const previous = this.state.previous;
      const next = this.state.next;
      const lerpedPlayers = playersLerp(
        previous.players, next.players, ratio);
      const lerpedBoardSize = boardSizeLerp(
        previous.boardSize, next.boardSize, ratio);
      const lerped = Object.assign({}, next, {
        players: lerpedPlayers,
        boardSize: lerpedBoardSize,
      });
      const newState = Object.assign(this.state, {lerped});
      this.setState(newState);
    }, 10);
  }

  startMousePoll_(){
    setInterval(() => {

      const playSpaceOffset = calculatePlayspaceOffset();
      let center = {x: 250, y: 250};
      if(this.state.lerped.index !== undefined){
        center = 
          this.state.lerped.players[this.state.lerped.index].position; 
      }
      center = {
        x: this.state.lerped.boardSize.width*0.5 + center.x,
        y: this.state.lerped.boardSize.height*0.5 + center.y
      }

      center.x += playSpaceOffset.x;
      center.y += playSpaceOffset.y;


      const moveVector = {};
      moveVector.x = (this.mousePos.x - center.x).toFixed(4);
      moveVector.y = (this.mousePos.y - center.y).toFixed(4);

      socket.emit('updateMoveVector', moveVector);
    }, 100);
  }

  updateMousePos_(e){
    this.mousePos.x = e.clientX;
    this.mousePos.y = e.clientY;
  }

  upgradeSize_(){
    socket.emit('upgradeSize');
  }
  
  upgradeSpeed_(){
    socket.emit('upgradeSpeed');
  }

  handleKeyPress_(e){
    console.log(e.key);
    switch(e.key) {
      case 's':
        this.upgradeSpeed_();
        break;
      case 'd':
        this.upgradeSize_();
        break;
      default:
        break;
    }
  }

  render() {
    const center = (pos) => {
      return {
        x: this.state.lerped.boardSize.width*0.5 + pos.x,
        y: this.state.lerped.boardSize.height*0.5 + pos.y
      };
    };
    const players = this.state.lerped.players
      .filter(player => player.alive)
      .map(player => {
      return (<Player 
        size={player.size} 
        position={center(player.position)}/>);
    });
    const playSize = {
      height: this.state.lerped.boardSize.height,
      width: this.state.lerped.boardSize.width,
    };
    return (
        <div className="Game" 
      tabIndex="0"
      onKeyDown={(e) => {this.handleKeyPress_(e)}}
      onMouseMove={(e) => {this.updateMousePos_(e)}}>
        <div id='PlaySpace' className="PlaySpace" style={ playSize }>
          {players}
        </div>
        <Balance 
            balance={this.state.lerped.balance} 
            total={this.state.lerped.totalCurrency}/>
      </div>
    );
  }
}

export default App;
