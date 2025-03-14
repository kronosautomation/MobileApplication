import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import PremiumContentScreen from '../screens/subscription/PremiumContentScreen';
import { RootStackParamList } from '../types';

// Create the stack navigator for the app
const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // While checking authentication status, return null or a loading screen
  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      {isAuthenticated ? (
        // User is logged in, show main app screens
        <>
          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen name="PremiumContent" component={PremiumContentScreen} />
        </>
      ) : (
        // User is not logged in, show authentication screens
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
