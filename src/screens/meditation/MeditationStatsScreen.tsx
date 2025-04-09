import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { MeditationStats, ComparisonStats } from '../../types';
import { meditationService } from '../../api';
import { getMarkedDatesFromArray } from '../../utils/dateUtils';

// Calendar view component
import { Calendar } from 'react-native-calendars';

const MeditationStatsScreen: React.FC = () => {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<MeditationStats | null>(null);
  const [timeFrame, setTimeFrame] = useState<'all' | 'month' | 'week'>('all');
  
  // Fetch meditation stats
  const fetchMeditationStats = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      const meditationStats = await meditationService.getUserMeditationStats(
        true, // includeCalendar
        true, // includeComparisons
        // Calendar date range (last 90 days by default)
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        new Date()
      );
      
      setStats(meditationStats);
    } catch (error) {
      console.error('Failed to fetch meditation stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchMeditationStats();
  }, []);
  
  const onRefresh = () => {
    fetchMeditationStats(true);
  };
  
  // Format meditation dates for the calendar
  const markedDates = useMemo(() => {
    if (!stats?.meditationDates) return {};
    
    return getMarkedDatesFromArray(stats.meditationDates, colors.primary.main);
  }, [stats?.meditationDates, colors.primary.main]);
  
  // Render time comparison block
  const renderTimeComparison = () => {
    if (!stats?.comparisonStats) return null;
    
    const { currentPeriod, previousPeriod, timeChangePercent } = stats.comparisonStats;
    const isPositive = timeChangePercent >= 0;
    
    return (
      <View style={styles.comparisonBlock}>
        <Text style={[styles.comparisonTitle, { color: colors.text.primary }]}>
          Meditation Time
        </Text>
        
        <View style={styles.periodsContainer}>
          <View style={styles.periodBlock}>
            <Text style={[styles.periodLabel, { color: colors.text.secondary }]}>
              {previousPeriod.periodName}
            </Text>
            <Text style={[styles.periodValue, { color: colors.text.primary }]}>
              {previousPeriod.totalMinutes} min
            </Text>
          </View>
          
          <View style={styles.changeIndicator}>
            <Ionicons
              name={isPositive ? 'arrow-up' : 'arrow-down'}
              size={24}
              color={isPositive ? colors.success.main : colors.error.main}
            />
            <Text
              style={[
                styles.changeText,
                { color: isPositive ? colors.success.main : colors.error.main },
              ]}
            >
              {Math.abs(Math.round(timeChangePercent))}%
            </Text>
          </View>
          
          <View style={styles.periodBlock}>
            <Text style={[styles.periodLabel, { color: colors.text.secondary }]}>
              {currentPeriod.periodName}
            </Text>
            <Text style={[styles.periodValue, { color: colors.text.primary }]}>
              {currentPeriod.totalMinutes} min
            </Text>
          </View>
        </View>
      </View>
    );
  };
  
  // Render session comparison block
  const renderSessionComparison = () => {
    if (!stats?.comparisonStats) return null;
    
    const { currentPeriod, previousPeriod, sessionCountChangePercent } = stats.comparisonStats;
    const isPositive = sessionCountChangePercent >= 0;
    
    return (
      <View style={styles.comparisonBlock}>
        <Text style={[styles.comparisonTitle, { color: colors.text.primary }]}>
          Meditation Sessions
        </Text>
        
        <View style={styles.periodsContainer}>
          <View style={styles.periodBlock}>
            <Text style={[styles.periodLabel, { color: colors.text.secondary }]}>
              {previousPeriod.periodName}
            </Text>
            <Text style={[styles.periodValue, { color: colors.text.primary }]}>
              {previousPeriod.sessionCount}
            </Text>
          </View>
          
          <View style={styles.changeIndicator}>
            <Ionicons
              name={isPositive ? 'arrow-up' : 'arrow-down'}
              size={24}
              color={isPositive ? colors.success.main : colors.error.main}
            />
            <Text
              style={[
                styles.changeText,
                { color: isPositive ? colors.success.main : colors.error.main },
              ]}
            >
              {Math.abs(Math.round(sessionCountChangePercent))}%
            </Text>
          </View>
          
          <View style={styles.periodBlock}>
            <Text style={[styles.periodLabel, { color: colors.text.secondary }]}>
              {currentPeriod.periodName}
            </Text>
            <Text style={[styles.periodValue, { color: colors.text.primary }]}>
              {currentPeriod.sessionCount}
            </Text>
          </View>
        </View>
      </View>
    );
  };
  
  // Render streak block
  const renderStreakBlock = () => {
    if (!stats) return null;
    
    return (
      <View style={[styles.statBlock, { backgroundColor: colors.background.paper }]}>
        <View style={styles.statHeader}>
          <Ionicons name="flame" size={24} color={colors.warning.main} />
          <Text style={[styles.statTitle, { color: colors.text.primary }]}>
            Meditation Streak
          </Text>
        </View>
        
        <View style={styles.streakContainer}>
          <View style={styles.streakInfo}>
            <Text style={[styles.streakValue, { color: colors.warning.main }]}>
              {stats.currentStreak}
            </Text>
            <Text style={[styles.streakLabel, { color: colors.text.secondary }]}>
              Current Streak
            </Text>
          </View>
          
          <View style={[styles.streakDivider, { backgroundColor: colors.divider }]} />
          
          <View style={styles.streakInfo}>
            <Text style={[styles.streakValue, { color: colors.text.primary }]}>
              {stats.longestStreak}
            </Text>
            <Text style={[styles.streakLabel, { color: colors.text.secondary }]}>
              Longest Streak
            </Text>
          </View>
        </View>
      </View>
    );
  };
  
  // Render stats summary
  const renderStatsSummary = () => {
    if (!stats) return null;
    
    return (
      <View style={[styles.statBlock, { backgroundColor: colors.background.paper }]}>
        <View style={styles.statHeader}>
          <Ionicons name="stats-chart" size={24} color={colors.primary.main} />
          <Text style={[styles.statTitle, { color: colors.text.primary }]}>
            Meditation Summary
          </Text>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {stats.totalSessions}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
              Total Sessions
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {stats.totalMinutes}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
              Total Minutes
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {stats.totalDaysActive}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
              Days Active
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text.primary }]}>
              {stats.averageSessionMinutes}
            </Text>
            <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
              Avg. Minutes
            </Text>
          </View>
        </View>
      </View>
    );
  };
  
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
            Loading statistics...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
