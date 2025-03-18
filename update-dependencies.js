/**
 * Script to update dependencies for MindfulMastery app
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
    logStep('1. Installing expo-network for connectivity monitoring...');
    execSync('npm install expo-network', { stdio: 'inherit' });

    logStep('2. Cleaning metro bundler cache...');
    execSync('npx expo start --clear', { stdio: 'inherit' });

    logStep('3. Updating package.json with development notes...');
    const packageJsonPath = './package.json';
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    if (!packageJson.mindfulMastery) {
      packageJson.mindfulMastery = {
        updates: []
      };
    }
    
    packageJson.mindfulMastery.updates.push({
      date: new Date().toISOString(),
      description: 'Added expo-network for better connectivity monitoring',
      version: '1.0.1'
    });
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    logStep('✅ Successfully updated dependencies!');
    console.log('\nTo start the app, run:');
    console.log('  npm start');
    
  } catch (error) {
    console.error('\n\x1b[31mError updating dependencies:\x1b[0m', error.message);
    process.exit(1);
  }
}

// Run the update
updateDependencies();
