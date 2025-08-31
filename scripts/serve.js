// Minimal zero-dependency static file server for local preview
// Usage: node scripts/serve.js [port]
const http = require('http');
const fs = require('fs');
const path = require('path');
const port = parseInt(process.argv[2], 10) || 8080;

const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json'
};

http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(process.cwd(), urlPath);
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = mime[ext] || 'application/octet-stream';
    res.writeHead(200, {'Content-Type': type});
    fs.createReadStream(filePath).pipe(res);
  });
}).listen(port, () => {
  console.log(`Serving ${process.cwd()} on http://localhost:${port}`);
});
