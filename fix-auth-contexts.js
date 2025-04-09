/**
 * This script fixes inconsistent imports of AuthContext throughout the project
 * It ensures all imports use the correct path (contexts instead of context)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting AuthContext import path fix...');

// Function to recursively get all TypeScript files
function getAllTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllTsFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Find all TypeScript files in the src directory
const srcDir = path.join(__dirname, 'src');
const tsFiles = getAllTsFiles(srcDir);

// Patterns to look for
const singularPattern = /from ['"](\.\.\/)+context\/AuthContext['"];/;
const singularImportPattern = /import\s+\{[^}]*\}\s+from\s+['"](\.\.\/)+context\/AuthContext['"];/;

let fixedFiles = 0;

// Process each file
tsFiles.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file contains the singular import pattern
    if (singularPattern.test(content)) {
      console.log(`Found singular import in: ${filePath}`);
      
      // Replace with plural form
      const updatedContent = content.replace(
        singularImportPattern, 
        match => match.replace('/context/AuthContext', '/contexts/AuthContext')
      );
      
      if (content !== updatedContent) {
        fs.writeFileSync(filePath, updatedContent);
        console.log(`Fixed import in: ${filePath}`);
        fixedFiles++;
      }
    }
  } catch (err) {
    console.error(`Error processing file ${filePath}:`, err);
  }
});

console.log(`\nFixed ${fixedFiles} files.`);
console.log('\nTo clear Metro bundler cache and restart, run:');
console.log('npx expo start --clear');
