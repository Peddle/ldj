import React, { Component } from 'react';

class Player extends Component {
  render() {
    return (
      <div className="Player" style={this.playerStyle()}>
      </div>
    );
  };

  playerStyle(){
    return {
      position: "absolute",
      backgroundColor: "#F44",
      width: this.props.size,
      height: this.props.size,
      borderRadius: "100%",
      top: this.props.position.y - this.props.size*0.5,
      left: this.props.position.x - this.props.size*0.5,
    };
  }
}



export default Player;
