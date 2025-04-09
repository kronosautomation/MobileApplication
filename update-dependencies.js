/**
 * Utility script to update project dependencies
 * This script adds missing dependencies to the project
 * Run with: node update-dependencies.js
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

console.log('Updating project dependencies...');

// Read the current package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Check if expo-image-picker is already installed
if (!packageJson.dependencies['expo-image-picker']) {
  console.log('Installing expo-image-picker...');
  try {
    execSync('npm install expo-image-picker --save', { stdio: 'inherit' });
    console.log('Successfully installed expo-image-picker');
  } catch (error) {
    console.error('Failed to install expo-image-picker:', error.message);
    process.exit(1);
  }
} else {
  console.log('expo-image-picker is already installed.');
}

// Update app.json with necessary permissions if needed
const appJsonPath = path.join(__dirname, 'app.json');
let appJson;

try {
  appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
} catch (error) {
  console.error('Failed to read app.json:', error.message);
  process.exit(1);
}

// Check if plugins section exists and if expo-image-picker is configured
if (!appJson.expo.plugins) {
  appJson.expo.plugins = [];
}

// Check if expo-image-picker plugin is already configured
const hasImagePickerPlugin = appJson.expo.plugins.some(plugin => 
  Array.isArray(plugin) && plugin[0] === 'expo-image-picker'
);

if (!hasImagePickerPlugin) {
  console.log('Adding expo-image-picker plugin configuration to app.json...');
  appJson.expo.plugins.push([
    'expo-image-picker',
    {
      'photosPermission': 'The app needs access to your photos to update your profile picture.',
      'cameraPermission': 'The app needs access to your camera to take profile pictures.'
    }
  ]);

  // Write the updated app.json
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
  console.log('Successfully updated app.json with expo-image-picker configuration');
}

console.log('Dependency update completed.');
console.log('Please run "npx expo start --clear" to restart your app with the new dependencies.');
