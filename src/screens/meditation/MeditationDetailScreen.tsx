import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MeditationStackParamList } from '../../navigation/stacks/MeditationStack';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<MeditationStackParamList, 'MeditationDetail'>;

// Sample meditation data (in a real app, you would fetch this based on the ID)
const meditationDetails = {
  id: '1',
  title: 'Morning Calm',
  description: 'Start your day with a calm and focused mind. This guided meditation helps you center yourself and prepare for the day ahead with mindfulness and intention.',
  duration: 10,
  level: 'Beginner',
  category: 'Mindfulness',
  benefits: [
    'Reduced morning anxiety',
    'Improved focus throughout the day',
    'Greater sense of calm and purpose'
  ],
  creator: 'Sarah Johnson',
  plays: 5280
};

const MeditationDetailScreen = ({ route, navigation }: Props) => {
  const { id, title } = route.params;
  
  // In a real app, you would fetch the meditation details using the ID
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <View style={styles.meditationImage}>
            <Ionicons name="leaf" size={60} color="#4A62FF" />
          </View>
          <Text style={styles.title}>{meditationDetails.title}</Text>
          <View style={styles.meditationMeta}>
            <Text style={styles.metaItem}>{meditationDetails.duration} min</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaItem}>{meditationDetails.level}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaItem}>{meditationDetails.category}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{meditationDetails.description}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benefits</Text>
          {meditationDetails.benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4A62FF" />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the Creator</Text>
          <Text style={styles.creatorText}>Created by {meditationDetails.creator}</Text>
          <Text style={styles.playsText}>{meditationDetails.plays.toLocaleString()} plays</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => navigation.navigate('MeditationPlayer', { 
            id: meditationDetails.id, 
            title: meditationDetails.title, 
            duration: meditationDetails.duration 
          })}
        >
          <Text style={styles.startButtonText}>Begin Meditation</Text>
          <Ionicons name="play-circle" size={24} color="#FFF" />
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
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  meditationImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e8efff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  meditationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  metaItem: {
    fontSize: 16,
    color: '#666',
  },
  metaDot: {
    fontSize: 16,
    color: '#666',
    marginHorizontal: 8,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  creatorText: {
    fontSize: 16,
    color: '#333',
  },
  playsText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  startButton: {
    backgroundColor: '#4A62FF',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default MeditationDetailScreen;