import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MIME types for common file extensions
const contentTypeMap = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Handle special routes
  let filePath;
  if (req.url === '/app' || req.url === '/app.html') {
    filePath = path.join(__dirname, 'dist', 'app.html');
  } else {
    // Get the file path based on URL
    filePath = path.join(
      __dirname, 
      'dist', 
      req.url === '/' ? 'index.html' : decodeURI(req.url).replace(/^\/+/, '')
    );
  }
  
  // Get file extension
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = contentTypeMap[extname] || 'application/octet-stream';
  
  // Read the file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      // If the file doesn't exist, check if we should serve index.html (client-side routing)
      if (err.code === 'ENOENT') {
        console.log(`File not found: ${filePath}, trying index.html`);
        
        // For requests that might be part of client-side routing, serve index.html
        // But for asset requests that truly don't exist, return 404
        if (!extname || extname === '.html') {
          // For app routes, serve app.html
          if (req.url.startsWith('/app')) {
            fs.readFile(path.join(__dirname, 'dist', 'app.html'), (err, content) => {
              if (err) {
                res.writeHead(500);
                res.end('Server Error');
                return;
              }
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(content, 'utf-8');
            });
          } else {
            // For other routes, serve index.html
            fs.readFile(path.join(__dirname, 'dist', 'index.html'), (err, content) => {
              if (err) {
                res.writeHead(500);
                res.end('Server Error');
                return;
              }
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(content, 'utf-8');
            });
          }
        } else {
          // If it's a missing asset, return 404
          res.writeHead(404);
          res.end('Not found');
        }
      } else {
        // For other errors, return 500
        console.error(`Error reading file: ${err}`);
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
      return;
    }
    
    // Success - return the file
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content, 'utf-8');
  });
});

const PORT = 4174;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
