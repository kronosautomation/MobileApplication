import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { JournalStackParamList } from '../../navigation/stacks/JournalStack';
import { Ionicons } from '@expo/vector-icons';
import { Calendar, DateData } from 'react-native-calendars';

type Props = NativeStackScreenProps<JournalStackParamList, 'JournalCalendar'>;

// Sample journal entry dates (in a real app, you would fetch these from storage)
const journalDates = {
  '2025-03-17': { marked: true, dotColor: '#4A62FF' },
  '2025-03-15': { marked: true, dotColor: '#4A62FF' },
  '2025-03-12': { marked: true, dotColor: '#4A62FF' },
  '2025-03-08': { marked: true, dotColor: '#4A62FF' },
  '2025-03-05': { marked: true, dotColor: '#4A62FF' },
};

const JournalCalendarScreen = ({ navigation }: Props) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const handleDateSelect = (date: DateData) => {
    setSelectedDate(date.dateString);
    
    // Check if there's an entry for this date
    if (journalDates[date.dateString]) {
      // In a real app, you would fetch the entry for this date
      // For now, we'll just navigate to a mock entry
      navigation.navigate('JournalEntry', { 
        id: date.dateString, 
        date: new Date(date.dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      });
    } else {
      // If no entry exists for this date, you could navigate to create a new one
      // or show a message that no entry exists
    }
  };
  
  // Get the current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Journal Calendar</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={handleDateSelect}
          markedDates={{
            ...journalDates,
            [selectedDate || '']: {
              ...(journalDates[selectedDate || ''] || {}),
              selected: true,
              selectedColor: '#4A62FF',
            },
            [getCurrentDate()]: {
              ...(journalDates[getCurrentDate()] || {}),
              marked: true,
              dotColor: '#E91E63',
            },
          }}
          theme={{
            backgroundColor: '#f8f9fa',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#666',
            selectedDayBackgroundColor: '#4A62FF',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#E91E63',
            dayTextColor: '#333',
            textDisabledColor: '#d9e1e8',
            dotColor: '#4A62FF',
            selectedDotColor: '#ffffff',
            arrowColor: '#4A62FF',
            monthTextColor: '#333',
            indicatorColor: '#4A62FF',
            textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '300',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
          }}
        />
      </View>
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4A62FF' }]} />
          <Text style={styles.legendText}>Journal Entry</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#E91E63' }]} />
          <Text style={styles.legendText}>Today</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.newEntryButton}
        onPress={() => navigation.navigate('NewJournalEntry')}
      >
        <Ionicons name="add" size={24} color="#FFF" />
        <Text style={styles.newEntryText}>New Entry</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'white',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  calendarContainer: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legend: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
  newEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A62FF',
    borderRadius: 12,
    margin: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newEntryText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
});

export default JournalCalendarScreen;