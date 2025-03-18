import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MeditationStackParamList } from '../../navigation/stacks/MeditationStack';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<MeditationStackParamList, 'MeditationCompleted'>;

const MeditationCompletedScreen = ({ route, navigation }: Props) => {
  const { sessionTime } = route.params;
  
  // Format time in minutes and seconds
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    if (minutes === 0) {
      return `${seconds} seconds`;
    } else if (seconds === 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''} and ${seconds} seconds`;
    }
  };
  
  // Get a random affirmation
  const getRandomAffirmation = () => {
    const affirmations = [
      "You've created a moment of peace in your day.",
      "Your mind will carry this calm with you.",
      "Each meditation brings you closer to your best self.",
      "You've honored your well-being today.",
      "The peace you feel now can be accessed anytime.",
      "You're building a healthier relationship with yourself.",
      "This practice is changing your brain in positive ways.",
      "You've given yourself the gift of presence.",
    ];
    
    return affirmations[Math.floor(Math.random() * affirmations.length)];
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.completionIcon}>
          <Ionicons name="checkmark-circle" size={80} color="#4A62FF" />
        </View>
        
        <Text style={styles.title}>Session Complete</Text>
        <Text style={styles.sessionInfo}>
          You meditated for {formatTime(sessionTime)}
        </Text>
        
        <View style={styles.affirmationContainer}>
          <Text style={styles.affirmationLabel}>Remember:</Text>
          <Text style={styles.affirmation}>{getRandomAffirmation()}</Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{Math.floor(sessionTime / 60)}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>+5</Text>
            <Text style={styles.statLabel}>Mindfulness Points</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.journalButton}
          onPress={() => {
            // Navigate to journal entry screen (would be implemented in Journal Stack)
            navigation.navigate('MeditationMain');
            // In a real app, you would navigate to the journal tab and create a new entry
          }}
        >
          <Text style={styles.journalButtonText}>Journal This Experience</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.doneButton}
          onPress={() => navigation.navigate('MeditationMain')}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  completionIcon: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  sessionInfo: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  affirmationContainer: {
    backgroundColor: '#e8efff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  affirmationLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A62FF',
    marginBottom: 10,
  },
  affirmation: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A62FF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  journalButton: {
    backgroundColor: '#4A62FF',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 30,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  journalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  doneButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
});

export default MeditationCompletedScreen;