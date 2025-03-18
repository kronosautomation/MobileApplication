import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { JournalStackParamList, PerformanceJournal, PerformanceFocusArea } from '../../types';
import { Text, Button } from '../../components/ui';
import { Ionicons } from '@expo/vector-icons';

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
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Get journal ID from params
  const { journalId } = route.params;
  
  // In a real app, we would fetch the journal entry
  // For now, we'll use mock data
  const mockJournal: PerformanceJournal = {
    id: journalId,
    userId: 'user123',
    title: 'My Performance Anxiety',
    content: 'I experienced anxiety before my presentation today. I felt my heart racing and my palms getting sweaty. I tried using some deep breathing techniques that helped a bit, but I still felt very nervous throughout the presentation. I noticed that my anxiety was highest right before I was introduced, and it gradually decreased as I got further into my presentation. Next time, I think I\'ll try to practice more with a friend to build confidence.',
    anxietyLevel: 7,
    performanceFocusArea: PerformanceFocusArea.WorkPresentation,
    event: 'Quarterly Sales Presentation',
    eventDate: new Date().toISOString(),
    triggers: ['Large audience', 'Being evaluated', 'Past failure'],
    copingStrategies: ['Deep breathing', 'Visualization'],
    emotions: ['Nervous', 'Anxious', 'Worried'],
    isPrivate: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
    navigation.navigate('JournalEntry', { journalId });
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
              // In a real app, this would call journalService.deleteJournal
              console.log('Deleting journal entry:', journalId);
              
              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Navigate back to list on success
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting journal entry:', error);
              setIsLoading(false);
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        
        <Text variant="h3" color="primary" style={styles.headerTitle}>
          Journal Entry
        </Text>
        
        <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
          <Ionicons name="pencil" size={24} color={colors.primary.main} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Journal Header */}
        <View style={styles.journalHeader}>
          <Text variant="h3" color="primary">
            {mockJournal.title}
          </Text>
          
          <Text variant="body2" color="secondary" style={styles.date}>
            {formatDate(mockJournal.createdAt)}
          </Text>
        </View>
        
        {/* Metadata */}
        <View style={[styles.metadataContainer, { backgroundColor: colors.background.paper }]}>
          <View style={styles.metadataRow}>
            <Text variant="body2" color="secondary">
              Anxiety Level:
            </Text>
            <View style={[styles.anxietyBadge, { backgroundColor: mockJournal.anxietyLevel > 6 ? colors.error.main : mockJournal.anxietyLevel > 3 ? colors.warning.main : colors.success.main }]}>
              <Text variant="body2" color="light">
                {mockJournal.anxietyLevel}/10
              </Text>
            </View>
          </View>
          
          <View style={styles.metadataRow}>
            <Text variant="body2" color="secondary">
              Focus Area:
            </Text>
            <Text variant="body2" color="primary">
              {getFocusAreaLabel(mockJournal.performanceFocusArea)}
            </Text>
          </View>
          
          {mockJournal.event && (
            <View style={styles.metadataRow}>
              <Text variant="body2" color="secondary">
                Event:
              </Text>
              <Text variant="body2" color="primary">
                {mockJournal.event}
              </Text>
            </View>
          )}
        </View>
        
        {/* Content */}
        <View style={[styles.contentBox, { backgroundColor: colors.background.paper }]}>
          <Text variant="body" color="primary" style={styles.contentText}>
            {mockJournal.content}
          </Text>
        </View>
        
        {/* Emotions */}
        {mockJournal.emotions && mockJournal.emotions.length > 0 && (
          <View style={styles.section}>
            <Text variant="h4" color="primary" style={styles.sectionTitle}>
              Emotions
            </Text>
            <View style={styles.tagsContainer}>
              {mockJournal.emotions.map((emotion, index) => (
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
        {mockJournal.triggers && mockJournal.triggers.length > 0 && (
          <View style={styles.section}>
            <Text variant="h4" color="primary" style={styles.sectionTitle}>
              Triggers
            </Text>
            <View style={styles.tagsContainer}>
              {mockJournal.triggers.map((trigger, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: colors.warning.light }]}>
                  <Text variant="body2" color="light">
                    {trigger}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Coping Strategies */}
        {mockJournal.copingStrategies && mockJournal.copingStrategies.length > 0 && (
          <View style={styles.section}>
            <Text variant="h4" color="primary" style={styles.sectionTitle}>
              Coping Strategies
            </Text>
            <View style={styles.tagsContainer}>
              {mockJournal.copingStrategies.map((strategy, index) => (
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
          loading={isLoading}
          style={[styles.deleteButton, { borderColor: colors.error.main }]}
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
  contentBox: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  contentText: {
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
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
  },
});

export default JournalDetailScreen;
