import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import { RootStackParamList } from '../types';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { useAuth } from '../auth';
import { useTheme } from '../context';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { isDark, currentTheme } = useTheme();

  // Customize navigation theme based on current theme
  const navigationTheme = isDark 
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: currentTheme.colors.background.default,
          card: currentTheme.colors.background.paper,
          text: currentTheme.colors.text.primary,
          border: currentTheme.colors.neutral.lighter,
        }
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: currentTheme.colors.background.default,
          card: currentTheme.colors.background.paper,
          text: currentTheme.colors.text.primary,
          border: currentTheme.colors.neutral.lighter,
        }
      };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: currentTheme.colors.background.default }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={currentTheme.colors.background.default} />
        <ActivityIndicator size="large" color={currentTheme.colors.primary.main} />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={currentTheme.colors.background.default} />
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            <Stack.Screen name="Main" component={MainNavigator} />
          ) : (
            <Stack.Screen name="Auth" component={AuthNavigator} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RootNavigator; 