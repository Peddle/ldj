import React, { Component } from 'react';

class Player extends Component {
  constructor(props) {
    super(props);
    props.position;
  }

  render() {
    return (
      <div className="Player" style={this.playerStyle()}>
      </div>
    );
  };

  playerStyle(){
    return {
      position: "absolute",
      backgroundColor: "red",
      width: "100px",
      height: "100px",
      borderRadius: "100%",
      top: this.props.position.y - 50,
      left: this.props.position.x - 50,
    };
  }
}



export default Player;
