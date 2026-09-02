const http = require('http');

const data = JSON.stringify({
  phoneNumber: '2134569870',
  password: 'password'
});

const loginOptions = {
  hostname: '203.145.46.200',
  port: 8080,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(loginOptions, (res) => {
  let loginData = '';
  res.on('data', (d) => { loginData += d; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(loginData);
      const token = parsed.data.accessToken || parsed.data.token;
      
      const meOptions = {
        hostname: '203.145.46.200',
        port: 8080,
        path: '/api/v1/users/me',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      const req2 = http.request(meOptions, (res2) => {
        let meData = '';
        res2.on('data', (d) => { meData += d; });
        res2.on('end', () => {
            console.log('Me payload:', meData);
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
