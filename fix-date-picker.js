/**
 * Script to fix the RNCMaterialDatePicker native module issue
 * This script will:
 * 1. Delete the problematic @react-native-community/datetimepicker 
 * 2. Install a compatible version of react-native-modal-datetime-picker 
 * 3. Create configuration for the date picker module in app.json
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Starting date picker dependency fix...');

// Function to update app.json with the proper plugins configuration
function updateAppJson() {
  const appJsonPath = path.join(__dirname, 'app.json');
  console.log(`Reading ${appJsonPath}...`);
  
  try {
    // Read the current app.json
    const appJsonData = fs.readFileSync(appJsonPath, 'utf8');
    const appJson = JSON.parse(appJsonData);
    
    // Check if plugins array exists, if not create it
    if (!appJson.expo.plugins) {
      appJson.expo.plugins = [];
    }
    
    // Check if the datetime picker configuration already exists
    const datetimePickerIndex = appJson.expo.plugins.findIndex(
      plugin => Array.isArray(plugin) && plugin[0] === '@react-native-community/datetimepicker'
    );
    
    if (datetimePickerIndex !== -1) {
      console.log('DateTimePicker plugin configuration already exists in app.json');
    } else {
      // Add the datetime picker plugin configuration
      appJson.expo.plugins.push(['@react-native-community/datetimepicker']);
      
      // Write the updated configuration back to app.json
      fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
      console.log('✅ Added DateTimePicker plugin configuration to app.json');
    }
  } catch (error) {
    console.error('❌ Error updating app.json:', error.message);
    return false;
  }
  
  return true;
}

// Main function to fix the date picker issue
async function fixDatePicker() {
  try {
    // 1. Remove the problematic packages
    console.log('Removing problematic date picker packages...');
    try {
      execSync('npm uninstall @react-native-community/datetimepicker', { stdio: 'inherit' });
      console.log('✅ Removed @react-native-community/datetimepicker');
    } catch (error) {
      console.log('⚠️ Package removal encountered an issue, continuing...');
    }
    
    // 2. Install the compatible packages
    console.log('Installing compatible date picker packages...');
    execSync('expo install @react-native-community/datetimepicker', { stdio: 'inherit' });
    execSync('expo install react-native-modal-datetime-picker', { stdio: 'inherit' });
    console.log('✅ Installed compatible date picker packages');
    
    // 3. Update app.json with proper configuration
    if (updateAppJson()) {
      console.log('✅ Updated app.json configuration');
    }
    
    // 4. Clean project caches
    console.log('Cleaning project caches...');
    try {
      // Remove .expo folder if it exists
      const expoDir = path.join(__dirname, '.expo');
      if (fs.existsSync(expoDir)) {
        fs.rmSync(expoDir, { recursive: true, force: true });
      }
      
      // Remove node_modules/.cache if it exists
      const cacheDir = path.join(__dirname, 'node_modules', '.cache');
      if (fs.existsSync(cacheDir)) {
        fs.rmSync(cacheDir, { recursive: true, force: true });
      }
      
      console.log('✅ Cleaned project caches');
    } catch (error) {
      console.log('⚠️ Error cleaning caches:', error.message);
    }
    
    console.log('\n🎉 Date picker dependency fix completed!');
    console.log('\nNext steps:');
    console.log('1. Stop any running instances of your application');
    console.log('2. Run "npx expo start --clear" to restart with cleared cache');
    console.log('3. Test the date picker functionality in your app');
    
  } catch (error) {
    console.error('❌ Error fixing date picker dependencies:', error.message);
    console.log('\nPlease try manually executing these steps:');
    console.log('1. npm uninstall @react-native-community/datetimepicker');
    console.log('2. expo install @react-native-community/datetimepicker');
    console.log('3. expo install react-native-modal-datetime-picker');
    console.log('4. Add ["@react-native-community/datetimepicker"] to the plugins array in app.json');
    console.log('5. Delete the .expo folder and node_modules/.cache folder');
    console.log('6. Restart with: npx expo start --clear');
  }
}

// Execute the main function
fixDatePicker();
