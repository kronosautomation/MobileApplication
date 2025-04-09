/**
 * Dependency check utility for MindfulMastery
 * 
 * This script checks for common dependency issues that could cause
 * bundling errors, particularly with expo-image-picker
 * Run with: node check-dependencies.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Checking dependencies for potential issues...');

// Read package.json
let packageJson;
try {
  packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  console.log('Successfully read package.json');
} catch (error) {
  console.error('Error reading package.json:', error.message);
  process.exit(1);
}

// Check for expo-image-picker
const hasImagePicker = packageJson.dependencies && 'expo-image-picker' in packageJson.dependencies;
console.log(`expo-image-picker ${hasImagePicker ? 'is' : 'is NOT'} listed in dependencies`);

if (hasImagePicker) {
  console.log(`expo-image-picker version: ${packageJson.dependencies['expo-image-picker']}`);
} else {
  console.log('expo-image-picker should be added to dependencies');
}

// Check Expo SDK version
const expoVersion = packageJson.dependencies && packageJson.dependencies.expo;
console.log(`Expo SDK version: ${expoVersion || 'Not found'}`);

// Check React Native version
const rnVersion = packageJson.dependencies && packageJson.dependencies['react-native'];
console.log(`React Native version: ${rnVersion || 'Not found'}`);

// Check for peer dependency conflicts
console.log('\nChecking for dependency conflicts...');
try {
  console.log('Running npm ls expo-image-picker:');
  execSync('npm ls expo-image-picker', { stdio: 'inherit' });
} catch (error) {
  console.log('Dependency tree has issues. This could be causing your error.');
}

// Check node_modules for actual installation
const imagepickerPath = path.join(__dirname, 'node_modules', 'expo-image-picker');
const isInstalled = fs.existsSync(imagepickerPath);

console.log(`\nexpo-image-picker is ${isInstalled ? 'correctly installed' : 'NOT correctly installed'} in node_modules`);

if (!isInstalled) {
  console.log('\nRecommendation: Reinstall expo-image-picker:');
  console.log('npm uninstall expo-image-picker');
  console.log('npm install expo-image-picker --save');
} else {
  // Check for common configuration issues
  const appJsonPath = path.join(__dirname, 'app.json');
  let appJson;
  
  try {
    appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    
    // Check for plugins configuration
    const hasPlugins = appJson.expo && appJson.expo.plugins;
    const hasImagePickerPlugin = hasPlugins && appJson.expo.plugins.some(p => 
      Array.isArray(p) && p[0] === 'expo-image-picker');
    
    console.log(`\napp.json has plugins configuration: ${hasPlugins ? 'Yes' : 'No'}`);
    console.log(`app.json has expo-image-picker plugin: ${hasImagePickerPlugin ? 'Yes' : 'No'}`);
    
    if (!hasImagePickerPlugin) {
      console.log('\nRecommendation: Add expo-image-picker to plugins in app.json');
    }
    
  } catch (error) {
    console.error('Error reading app.json:', error.message);
  }
}

console.log('\nRecommendation:');
console.log('1. Run the clean-cache.js script to clear bundler caches');
console.log('2. Ensure you have the latest compatible versions of dependencies');
console.log('3. Restart Metro with: npx expo start --clear');
