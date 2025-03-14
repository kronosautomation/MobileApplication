import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MeditationStackParamList } from '../types';
import MeditationListScreen from '../screens/meditation/MeditationListScreen';
import MeditationDetailScreen from '../screens/meditation/MeditationDetailScreen';
import MeditationPlayerScreen from '../screens/meditation/MeditationPlayerScreen';
import MeditationCompleteScreen from '../screens/meditation/MeditationCompleteScreen';

// Create stack navigator for meditation screens
const Stack = createNativeStackNavigator<MeditationStackParamList>();

const MeditationNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="MeditationList"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MeditationList" component={MeditationListScreen} />
      <Stack.Screen name="MeditationDetail" component={MeditationDetailScreen} />
      <Stack.Screen 
        name="MeditationPlayer" 
        component={MeditationPlayerScreen} 
        options={{ 
          animation: 'fade',
          gestureEnabled: false, 
          presentation: 'fullScreenModal' 
        }} 
      />
      <Stack.Screen 
        name="MeditationComplete" 
        component={MeditationCompleteScreen}
        options={{ 
          animation: 'fade',
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default MeditationNavigator;
