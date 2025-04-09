import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import stack navigators
import HomeStack from './stacks/HomeStack';
import MeditationStack from './stacks/MeditationStack';
import JournalStack from './stacks/JournalStack';
import ProfileStack from './stacks/ProfileStack';

// Import custom icon component
import IconFallback from '../components/common/IconFallback';

// Create Tab Navigator
const Tab = createBottomTabNavigator();

// Tab navigator configuration
const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          // Set icon name based on route and focus state
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Meditate') {
            iconName = focused ? 'leaf' : 'leaf-outline';
          } else if (route.name === 'Journal') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            // Default fallback
            iconName = focused ? 'help-circle' : 'help-circle-outline';
          }

          // Use our custom IconFallback component
          return <IconFallback name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4A62FF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Meditate" component={MeditationStack} />
      <Tab.Screen name="Journal" component={JournalStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default AppNavigator;