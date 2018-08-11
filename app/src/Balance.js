import React, { Component } from 'react';
import './App.css';

class Balance extends Component {
  render() {
    return (
      <div className="Balance">
        Balance: {this.props.balance} of {this.props.total}
      </div>
    );
  };
}



export default Balance;
