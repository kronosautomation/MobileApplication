import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import MeditationScreen from '../../screens/MeditationScreen';
import MeditationDetailScreen from '../../screens/meditation/MeditationDetailScreen';
import MeditationPlayerScreen from '../../screens/meditation/MeditationPlayerScreen';
import MeditationCompletedScreen from '../../screens/meditation/MeditationCompletedScreen';

// Define types for meditation stack navigation
export type MeditationStackParamList = {
  MeditationMain: undefined;
  MeditationDetail: { id: string; title: string };
  MeditationPlayer: { id: string; title: string; duration: number };
  MeditationCompleted: { sessionTime: number };
};

const Stack = createNativeStackNavigator<MeditationStackParamList>();

const MeditationStack = () => {
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
        name="MeditationMain" 
        component={MeditationScreen} 
        options={{ 
          title: 'Meditations',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="MeditationDetail" 
        component={MeditationDetailScreen} 
        options={({ route }) => ({ title: route.params.title })} 
      />
      <Stack.Screen 
        name="MeditationPlayer" 
        component={MeditationPlayerScreen} 
        options={{ 
          title: 'Meditation Session',
          headerShown: false,
          presentation: 'fullScreenModal'
        }} 
      />
      <Stack.Screen 
        name="MeditationCompleted" 
        component={MeditationCompletedScreen} 
        options={{ 
          title: 'Session Complete',
          headerShown: false,
          presentation: 'card'
        }} 
      />
    </Stack.Navigator>
  );
};

export default MeditationStack;