/**
 * AuthContext verification utility
 * 
 * This script verifies that the AuthContext implementations are consistent
 * and identifies any potential issues that could cause "Super expression" errors
 * Run with: node verify-context.js
 */

const fs = require('fs');
const path = require('path');

console.log('Starting AuthContext verification...');

// Define paths to the context files
const contextPaths = [
  path.join(__dirname, 'src', 'context', 'AuthContext.tsx'),
  path.join(__dirname, 'src', 'contexts', 'AuthContext.tsx')
];

// Check if both files exist
const existingFiles = contextPaths.filter(p => fs.existsSync(p));

if (existingFiles.length === 0) {
  console.error('Error: No AuthContext files found!');
  process.exit(1);
} else if (existingFiles.length === 1) {
  console.log(`Only one AuthContext implementation found: ${existingFiles[0]}`);
  console.log('This is good - no duplication issues.');
  process.exit(0);
}

console.log(`Both AuthContext implementations exist. This could cause conflicts.`);

// Read file contents
const fileContents = existingFiles.map(file => {
  return {
    path: file,
    content: fs.readFileSync(file, 'utf8')
  };
});

// Simple checks for potential conflicts
fileContents.forEach(file => {
  console.log(`\nAnalyzing ${path.basename(file.path)}...`);
  
  // Check for AuthProvider export
  if (file.content.includes('export const AuthProvider')) {
    console.log('✓ Exports AuthProvider');
  } else {
    console.log('✗ Does not export AuthProvider');
  }
  
  // Check for useAuth export
  if (file.content.includes('export const useAuth')) {
    console.log('✓ Exports useAuth');
  } else {
    console.log('✗ Does not export useAuth');
  }
  
  // Check for default export
  if (file.content.includes('export default AuthContext')) {
    console.log('✓ Has default export');
  } else {
    console.log('✗ No default export');
  }
  
  // Check for class component vs functional component
  if (file.content.includes('extends React.Component')) {
    console.log('! Uses class component (could conflict with functional component)');
  }
  
  // Check for createContext
  if (file.content.includes('createContext')) {
    console.log('✓ Uses createContext');
  } else {
    console.log('✗ Does not use createContext');
  }
});

console.log('\nRecommendation:');
console.log('1. Choose ONE implementation to keep (preferably the more complete one)');
console.log('2. Update all imports to use the centralized auth import at src/auth/index.ts');
console.log('3. Run the clean-cache.js script to clear bundler caches');
console.log('4. Restart Metro with: npx expo start --clear');
