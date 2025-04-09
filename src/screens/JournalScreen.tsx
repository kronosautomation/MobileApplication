import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { JournalStackParamList } from '../navigation/stacks/JournalStack';
import { Ionicons } from '@expo/vector-icons';
import { journalService } from '../api/journalService';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { MainTabParamList } from '../types';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

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
  const { currentTheme } = useTheme();
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const tabNavigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  useEffect(() => {
    checkMonthlyLimit();
  }, []);

  const checkMonthlyLimit = async () => {
    try {
      const subscriptionJson = await AsyncStorage.getItem('@MindfulMastery:subscription');
      const subscription = subscriptionJson ? JSON.parse(subscriptionJson) : { tier: 'Free' };
      
      if (subscription.tier === 'Free') {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        const entries = await journalService.getJournals(startOfMonth, endOfMonth);
        setIsLimitReached(entries.length >= 5);
      }
    } catch (error) {
      console.error('Error checking monthly limit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradePress = () => {
    // Navigate to the subscription screen in the Profile tab
    tabNavigation.navigate('Profile', { screen: 'Subscription' });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background.default }]}>
      <View style={[styles.header, { backgroundColor: currentTheme.colors.background.paper }]}>
        <View>
          <Text style={[styles.title, { color: currentTheme.colors.text.primary }]}>Journal</Text>
          <Text style={[styles.subtitle, { color: currentTheme.colors.text.secondary }]}>Record your mindfulness journey</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={[styles.calendarButton, { backgroundColor: currentTheme.colors.primary.light }]}
            onPress={() => navigation.navigate('JournalCalendar' as never)}
          >
            <Ionicons name="calendar-outline" size={24} color={currentTheme.colors.primary.main} />
          </TouchableOpacity>
        </View>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme.colors.primary.main} />
        </View>
      ) : (
        <TouchableOpacity 
          style={[
            styles.newEntryButton, 
            { backgroundColor: isLimitReached ? currentTheme.colors.neutral.light : currentTheme.colors.primary.main }
          ]}
          onPress={isLimitReached ? handleUpgradePress : () => navigation.navigate('NewJournalEntry' as never)}
          disabled={isLoading}
        >
          <Ionicons name="add" size={24} color="#FFF" />
          <Text style={styles.newEntryText}>
            {isLimitReached ? 'Upgrade to Premium' : 'New Entry'}
          </Text>
        </TouchableOpacity>
      )}

      {isLimitReached && (
        <View style={[styles.limitMessage, { backgroundColor: currentTheme.colors.warning.light }]}>
          <Text style={[styles.limitText, { color: currentTheme.colors.warning.dark }]}>
            You've reached your monthly limit of 5 journal entries.{'\n'}
            Upgrade to Premium for unlimited entries!
          </Text>
        </View>
      )}
      
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
  },
  subtitle: {
    fontSize: 16,
    marginTop: 5,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  calendarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  limitMessage: {
    margin: 20,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  limitText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
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