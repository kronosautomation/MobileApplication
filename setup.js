const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('Running MindfulMastery setup script...');

// Function to run commands
function runCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command}`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return reject(error);
      }
      if (stderr) console.error(`stderr: ${stderr}`);
      console.log(`stdout: ${stdout}`);
      resolve(stdout);
    });
  });
}

async function setup() {
  try {
    // Clean npm cache
    await runCommand('npm cache clean --force');
    console.log('Cleaned npm cache');

    // Try installing with legacy-peer-deps
    try {
      await runCommand('npm install --legacy-peer-deps');
      console.log('Installation successful with legacy-peer-deps!');
      return;
    } catch (error) {
      console.log('Installation with legacy-peer-deps failed, trying alternative methods...');
    }

    // Try installing with force
    try {
      await runCommand('npm install --force');
      console.log('Installation successful with force flag!');
      return;
    } catch (error) {
      console.log('Installation with force flag failed, trying more options...');
    }

    // If we get here, both install methods failed
    console.log('Running cleanup and trying a different approach...');
    
    // Delete node_modules and package-lock.json
    if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
      console.log('Removing node_modules directory...');
      fs.rmSync(path.join(__dirname, 'node_modules'), { recursive: true, force: true });
    }
    
    if (fs.existsSync(path.join(__dirname, 'package-lock.json'))) {
      console.log('Removing package-lock.json...');
      fs.unlinkSync(path.join(__dirname, 'package-lock.json'));
    }

    // Try again with clean state
    await runCommand('npm install --legacy-peer-deps');
    console.log('Installation successful after cleanup!');

  } catch (error) {
    console.error('Setup failed:', error);
    console.log('\n\nManual fixing instructions:');
    console.log('1. Delete node_modules folder and package-lock.json');
    console.log('2. Run: npm install --legacy-peer-deps');
    console.log('3. If error persists, try using yarn: yarn install');
    process.exit(1);
  }
}

setup();
