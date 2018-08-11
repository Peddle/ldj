import openSocket from 'socket.io-client';
const socket = openSocket('http://aaronpeddle.com:3001');

export { socket };
