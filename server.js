const WebSocket = require('ws');
const socket = new WebSocket.Server({ port: 8080 });

let players = []; 
function broadcast(message) {
  socket.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

socket.on('connection', (ws) => {
  let playerName = `Player ${players.length + 1}`;
  let playerColor = ''; 

  players.push({ ws, playerName, playerColor });

  ws.send(JSON.stringify({ type: 'assignPlayer', playerName, color: playerColor }));

  broadcast({ type: 'playerJoined', playerName, color: playerColor });

  ws.on('message', (message) => {
    const msg = JSON.parse(message);
    if (msg.type === 'playerColor') {
      playerColor = msg.color;
      broadcast({ type: 'playerColorUpdate', playerName, color: playerColor });
    }
    if (msg.type === 'chat') {
      broadcast({ type: 'chat', message: `${playerName}: ${msg.message}` });
    }
  });
  ws.on('close', () => {
    players = players.filter(player => player.ws !== ws);
    broadcast({ type: 'playerLeft', playerName });
  });
});
