import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { JournalStackParamList } from './stacks/JournalStack';
import JournalListScreen from '../screens/journal/JournalListScreen';
import JournalEntryScreen from '../screens/journal/JournalEntryScreen';
import JournalDetailScreen from '../screens/journal/JournalDetailScreen';
import NewJournalEntryScreen from '../screens/journal/NewJournalEntryScreen';

// Create stack navigator for journal screens
const Stack = createNativeStackNavigator<JournalStackParamList>();

const JournalNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="JournalList"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="JournalList" component={JournalListScreen} />
      <Stack.Screen 
        name="JournalEntry" 
        component={JournalEntryScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen name="JournalDetail" component={JournalDetailScreen} />
      <Stack.Screen 
        name="NewJournalEntry" 
        component={NewJournalEntryScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

export default JournalNavigator;
