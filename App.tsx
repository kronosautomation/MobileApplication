import React, { useEffect, useState } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider, useAuth, useTheme } from './src/context';
import AppNavigator from './src/navigation/AppNavigator';

// Ignore specific deprecation warnings that we can't fix
LogBox.ignoreLogs([
  'ViewPropTypes will be removed from React Native',
  'AsyncStorage has been extracted from react-native',
]);

// Keep the splash screen visible until the app is ready
SplashScreen.preventAutoHideAsync();

// Main App component
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// App content with authentication and theme context
function AppContent() {
  const [appIsReady, setAppIsReady] = useState(false);
  const { isDark } = useTheme();
  
  useEffect(() => {
    // Load resources asynchronously
    async function prepare() {
      try {
        // Load fonts
        await Font.loadAsync({
          'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
          'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
          'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
          'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
          ...Ionicons.font,
        });
        
        // Add artificial delay to ensure smooth transition
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        // App is ready to be displayed
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    // Hide the splash screen once the app is ready
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </>
  );
}
