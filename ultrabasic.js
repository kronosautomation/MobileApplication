/**
 * Basic React Native Application with extensive logging
 */
import React, { useEffect } from 'react';
import { AppRegistry, Text, View, LogBox } from 'react-native';

// Ignore non-critical warnings
LogBox.ignoreLogs(['Require cycle:']);

console.log('Starting UltraBasic app...');

// Ultra basic component with debugging
function UltraBasicApp() {
  console.log('UltraBasicApp component function called');
  
  // Log when component mounts
  useEffect(() => {
    console.log('UltraBasicApp mounted');
    
    return () => {
      console.log('UltraBasicApp unmounted');
    };
  }, []);
  
  console.log('Rendering UltraBasicApp');
  
  try {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#ffffff' 
      }}>
        <Text style={{ 
          fontSize: 24, 
          fontWeight: 'bold',
          color: '#000000'
        }}>
          Hello World
        </Text>
        <Text style={{ 
          marginTop: 20,
          fontSize: 16,
          color: '#333333'
        }}>
          If you can see this, basic rendering is working
        </Text>
      </View>
    );
  } catch (err) {
    console.error('Error rendering UltraBasicApp:', err);
    
    // Return a fallback UI if rendering fails
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#ffdddd' 
      }}>
        <Text style={{ color: '#ff0000' }}>
          Rendering Error: {err.message}
        </Text>
      </View>
    );
  }
}

// Add a console.log right before registration
console.log('About to register main component...');

// Register the app with error handling
try {
  console.log('Registering main component...');
  AppRegistry.registerComponent('main', () => UltraBasicApp);
  console.log('Main component registered successfully');
} catch (err) {
  console.error('Failed to register main component:', err);
}
