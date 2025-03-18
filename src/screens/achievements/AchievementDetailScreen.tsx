import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Text } from '../../components/ui';
import { AchievementsStackParamList, Achievement } from '../../types';
import { achievementsService } from '../../api';
import { TouchableOpacity } from 'react-native-gesture-handler';

type AchievementDetailScreenRouteProp = RouteProp<AchievementsStackParamList, 'AchievementDetail'>;

const AchievementDetailScreen: React.FC = () => {
  const route = useRoute<AchievementDetailScreenRouteProp>();
  const navigation = useNavigation();
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;
  
  const { achievementId } = route.params;
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch achievement details
  useEffect(() => {
    const fetchAchievement = async () => {
      try {
        setLoading(true);
        
        // Call the real achievements service
        const data = await achievementsService.getAchievementById(achievementId);
        setAchievement(data);
      } catch (error) {
        console.error('Error fetching achievement:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAchievement();
  }, [achievementId]);
  
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text variant="h3">Achievement</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      </SafeAreaView>
    );
  }
  
  if (!achievement) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text variant="h3">Achievement</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text>Achievement not found</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Calculate progress percentage
  const progressPercentage = Math.min(
    Math.round((achievement.progress / achievement.totalRequired) * 100),
    100
  );
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h3">Achievement</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.achievementCard, { backgroundColor: colors.background.paper }]}>
          <View style={[styles.iconContainer, { 
            backgroundColor: achievement.isUnlocked ? colors.primary.light : colors.neutral.lightest,
            borderColor: achievement.isUnlocked ? colors.primary.main : colors.neutral.lighter
          }]}>
            <Ionicons 
              name={achievement.isUnlocked ? "trophy" : "trophy-outline"} 
              size={60} 
              color={achievement.isUnlocked ? colors.primary.main : colors.neutral.light} 
            />
          </View>
          
          <Text 
            variant="h2" 
            color={achievement.isUnlocked ? 'primary' : 'secondary'}
            style={styles.title}
          >
            {achievement.title}
          </Text>
          
          <Text variant="body" color="secondary" style={styles.description}>
            {achievement.description}
          </Text>
          
          {achievement.isUnlocked && achievement.unlockedAt && (
            <View style={[styles.unlockedInfo, { backgroundColor: colors.success.light }]}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
              <Text variant="body" color="success" style={styles.unlockedText}>
                Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
              </Text>
            </View>
          )}
          
          {!achievement.isUnlocked && (
            <View style={styles.progressSection}>
              <View style={styles.progressInfo}>
                <Text variant="body2" color="secondary">
                  Progress: {achievement.progress} / {achievement.totalRequired}
                </Text>
                <Text variant="body2" color="secondary">
                  {progressPercentage}%
                </Text>
              </View>
              
              <View style={[styles.progressBar, { backgroundColor: colors.neutral.lightest }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${progressPercentage}%`,
                      backgroundColor: colors.primary.main 
                    }
                  ]} 
                />
              </View>
              
              <Text variant="body2" color="secondary" style={styles.remainingText}>
                {achievement.totalRequired - achievement.progress} more to go!
              </Text>
            </View>
          )}
        </View>
        
        <View style={[styles.tipsCard, { backgroundColor: colors.background.paper }]}>
          <Text variant="h4" style={styles.tipsTitle}>
            Tips to earn this achievement
          </Text>
          
          <View style={styles.tipsList}>
            {achievement.type === 0 && ( // ConsistencyStreak
              <>
                <View style={styles.tipItem}>
                  <Ionicons name="calendar-outline" size={20} color={colors.primary.main} style={styles.tipIcon} />
                  <Text variant="body2" style={styles.tipText}>
                    Set a regular time each day for your meditation practice.
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="notifications-outline" size={20} color={colors.primary.main} style={styles.tipIcon} />
                  <Text variant="body2" style={styles.tipText}>
                    Enable reminders to help you maintain your streak.
                  </Text>
                </View>
              </>
            )}
            
            {achievement.type === 1 && ( // TotalMeditationTime
              <>
                <View style={styles.tipItem}>
                  <Ionicons name="time-outline" size={20} color={colors.primary.main} style={styles.tipIcon} />
                  <Text variant="body2" style={styles.tipText}>
                    Try gradually increasing the length of your meditation sessions.
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="calendar-outline" size={20} color={colors.primary.main} style={styles.tipIcon} />
                  <Text variant="body2" style={styles.tipText}>
                    Even short sessions count toward your total meditation time.
                  </Text>
                </View>
              </>
            )}
            
            <View style={styles.tipItem}>
              <Ionicons name="bulb-outline" size={20} color={colors.primary.main} style={styles.tipIcon} />
              <Text variant="body2" style={styles.tipText}>
                Consistency is key to building a mindfulness habit.
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
  placeholder: {
    width: 24,
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
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  achievementCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    textAlign: 'center',
    marginBottom: 16,
  },
  unlockedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  unlockedText: {
    marginLeft: 8,
  },
  progressSection: {
    width: '100%',
    marginTop: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
  },
  remainingText: {
    textAlign: 'center',
    marginTop: 8,
  },
  tipsCard: {
    borderRadius: 16,
    padding: 20,
  },
  tipsTitle: {
    marginBottom: 16,
  },
  tipsList: {
    
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
  },
});

export default AchievementDetailScreen;
