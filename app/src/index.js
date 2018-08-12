import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';


const Home = (props) => (
  <div>
    <input 
      onChange={props.onNicknameChange} 
      placeholder="Enter Nickname"/>
    <a onClick={props.onPlay}>Play Game</a>
  </div>
);


class Routes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menu: false,
      nickname: "",
    };
  }
  handleChange() {
  }

  playGame() {
    const newState = Object.assign({}, this.state);
    newState.menu = false;
    this.setState(newState);
  }

  updateNickname(e) {
    const newState = Object.assign({}, this.state);
    newState.nickname = e.target.value;
    this.setState(newState);
  }

  render() {
    const view = this.state.menu ? 
      (<Home 
        onNicknameChange={(e)=> this.updateNickname(e)} 
        onPlay={() => this.playGame()}/>) :
      (<App nickname={this.state.nickname}/>);

    return view;
  }
}

ReactDOM.render(<Routes />, document.getElementById('root'));

registerServiceWorker();
