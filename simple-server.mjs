import http from 'http';

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Testing server on port 4174\n');
});

server.listen(4174, '0.0.0.0', () => {
  console.log('Server running on port 4174');
});
