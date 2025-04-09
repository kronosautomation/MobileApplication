/**
 * React Native Config Patch
 * This script modifies metro configuration to fix component registration issues
 */
const fs = require('fs');
const path = require('path');

// Path to the metro configuration in node_modules
const metroConfigPath = path.join(
  __dirname, 
  'node_modules',
  'metro-config',
  'src',
  'defaults',
  'defaults.js'
);

// Check if the file exists
if (!fs.existsSync(metroConfigPath)) {
  console.error('Metro config file not found at:', metroConfigPath);
  process.exit(1);
}

// Read the current config
let configContent = fs.readFileSync(metroConfigPath, 'utf8');

// Add App.js to the resolver's sourceExts before .tsx
if (!configContent.includes("sourceExts: ['js', 'jsx', 'ts', 'tsx'")) {
  console.log('Patching Metro configuration...');
  configContent = configContent.replace(
    /sourceExts:\s*\[(.*?)\]/s,
    "sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json']"
  );
  
  // Write the modified config
  fs.writeFileSync(metroConfigPath, configContent);
  console.log('Metro configuration patched successfully!');
} else {
  console.log('Metro configuration already correctly set up');
}

console.log('Patch completed. Please restart your app with:');
console.log('npx expo start --clear');
