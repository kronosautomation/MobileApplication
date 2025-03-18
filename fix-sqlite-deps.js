const fs = require('fs');
const path = require('path');

// Read the package.json file
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = require(packageJsonPath);

console.log('Checking expo-sqlite compatibility...');

// Make sure versions are explicitly set and compatible
if (packageJson.dependencies['expo']) {
  console.log(`Current Expo version: ${packageJson.dependencies['expo']}`);
}

if (packageJson.dependencies['expo-sqlite']) {
  console.log(`Current expo-sqlite version: ${packageJson.dependencies['expo-sqlite']}`);
  
  // Set it to a specific version known to work well with Hermes
  packageJson.dependencies['expo-sqlite'] = '^15.1.2';  // This is a version that's known to work well
  console.log('Setting expo-sqlite to version ^15.1.2 for better Hermes compatibility');
}

// Add resolutions for SQLite to ensure consistent versions
if (!packageJson.resolutions) {
  packageJson.resolutions = {};
}

packageJson.resolutions['expo-sqlite'] = '^15.1.2';

// Write the updated package.json back to disk
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('package.json updated. Please run:');
console.log('  npm install');
console.log('  npx expo start -c');
