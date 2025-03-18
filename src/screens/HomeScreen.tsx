import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../navigation/stacks/HomeStack';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeMain'>;

const HomeScreen = ({ navigation }: Props) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Your mindfulness journey continues</Text>
        </View>
        
        <View style={styles.quickStatsContainer}>
          <TouchableOpacity 
            style={styles.quickStatCard}
            onPress={() => navigation.navigate('Stats')}
          >
            <Ionicons name="analytics-outline" size={24} color="#4A62FF" />
            <Text style={styles.quickStatTitle}>Your Progress</Text>
            <Text style={styles.quickStatSubtitle}>View detailed stats</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickStatCard}
            onPress={() => navigation.navigate('Achievements')}
          >
            <Ionicons name="trophy-outline" size={24} color="#4A62FF" />
            <Text style={styles.quickStatTitle}>Achievements</Text>
            <Text style={styles.quickStatSubtitle}>Track milestones</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Recommendation</Text>
        </View>
        
        <TouchableOpacity style={styles.recommendationCard}>
          <View style={styles.recommendationContent}>
            <Text style={styles.recommendationTitle}>Calm Mind Meditation</Text>
            <Text style={styles.recommendationSubtitle}>10 minutes of guided meditation to center your thoughts</Text>
            <View style={styles.recommendationFooter}>
              <View style={styles.recommendationTag}>
                <Text style={styles.recommendationTagText}>10 min</Text>
              </View>
              <Text style={styles.recommendationDetails}>Beginner friendly</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Journal Entries</Text>
        </View>
        
        <TouchableOpacity style={styles.journalEntryCard}>
          <Text style={styles.journalEntryDate}>Today</Text>
          <Text style={styles.journalEntryText}>Started a new meditation routine. Feeling more centered...</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.journalEntryCard}>
          <Text style={styles.journalEntryDate}>Yesterday</Text>
          <Text style={styles.journalEntryText}>Reflected on my goals for mindfulness practice...</Text>
        </TouchableOpacity>
      </ScrollView>
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
  },
  header: {
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A62FF',
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
    marginTop: 8,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  quickStatCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickStatTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  quickStatSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sectionHeader: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  recommendationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  recommendationContent: {
    padding: 15,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  recommendationSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
    marginBottom: 12,
  },
  recommendationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendationTag: {
    backgroundColor: '#E8EFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  recommendationTagText: {
    color: '#4A62FF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  recommendationDetails: {
    color: '#666',
    fontSize: 12,
  },
  journalEntryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  journalEntryDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A62FF',
    marginBottom: 6,
  },
  journalEntryText: {
    fontSize: 14,
    color: '#333',
  },
});

export default HomeScreen;