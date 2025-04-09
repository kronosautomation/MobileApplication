/**
 * Utility script to remove the App.js.backup file
 * Run with: node remove-backup.js
 */

const fs = require('fs');
const path = require('path');

// Define the path to the backup file
const backupFile = path.join(__dirname, 'App.js.backup');

console.log(`Checking for backup file at: ${backupFile}`);

try {
  // Check if the file exists
  if (fs.existsSync(backupFile)) {
    console.log('App.js.backup file found. Deleting...');
    
    // Delete the file
    fs.unlinkSync(backupFile);
    console.log('App.js.backup file has been successfully removed.');
  } else {
    console.log('App.js.backup file not found or may have already been deleted.');
  }
} catch (error) {
  console.error(`Error while attempting to remove the backup file: ${error.message}`);
  console.error('You may need to delete the file manually.');
}
