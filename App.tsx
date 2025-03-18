import React, { useState, useEffect } from 'react';
import { StatusBar, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import navigation stacks
import AuthStack from './src/navigation/stacks/AuthStack';
import AppNavigator from './src/navigation/AppNavigator';

// Import auth context provider
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(err => {
  console.warn('Error preventing splash screen hide:', err);
});

// Main navigation container that handles auth state
const RootNavigator = () => {
  const { user, isLoading } = useAuth();

  // This determines which stack to show based on auth state
  return (
    <NavigationContainer>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A62FF" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : user ? (
        <AppNavigator />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

// Main App component
export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    async function prepare() {
      try {
        console.log('Loading resources...');
        
        // Load fonts
        await Font.loadAsync({
          'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
          'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
          'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
          'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
          ...Ionicons.font,
        });
        
        // Initialize AsyncStorage with simple test
        await AsyncStorage.setItem('@MindfulMastery:test', 'Storage Test');
        
        console.log('Resources loaded successfully');
      } catch (e) {
        console.error('Error loading resources:', e);
        setError(e instanceof Error ? e : new Error('Failed to load resources'));
      } finally {
        setIsReady(true);
      }
    }
    
    prepare();
  }, []);
  
  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync().catch(err => {
        console.warn('Error hiding splash screen:', err);
      });
    }
  }, [isReady]);
  
  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A62FF" />
        <Text style={styles.loadingText}>Loading resources...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
        <Text style={styles.errorMessage}>{error.message}</Text>
      </View>
    );
  }
  
  // Return the app with authentication
  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content" />
      <RootNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#343a40',
    textAlign: 'center',
  },
});