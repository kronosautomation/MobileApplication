import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AchievementsStackParamList } from '../types';
import AchievementsListScreen from '../screens/achievements/AchievementsListScreen';
import AchievementDetailScreen from '../screens/achievements/AchievementDetailScreen';

// Create stack navigator for achievements screens
const Stack = createNativeStackNavigator<AchievementsStackParamList>();

const AchievementsNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="AchievementsList"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="AchievementsList" component={AchievementsListScreen} />
      <Stack.Screen name="AchievementDetail" component={AchievementDetailScreen} />
    </Stack.Navigator>
  );
};

export default AchievementsNavigator;
