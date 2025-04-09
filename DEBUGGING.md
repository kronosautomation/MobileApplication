# MindfulMastery Mobile App - Debugging Guide

This document provides guidance for debugging common issues with the MindfulMastery Mobile Application.

## Common Issues and Solutions

### 1. Navigation Issues

**Problem:** Navigation container errors or 'Looks like you have nested a NavigationContainer'

**Solution:**
- Ensure there is only one NavigationContainer in the application, which should be in the App.tsx file.
- Stack navigators, tab navigators, and other navigator components should not include their own NavigationContainer.

### 2. Expo Startup Problems

**Solution:**
```bash
# Clear cache and restart
expo r -c
# Or the longer version
expo start --clear
```

### 3. JavaScript Bundle Issues

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install --legacy-peer-deps

# Clear metro bundler cache
npx react-native start --reset-cache
```

### 4. Diagnostic Mode

To run the app in diagnostic mode:

1. In App.tsx, set the diagnostic mode flag to true:
```typescript
const DIAGNOSTIC_MODE = true; // Change to true for troubleshooting
```

2. Restart the application.

### 5. Error Boundary Recovery

If the app crashes but shows the error boundary screen:

1. The error message will provide details about what went wrong.
2. Click "Try Again" to reset the error state and attempt to continue.
3. If the issue persists, check the console logs for more information.

### 6. AsyncStorage Issues

AsyncStorage data can become corrupted. To clear all storage:

```typescript
// Add this to a developer settings screen or use in debug code
await AsyncStorage.clear();
```

### 7. Expo Packages Problems

If Expo packages are causing issues:

```bash
# Reinstall expo and core packages
npm uninstall expo expo-status-bar expo-splash-screen
npm install expo expo-status-bar expo-splash-screen
```

### 8. Navigation State Issues

If navigation state becomes corrupted:

```typescript
// Reset navigation state by navigating to the initial route
navigation.reset({
  index: 0,
  routes: [{ name: 'Home' }],
});
```

## Development Tools

### 1. DiagnosticHelper

The app includes a `DiagnosticHelper` utility that provides enhanced logging:

```typescript
import { debugLog, errorLog, Diagnostics } from '../utils/DiagnosticHelper';

// Use in components
debugLog('Component mounted', props);
errorLog('Error fetching data', error);

// Check navigation initialization
Diagnostics.checkNavigation(navigation);
```

### 2. Performance Monitoring

```typescript
import { startPerformanceTimer, endPerformanceTimer } from '../utils/DiagnosticHelper';

// Measure a function's execution time
function expensiveOperation() {
  const timerId = startPerformanceTimer('expensiveOperation');
  
  // ... code here
  
  endPerformanceTimer(timerId);
}
```

## Expo Version Conflicts

If you encounter version conflicts between packages:

1. Check package.json for duplicate dependencies
2. Review the "resolutions" field to ensure React versions are fixed
3. Check for peer dependency conflicts with `npm ls [package-name]`

## Troubleshooting React Native Navigation

1. Verify installation of required packages:
   - @react-navigation/native
   - @react-navigation/native-stack
   - @react-navigation/bottom-tabs
   - react-native-screens
   - react-native-safe-area-context

2. Check if navigator objects are properly created:
   ```typescript
   const Stack = createNativeStackNavigator();
   const Tab = createBottomTabNavigator();
   ```

## Error Logs

All critical errors should be logged to the console. Check the terminal running Metro bundler for detailed error messages.

## Support

For further assistance, contact the development team or refer to the project documentation.