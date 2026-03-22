const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const port = process.argv[2] || process.env.PORT || '8080';
const projectRoot = path.resolve(__dirname, '..');
const logsDir = path.join(projectRoot, 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
const logFile = path.join(logsDir, 'server.log');

const outStream = fs.createWriteStream(logFile, { flags: 'a' });
outStream.write(`\n=== serve-logged starting at ${new Date().toISOString()} (port ${port}) ===\n`);

const child = spawn(process.execPath, ['scripts/serve.js', String(port)], {
  cwd: projectRoot,
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: false
});

child.stdout.on('data', (chunk) => {
  outStream.write(chunk);
  process.stdout.write(chunk);
});
child.stderr.on('data', (chunk) => {
  outStream.write(chunk);
  process.stderr.write(chunk);
});

child.on('close', (code) => {
  outStream.write(`\n=== serve-logged stopped (${code}) at ${new Date().toISOString()} ===\n`);
  outStream.end();
  process.exit(code);
});

process.on('SIGINT', () => {
  child.kill('SIGINT');
});

// keep this process running as long as the child is running
console.log(`serve-logged: spawned server on port ${port}, logging to ${logFile}`);
