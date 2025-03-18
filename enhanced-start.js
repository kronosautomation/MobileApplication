/**
 * Enhanced startup script with additional logging
 * Run with: node enhanced-start.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Log file setup
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFile = path.join(logDir, `startup-${new Date().toISOString().replace(/:/g, '-')}.log`);
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

// Log both to console and file
function log(message) {
  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] ${message}`;
  console.log(formattedMessage);
  logStream.write(formattedMessage + '\n');
}

log('=== Enhanced Startup Script ===');
log('Checking environment...');

// Log Node.js and npm versions
log(`Node version: ${process.version}`);
log(`Using diagnostic app to isolate "Super expression" error`);

// Clear caches
log('Clearing React Native and Metro caches...');

// Start the Metro bundler with diagnostic app
log('Starting Metro bundler...');
log('Using enhanced error reporting...');

const startProcess = spawn('npx', ['expo', 'start', '--clear'], { 
  env: { 
    ...process.env, 
    DEBUG: 'metro:*', 
    REACT_DEBUGGER: 'echo Debugger attached && sleep 5000'
  },
  stdio: 'pipe'
});

// Pipe output to our log
startProcess.stdout.on('data', (data) => {
  const output = data.toString();
  log(`[METRO] ${output.trim()}`);
  
  // Look for specific error patterns
  if (output.includes('Super expression must either be null or a function')) {
    log('DETECTED KEY ERROR: Super expression must either be null or a function');
    log('This typically indicates a component inheritance issue or circular dependency');
  }
  
  if (output.includes('main has not been registered')) {
    log('DETECTED KEY ERROR: "main" has not been registered');
    log('This suggests the App component failed to initialize properly');
  }
});

startProcess.stderr.on('data', (data) => {
  log(`[ERROR] ${data.toString().trim()}`);
});

startProcess.on('close', (code) => {
  log(`Metro bundler process exited with code ${code}`);
  logStream.end();
});

// Catch script errors
process.on('uncaughtException', (err) => {
  log(`Uncaught exception: ${err.message}`);
  log(err.stack);
  logStream.end();
  process.exit(1);
});
