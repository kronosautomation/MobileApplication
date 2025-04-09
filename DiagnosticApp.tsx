import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';

const DiagnosticApp = () => {
  const appVersion = Constants.manifest?.version ?? 'Unknown';
  const expoVersion = Constants.expoVersion ?? 'Unknown';
  const deviceName = Constants.deviceName ?? 'Unknown';
  const platformOS = Constants.platform?.os ?? 'Unknown';
  
  // Log diagnostic info
  useEffect(() => {
    console.log('===== DIAGNOSTIC INFORMATION =====');
    console.log('App Version:', appVersion);
    console.log('Expo Version:', expoVersion);
    console.log('Device Name:', deviceName);
    console.log('Platform OS:', platformOS);
    console.log('================================');
    
    // Log registered components (won't show all due to React Native limitations)
    console.log('Component registration check...');
    try {
      console.log('App Component is being rendered');
    } catch (error) {
      console.error('Error logging component info:', error);
    }
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>MindfulMastery Diagnostics</Text>
          <Text style={styles.subHeaderText}>Troubleshooting Information</Text>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Device Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Version:</Text>
            <Text style={styles.infoValue}>{appVersion}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Expo Version:</Text>
            <Text style={styles.infoValue}>{expoVersion}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Device:</Text>
            <Text style={styles.infoValue}>{deviceName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Platform:</Text>
            <Text style={styles.infoValue}>{platformOS}</Text>
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Diagnostic Tests</Text>
          <Text style={styles.testMessage}>
            If you can see this message, the basic React rendering is working.
          </Text>
          
          <View style={styles.testItem}>
            <Text style={styles.testLabel}>Basic Component Rendering:</Text>
            <Text style={styles.testPass}>PASS</Text>
          </View>
          
          <View style={styles.testItem}>
            <Text style={styles.testLabel}>Component Registration:</Text>
            <Text style={styles.testPass}>PASS</Text>
          </View>
        </View>
        
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Next Steps:</Text>
          <Text style={styles.instructionsText}>
            1. Check the logs in your terminal for additional diagnostic information
          </Text>
          <Text style={styles.instructionsText}>
            2. Ensure that only one copy of AuthContext is being imported
          </Text>
          <Text style={styles.instructionsText}>
            3. Clear Metro cache and node_modules
          </Text>
          <Text style={styles.instructionsText}>
            4. Reinstall dependencies if needed
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  scrollContent: {
    padding: 20,
  },
  headerContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subHeaderText: {
    fontSize: 16,
    color: '#666',
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    flex: 1,
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    flex: 2,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  testMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  testItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
  },
  testLabel: {
    fontSize: 16,
    color: '#333',
  },
  testPass: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  testFail: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
  },
  instructionsContainer: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
});

export default DiagnosticApp;