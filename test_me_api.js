const http = require('http');

const options = {
  hostname: '203.145.46.200',
  port: 8080,
  path: '/api/v1/users/me',
  method: 'GET',
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(data);
  });
});

req.on('error', (e) => {
  console.error(e);
});
req.end();
