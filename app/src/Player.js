import React, { Component } from 'react';
import './Player.css';
import perlin from 'perlin-noise';

const colors = [
  [255, 68, 68],
  [102, 204, 255],
  [70, 255, 180],
  [255, 100, 200],
  [255, 204, 173],
  [225, 173, 255],
];


const flicker = perlin.generatePerlinNoise(1, 1000, {
  persistence: 0.01,
});

const toRgba = (color, a) => {
  const [r,g,b] = color;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

const tagStyle = (size) => {
  const fontSize = Math.min(30, size*0.4);
  return {
    position: "absolute",
    bottom: -fontSize - 2,
    fontSize: fontSize,

    
    left: -200,
    right: -200,
  };
};

class Player extends Component {
  constructor(props) {
    super(props);

    this.flickerIndex = 0;
  }
  render() {
    const nickname = this.props.nickname || "anonymous";
    const maybeYouClass = this.props.isYou ? "YourPlayer" : "";
    return (
      <div className={maybeYouClass} style={this.playerStyle()}>
        <div style={tagStyle(this.props.size)}>
          {nickname}
        </div>
      </div>
    );
  }

  playerStyle(){
    const color = colors[this.props.index%colors.length];
    const noiseScalar = flicker[this.flickerIndex++%flicker.length];
    const auraSize = this.props.size*0.2 + 2*noiseScalar;

    const baseStyles = {
      position: "absolute",
      zIndex: 5,
      backgroundColor: toRgba(color, 1),
      width: this.props.size,
      height: this.props.size,
      borderRadius: "100%",
      top: this.props.position.y - this.props.size*0.5,
      left: this.props.position.x - this.props.size*0.5,
      boxShadow: "0 0 0 " + 
          auraSize + "px " + toRgba(color, 0.3),
    };

    const yourPlayerStyles = {
      // borderWidth: this.props.size*0.4,
      // borderStyle: "solid"
    }

    return this.props.isYou ? 
      Object.assign(baseStyles, yourPlayerStyles) :
      baseStyles;
  }
}



export default Player;
