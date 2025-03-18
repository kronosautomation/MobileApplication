import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Simple component with no dependencies
export default function DiagnosticApp() {
  console.log('DiagnosticApp rendering');
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diagnostic Mode</Text>
      <Text style={styles.message}>If you're seeing this, basic rendering is working.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#4a62ff',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
});
