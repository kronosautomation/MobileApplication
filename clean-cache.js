/**
 * Cache cleaning utility for MindfulMastery mobile application
 * 
 * This script cleans various caches that can cause bundling errors
 * Run with: node clean-cache.js
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

console.log('Starting cache cleanup process...');

// Define caches to clean
const cachesToClean = [
  path.join(__dirname, '.expo'),
  path.join(__dirname, 'node_modules', '.cache')
];

// Clean cache directories
console.log('\nCleaning cache directories...');
cachesToClean.forEach(cachePath => {
  if (fs.existsSync(cachePath)) {
    try {
      console.log(`Removing ${cachePath}...`);
      fs.rmSync(cachePath, { recursive: true, force: true });
      console.log(`Successfully removed ${cachePath}`);
    } catch (error) {
      console.error(`Error removing ${cachePath}:`, error.message);
    }
  } else {
    console.log(`Directory doesn't exist, skipping: ${cachePath}`);
  }
});

// Function to run a command and handle errors
function runCommand(command, args, errorMessage) {
  console.log(`\nRunning: ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { 
    stdio: 'inherit', 
    shell: process.platform === 'win32' 
  });
  
  if (result.error) {
    console.error(`${errorMessage}: ${result.error.message}`);
  } else if (result.status !== 0) {
    console.error(`${errorMessage}. Exit code: ${result.status}`);
  } else {
    console.log('Command completed successfully');
  }
  return result.status === 0;
}

// Try to clean watchman cache if available
runCommand('watchman', ['watch-del-all'], 'Failed to clean watchman cache. This is OK if you don\'t use watchman');

console.log('\nCache cleanup completed!');
console.log('\nNow restart your Metro bundler with:');
console.log('npx expo start --clear');
