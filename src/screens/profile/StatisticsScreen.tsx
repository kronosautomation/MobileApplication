import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PerformanceJournal } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useAuth } from '../../context';
import { api } from '../../api';
import { userProfileService, UserStats } from '../../api/userProfileService';

// Define a local type that includes the Statistics screen
type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Statistics: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  About: undefined;
  Subscription: undefined;
};

type NavigationProps = NativeStackNavigationProp<ProfileStackParamList, 'Statistics'>;

const StatisticsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const { currentTheme, isDark } = useTheme();
  const { colors } = currentTheme;
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [journalEntries, setJournalEntries] = useState<PerformanceJournal[]>([]);
  const [meditationFrequency, setMeditationFrequency] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  // Chart dimensions
  const screenWidth = Dimensions.get('window').width - 32;

  // Chart configuration
  const chartConfig = {
    backgroundColor: isDark ? colors.background.dark : colors.background.paper,
    backgroundGradientFrom: isDark ? colors.background.dark : colors.background.paper,
    backgroundGradientTo: isDark ? colors.background.dark : colors.background.paper,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(${isDark ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(${isDark ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary.main,
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        console.log('Fetching statistics data for user:', user.id);
        
        // Fetch user stats from API
        const stats = await userProfileService.getUserStats();
        console.log('User stats retrieved:', stats);
        setUserStats(stats);
        
        // Fetch journal entries
        const journalsResponse = await api.getJournalEntries(user.id);
        console.log(`Retrieved ${journalsResponse.data.length} journal entries`);
        setJournalEntries(journalsResponse.data);
        
        // Generate meditation frequency data for the last 7 days
        // In a real implementation, you would calculate this from actual data
        // This is just a placeholder
        const dummyFrequency = [2, 1, 0, 1, 3, 1, 2]; // Example data
        setMeditationFrequency(dummyFrequency);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user?.id]);

  // Prepare data for meditation frequency chart (last 7 days)
  const getMeditationFrequencyData = () => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });
    
    return {
      labels: last7Days,
      datasets: [
        {
          data: meditationFrequency,
          color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        }
      ],
    };
  };
  
  // Prepare data for anxiety levels chart
  const getAnxietyLevelData = () => {
    // Simulate anxiety level data from journal entries
    // In a real app, this would come from actual journal entries
    return {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          data: [7, 6, 8, 5, 4, 3, 4],
          color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
          strokeWidth: 2,
        }
      ],
    };
  };
  
  // Format duration from minutes to readable format
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Statistics</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
            Loading your statistics...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Statistics</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Summary Section */}
        <View style={[styles.section, { backgroundColor: isDark ? colors.background.paper : colors.background.default }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Meditation Summary
          </Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary.main }]}>
                {userStats?.totalMeditations || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                Total Sessions
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary.main }]}>
                {formatDuration(userStats?.totalMinutes || 0)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                Total Time
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary.main }]}>
                {(userStats?.averageAnxietyReduction || 0).toFixed(1)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                Avg. Anxiety Reduction
              </Text>
            </View>
          </View>
          
          <View style={[styles.statsRow, { marginTop: 24 }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary.main }]}>
                {userStats?.completedMeditations || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                Completed
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary.main }]}>
                {userStats?.currentStreak || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                Current Streak
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary.main }]}>
                {(userStats?.completionRate || 0).toFixed(1)}%
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                Completion Rate
              </Text>
            </View>
          </View>
        </View>
        
        {/* Meditation Frequency Chart */}
        <View style={[styles.section, { backgroundColor: isDark ? colors.background.paper : colors.background.default }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Meditation Frequency
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.text.secondary }]}>
            Last 7 days
          </Text>
          
          <BarChart
            data={getMeditationFrequencyData()}
            width={screenWidth}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            verticalLabelRotation={0}
            fromZero
            yAxisLabel=""
            yAxisSuffix=""
          />
        </View>
        
        {/* Anxiety Level Chart */}
        <View style={[styles.section, { backgroundColor: isDark ? colors.background.paper : colors.background.default }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Anxiety Level Trend
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.text.secondary }]}>
            Last 7 days (lower is better)
          </Text>
          
          <LineChart
            data={getAnxietyLevelData()}
            width={screenWidth}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(255, 50, 50, ${opacity})`,
            }}
            style={styles.chart}
            bezier
          />
        </View>
        
        {/* Journal Entry Stats */}
        <View style={[styles.section, { backgroundColor: isDark ? colors.background.paper : colors.background.default }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Journal Activity
          </Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary.main }]}>
                {journalEntries.length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                Total Entries
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary.main }]}>
                {userStats?.daysActive || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                Days Active
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary.main }]}>
                {userStats?.totalAchievements || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                Achievements
              </Text>
            </View>
          </View>
        </View>
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
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 24,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginTop: 16,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default StatisticsScreen;