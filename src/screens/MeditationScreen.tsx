import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MeditationStackParamList } from '../navigation/stacks/MeditationStack';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<MeditationStackParamList, 'MeditationMain'>;

// Sample meditation data
const meditationCategories = [
  { id: '1', title: 'Beginner', description: 'Start your meditation journey', iconName: 'leaf-outline' },
  { id: '2', title: 'Sleep', description: 'Improve your sleep quality', iconName: 'moon-outline' },
  { id: '3', title: 'Anxiety', description: 'Calm your anxious mind', iconName: 'water-outline' },
  { id: '4', title: 'Focus', description: 'Enhance your concentration', iconName: 'eye-outline' },
];

const featuredMeditations = [
  { id: '1', title: 'Morning Calm', duration: 10, level: 'Beginner', category: 'Mindfulness' },
  { id: '2', title: 'Deep Sleep', duration: 20, level: 'All Levels', category: 'Sleep' },
  { id: '3', title: 'Anxiety Relief', duration: 15, level: 'Intermediate', category: 'Anxiety' },
];

const MeditationScreen = ({ navigation }: Props) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meditations</Text>
        <Text style={styles.subtitle}>Find your peace</Text>
      </View>
      
      <FlatList
        data={meditationCategories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        style={styles.categoriesList}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.categoryCard}
            onPress={() => navigation.navigate('MeditationDetail', { id: item.id, title: item.title })}
          >
            <View style={styles.categoryIcon}>
              <Ionicons name={item.iconName} size={24} color="#4A62FF" />
            </View>
            <Text style={styles.categoryTitle}>{item.title}</Text>
            <Text style={styles.categoryDescription}>{item.description}</Text>
          </TouchableOpacity>
        )}
      />
      
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Meditations</Text>
      </View>
      
      <FlatList
        data={featuredMeditations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.featuredList}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.meditationCard}
            onPress={() => navigation.navigate('MeditationDetail', { id: item.id, title: item.title })}
          >
            <View style={styles.meditationInfo}>
              <Text style={styles.meditationTitle}>{item.title}</Text>
              <View style={styles.meditationMeta}>
                <Text style={styles.meditationDuration}>{item.duration} min</Text>
                <Text style={styles.meditationDot}>•</Text>
                <Text style={styles.meditationLevel}>{item.level}</Text>
              </View>
              <Text style={styles.meditationCategory}>{item.category}</Text>
            </View>
            <View style={styles.playButton}>
              <Ionicons name="play" size={20} color="#FFF" />
            </View>
          </TouchableOpacity>
        )}
      />
      
      <TouchableOpacity 
        style={styles.quickStartButton}
        onPress={() => navigation.navigate('MeditationPlayer', { id: '1', title: 'Quick Meditation', duration: 5 })}
      >
        <Text style={styles.quickStartText}>Quick 5-Minute Meditation</Text>
        <Ionicons name="play-circle" size={24} color="#FFF" />
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
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A62FF',
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
    marginTop: 5,
  },
  categoriesList: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    width: 150,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e8efff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  sectionHeader: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  featuredList: {
    paddingHorizontal: 20,
  },
  meditationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  meditationInfo: {
    flex: 1,
  },
  meditationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  meditationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  meditationDuration: {
    fontSize: 14,
    color: '#666',
  },
  meditationDot: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 5,
  },
  meditationLevel: {
    fontSize: 14,
    color: '#666',
  },
  meditationCategory: {
    fontSize: 14,
    color: '#4A62FF',
    marginTop: 5,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A62FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickStartButton: {
    backgroundColor: '#4A62FF',
    borderRadius: 12,
    padding: 15,
    margin: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickStartText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default MeditationScreen;