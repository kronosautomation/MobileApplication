/**
 * Utility script to clear cache and restart the Expo app
 * This script will clear the Metro bundler cache and restart your app
 * Run with: node clear-cache.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Clearing Expo/Metro bundler cache...');

try {
  // Remove .expo folder if it exists
  const expoDir = path.join(__dirname, '.expo');
  if (fs.existsSync(expoDir)) {
    console.log('Removing .expo directory...');
    fs.rmSync(expoDir, { recursive: true, force: true });
  }
  
  // Remove node_modules/.cache if it exists
  const cacheDir = path.join(__dirname, 'node_modules', '.cache');
  if (fs.existsSync(cacheDir)) {
    console.log('Removing node_modules/.cache directory...');
    fs.rmSync(cacheDir, { recursive: true, force: true });
  }
  
  console.log('Cache directories removed successfully.');
  
  // Restart the Expo server with cleared cache
  console.log('Restarting Expo server with cleared cache...');
  execSync('npx expo start --clear', { stdio: 'inherit' });
} catch (error) {
  console.error('Error clearing cache:', error.message);
  console.log('\nPlease try running the following commands manually:');
  console.log('rm -rf .expo');
  console.log('rm -rf node_modules/.cache');
  console.log('npx expo start --clear');
}
