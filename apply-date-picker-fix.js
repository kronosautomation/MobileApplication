    // 7. Fix the focus area issue in the journal service
    if (!fixJournalService()) {
      success = false;
    }/**
 * Script to fix the date picker issue in MindfulMastery mobile application
 * This script will:
 * 1. Update the app.json to configure the date picker properly
 * 2. Replace the problematic NewJournalEntryScreen with our fixed version
 * 3. Make sure the DatePickerWrapper component is properly set up
 * 4. Fix the foreign key constraint error by ensuring valid focus area values
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Starting MindfulMastery date picker and foreign key constraint fix...');

// Function to fix the focus area issue in the journal service
function fixJournalService() {
  const servicePath = path.join(__dirname, 'src', 'api', 'journalService.ts');
  
  try {
    if (fs.existsSync(servicePath)) {
      console.log('Fixing focus area mapping in journal service...');
      
      const content = fs.readFileSync(servicePath, 'utf8');
      const updatedContent = content.replace(
        "focusAreaId: journal.performanceFocusArea?.toString(),",
        "focusAreaId: journal.performanceFocusArea?.toString() || 'other', // Ensure a valid focusAreaId is always sent"
      );
      
      fs.writeFileSync(servicePath, updatedContent);
      console.log('✅ Fixed focus area mapping in journal service');
      return true;
    } else {
      console.error('❌ Journal service file not found');
      return false;
    }
  } catch (error) {
    console.error('❌ Error fixing journal service:', error.message);
    return false;
  }
}

// Function to update app.json to properly configure date picker
function updateAppJson() {
  const appJsonPath = path.join(__dirname, 'app.json');
  console.log(`Reading ${appJsonPath}...`);
  
  try {
    // Read the current app.json
    const appJsonData = fs.readFileSync(appJsonPath, 'utf8');
    const appJson = JSON.parse(appJsonData);
    
    // Move newArchEnabled inside the expo config if it's at root level
    if (appJson.newArchEnabled && !appJson.expo.newArchEnabled) {
      appJson.expo.newArchEnabled = true;
      delete appJson.newArchEnabled;
      console.log('✅ Moved newArchEnabled inside expo configuration');
    }
    
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
      console.log('✅ Added DateTimePicker plugin configuration to app.json');
    }
    
    // Write the updated configuration back to app.json
    fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
    console.log('✅ Updated app.json configuration');
  } catch (error) {
    console.error('❌ Error updating app.json:', error.message);
    return false;
  }
  
  return true;
}

// Function to ensure the common components directory exists
function ensureCommonDirectory() {
  const commonDir = path.join(__dirname, 'src', 'components', 'common');
  
  try {
    if (!fs.existsSync(commonDir)) {
      console.log('Creating common components directory...');
      fs.mkdirSync(commonDir, { recursive: true });
    }
    return true;
  } catch (error) {
    console.error('❌ Error creating common directory:', error.message);
    return false;
  }
}

// Function to create the journal styles directory if it doesn't exist
function ensureJournalStylesDirectory() {
  const stylesDir = path.join(__dirname, 'src', 'screens', 'journal', 'styles');
  
  try {
    if (!fs.existsSync(stylesDir)) {
      console.log('Creating journal styles directory...');
      fs.mkdirSync(stylesDir, { recursive: true });
    }
    return true;
  } catch (error) {
    console.error('❌ Error creating styles directory:', error.message);
    return false;
  }
}

// Function to create the DatePickerWrapper component
function createDatePickerWrapper() {
  const componentPath = path.join(__dirname, 'src', 'components', 'common', 'DatePickerWrapper.tsx');
  
  try {
    console.log('Creating DatePickerWrapper component...');
    
    const componentContent = `import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

interface DatePickerWrapperProps {
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
  maximumDate?: Date;
  minimumDate?: Date;
  disabled?: boolean;
  formatPattern?: string;
  label?: string;
  placeholder?: string;
  iconName?: string;
  iconColor?: string;
  iconSize?: number;
  style?: any;
  textStyle?: any;
}

/**
 * A cross-platform date picker wrapper component that works well with Expo
 * This component uses react-native-modal-datetime-picker which is more compatible
 * with Expo's managed workflow than the native DateTimePicker
 */
const DatePickerWrapper: React.FC<DatePickerWrapperProps> = ({
  value,
  onChange,
  mode = 'date',
  maximumDate,
  minimumDate,
  disabled = false,
  formatPattern = 'MMM dd, yyyy',
  label,
  placeholder = 'Select date',
  iconName = 'calendar-outline',
  iconColor = '#4A62FF',
  iconSize = 20,
  style,
  textStyle,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const showPicker = () => {
    if (!disabled) {
      setIsVisible(true);
    }
  };

  const hidePicker = () => {
    setIsVisible(false);
  };

  const handleConfirm = (date: Date) => {
    onChange(date);
    hidePicker();
  };

  const formattedDate = value ? format(value, formatPattern) : placeholder;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.button, disabled && styles.disabled, style]}
        onPress={showPicker}
        disabled={disabled}
      >
        <Text style={[styles.dateText, textStyle, disabled && styles.disabledText]}>
          {formattedDate}
        </Text>
        <Ionicons name={iconName as any} size={iconSize} color={disabled ? '#ccc' : iconColor} />
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isVisible}
        mode={mode}
        date={value}
        onConfirm={handleConfirm}
        onCancel={hidePicker}
        maximumDate={maximumDate}
        minimumDate={minimumDate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  disabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  disabledText: {
    color: '#999',
  },
});

export default DatePickerWrapper;`;

    fs.writeFileSync(componentPath, componentContent);
    console.log('✅ Created DatePickerWrapper component');
    return true;
  } catch (error) {
    console.error('❌ Error creating DatePickerWrapper component:', error.message);
    return false;
  }
}

// Function to create the styles file for the NewJournalEntryScreen
function createJournalEntryStyles() {
  const stylesPath = path.join(__dirname, 'src', 'screens', 'journal', 'styles', 'NewJournalEntryScreen.styles.ts');
  
  try {
    console.log('Creating styles for NewJournalEntryScreen...');
    
    const stylesContent = `import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'white',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#4A62FF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#c0c0c0',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  saveButtonTextDisabled: {
    color: '#e0e0e0',
  },
  
  // Tab Navigation
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4A62FF',
  },
  tabText: {
    fontSize: 13,
    color: '#888',
  },
  activeTabText: {
    color: '#4A62FF',
    fontWeight: '500',
  },
  
  // Content Areas
  formContainer: {
    flex: 1,
    padding: 15,
  },
  sectionContainer: {
    gap: 20,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  fieldHelp: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  fieldSubLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  helpButton: {
    padding: 4,
  },
  
  // Date Selector
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  
  // Input fields
  titleInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    fontSize: 16,
    color: '#333',
    height: 120,
    textAlignVertical: 'top',
  },
  
  // Switch
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  
  // Mood Selection
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 16,
    padding: 8,
    borderRadius: 8,
  },
  moodIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  
  // Sliders
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderMinLabel: {
    fontSize: 12,
    color: '#888',
    width: 30,
    textAlign: 'center',
  },
  sliderMaxLabel: {
    fontSize: 12,
    color: '#888',
    width: 30,
    textAlign: 'center',
  },
  
  // Tags (Coping Strategies & Techniques)
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagItem: {
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  tagItemSelected: {
    backgroundColor: '#4A62FF20',
    borderColor: '#4A62FF',
  },
  tagText: {
    fontSize: 14,
    color: '#666',
  },
  tagTextSelected: {
    color: '#4A62FF',
    fontWeight: '500',
  },
  
  // Prompts
  promptsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 16,
    padding: 8,
  },
  promptItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  promptText: {
    fontSize: 14,
    color: '#666',
  },
});`;

    fs.writeFileSync(stylesPath, stylesContent);
    console.log('✅ Created styles for NewJournalEntryScreen');
    return true;
  } catch (error) {
    console.error('❌ Error creating styles file:', error.message);
    return false;
  }
}

// Function to update the JournalEntryScreen with the fixed version
function updateJournalEntryScreen() {
  const screenPath = path.join(__dirname, 'src', 'screens', 'journal', 'NewJournalEntryScreen.tsx');
  const backupPath = path.join(__dirname, 'src', 'screens', 'journal', 'NewJournalEntryScreen.backup.tsx');
  const fixedPath = path.join(__dirname, 'src', 'screens', 'journal', 'NewJournalEntryScreen.fixed.tsx');
  
  try {
    // Create a backup of the original file if it exists
    if (fs.existsSync(screenPath)) {
      console.log('Creating backup of original NewJournalEntryScreen...');
      fs.copyFileSync(screenPath, backupPath);
    }
    
    // Copy the fixed file to the original location
    if (fs.existsSync(fixedPath)) {
      console.log('Fixing foreign key constraint issue in journal entry...');
      
      const fixedCode = `      title: title.trim() || 'Untitled Journal',
      date: date.toISOString(),
      anxietyLevel,
      confidenceLevel,
      performanceFocusArea: selectedFocusArea === null ? PerformanceFocusArea.Other : selectedFocusArea,`;
    
    const originalCode = `      title: title.trim() || 'Untitled Journal',
      date: date.toISOString(),
      anxietyLevel,
      confidenceLevel,
      performanceFocusArea: selectedFocusArea === null ? undefined : selectedFocusArea,`;
    
    if (fs.existsSync(screenPath)) {
      const content = fs.readFileSync(screenPath, 'utf8');
      const updatedContent = content.replace(originalCode, fixedCode);
      fs.writeFileSync(screenPath, updatedContent);
      console.log('✅ Foreign key constraint fix applied');
    }
    } else {
      console.error('❌ Fixed NewJournalEntryScreen file not found');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error updating JournalEntryScreen:', error.message);
    return false;
  }
}

// Function to install or update required packages
function updatePackages() {
  try {
    console.log('Updating packages...');
    
    // Make sure react-native-modal-datetime-picker is installed
    console.log('Ensuring react-native-modal-datetime-picker is installed...');
    execSync('expo install react-native-modal-datetime-picker', { stdio: 'inherit' });
    
    // Update the date time picker package to ensure a compatible version
    console.log('Updating @react-native-community/datetimepicker...');
    execSync('expo install @react-native-community/datetimepicker', { stdio: 'inherit' });
    
    console.log('✅ Packages updated successfully');
    return true;
  } catch (error) {
    console.error('❌ Error updating packages:', error.message);
    console.error('Please run the following commands manually:');
    console.error('expo install react-native-modal-datetime-picker');
    console.error('expo install @react-native-community/datetimepicker');
    return false;
  }
}

// Main function to run the fix
async function applyFix() {
  let success = true;
  
  try {
    // 1. Update app.json
    if (!updateAppJson()) {
      success = false;
    }
    
    // 2. Create necessary directories
    if (!ensureCommonDirectory() || !ensureJournalStylesDirectory()) {
      success = false;
    }
    
    // 3. Create the DatePickerWrapper component
    if (!createDatePickerWrapper()) {
      success = false;
    }
    
    // 4. Create the styles file
    if (!createJournalEntryStyles()) {
      success = false;
    }
    
    // 5. Update the fixed NewJournalEntryScreen.tsx file
    if (!updateJournalEntryScreen()) {
      success = false;
    }
    
    // 6. Update packages
    if (!updatePackages()) {
      success = false;
    }
    
    // Final status report
    if (success) {
      console.log('\n🎉 Date picker fix applied successfully!');
      console.log('\nNext steps:');
      console.log('1. Stop any running instances of your application');
      console.log('2. Run "npx expo start --clear" to restart with a cleared cache');
      console.log('3. Test the journal entry screens');
    } else {
      console.log('\n⚠️ Fix applied with some issues.');
      console.log('Please review the errors above and fix any remaining issues manually.');
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the fix
applyFix();
