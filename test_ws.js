const http = require('http');

const options = {
  port: 8080,
  hostname: '203.145.46.200',
  path: '/ws-native',
  headers: {
    'Connection': 'Upgrade',
    'Upgrade': 'websocket'
  }
};

const req = http.request(options);
req.on('upgrade', (res, socket, upgradeHead) => {
  console.log('Got upgrade! HTTP Version:', res.httpVersion);
  console.log('Status code:', res.statusCode);
  socket.end();
});
req.on('response', (res) => {
  console.log('Got standard response instead of upgrade. Status:', res.statusCode);
});
req.on('error', (e) => {
  console.error('Request error:', e.message);
});
req.end();
