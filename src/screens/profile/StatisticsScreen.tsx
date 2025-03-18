import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList, MeditationSession, PerformanceJournal } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useAuth } from '../../context';
import { api } from '../../api';

type NavigationProps = NativeStackNavigationProp<ProfileStackParamList, 'Statistics'>;

const StatisticsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const { currentTheme, isDark } = useTheme();
  const { colors } = currentTheme;
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [meditationSessions, setMeditationSessions] = useState<MeditationSession[]>([]);
  const [journalEntries, setJournalEntries] = useState<PerformanceJournal[]>([]);
  const [totalMeditationTime, setTotalMeditationTime] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [averageAnxietyReduction, setAverageAnxietyReduction] = useState(0);

  // Chart dimensions
  const screenWidth = Dimensions.get('window').width - 32;

  // Chart configuration
  const chartConfig = {
    backgroundColor: isDark ? colors.background.dark : colors.background.light,
    backgroundGradientFrom: isDark ? colors.background.dark : colors.background.light,
    backgroundGradientTo: isDark ? colors.background.dark : colors.background.light,
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
        // In a real app, these would be API calls to fetch user data
        // For demo purposes, we'll simulate the data
        
        // Simulate API call for meditation sessions
        const sessionsResponse = await api.getMeditationSessions(user.id);
        setMeditationSessions(sessionsResponse.data);
        
        // Simulate API call for journal entries
        const journalsResponse = await api.getJournalEntries(user.id);
        setJournalEntries(journalsResponse.data);
        
        // Calculate statistics
        if (sessionsResponse.data.length > 0) {
          // Total meditation time
          const totalTime = sessionsResponse.data.reduce(
            (sum, session) => sum + session.durationInSeconds, 0
          );
          setTotalMeditationTime(totalTime);
          setTotalSessions(sessionsResponse.data.length);
          
          // Calculate average anxiety reduction (for sessions with before/after values)
          const sessionsWithAnxietyData = sessionsResponse.data.filter(
            session => session.anxietyBefore !== undefined && session.anxietyAfter !== undefined
          );
          
          if (sessionsWithAnxietyData.length > 0) {
            const totalReduction = sessionsWithAnxietyData.reduce(
              (sum, session) => sum + ((session.anxietyBefore || 0) - (session.anxietyAfter || 0)), 0
            );
            setAverageAnxietyReduction(totalReduction / sessionsWithAnxietyData.length);
          }
        }
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
    
    const sessionsPerDay = last7Days.map(day => {
      // This is simplified logic - in a real app you'd properly count sessions per day
      return Math.floor(Math.random() * 3); // Simulated data
    });
    
    return {
      labels: last7Days,
      datasets: [
        {
          data: sessionsPerDay,
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
  
  // Format seconds to a readable duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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
        <View style={[styles.section, { backgroundColor: isDark ? colors.background.paper : colors.background.light }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Meditation Summary
          </Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary.main }]}>
                {totalSessions}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                Total Sessions
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary.main }]}>
                {formatDuration(totalMeditationTime)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                Total Time
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary.main }]}>
                {averageAnxietyReduction.toFixed(1)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                Avg. Anxiety Reduction
              </Text>
            </View>
          </View>
        </View>
        
        {/* Meditation Frequency Chart */}
        <View style={[styles.section, { backgroundColor: isDark ? colors.background.paper : colors.background.light }]}>
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
          />
        </View>
        
        {/* Anxiety Level Chart */}
        <View style={[styles.section, { backgroundColor: isDark ? colors.background.paper : colors.background.light }]}>
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
        <View style={[styles.section, { backgroundColor: isDark ? colors.background.paper : colors.background.light }]}>
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
                3
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                This Week
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primary.main }]}>
                12
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                This Month
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