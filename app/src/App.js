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
      showInstructions: true,
      winner: "Aaron",
    };

    this.mousePos = {};
    this.mousePos.x = 0;
    this.mousePos.y = 0;

    this.startLerp_();
    this.listenForTicks_();
    this.startMousePoll_();
    this.listenForWinner_();
    if(props.nickname) this.sendNickname_(props.nickname);
  }

  sendNickname_(nickname){
    socket.emit('nickname', nickname);
  }

  listenForWinner_(){
    socket.on('winner', (winner) => {
      console.log("winner: " + winner);
      this.setState(
        Object.assign({}, this.state, {winner}));
    });
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

  hideInstructions(){
    const newState = Object.assign({}, this.state);
    newState.showInstructions = false;
    this.setState(newState);
  }

  render() {
    const center = (pos) => {
      return {
        x: this.state.lerped.boardSize.width*0.5 + pos.x,
        y: this.state.lerped.boardSize.height*0.5 + pos.y
      };
    };
    const players = this.state.lerped.players
      .map((player, i) => {
        if(!player.alive) return false;
        const isYou = i === this.state.lerped.index;
        return (<Player 
          size={player.size} 
          key={i}
          index={i}
          isYou={isYou}
          nickname={player.nickname}
          position={center(player.position)}/>);
      });
    const playSize = {
      height: this.state.lerped.boardSize.height,
      width: this.state.lerped.boardSize.width,
    };
    const maybeInstructions = this.state.showInstructions ? 
      (<div class="Instructions">
          <div 
            class="close" 
            onClick={() => {this.hideInstructions()}}>[ x ]</div>
          <h3>How to play:</h3>
            <h4>Objective</h4>
              <p>Be the last one standing by eating your opponents and stealing their power</p>
              <p>You Can only eat opponents who are smaller than you</p>
            <h4>Controls</h4>
            <ul>
              <li>Use mouse to move</li>
              <li>"S" key buy a speed upgrade with power </li>
              <li>"D" key buy a size upgrade with power </li>
            </ul>
            <h4>Tip!</h4>
            <p>
              Upgrades cost a percentage of total power in the game. Wait for other players to spend their money to increase you purchasing power
            </p>
      </div>) : false;

    const previousWinner = <div className="Winner">
      Previous Winner: <span>
      {this.state.winner}
      </span></div>;

    return (
      <div className="Game" 
          tabIndex="0"
          onKeyDown={(e) => {this.handleKeyPress_(e)}}
          onMouseMove={(e) => {this.updateMousePos_(e)}}>
        <div id='PlaySpace' className="PlaySpace" style={ playSize }>
          {players}
          <Balance 
              balance={this.state.lerped.balance} 
              total={this.state.lerped.totalCurrency}/>
        </div>
        {previousWinner}
        {maybeInstructions}
      </div>
    );
  }
}

export default App;
