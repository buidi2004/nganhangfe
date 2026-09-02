const http = require('http');

const data = JSON.stringify({
  phoneNumber: '33333333',
  password: 'password'
});

const loginOptions = {
  hostname: '203.145.46.200',
  port: 8080,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(loginOptions, (res) => {
  let loginData = '';
  res.on('data', (d) => { loginData += d; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(loginData);
      const token = parsed.data.accessToken || parsed.data.token;
      console.log('Got token');
      
      const wsOptions = {
        port: 8080,
        hostname: '203.145.46.200',
        path: '/ws-native?token=' + token,
        headers: {
          'Connection': 'Upgrade',
          'Upgrade': 'websocket'
        }
      };

      const req2 = http.request(wsOptions);
      req2.on('upgrade', (res2, socket, upgradeHead) => {
        console.log('WS Upgrade success with token in URL! Status:', res2.statusCode);
        socket.end();
      });
      req2.on('response', (res2) => {
        console.log('WS Upgrade failed. Status:', res2.statusCode);
      });
      req2.end();

    } catch(e) {}
  });
});

req.write(data);
req.end();
