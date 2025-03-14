import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../types';
import ProfileMainScreen from '../screens/profile/ProfileMainScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SubscriptionScreen from '../screens/subscription/SubscriptionScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import StatisticsScreen from '../screens/profile/StatisticsScreen';
import PrivacyPolicyScreen from '../screens/profile/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/profile/TermsOfServiceScreen';
import AboutScreen from '../screens/profile/AboutScreen';

// Create stack navigator for profile screens
const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="ProfileMain"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileMainScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Statistics" component={StatisticsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;
