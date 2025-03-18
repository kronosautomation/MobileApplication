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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { JournalStackParamList, PerformanceJournal, PerformanceFocusArea } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../api';
import { useAuth } from '../../context';

type JournalListNavigationProp = NativeStackNavigationProp<JournalStackParamList, 'JournalList'>;

const JournalListScreen: React.FC = () => {
  const navigation = useNavigation<JournalListNavigationProp>();
  const { currentTheme, isDark } = useTheme();
  const { colors } = currentTheme;
  const { user } = useAuth();
  
  const [journals, setJournals] = useState<PerformanceJournal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchJournals();
  }, []);
  
  const fetchJournals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!user?.id) throw new Error('User not authenticated');
      
      // In a real app, this would fetch from the API
      const response = await api.getJournalEntries(user.id);
      setJournals(response.data);
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
    navigation.navigate('JournalDetail', { journalId });
  };
  
  const handleCreateJournal = () => {
    navigation.navigate('JournalEntry');
  };
  
  const renderJournalItem = ({ item }: { item: PerformanceJournal }) => (
    <TouchableOpacity
      style={[styles.journalCard, { backgroundColor: colors.background.paper }]}
      onPress={() => handleJournalPress(item.id)}
    >
      <View style={styles.journalHeader}>
        <Text style={[styles.journalTitle, { color: colors.text.primary }]}>
          {item.title}
        </Text>
        <Text style={[styles.journalDate, { color: colors.text.secondary }]}>
          {formatDate(item.createdAt)}
        </Text>
      </View>
      
      <Text 
        style={[styles.journalContent, { color: colors.text.secondary }]} 
        numberOfLines={2}
      >
        {item.content}
      </Text>
      
      <View style={styles.journalFooter}>
        <View style={[styles.anxietyBadge, { backgroundColor: getAnxietyColor(item.anxietyLevel) }]}>
          <Text style={styles.anxietyText}>
            {item.anxietyLevel}/10
          </Text>
        </View>
        
        <View style={[styles.categoryBadge, { backgroundColor: isDark ? colors.background.dark : colors.background.light }]}>
          <Text style={[styles.categoryText, { color: colors.text.secondary }]}>
            {getPerformanceFocusAreaLabel(item.performanceFocusArea)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  const getAnxietyColor = (level: number): string => {
    if (level <= 3) return colors.success.main;
    if (level <= 6) return colors.warning.main;
    return colors.error.main;
  };
  
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="journal-outline" size={60} color={colors.neutral.main} />
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
        <Text style={[styles.emptyButtonText, { color: colors.primary.contrastText }]}>
          Create First Entry
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
            <Text style={[styles.retryButtonText, { color: colors.primary.contrastText }]}>
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
          <Ionicons name="add" size={24} color={colors.primary.contrastText} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  journalTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    flex: 1,
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