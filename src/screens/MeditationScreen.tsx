import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MeditationStackParamList } from '../navigation/stacks/MeditationStack';
import { Ionicons } from '@expo/vector-icons';
import { useSubscription } from '../hooks/useSubscription'; // Hypothetical hook

type Props = NativeStackScreenProps<MeditationStackParamList, 'MeditationMain'>;

// Sample meditation data - ADD isPremium flag
const meditationCategories = [
  { id: '1', title: 'Beginner', description: 'Start your meditation journey', iconName: 'leaf-outline', isPremium: false },
  { id: '2', title: 'Sleep', description: 'Improve your sleep quality', iconName: 'moon-outline', isPremium: true },
  { id: '3', title: 'Anxiety', description: 'Calm your anxious mind', iconName: 'water-outline', isPremium: false },
  { id: '4', title: 'Focus', description: 'Enhance your concentration', iconName: 'eye-outline', isPremium: true },
];

const featuredMeditations = [
  { id: '1', title: 'Morning Calm', duration: 10, level: 'Beginner', category: 'Mindfulness', isPremium: false },
  { id: '2', title: 'Deep Sleep', duration: 20, level: 'All Levels', category: 'Sleep', isPremium: true },
  { id: '3', title: 'Anxiety Relief', duration: 15, level: 'Intermediate', category: 'Anxiety', isPremium: false },
];

// Sample free quick meditation
const quickMeditation = {
  id: 'quick-free',
  title: 'Quick 5-Minute Reset',
  duration: 5,
  isPremium: false
};

// Sample premium quick meditation (example)
const premiumQuickMeditation = {
  id: 'quick-premium',
  title: 'Quick Premium Focus',
  duration: 3,
  isPremium: true
};

const MeditationScreen = ({ navigation }: Props) => {
  const { isSubscribed } = useSubscription(); // Get subscription status

  const handlePress = (item: { id: string; title: string; isPremium: boolean; duration?: number }) => {
    if (item.isPremium && !isSubscribed) {
      Alert.alert(
        "Subscription Required",
        "This meditation requires an active subscription. Please subscribe to access premium content.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Subscribe", onPress: () => navigation.navigate('Subscription') } // Navigate to Subscription screen
        ]
      );
    } else {
      // Determine navigation target based on whether it's a category or a specific meditation
      if (item.duration !== undefined) { // It's a specific meditation (featured or quick)
        navigation.navigate('MeditationPlayer', { id: item.id, title: item.title, duration: item.duration });
      } else { // It's a category
        navigation.navigate('MeditationList', { categoryId: item.id, title: item.title }); // Navigate to list screen for category
      }
    }
  };

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
            onPress={() => handlePress(item)} // Use shared handler
          >
            <View style={styles.categoryIconContainer}>
              <View style={styles.categoryIcon}>
                <Ionicons name={item.iconName as any} size={24} color="#4A62FF" />
              </View>
              {item.isPremium && !isSubscribed && (
                 <View style={styles.lockIconOverlay}>
                   <Ionicons name="lock-closed" size={18} color="#FFF" />
                 </View>
              )}
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
            onPress={() => handlePress(item)} // Use shared handler
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
            <View style={styles.playButtonContainer}>
              <View style={styles.playButton}>
                 <Ionicons name="play" size={20} color="#FFF" />
              </View>
              {item.isPremium && !isSubscribed && (
                 <View style={styles.lockIconOverlaySmall}>
                    <Ionicons name="lock-closed" size={14} color="#FFF" />
                 </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
      
      <TouchableOpacity 
        style={styles.quickStartButton}
        onPress={() => handlePress(quickMeditation)} // Use shared handler for free quick meditation
      >
        <Text style={styles.quickStartText}>{quickMeditation.title}</Text>
        <Ionicons name="play-circle" size={24} color="#FFF" />
      </TouchableOpacity>
      
       {/* Example: Premium Quick Start Button (Optional) */}
       {/* 
       <TouchableOpacity 
         style={[styles.quickStartButton, {backgroundColor: '#888'}]} // Different style for premium example
         onPress={() => handlePress(premiumQuickMeditation)} // Use shared handler
       >
         <View style={{flexDirection: 'row', alignItems: 'center'}}>
           <Text style={styles.quickStartText}>{premiumQuickMeditation.title}</Text>
           {premiumQuickMeditation.isPremium && !isSubscribed && (
             <Ionicons name="lock-closed" size={18} color="#FFF" style={{marginLeft: 8}}/>
           )}
         </View>
         <Ionicons name="play-circle" size={24} color="#FFF" />
       </TouchableOpacity> 
       */}
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
    alignItems: 'center', // Center content
  },
  categoryIconContainer: {
     position: 'relative', // Needed for absolute positioning of lock icon
     marginBottom: 10,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e8efff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  categoryDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    // paddingTop: 0, // Removed conflicting padding
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
    marginRight: 10, // Add margin to prevent text overlap with button
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
  playButtonContainer: {
     position: 'relative', // For lock icon positioning
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
    marginHorizontal: 20,
    marginTop: 10, // Adjusted margin
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quickStartText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  lockIconOverlay: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 4,
  },
  lockIconOverlaySmall: {
    position: 'absolute',
    bottom: -3, // Adjusted position
    right: -3,  // Adjusted position
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    padding: 3,
  },
});

export default MeditationScreen;