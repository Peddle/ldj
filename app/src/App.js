import React, { Component } from 'react';
import './App.css';
import {socket} from './Sockets.js';
import Player from './Player.js';

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

class App extends Component {
  constructor(props){
    super(props);
    this.state  = {
      next: {
        players: []
      },
      previous: {
        players: []
      },
      startTimestamp: new Date().getTime(),
      endTimestamp: new Date().getTime() + 300,
      lerped: {
        players: []
      },
    };

    this.mousePos = {};
    this.mousePos.x = 0;
    this.mousePos.y = 0;

    this.startLerp_();
    this.listenForTicks_();
    this.startMousePoll_();
  }

  listenForTicks_(){
    socket.on('tick', (players) => {
      const previous = this.state.next;
      const next = players;
      const startTimestamp = new Date().getTime();
      const endTimestamp = new Date().getTime() + 300;
      const update = {previous, next, startTimestamp, endTimestamp};
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
      const lerpedPlayers = next.players.map((nextPlayer, index) => {
        if(index >= previous.players.length)
          return nextPlayer;
        const previousPlayer = previous.players[index];
        return playerLerp(previousPlayer, nextPlayer, ratio);
      });
      const lerped = Object.assign({}, next, {
        players: lerpedPlayers
      });
      const newState = Object.assign(this.state, {lerped});
      this.setState(newState);
    }, 10);
  }

  startMousePoll_(){
    setInterval(() => {

      let center = {x: 250, y: 250};
      if(this.state.lerped.index !== undefined){
        center = 
          this.state.lerped.players[this.state.lerped.index].position; 
      }
      const moveVector = {};
      moveVector.x = this.mousePos.x - center.x;
      moveVector.y = this.mousePos.y - center.y;

      console.log(moveVector);
      socket.emit('updateMoveVector', moveVector);
    }, 100);
  }

  updateMousePos_(e){
    this.mousePos.x = e.clientX;
    this.mousePos.y = e.clientY;
  }

  render() {
    const players = this.state.lerped.players
      .filter(player => player.alive)
      .map(player => {
      return (<Player position={player.position}/>);
    });
    return (
        <div className="Game" 
      onMouseMove={(e) => {this.updateMousePos_(e)}}>
          {players}
        </div>
    );
  }
}

export default App;
