import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { JournalStackParamList } from '../../navigation/stacks/JournalStack';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<JournalStackParamList, 'JournalEntry'>;

// Sample journal entry (in a real app, you would fetch this based on the ID)
const journalEntry = {
  id: '1',
  date: 'March 17, 2025',
  title: 'Finding Balance',
  content: `Today I focused on finding balance in my daily routine. The morning meditation helped me center my thoughts and prepare for the day ahead.

I noticed that when I started my day with mindfulness, the rest of my day seemed to flow more smoothly. I was less reactive to stressful situations and more present in my interactions with others.

During my afternoon walk, I practiced mindful walking, paying attention to each step and the sensations in my body. It was a great way to reset in the middle of the day.

Things I'm grateful for today:
- The beautiful weather
- A productive meeting with my team
- Making time for self-care

Tomorrow I want to continue this practice and perhaps extend my morning meditation by a few minutes.`,
  mood: 'peaceful',
  tags: ['balance', 'gratitude', 'mindfulness'],
  meditationDuration: 15,
};

// Map moods to icons and colors
const moodConfig: Record<string, { icon: string; color: string }> = {
  peaceful: { icon: 'leaf-outline', color: '#4CAF50' },
  determined: { icon: 'fitness-outline', color: '#FF5722' },
  grateful: { icon: 'heart-outline', color: '#E91E63' },
  happy: { icon: 'sunny-outline', color: '#FFC107' },
  reflective: { icon: 'water-outline', color: '#2196F3' },
};

const JournalEntryScreen = ({ route, navigation }: Props) => {
  const { id, date } = route.params;
  
  // In a real app, you would fetch the entry using the ID
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.date}>{journalEntry.date}</Text>
          <Text style={styles.title}>{journalEntry.title}</Text>
          
          <View style={styles.moodContainer}>
            <View style={[
              styles.moodIcon, 
              { backgroundColor: moodConfig[journalEntry.mood]?.color + '20' || '#e8efff' }
            ]}>
              <Ionicons 
                name={moodConfig[journalEntry.mood]?.icon || 'ellipsis-horizontal'} 
                size={20} 
                color={moodConfig[journalEntry.mood]?.color || '#4A62FF'} 
              />
            </View>
            <Text style={styles.moodText}>
              Feeling {journalEntry.mood}
            </Text>
          </View>
          
          {journalEntry.meditationDuration && (
            <View style={styles.meditationInfo}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.meditationText}>
                Meditated for {journalEntry.meditationDuration} minutes
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.contentContainer}>
          <Text style={styles.content}>{journalEntry.content}</Text>
        </View>
        
        {journalEntry.tags && journalEntry.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            <Text style={styles.tagsLabel}>Tags:</Text>
            <View style={styles.tagsList}>
              {journalEntry.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
      
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#666" />
        </TouchableOpacity>
        
        <View style={styles.actionButtonsRight}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              // In a real app, you would navigate to an edit screen
              navigation.goBack();
            }}
          >
            <Ionicons name="create-outline" size={24} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              // In a real app, you would implement delete functionality
              navigation.goBack();
            }}
          >
            <Ionicons name="trash-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80, // Allow space for action bar
  },
  header: {
    marginBottom: 20,
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  moodIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  moodText: {
    fontSize: 16,
    color: '#333',
  },
  meditationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  meditationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  contentContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  tagsContainer: {
    marginBottom: 20,
  },
  tagsLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e8efff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#4A62FF',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButtonsRight: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});

export default JournalEntryScreen;