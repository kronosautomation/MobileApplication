import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/stacks/HomeStack';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<HomeStackParamList, 'Achievements'>;

// Sample achievements data
const achievements = [
  { id: '1', title: 'First Meditation', description: 'Completed your first meditation session', completed: true },
  { id: '2', title: 'Week Streak', description: 'Meditated for 7 consecutive days', completed: true },
  { id: '3', title: 'Mindfulness Master', description: 'Completed 30 meditation sessions', completed: false },
  { id: '4', title: 'Journal Keeper', description: 'Created 10 journal entries', completed: false },
  { id: '5', title: 'Deep Breather', description: 'Completed a 20-minute meditation', completed: true },
];

const AchievementsScreen = ({ navigation }: Props) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Achievements</Text>
        <Text style={styles.subtitle}>Your mindfulness milestones</Text>
        
        <FlatList
          data={achievements}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.achievementItem}>
              <View style={[
                styles.achievementIcon, 
                {backgroundColor: item.completed ? '#4A62FF' : '#e0e0e0'}
              ]}>
                <Ionicons 
                  name={item.completed ? 'trophy' : 'trophy-outline'} 
                  size={24} 
                  color={item.completed ? 'white' : '#999'} 
                />
              </View>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementTitle}>{item.title}</Text>
                <Text style={styles.achievementDescription}>{item.description}</Text>
              </View>
              {item.completed && (
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              )}
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A62FF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 30,
  },
  listContent: {
    paddingBottom: 20,
  },
  achievementItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default AchievementsScreen;