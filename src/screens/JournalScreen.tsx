import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { JournalStackParamList } from '../navigation/stacks/JournalStack';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<JournalStackParamList, 'JournalMain'>;

// Sample journal entries
const journalEntries = [
  {
    id: '1',
    date: 'March 17, 2025',
    title: 'Finding Balance',
    content: 'Today I focused on finding balance in my daily routine. The morning meditation helped me center my thoughts...',
    mood: 'peaceful',
  },
  {
    id: '2',
    date: 'March 15, 2025',
    title: 'Overcoming Challenges',
    content: 'Faced a challenging situation at work today. Used breathing techniques to stay calm and focused...',
    mood: 'determined',
  },
  {
    id: '3',
    date: 'March 12, 2025',
    title: 'Gratitude Practice',
    content: "Spent time reflecting on things I'm grateful for. Family, health, and the opportunity to grow...",
    mood: 'grateful',
  },
];

// Map moods to icons
const moodIcons: Record<string, string> = {
  peaceful: 'leaf-outline',
  determined: 'fitness-outline',
  grateful: 'heart-outline',
  happy: 'sunny-outline',
  reflective: 'water-outline',
};

const JournalScreen = ({ navigation }: Props) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Journal</Text>
          <Text style={styles.subtitle}>Record your mindfulness journey</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.calendarButton}
            onPress={() => navigation.navigate('JournalCalendar')}
          >
            <Ionicons name="calendar-outline" size={24} color="#4A62FF" />
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.newEntryButton}
        onPress={() => navigation.navigate('NewJournalEntry')}
      >
        <Ionicons name="add" size={24} color="#FFF" />
        <Text style={styles.newEntryText}>New Entry</Text>
      </TouchableOpacity>
      
      <FlatList
        data={journalEntries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.entriesList}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.entryCard}
            onPress={() => navigation.navigate('JournalEntry', { id: item.id, date: item.date })}
          >
            <View style={styles.entryHeader}>
              <Text style={styles.entryDate}>{item.date}</Text>
              <View style={styles.moodIcon}>
                <Ionicons 
                  name={moodIcons[item.mood] || 'ellipsis-horizontal'} 
                  size={18} 
                  color="#4A62FF" 
                />
              </View>
            </View>
            <Text style={styles.entryTitle}>{item.title}</Text>
            <Text 
              style={styles.entryContent}
              numberOfLines={2}
            >
              {item.content}
            </Text>
            <View style={styles.entryFooter}>
              <Text style={styles.readMore}>Read More</Text>
              <Ionicons name="chevron-forward" size={16} color="#4A62FF" />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No journal entries yet</Text>
            <Text style={styles.emptySubtext}>Start documenting your mindfulness journey</Text>
          </View>
        }
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A62FF',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  calendarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e8efff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A62FF',
    borderRadius: 12,
    margin: 20,
    marginTop: 0,
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
  entriesList: {
    padding: 20,
    paddingTop: 0,
  },
  entryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  entryDate: {
    fontSize: 14,
    color: '#666',
  },
  moodIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#e8efff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  entryContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  entryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  readMore: {
    fontSize: 14,
    color: '#4A62FF',
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default JournalScreen;