/**
 * Script to install offline functionality dependencies
 */
const { execSync } = require('child_process');
const fs = require('fs');

// Log helper
const logStep = (message) => {
  console.log(`\n\x1b[36m${message}\x1b[0m`);
};

// Main function
function updateDependencies() {
  try {
    logStep('1. Installing offline storage dependencies...');
    execSync('npm install expo-sqlite expo-file-system @react-native-async-storage/async-storage', { stdio: 'inherit' });

    logStep('2. Installing network and background sync dependencies...');
    execSync('npm install expo-network expo-background-fetch expo-task-manager', { stdio: 'inherit' });

    logStep('3. Cleaning metro bundler cache...');
    execSync('npx expo start --clear', { stdio: 'inherit' });

    logStep('4. Updating package.json with development notes...');
    const packageJsonPath = './package.json';
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (!packageJson.mindfulMastery) {
      packageJson.mindfulMastery = {
        updates: []
      };
    }
    
    packageJson.mindfulMastery.updates.push({
      date: new Date().toISOString(),
      description: 'Added offline-first functionality with data persistence and synchronization',
      version: '1.1.0'
    });
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    logStep('✅ Successfully installed offline functionality dependencies!');
    
  } catch (error) {
    console.error('\n\x1b[31mError updating dependencies:\x1b[0m', error.message);
    process.exit(1);
  }
}

// Run the update
updateDependencies();
