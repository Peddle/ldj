import React, { Component } from 'react';
import './App.css';

class Balance extends Component {
  render() {
    return (
      <div>
        <div style={this.outerBarStyle()}>
          <div style={this.innerBarStyle()}>
          </div>
        </div>
      </div>
    );
  };


  outerBarStyle(){
    const height = 40;
    return{
      position: "absolute",
      bottom: -height,
      width: "100%",
      height: height,
      backgroundColor: "#222",
    };
  }

  innerBarStyle(){
    const percent = this.props.balance*100.0 / this.props.total;
    return{
      position: "absolute",
      width: percent + "%",
      height: "100%",
      backgroundColor: "#8f8",
      boxShadow: "0 0 8px 8px rgba(8, 255, 136, 0.2)",
    };
  }
}

export default Balance;
