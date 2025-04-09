/**
 * Script to fix the PostgreSQL foreign key constraint error
 * Error: 'insert or update on table "performance_journals" violates foreign key constraint "fk_performance_journal_focus_area"'
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Starting MindfulMastery foreign key constraint fix...');

// Function to fix the focus area handling in NewJournalEntryScreen
function fixJournalScreen() {
  const screenPath = path.join(__dirname, 'src', 'screens', 'journal', 'NewJournalEntryScreen.tsx');
  const backupPath = path.join(__dirname, 'src', 'screens', 'journal', 'NewJournalEntryScreen.backup.tsx');
  
  try {
    // Create a backup if it doesn't exist
    if (fs.existsSync(screenPath) && !fs.existsSync(backupPath)) {
      console.log('Creating backup of original NewJournalEntryScreen...');
      fs.copyFileSync(screenPath, backupPath);
    }
    
    if (!fs.existsSync(screenPath)) {
      console.error('❌ NewJournalEntryScreen.tsx not found!');
      return false;
    }
    
    console.log('Reading NewJournalEntryScreen...');
    const content = fs.readFileSync(screenPath, 'utf8');
    
    // Fix 1: Ensure selected focus area is initialized with a valid default
    const fixedContent1 = content.replace(
      /const \[selectedFocusArea, setSelectedFocusArea\] = useState<PerformanceFocusArea \| null>\(null\);/g,
      'const [selectedFocusArea, setSelectedFocusArea] = useState<PerformanceFocusArea>(PerformanceFocusArea.Other);'
    );
    
    // Fix 2: Ensure the focus area is always sent with a valid value
    const fixedContent2 = fixedContent1.replace(
      /performanceFocusArea: selectedFocusArea === null \? undefined : selectedFocusArea,/g,
      'performanceFocusArea: selectedFocusArea, // Always provide a valid value'
    );
    
    // Apply fixes
    if (content !== fixedContent2) {
      console.log('Applying focus area fixes to NewJournalEntryScreen...');
      fs.writeFileSync(screenPath, fixedContent2);
      console.log('✅ Applied fixes to NewJournalEntryScreen');
    } else {
      console.log('⚠️ No changes were needed in NewJournalEntryScreen');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error fixing NewJournalEntryScreen:', error.message);
    return false;
  }
}

// Function to enhance the journalService to better handle the focus area mapping
function enhanceJournalService() {
  const servicePath = path.join(__dirname, 'src', 'api', 'journalService.ts');
  const backupPath = path.join(__dirname, 'src', 'api', 'journalService.backup.ts');
  
  try {
    // Create a backup if it doesn't exist
    if (fs.existsSync(servicePath) && !fs.existsSync(backupPath)) {
      console.log('Creating backup of original journalService...');
      fs.copyFileSync(servicePath, backupPath);
    }
    
    if (!fs.existsSync(servicePath)) {
      console.error('❌ journalService.ts not found!');
      return false;
    }
    
    console.log('Reading journalService...');
    const content = fs.readFileSync(servicePath, 'utf8');
    
    // Fix: Enhance focus area handling in the API request
    const focusAreaHandlingRegex = /focusAreaId: journal\.performanceFocusArea\?\.toString\(\) \|\| 'other',/g;
    
    const enhancedFocusAreaHandling = `focusAreaId: typeof journal.performanceFocusArea === 'number' ? journal.performanceFocusArea.toString() : 'other', // Ensure a valid focusAreaId is always sent
          
          // Add detailed debugging for focus area
          // @ts-ignore - Logging for debugging purposes only
          _debug_focusArea: {
            rawValue: journal.performanceFocusArea,
            type: typeof journal.performanceFocusArea,
            stringValue: journal.performanceFocusArea?.toString(),
            isNumber: typeof journal.performanceFocusArea === 'number',
          },`;
    
    if (content.match(focusAreaHandlingRegex)) {
      console.log('Enhancing focus area handling in journalService...');
      const fixedContent = content.replace(focusAreaHandlingRegex, enhancedFocusAreaHandling);
      fs.writeFileSync(servicePath, fixedContent);
      console.log('✅ Enhanced journalService focus area handling');
      return true;
    } else {
      console.log('⚠️ Could not locate exact focus area handling pattern in journalService');
      
      // Alternative approach - look for a simpler pattern and add warning
      const apiClientPostPattern = /const response = await apiClient\.post<PerformanceJournal>\('\/performance-journal', requestData\);/g;
      
      if (content.match(apiClientPostPattern)) {
        console.log('Attempting alternative enhancement...');
        const modifiedContent = content.replace(
          apiClientPostPattern,
          `// Ensure focus area is valid before sending to API
        if (!requestData.focusAreaId || requestData.focusAreaId === 'undefined' || requestData.focusAreaId === 'null') {
          console.warn('Fixing invalid focusAreaId before API call - was:', requestData.focusAreaId);
          requestData.focusAreaId = 'other';
        }
        
        // Log the final request data before sending
        console.log('Final API request data:', JSON.stringify(requestData, null, 2));
        
        const response = await apiClient.post<PerformanceJournal>('/performance-journal', requestData);`
        );
        
        fs.writeFileSync(servicePath, modifiedContent);
        console.log('✅ Applied alternative enhancement to journalService');
        return true;
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ Error enhancing journalService:', error.message);
    return false;
  }
}

// Main function to run the fixes
async function applyFixes() {
  let success = true;
  
  try {
    // Fix the journal screen
    if (!fixJournalScreen()) {
      success = false;
    }
    
    // Enhance the journal service
    if (!enhanceJournalService()) {
      success = false;
    }
    
    // Final status report
    if (success) {
      console.log('\n🎉 Foreign key constraint fixes applied successfully!');
      console.log('\nNext steps:');
      console.log('1. Stop any running instances of your application');
      console.log('2. Run "npx expo start --clear" to restart with a cleared cache');
      console.log('3. Test creating a journal entry');
      console.log('\nRemember to check the application logs for the debug output to verify the focus area is being sent correctly.');
    } else {
      console.log('\n⚠️ Some fixes were not applied successfully.');
      console.log('Please review the errors above and fix any remaining issues manually.');
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the fixes
applyFixes();
