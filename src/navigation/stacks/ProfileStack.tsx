import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import ProfileScreen from '../../screens/ProfileScreen';
import SettingsScreen from '../../screens/profile/SettingsScreen';
import NotificationsScreen from '../../screens/profile/NotificationsScreen';
import AccountScreen from '../../screens/profile/AccountScreen';
import EmailSettingsScreen from '../../screens/profile/EmailSettingsScreen';

// Define types for profile stack navigation
export type ProfileStackParamList = {
  ProfileMain: undefined;
  Settings: undefined;
  Notifications: undefined;
  Account: undefined;
  EmailSettings: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileStack = () => {
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
        name="ProfileMain" 
        component={ProfileScreen} 
        options={{ 
          title: 'Your Profile',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }} 
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{ title: 'Notifications' }} 
      />
      <Stack.Screen 
        name="Account" 
        component={AccountScreen} 
        options={{ title: 'Edit Profile' }} 
      />
      <Stack.Screen 
        name="EmailSettings" 
        component={EmailSettingsScreen} 
        options={{ title: 'Email Settings' }} 
      />
    </Stack.Navigator>
  );
};

export default ProfileStack;