/**
 * Script to start the app with the JavaScript entry point
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting app with JavaScript entry point...');

// Kill existing metro processes if any
try {
  if (process.platform === 'win32') {
    execSync('taskkill /f /im node.exe', { stdio: 'ignore' });
  } else {
    execSync('pkill -f "node.*metro"', { stdio: 'ignore' });
  }
  console.log('Killed existing metro processes');
} catch (error) {
  console.log('No existing metro processes to kill');
}

// Clear caches
const cachesToClear = [
  path.join(__dirname, '.expo'),
  path.join(__dirname, 'node_modules', '.cache')
];

cachesToClear.forEach(cachePath => {
  if (fs.existsSync(cachePath)) {
    try {
      fs.rmSync(cachePath, { recursive: true, force: true });
      console.log(`Removed cache directory: ${cachePath}`);
    } catch (error) {
      console.warn(`Failed to remove cache directory: ${cachePath}`);
    }
  }
});

// Set environment variable to prefer JS over TS
process.env.EXPO_USE_JS_ENTRY = 'true';

// Start the app with specific entry point
try {
  console.log('Starting Expo with JavaScript entry point...');
  execSync('npx expo start --clear', { 
    stdio: 'inherit',
    env: { ...process.env, EXPO_USE_JS_ENTRY: 'true' }
  });
} catch (error) {
  console.error('Failed to start Expo:', error.message);
}
