import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { PerformanceJournal, PerformanceFocusArea } from '../../types';
import { Text, Button } from '../../components/ui';
import { Ionicons } from '@expo/vector-icons';
import { journalService } from '../../api/journalService';

type JournalStackParamList = {
  JournalDetail: {
    journalId: string;
    refresh?: boolean;
  };
};

type JournalDetailScreenNavigationProp = NativeStackNavigationProp<
  JournalStackParamList,
  'JournalDetail'
>;

type JournalDetailScreenRouteProp = RouteProp<JournalStackParamList, 'JournalDetail'>;

const JournalDetailScreen: React.FC = () => {
  const navigation = useNavigation<JournalDetailScreenNavigationProp>();
  const route = useRoute<JournalDetailScreenRouteProp>();
  const { currentTheme } = useTheme();
  const { colors, spacing } = currentTheme;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [journal, setJournal] = useState<PerformanceJournal | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Get journal ID and refresh trigger from params
  const { journalId, refresh } = route.params;
  
  // Fetch journal data when component mounts or when refresh is triggered
  useEffect(() => {
    fetchJournalData();
    // Add refresh to the dependency array to trigger reload when coming back from edit
  }, [journalId, refresh]);
  
  // Fetch journal data from service
  const fetchJournalData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const journalData = await journalService.getJournalById(journalId);
      console.log('Fetched journal data:', journalData);
      console.log(`Journal detail anxietyLevel=${journalData.anxietyLevel}, confidenceLevel=${journalData.confidenceLevel}`);
      console.log(`Journal detail title="${journalData.title}"`);
      
      // Update navigation header title
      navigation.setOptions({ 
        title: journalData.title || `Journal Entry` 
      });
      
      setJournal(journalData);
    } catch (err) {
      console.error('Error fetching journal:', err);
      setError('Failed to load journal entry. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Handle edit
  const handleEdit = () => {
    navigation.navigate('JournalDetail', { journalId });
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
            setIsDeleting(true);
            try {
              // Call journalService to delete the entry
              await journalService.deleteJournal(journalId);
              
              // Navigate back to list on success
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting journal entry:', error);
              Alert.alert('Error', 'Failed to delete journal entry. Please try again.');
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };
  
  // Get focus area label
  const getFocusAreaLabel = (area: PerformanceFocusArea): string => {
    switch (area) {
      case PerformanceFocusArea.PublicSpeaking:
        return 'Public Speaking';
      case PerformanceFocusArea.Sports:
        return 'Sports';
      case PerformanceFocusArea.SexualPerformance:
        return 'Sexual Performance';
      case PerformanceFocusArea.WorkPresentation:
        return 'Work Presentation';
      case PerformanceFocusArea.SocialAnxiety:
        return 'Social Anxiety';
      case PerformanceFocusArea.TestTaking:
        return 'Test Taking';
      case PerformanceFocusArea.JobInterview:
        return 'Job Interview';
      case PerformanceFocusArea.Other:
        return 'Other';
      default:
        return 'Unknown';
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          
          <Text variant="h3" color="primary" style={styles.headerTitle}>
            Journal Entry
          </Text>
          
          <View style={{ width: 32 }} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text variant="body" color="secondary" style={{ marginTop: 16 }}>
            Loading journal entry...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Render error state
  if (error || !journal) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          
          <Text variant="h3" color="primary" style={styles.headerTitle}>
            Journal Entry
          </Text>
          
          <View style={{ width: 32 }} />
        </View>
        
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error.main} />
          <Text variant="body" color="error" style={{ marginTop: 16 }}>
            {error || 'Journal entry not found'}
          </Text>
          <Button
            title="Try Again"
            onPress={fetchJournalData}
            style={{ marginTop: 16 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        
        <Text variant="h3" color="primary" style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
          {journal?.title || 'Journal Entry'}
        </Text>
        
        <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
          <Ionicons name="pencil" size={24} color={colors.primary.main} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Journal Header */}
        <View style={styles.journalHeader}>
          <Text variant="h3" color="primary">
            {journal.title}
          </Text>
          
          <Text variant="body2" color="secondary" style={styles.date}>
            {formatDate(journal.createdAt)}
          </Text>
        </View>
        
        {/* Metadata */}
        <View style={[styles.metadataContainer, { backgroundColor: colors.background.paper }]}>
          <View style={styles.metadataRow}>
            <Text variant="body2" color="secondary">
              Anxiety Level:
            </Text>
            <View style={[styles.anxietyBadge, { 
              backgroundColor: journal.anxietyLevel > 6 ? colors.error.main : 
                               journal.anxietyLevel > 3 ? colors.warning.main : 
                               colors.success.main 
            }]}>
              <Text variant="body2" color="light">
                {typeof journal.anxietyLevel === 'number' ? 
                  journal.anxietyLevel : 
                  (journal.anxietyLevel ? parseInt(String(journal.anxietyLevel), 10) : 5)}/10
              </Text>
            </View>
          </View>
          
          {(journal.confidenceLevel !== undefined && journal.confidenceLevel !== null) && (
            <View style={styles.metadataRow}>
              <Text variant="body2" color="secondary">
                Confidence Level:
              </Text>
              <View style={[styles.confidenceBadge, { 
                backgroundColor: journal.confidenceLevel < 4 ? colors.error.main : 
                                journal.confidenceLevel < 7 ? colors.warning.main : 
                                colors.success.main 
              }]}>
                <Text variant="body2" color="light">
                  {typeof journal.confidenceLevel === 'number' ? 
                    journal.confidenceLevel : 
                    (journal.confidenceLevel ? parseInt(String(journal.confidenceLevel), 10) : 5)}/10
                </Text>
              </View>
            </View>
          )}
          
          <View style={styles.metadataRow}>
            <Text variant="body2" color="secondary">
              Focus Area:
            </Text>
            <Text variant="body2" color="primary">
              {getFocusAreaLabel(journal.performanceFocusArea)}
            </Text>
          </View>
          
          {journal.event && (
            <View style={styles.metadataRow}>
              <Text variant="body2" color="secondary">
                Event:
              </Text>
              <Text variant="body2" color="primary">
                {journal.event}
              </Text>
            </View>
          )}
        </View>
        
        {/* Content */}
        {journal.content && (
          <View style={[styles.contentBox, { backgroundColor: colors.background.paper }]}>
            <Text variant="body" color="primary" style={styles.contentText}>
              {journal.content}
            </Text>
          </View>
        )}
        
        {/* CBT Framework Sections */}
        {journal.situation && (
          <View style={[styles.contentBox, { backgroundColor: colors.background.paper }]}>
            <Text variant="h4" color="primary" style={styles.sectionTitle}>
              Situation
            </Text>
            <Text variant="body" color="primary" style={styles.contentText}>
              {journal.situation}
            </Text>
          </View>
        )}
        
        {journal.thoughts && (
          <View style={[styles.contentBox, { backgroundColor: colors.background.paper }]}>
            <Text variant="h4" color="primary" style={styles.sectionTitle}>
              Thoughts
            </Text>
            <Text variant="body" color="primary" style={styles.contentText}>
              {journal.thoughts}
            </Text>
          </View>
        )}
        
        {journal.physicalSensations && (
          <View style={[styles.contentBox, { backgroundColor: colors.background.paper }]}>
            <Text variant="h4" color="primary" style={styles.sectionTitle}>
              Physical Sensations
            </Text>
            <Text variant="body" color="primary" style={styles.contentText}>
              {journal.physicalSensations}
            </Text>
          </View>
        )}
        
        {journal.actions && (
          <View style={[styles.contentBox, { backgroundColor: colors.background.paper }]}>
            <Text variant="h4" color="primary" style={styles.sectionTitle}>
              Actions
            </Text>
            <Text variant="body" color="primary" style={styles.contentText}>
              {journal.actions}
            </Text>
          </View>
        )}
        
        {journal.outcome && (
          <View style={[styles.contentBox, { backgroundColor: colors.background.paper }]}>
            <Text variant="h4" color="primary" style={styles.sectionTitle}>
              Outcome
            </Text>
            <Text variant="body" color="primary" style={styles.contentText}>
              {journal.outcome}
            </Text>
          </View>
        )}
        
        {journal.reflection && (
          <View style={[styles.contentBox, { backgroundColor: colors.background.paper }]}>
            <Text variant="h4" color="primary" style={styles.sectionTitle}>
              Reflection
            </Text>
            <Text variant="body" color="primary" style={styles.contentText}>
              {journal.reflection}
            </Text>
          </View>
        )}
        
        {/* Emotions */}
        {journal.emotions && journal.emotions.length > 0 && (
          <View style={styles.section}>
            <Text variant="h4" color="primary" style={styles.sectionTitle}>
              Emotions
            </Text>
            <View style={styles.tagsContainer}>
              {journal.emotions.map((emotion, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: colors.primary.light }]}>
                  <Text variant="body2" color="light">
                    {emotion}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Triggers */}
        {journal.triggers && journal.triggers.length > 0 && (
          <View style={styles.section}>
            <Text variant="h4" color="primary" style={styles.sectionTitle}>
              Triggers
            </Text>
            <View style={styles.tagsContainer}>
              {journal.triggers.map((trigger, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: colors.warning.light }]}>
                  <Text variant="body2" color="light">
                    {trigger}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Techniques Used */}
        {journal.techniquesUsed && journal.techniquesUsed.length > 0 && (
          <View style={styles.section}>
            <Text variant="h4" color="primary" style={styles.sectionTitle}>
              Techniques Used
            </Text>
            <View style={styles.tagsContainer}>
              {journal.techniquesUsed.map((technique, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: colors.primary.light }]}>
                  <Text variant="body2" color="light">
                    {technique}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Coping Strategies */}
        {journal.copingStrategies && journal.copingStrategies.length > 0 && (
          <View style={styles.section}>
            <Text variant="h4" color="primary" style={styles.sectionTitle}>
              Coping Strategies
            </Text>
            <View style={styles.tagsContainer}>
              {journal.copingStrategies.map((strategy, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: colors.success.light }]}>
                  <Text variant="body2" color="light">
                    {strategy}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Delete Button */}
        <Button
          title="Delete Entry"
          variant="outline"
          onPress={handleDelete}
          loading={isDeleting}
          style={styles.deleteButton}
          textStyle={{ color: colors.error.main }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 4,
  },
  editButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  journalHeader: {
    marginBottom: 16,
  },
  date: {
    marginTop: 4,
  },
  metadataContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  anxietyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  contentBox: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  contentText: {
    lineHeight: 24,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  deleteButton: {
    marginTop: 16,
    borderColor: '#e53935',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default JournalDetailScreen;
