const express = require('express');
const path = require('path');
const history = require('connect-history-api-fallback');

const app = express();
const PORT = process.env.PORT || 4174;

// Apply history API fallback for SPA navigation
app.use(history());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// For any route that doesn't match a static file, serve index.html
app.get('*', (req, res) => {
  // Special case for /app.html route
  if (req.path === '/app' || req.path === '/app.html') {
    res.sendFile(path.join(__dirname, 'dist', 'app.html'));
  } else {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
