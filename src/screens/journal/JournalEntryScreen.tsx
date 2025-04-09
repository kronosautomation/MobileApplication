import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { JournalStackParamList } from '../../navigation/stacks/JournalStack';
import { PerformanceJournal, PerformanceFocusArea } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { journalService } from '../../api/journalService';

type Props = NativeStackScreenProps<JournalStackParamList, 'JournalEntry'>;

// Map moods to icons and colors
const moodConfig: Record<string, { icon: string; color: string }> = {
  peaceful: { icon: 'leaf-outline', color: '#4CAF50' },
  determined: { icon: 'fitness-outline', color: '#FF5722' },
  grateful: { icon: 'heart-outline', color: '#E91E63' },
  happy: { icon: 'sunny-outline', color: '#FFC107' },
  reflective: { icon: 'water-outline', color: '#2196F3' },
  nervous: { icon: 'pulse-outline', color: '#FF9800' },
  anxious: { icon: 'flash-outline', color: '#9C27B0' },
  focused: { icon: 'eye-outline', color: '#607D8B' },
};

const JournalEntryScreen = ({ route, navigation }: Props) => {
  const { journalId } = route.params;
  
  const [journal, setJournal] = useState<PerformanceJournal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch journal entry when component mounts
  useEffect(() => {
    fetchJournalEntry();
  }, [journalId]);
  
  // Fetch journal entry from service
  const fetchJournalEntry = async () => {
    if (!journalId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const journalData = await journalService.getJournalById(journalId);
      console.log('Fetched journal entry:', journalData);
      setJournal(journalData);
    } catch (err) {
      console.error('Error fetching journal entry:', err);
      setError('Failed to load journal entry');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Handle edit
  const handleEdit = () => {
    navigation.navigate('NewJournalEntry', { existingJournalId: journalId });
  };
  
  // Handle delete
  const handleDelete = () => {
    Alert.alert(
      'Delete Journal Entry',
      'Are you sure you want to delete this journal entry? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await journalService.deleteJournal(journalId);
              navigation.navigate('JournalList');
            } catch (error) {
              console.error('Error deleting journal entry:', error);
              Alert.alert('Error', 'Failed to delete journal entry');
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  // Get the primary emotion if available
  const getPrimaryEmotion = (): string | undefined => {
    if (!journal?.emotions || journal.emotions.length === 0) {
      return undefined;
    }
    return journal.emotions[0];
  };
  
  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A62FF" />
          <Text style={styles.loadingText}>Loading journal entry...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Error state
  if (error || !journal) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#e74c3c" />
          <Text style={styles.errorText}>{error || 'Journal entry not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchJournalEntry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  // Get the primary emotion for display
  const primaryEmotion = getPrimaryEmotion();
  const moodData = primaryEmotion && moodConfig[primaryEmotion.toLowerCase()];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.date}>
            {formatDate(journal.createdAt)}
          </Text>
          <Text style={styles.title}>
            {journal.title || 'Untitled Journal Entry'}
          </Text>
          
          {primaryEmotion && moodData && (
            <View style={styles.moodContainer}>
              <View style={[
                styles.moodIcon, 
                { backgroundColor: moodData.color + '20' }
              ]}>
                <Ionicons 
                  name={moodData.icon} 
                  size={20} 
                  color={moodData.color} 
                />
              </View>
              <Text style={styles.moodText}>
                Feeling {primaryEmotion.toLowerCase()}
              </Text>
            </View>
          )}
          
          <View style={styles.metadataContainer}>
            <View style={styles.metadataItem}>
              <Ionicons name="pulse" size={16} color="#666" />
              <Text style={styles.metadataText}>Anxiety Level: {journal.anxietyLevel}/10</Text>
            </View>
            
            {journal.confidenceLevel !== undefined && (
              <View style={styles.metadataItem}>
                <Ionicons name="trophy" size={16} color="#666" />
                <Text style={styles.metadataText}>Confidence Level: {journal.confidenceLevel}/10</Text>
              </View>
            )}
            
            {journal.performanceFocusArea !== undefined && (
              <View style={styles.metadataItem}>
                <Ionicons name="flag" size={16} color="#666" />
                <Text style={styles.metadataText}>
                  Focus Area: {PerformanceFocusArea[journal.performanceFocusArea]}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Main content */}
        {journal.content && (
          <View style={styles.contentContainer}>
            <Text style={styles.content}>{journal.content}</Text>
          </View>
        )}
        
        {/* Situation section */}
        {journal.situation && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Situation</Text>
            <Text style={styles.sectionContent}>{journal.situation}</Text>
          </View>
        )}
        
        {/* Thoughts section */}
        {journal.thoughts && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Thoughts</Text>
            <Text style={styles.sectionContent}>{journal.thoughts}</Text>
          </View>
        )}
        
        {/* Physical Sensations section */}
        {journal.physicalSensations && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Physical Sensations</Text>
            <Text style={styles.sectionContent}>{journal.physicalSensations}</Text>
          </View>
        )}
        
        {/* Actions section */}
        {journal.actions && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Actions</Text>
            <Text style={styles.sectionContent}>{journal.actions}</Text>
          </View>
        )}
        
        {/* Outcome section */}
        {journal.outcome && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Outcome</Text>
            <Text style={styles.sectionContent}>{journal.outcome}</Text>
          </View>
        )}
        
        {/* Reflection section */}
        {journal.reflection && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Reflection</Text>
            <Text style={styles.sectionContent}>{journal.reflection}</Text>
          </View>
        )}
        
        {/* Emotions display */}
        {journal.emotions && journal.emotions.length > 0 && (
          <View style={styles.tagsContainer}>
            <Text style={styles.tagsLabel}>Emotions:</Text>
            <View style={styles.tagsList}>
              {journal.emotions.map((emotion, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: '#e8efff' }]}>
                  <Text style={styles.tagText}>{emotion}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Techniques Used display */}
        {journal.techniquesUsed && journal.techniquesUsed.length > 0 && (
          <View style={styles.tagsContainer}>
            <Text style={styles.tagsLabel}>Techniques Used:</Text>
            <View style={styles.tagsList}>
              {journal.techniquesUsed.map((technique, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: '#f0f8ff' }]}>
                  <Text style={styles.tagText}>{technique}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Coping Strategies display */}
        {journal.copingStrategies && journal.copingStrategies.length > 0 && (
          <View style={styles.tagsContainer}>
            <Text style={styles.tagsLabel}>Coping Strategies:</Text>
            <View style={styles.tagsList}>
              {journal.copingStrategies.map((strategy, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: '#f0fff0' }]}>
                  <Text style={styles.tagText}>{strategy}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Triggers display */}
        {journal.triggers && journal.triggers.length > 0 && (
          <View style={styles.tagsContainer}>
            <Text style={styles.tagsLabel}>Triggers:</Text>
            <View style={styles.tagsList}>
              {journal.triggers.map((trigger, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: '#fff0f0' }]}>
                  <Text style={styles.tagText}>{trigger}</Text>
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
            onPress={handleEdit}
          >
            <Ionicons name="create-outline" size={24} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleDelete}
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
  metadataContainer: {
    marginTop: 10,
    marginBottom: 15,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  metadataText: {
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
  sectionContainer: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  sectionContent: {
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
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#333',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    marginBottom: 20,
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4A62FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default JournalEntryScreen;
