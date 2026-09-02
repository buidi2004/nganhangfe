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
      
      const notifOptions = {
        hostname: '203.145.46.200',
        port: 8080,
        path: '/api/v1/notifications?page=0&size=5',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      const req2 = http.request(notifOptions, (res2) => {
        let nData = '';
        res2.on('data', (d) => { nData += d; });
        res2.on('end', () => {
            console.log('Notif payload:', nData);
        });
      });
      req2.end();
    } catch(e) {
      console.log('Login failed', loginData);
    }
  });
});

req.write(data);
req.end();
