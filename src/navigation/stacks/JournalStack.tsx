import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import JournalScreen from '../../screens/JournalScreen';
import JournalEntryScreen from '../../screens/journal/JournalEntryScreen';
import NewJournalEntryScreen from '../../screens/journal/NewJournalEntryScreen';
import JournalCalendarScreen from '../../screens/journal/JournalCalendarScreen';

// Import types from the .ts file
import { JournalStackParamList } from './JournalStack.ts';

const Stack = createNativeStackNavigator<JournalStackParamList>();

const JournalStack = () => {
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
        name="JournalMain" 
        component={JournalScreen} 
        options={{ 
          title: 'Your Journal',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="JournalEntry" 
        component={JournalEntryScreen} 
        options={({ route }) => ({ 
          title: route.params.date,
          headerShown: false
        })} 
      />
      <Stack.Screen 
        name="NewJournalEntry" 
        component={NewJournalEntryScreen} 
        options={{ 
          title: 'New Entry',
          headerShown: false,
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="JournalCalendar" 
        component={JournalCalendarScreen} 
        options={{ 
          title: 'Journal Calendar',
          headerShown: false
        }} 
      />
    </Stack.Navigator>
  );
};

export default JournalStack;