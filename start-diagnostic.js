/**
 * Diagnostic mode launcher for MindfulMastery
 * 
 * This script runs the app in diagnostic mode with a simplified component structure
 * to help identify registration issues.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Backup original index.js
const indexPath = path.join(__dirname, 'index.js');
const backupPath = path.join(__dirname, 'index.js.bak');

console.log('Starting diagnostic mode...');

try {
  // Backup original index.js if it exists and we haven't already
  if (fs.existsSync(indexPath) && !fs.existsSync(backupPath)) {
    console.log('Backing up original index.js...');
    fs.copyFileSync(indexPath, backupPath);
  }

  // Replace index.js with diagnostic version
  console.log('Installing diagnostic entry point...');
  const diagnosticContent = fs.readFileSync(
    path.join(__dirname, 'diagnostic-index.js'), 
    'utf8'
  );
  fs.writeFileSync(indexPath, diagnosticContent);

  // Clear caches
  console.log('Clearing caches...');
  const cachesToClear = [
    path.join(__dirname, '.expo'),
    path.join(__dirname, 'node_modules', '.cache')
  ];
  
  cachesToClear.forEach(cachePath => {
    if (fs.existsSync(cachePath)) {
      try {
        fs.rmSync(cachePath, { recursive: true, force: true });
      } catch (err) {
        console.warn(`Could not remove ${cachePath}: ${err.message}`);
      }
    }
  });

  // Start Expo in diagnostic mode
  console.log('Starting expo in diagnostic mode...');
  execSync('npx expo start --clear', { stdio: 'inherit' });
} catch (error) {
  console.error('Error in diagnostic mode:', error);
} finally {
  // Restore original index.js when done
  if (fs.existsSync(backupPath)) {
    console.log('Restoring original index.js...');
    fs.copyFileSync(backupPath, indexPath);
    fs.unlinkSync(backupPath);
  }
}
