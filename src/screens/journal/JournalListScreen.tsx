import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useIsFocused, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { PerformanceJournal, PerformanceFocusArea, MainTabParamList } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { journalService } from '../../api/journalService';
import { useAuth } from '../../context';

const JournalListScreen: React.FC = () => {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const route = useRoute();
  const isFocused = useIsFocused();
  const { currentTheme, isDark } = useTheme();
  const { colors } = currentTheme;
  const { user } = useAuth();
  
  const [journals, setJournals] = useState<PerformanceJournal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch journals when screen comes into focus or when route params change
  useEffect(() => {
    if (isFocused) {
      console.log('Journal list screen focused, fetching journals');
      fetchJournals();
    }
  }, [isFocused, route.params, user]);
  
  const fetchJournals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Attempting to fetch journals...');
      // Removed check for user?.id as journalService likely handles auth internally via apiClient
      
      // Fetch using journalService
      const fetchedJournals = await journalService.getJournals(); 
      console.log('Successfully fetched journals:', fetchedJournals?.length || 0);
      
      // For debugging, log more details if there are journals
      if (fetchedJournals?.length > 0) {
        console.log('First journal:', JSON.stringify(fetchedJournals[0]));
      } else {
        console.log('No journals were retrieved');
      }
      
      setJournals(fetchedJournals); // Set state with the result
    } catch (err: any) {
      console.error('Error fetching journals:', err);
      setError(err.message || 'Failed to load journal entries');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getPerformanceFocusAreaLabel = (area: PerformanceFocusArea): string => {
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
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  const handleJournalPress = (journalId: string) => {
    navigation.navigate('Journal', { screen: 'JournalDetail', params: { journalId } });
  };
  
  const handleCreateJournal = () => {
    navigation.navigate('Journal', { 
      screen: 'NewJournalEntry',
      params: { 
        existingJournalId: undefined  // Add params to satisfy TypeScript
      } 
    });
  };
  
  const renderJournalItem = ({ item }: { item: PerformanceJournal }) => {
    // Check if this is a local entry (for styling purposes)
    const isLocalEntry = item.id.startsWith('local-');
    
    // Debug log journal entry properties
    console.log(`Rendering journal item: id=${item.id}, title=${item.title}, anxietyLevel=${item.anxietyLevel}`);
    
    // Title should already be defined from the service, but add a fallback just in case
    const displayTitle = item.title || `Journal Entry - ${formatDate(item.createdAt)}`;
    
    // Ensure anxiety level is a number
    const anxietyLevel = typeof item.anxietyLevel === 'number' ? 
      item.anxietyLevel : (item.anxietyLevel ? parseInt(String(item.anxietyLevel), 10) : 5);
    
    return (
      <TouchableOpacity
        style={[
          styles.journalCard, 
          { backgroundColor: colors.background.paper },
          isLocalEntry && styles.localJournalCard
        ]}
        onPress={() => handleJournalPress(item.id)}
      >
        {isLocalEntry && (
          <View style={styles.localBadge}>
            <Text style={styles.localBadgeText}>Local</Text>
          </View>
        )}
        <View style={styles.journalHeader}>
          <View style={styles.headerTextContainer}>
            <Text 
              style={[styles.journalTitle, { color: colors.text.primary }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {displayTitle}
            </Text>
            <Text style={[styles.journalDate, { color: colors.text.secondary }]}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
        
        <Text 
          style={[styles.journalContent, { color: colors.text.secondary }]} 
          numberOfLines={2}
        >
          {item.content}
        </Text>
        
        <View style={styles.journalFooter}>
          <View style={[styles.anxietyBadge, { backgroundColor: getAnxietyColor(anxietyLevel) }]}>
            <Text style={styles.anxietyText}>
              {anxietyLevel}/10
            </Text>
          </View>
          
          <View style={[styles.categoryBadge, { backgroundColor: isDark ? colors.background.dark : colors.background.paper }]}>
            <Text style={[styles.categoryText, { color: colors.text.secondary }]}>
              {getPerformanceFocusAreaLabel(item.performanceFocusArea)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  const getAnxietyColor = (level: number): string => {
    if (level <= 3) return colors.success.main;
    if (level <= 6) return colors.warning.main;
    return colors.error.main;
  };
  
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="journal-outline" size={60} color={colors.neutral.medium} />
      <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
        No Journal Entries Yet
      </Text>
      <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
        Track your anxiety and performance by creating your first journal entry.
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: colors.primary.main }]}
        onPress={handleCreateJournal}
      >
        <Text style={[styles.emptyButtonText, { color: colors.primary.contrast }]}>
        Create First Entry
        </Text>
      </TouchableOpacity>
        
      {/* Only show in development mode - a test journal */}
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: colors.warning.main, marginTop: 20 }]}
        onPress={() => {
          // Add a sample journal entry to the list for testing
          const testJournal: PerformanceJournal = {
            id: 'test-' + Date.now(),
            userId: 'test-user',
            title: 'Test Journal Entry',
            content: 'This is a test journal entry to verify the UI is working correctly.',
            anxietyLevel: 4,
            confidenceLevel: 7,
            performanceFocusArea: PerformanceFocusArea.Other,
            emotions: ['peaceful'],
            techniquesUsed: ['breathing'],
            isPrivate: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          // Add to the journals list
          setJournals([testJournal]);
        }}
      >
        <Text style={[styles.emptyButtonText, { color: colors.warning.contrast }]}>
          Add Test Entry (Dev Only)
        </Text>
      </TouchableOpacity>
    </View>
  );
  
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
            Journal
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
            Loading journal entries...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
            Journal
          </Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error.main} />
          <Text style={[styles.errorText, { color: colors.text.primary }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary.main }]}
            onPress={fetchJournals}
          >
            <Text style={[styles.retryButtonText, { color: colors.primary.contrast }]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          Journal
        </Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary.main }]}
          onPress={handleCreateJournal}
        >
          <Ionicons name="add" size={24} color={colors.primary.contrast} />
        </TouchableOpacity>
      </View>
      
      {/* Journal List */}
      <FlatList
        data={journals}
        renderItem={renderJournalItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={fetchJournals}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  journalCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  journalHeader: {
    marginBottom: 8,
  },
  headerTextContainer: {
    flex: 1,
  },
  journalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 4,
  },
  journalDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  journalContent: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
    lineHeight: 22,
  },
  journalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  anxietyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  anxietyText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  localJournalCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4A62FF',
  },
  localBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4A62FF',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  localBadgeText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Inter-Medium',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});

export default JournalListScreen;