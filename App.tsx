import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import { performStartupTasks } from './src/utils/appStartup';
import RootNavigator from './src/navigation/RootNavigator';
import { AppProvider } from './src/context';

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(err => {
  console.warn('Error preventing splash screen hide:', err);
});

const App = () => {
  useEffect(() => {
    const initApp = async () => {
      try {
        // Run startup tasks
        await performStartupTasks();
        
        // Hide splash screen after resources are loaded
        await SplashScreen.hideAsync();
      } catch (err) {
        console.warn('Error during app initialization:', err);
        // Hide splash screen even if there's an error
        SplashScreen.hideAsync().catch(splashErr => {
          console.warn('Error hiding splash screen:', splashErr);
        });
      }
    };
    
    initApp();
  }, []);

  return (
    <ErrorBoundary>
      <AppProvider>
        <RootNavigator />
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;