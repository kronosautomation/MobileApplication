import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import { Text } from '../../components/ui';
import { Ionicons } from '@expo/vector-icons';
import { AchievementsStackParamList, Achievement, AchievementType } from '../../types';
import { achievementsService } from '../../api';
import { useAuth } from '../../context';

type AchievementsListScreenNavigationProp = NativeStackNavigationProp<
  AchievementsStackParamList,
  'AchievementsList'
>;

const AchievementsListScreen: React.FC = () => {
  const navigation = useNavigation<AchievementsListScreenNavigationProp>();
  const { currentTheme, isDark } = useTheme();
  const { colors } = currentTheme;
  const { user } = useAuth();
  
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  
  // Fetch achievements
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        
        // Call the real achievements service
        const data = await achievementsService.getUserAchievements();
        setAchievements(data);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAchievements();
  }, [user?.id]);
  
  // Filter achievements based on selected filter
  const filteredAchievements = achievements.filter(achievement => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'unlocked') return achievement.isUnlocked;
    if (selectedFilter === 'locked') return !achievement.isUnlocked;
    return true;
  });
  
  const getAchievementIconName = (type: AchievementType, isUnlocked: boolean): string => {
    const baseIconName = isUnlocked ? '' : '-outline';
    
    switch (type) {
      case AchievementType.ConsistencyStreak:
        return `calendar${baseIconName}`;
      case AchievementType.TotalMeditationTime:
        return `time${baseIconName}`;
      case AchievementType.AnxietyReduction:
        return `trending-down${baseIconName}`;
      case AchievementType.JournalEntries:
        return `journal${baseIconName}`;
      case AchievementType.MeditationCount:
        return `leaf${baseIconName}`;
      case AchievementType.SpecificFocusArea:
        return `fitness${baseIconName}`;
      default:
        return `trophy${baseIconName}`;
    }
  };
  
  const renderAchievementItem = ({ item }: { item: Achievement }) => {
    // Calculate progress percentage
    const progressPercentage = Math.round((item.progress / item.totalRequired) * 100);
    
    return (
      <TouchableOpacity
        style={[styles.achievementCard, { backgroundColor: colors.background.paper }]}
        onPress={() => navigation.navigate('AchievementDetail', { achievementId: item.id })}
      >
        <View style={[styles.iconContainer, { 
          backgroundColor: item.isUnlocked ? colors.primary.light : colors.neutral.lightest,
          borderColor: item.isUnlocked ? colors.primary.main : colors.neutral.lighter
        }]}>
          <Ionicons 
            name={getAchievementIconName(item.type, item.isUnlocked) as any}
            size={28} 
            color={item.isUnlocked ? colors.primary.main : colors.neutral.main} 
          />
        </View>
        
        <View style={styles.achievementInfo}>
          <Text 
            variant="subtitle" 
            color={item.isUnlocked ? 'primary' : 'text'}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          
          <Text variant="body2" color="secondary" numberOfLines={2} style={styles.description}>
            {item.description}
          </Text>
          
          {item.isUnlocked ? (
            <View style={styles.unlockedContainer}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success.main} />
              <Text variant="caption" color="success" style={styles.unlockedText}>
                Unlocked
              </Text>
            </View>
          ) : (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: colors.neutral.lightest }]}>
                <View 
                  style={[styles.progressFill, { 
                    width: `${progressPercentage}%`,
                    backgroundColor: colors.primary.main
                  }]} 
                />
              </View>
              <Text variant="caption" color="secondary" style={styles.progressText}>
                {item.progress}/{item.totalRequired}
              </Text>
            </View>
          )}
        </View>
        
        <Ionicons name="chevron-forward" size={20} color={colors.neutral.main} />
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <View style={styles.header}>
        <Text variant="h3" color="primary">
          Achievements
        </Text>
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === 'all' ? 
              { backgroundColor: colors.primary.main } : 
              { backgroundColor: isDark ? colors.background.paper : colors.background.light }
          ]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text 
            variant="button" 
            color={selectedFilter === 'all' ? 'light' : 'secondary'}
          >
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === 'unlocked' ? 
              { backgroundColor: colors.primary.main } : 
              { backgroundColor: isDark ? colors.background.paper : colors.background.light }
          ]}
          onPress={() => setSelectedFilter('unlocked')}
        >
          <Text 
            variant="button" 
            color={selectedFilter === 'unlocked' ? 'light' : 'secondary'}
          >
            Unlocked
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedFilter === 'locked' ? 
              { backgroundColor: colors.primary.main } : 
              { backgroundColor: isDark ? colors.background.paper : colors.background.light }
          ]}
          onPress={() => setSelectedFilter('locked')}
        >
          <Text 
            variant="button" 
            color={selectedFilter === 'locked' ? 'light' : 'secondary'}
          >
            In Progress
          </Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text variant="body" color="secondary" style={styles.loadingText}>
            Loading achievements...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredAchievements}
          renderItem={renderAchievementItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.achievementsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="trophy-outline" size={60} color={colors.neutral.main} />
              <Text variant="subtitle" color="text" style={styles.emptyText}>
                No achievements found
              </Text>
              <Text variant="body2" color="secondary" style={styles.emptySubtext}>
                {selectedFilter === 'unlocked' 
                  ? "You haven't unlocked any achievements yet. Keep meditating!"
                  : selectedFilter === 'locked'
                    ? "You've unlocked all available achievements. Great job!"
                    : "No achievements available right now. Check back later!"}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  achievementsList: {
    padding: 16,
    paddingBottom: 80,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
    marginRight: 8,
  },
  description: {
    marginVertical: 4,
  },
  unlockedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unlockedText: {
    marginLeft: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    minWidth: 35,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 40,
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    textAlign: 'center',
  },
});

export default AchievementsListScreen;