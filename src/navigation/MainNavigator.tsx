import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import HomeNavigator from './HomeNavigator';
import MeditationNavigator from './MeditationNavigator';
import JournalNavigator from './JournalNavigator';
import AchievementsNavigator from './AchievementsNavigator';
import ProfileNavigator from './ProfileNavigator';

// Create bottom tab navigator
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator: React.FC = () => {
  const { currentTheme, isDark } = useTheme();
  const { colors } = currentTheme;

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? colors.background.dark : colors.background.paper,
          borderTopColor: isDark ? colors.neutral.darker : colors.neutral.lighter,
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Inter-Medium',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Meditations"
        component={MeditationNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="leaf-outline" color={color} size={size} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Journal"
        component={JournalNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" color={color} size={size} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Achievements"
        component={AchievementsNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy-outline" color={color} size={size} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
