// Vercel API route that imports the main server
const app = require('../backend/server.js');
const path = require('path');
const fs = require('fs');

// Handle static file serving for Vercel
module.exports = (req, res) => {
  // Check if it's a static file request
  const staticFileExtensions = ['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'];
  const ext = path.extname(req.url);
  
  if (staticFileExtensions.includes(ext)) {
    let filePath;
    
    // Map URLs to file paths
    if (req.url.startsWith('/assets/')) {
      filePath = path.join(process.cwd(), 'public', req.url);
    } else if (req.url.startsWith('/css/')) {
      filePath = path.join(process.cwd(), 'public', req.url);
    } else if (req.url.startsWith('/public/')) {
      filePath = path.join(process.cwd(), req.url);
    } else if (req.url === '/') {
      filePath = path.join(process.cwd(), 'public/public/index.html');
    } else if (req.url.endsWith('.html')) {
      filePath = path.join(process.cwd(), 'public/public', req.url);
    } else {
      filePath = path.join(process.cwd(), 'public', req.url);
    }
    
    // Try to serve the static file
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath);
      
      // Set appropriate content type
      const contentTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
      };
      
      res.setHeader('Content-Type', contentTypes[ext] || 'text/plain');
      return res.send(content);
    }
  }
  
  // Fall back to Express app for API routes
  return app(req, res);
};
