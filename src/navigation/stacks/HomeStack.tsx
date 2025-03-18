import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import HomeScreen from '../../screens/HomeScreen';
import StatsScreen from '../../screens/home/StatsScreen';
import AchievementsScreen from '../../screens/home/AchievementsScreen';

// Define types for home stack navigation
export type HomeStackParamList = {
  HomeMain: undefined;
  Stats: undefined;
  Achievements: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f8f9fa',
        },
        headerTintColor: '#4A62FF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        options={{ 
          title: 'Dashboard',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="Stats" 
        component={StatsScreen} 
        options={{ title: 'Your Progress' }} 
      />
      <Stack.Screen 
        name="Achievements" 
        component={AchievementsScreen} 
        options={{ title: 'Achievements' }} 
      />
    </Stack.Navigator>
  );
};

export default HomeStack;