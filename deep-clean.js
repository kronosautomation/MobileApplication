/**
 * Deep cleaning utility for MindfulMastery
 * 
 * This script performs a thorough cleanup of the project
 * to resolve dependency and bundling issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting deep cleanup process...');

// Directories to clean
const dirsToClean = [
  '.expo',
  'node_modules/.cache',
  '.expo-shared'
];

// Ensure correct working directory
try {
  process.chdir(__dirname);
  console.log('Working directory:', process.cwd());
} catch (err) {
  console.error('Error changing to project directory:', err);
  process.exit(1);
}

// Clean directories
console.log('\nCleaning directories...');
dirsToClean.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    try {
      console.log(`Removing ${dir}...`);
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`Successfully removed ${dir}`);
    } catch (err) {
      console.error(`Error removing ${dir}:`, err.message);
    }
  } else {
    console.log(`Directory not found, skipping: ${dir}`);
  }
});

// Run commands with proper error handling
function runCommand(command, errorMessage) {
  try {
    console.log(`\nRunning: ${command}`);
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (err) {
    console.error(`${errorMessage}: ${err.message}`);
    return false;
  }
}

// Fix context duplication
console.log('\nFixing context duplication...');
const contextSingularPath = path.join(__dirname, 'src', 'context', 'AuthContext.tsx');
const warningContent = `/**
 * This file has been deprecated.
 * Please import from '../auth' instead.
 */

// Error to prevent accidental usage
throw new Error(
  'This AuthContext implementation has been deprecated. ' +
  'Please import from \\'../auth\\' instead.'
);`;

try {
  fs.writeFileSync(contextSingularPath, warningContent);
  console.log('Successfully updated singular context file with warning');
} catch (err) {
  console.error('Error updating context file:', err.message);
}

// Update import paths
console.log('\nChecking for incorrect imports...');
const accountScreenPath = path.join(__dirname, 'src', 'screens', 'profile', 'AccountScreen.tsx');
if (fs.existsSync(accountScreenPath)) {
  try {
    let content = fs.readFileSync(accountScreenPath, 'utf8');
    // Check if import is from contexts instead of auth
    if (content.includes("from '../../contexts/AuthContext'")) {
      content = content.replace(
        "from '../../contexts/AuthContext'", 
        "from '../../auth'"
      );
      fs.writeFileSync(accountScreenPath, content);
      console.log('Fixed AuthContext import in AccountScreen.tsx');
    } else {
      console.log('AccountScreen.tsx already has correct imports');
    }
  } catch (err) {
    console.error('Error updating AccountScreen.tsx:', err.message);
  }
}

// Clean and reinstall node modules (optional)
console.log('\nWould you like to clean and reinstall node modules? (y/n)');
console.log('(This is a simulated prompt - in a real scenario, this would ask for input)');
console.log('Skipping node_modules reinstall for now. You can run this manually if needed:');
console.log('npm ci');

// Install expo-image-picker if needed
console.log('\nEnsuring expo-image-picker is installed...');
runCommand('npm list expo-image-picker || npm install expo-image-picker --save', 
  'Failed to check/install expo-image-picker');

// Final cleanup
console.log('\nPerforming final cleanup...');
if (process.platform === 'win32') {
  runCommand('npx expo-doctor', 'Failed to run expo-doctor');
} else {
  runCommand('npx expo-doctor', 'Failed to run expo-doctor');
}

console.log('\nDeep cleanup completed!');
console.log('\nPlease restart your app with:');
console.log('npx expo start --clear');
console.log('\nIf issues persist, try running in diagnostic mode:');
console.log('node start-diagnostic.js');
