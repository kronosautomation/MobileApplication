import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { Text, Card, CardContent, CardTitle, Badge } from '../../components/ui';
import { Ionicons } from '@expo/vector-icons';
import { GuidedMeditation, Achievement } from '../../types';
import { meditationService, achievementsService } from '../../api';
import MeditationCard from '../../components/meditation/MeditationCard';
import AchievementCard from '../../components/achievements/AchievementCard';
import LottieView from 'lottie-react-native';

// Get today's date in readable format
const getTodayDate = () => {
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  return new Date().toLocaleDateString('en-US', options);
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { currentTheme, isDark } = useTheme();
  const { colors, spacing } = currentTheme;
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const { width } = useWindowDimensions();
  
  // State variables
  const [featuredMeditations, setFeaturedMeditations] = useState<GuidedMeditation[]>([]);
  const [recentMeditations, setRecentMeditations] = useState<GuidedMeditation[]>([]);
  const [recommendedMeditations, setRecommendedMeditations] = useState<GuidedMeditation[]>([]);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [meditationToday, setMeditationToday] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);
  
  // Function to fetch all required data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch featured meditations
      const featured = await meditationService.getFeaturedMeditations(5);
      setFeaturedMeditations(featured);
      
      // Fetch recent meditation sessions (simplified for demo)
      // In a real app, this would come from the user's history
      const allMeditations = await meditationService.getMeditations(1, 5);
      setRecentMeditations(allMeditations.meditations.slice(0, 2));
      
      // Set recommended meditations based on user preferences (simplified for demo)
      // In a real app, this would be personalized based on user data
      setRecommendedMeditations(allMeditations.meditations.slice(2, 5));
      
      // Check if user meditated today
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const sessions = await meditationService.getMeditationHistory(startOfDay);
      setMeditationToday(sessions.length > 0);
      
      // Fetch user's streak information
      const streakInfo = await achievementsService.getStreakInfo();
      setCurrentStreak(streakInfo.currentStreak);
      
      // Fetch newly unlocked achievements
      const achievements = await achievementsService.getNewlyUnlockedAchievements();
      setNewAchievements(achievements);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching home data:', error);
      setIsLoading(false);
    }
  };
  
  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };
  
  // Handle meditation card press
  const handleMeditationPress = (meditation: GuidedMeditation) => {
    navigation.navigate('Meditations', {
      screen: 'MeditationDetail',
      params: { meditationId: meditation.id }
    });
  };
  
  // Handle achievement card press
  const handleAchievementPress = (achievement: Achievement) => {
    navigation.navigate('Achievements', {
      screen: 'AchievementDetail',
      params: { achievementId: achievement.id }
    });
  };
  
  // Handle "See All" press for categories
  const handleSeeAllPress = (category: string) => {
    switch (category) {
      case 'meditations':
        navigation.navigate('Meditations');
        break;
      case 'achievements':
        navigation.navigate('Achievements');
        break;
      default:
        break;
    }
  };
  
  // Calculate greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text variant="h4">
            {getGreeting()}, {user?.firstName || 'there'}!
          </Text>
          <Text variant="body2" color="secondary">
            {getTodayDate()}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.profileButton, { backgroundColor: colors.background.paper }]}
          onPress={() => navigation.navigate('Profile')}
        >
          {user?.profileImageUrl ? (
            <Image
              source={{ uri: user.profileImageUrl }}
              style={styles.profileImage}
            />
          ) : (
            <Ionicons name="person" size={24} color={colors.primary.main} />
          )}
        </TouchableOpacity>
      </View>
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary.main]}
            tintColor={colors.primary.main}
          />
        }
      >
        {/* Daily Progress Card */}
        <Card style={styles.streakCard}>
          <View style={styles.streakContent}>
            <View style={styles.streakInfo}>
              <Text variant="h3">Your Daily Progress</Text>
              
              <View style={styles.streakRow}>
                <Ionicons
                  name="flame"
                  size={24}
                  color={currentStreak > 0 ? colors.warning.main : colors.text.disabled}
                />
                <Text variant="h4" style={styles.streakText}>
                  {currentStreak} day{currentStreak !== 1 ? 's' : ''} streak
                </Text>
              </View>
              
              <View style={styles.meditationStatus}>
                <Ionicons
                  name={meditationToday ? "checkmark-circle" : "timer-outline"}
                  size={20}
                  color={meditationToday ? colors.success.main : colors.text.secondary}
                />
                <Text variant="body" color={meditationToday ? 'success' : 'secondary'} style={styles.statusText}>
                  {meditationToday ? 'Meditation completed today' : 'No meditation yet today'}
                </Text>
              </View>
              
              <TouchableOpacity
                style={[styles.meditateButton, { backgroundColor: colors.primary.main }]}
                onPress={() => navigation.navigate('Meditations')}
              >
                <Text variant="button" color="light">
                  Meditate Now
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.streakAnimation}>
              <LottieView
                source={require('../../../assets/animations/meditation.json')}
                autoPlay
                loop
                style={styles.animation}
              />
            </View>
          </View>
        </Card>
        
        {/* New Achievements Section */}
        {newAchievements.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="h3">New Achievements</Text>
              <TouchableOpacity onPress={() => handleSeeAllPress('achievements')}>
                <Text variant="body2" color="primary">
                  See All
                </Text>
              </TouchableOpacity>
            </View>
            
            {newAchievements.map(achievement => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                onPress={handleAchievementPress}
              />
            ))}
          </View>
        )}
        
        {/* Featured Meditations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="h3">Featured Meditations</Text>
            <TouchableOpacity onPress={() => handleSeeAllPress('meditations')}>
              <Text variant="body2" color="primary">
                See All
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {featuredMeditations.map(meditation => (
              <MeditationCard
                key={meditation.id}
                meditation={meditation}
                onPress={handleMeditationPress}
                horizontal
              />
            ))}
          </ScrollView>
        </View>
        
        {/* Continue Your Practice */}
        {recentMeditations.length > 0 && (
          <View style={styles.section}>
            <Text variant="h3" style={styles.sectionTitle}>
              Continue Your Practice
            </Text>
            
            {recentMeditations.map(meditation => (
              <MeditationCard
                key={meditation.id}
                meditation={meditation}
                onPress={handleMeditationPress}
              />
            ))}
          </View>
        )}
        
        {/* Recommended For You */}
        <View style={styles.section}>
          <Text variant="h3" style={styles.sectionTitle}>
            Recommended For You
          </Text>
          
          {recommendedMeditations.map(meditation => (
            <MeditationCard
              key={meditation.id}
              meditation={meditation}
              onPress={handleMeditationPress}
            />
          ))}
        </View>
        
        {/* Premium Upgrade Card (show only for free users) */}
        {!isPremium && (
          <Card style={styles.premiumCard}>
            <CardContent>
              <View style={styles.premiumContent}>
                <View style={styles.premiumInfo}>
                  <CardTitle>
                    <Text variant="h3">Upgrade to Premium</Text>
                  </CardTitle>
                  
                  <Text variant="body" style={styles.premiumText}>
                    Unlock all meditations, advanced analytics, and more to help you on your journey.
                  </Text>
                  
                  <TouchableOpacity
                    style={[styles.upgradeButton, { backgroundColor: colors.primary.main }]}
                    onPress={() => navigation.navigate('Profile', { screen: 'Subscription' })}
                  >
                    <Text variant="button" color="light">
                      Upgrade Now
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <Ionicons name="diamond" size={60} color={colors.primary.main} />
              </View>
            </CardContent>
          </Card>
        )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  streakCard: {
    marginBottom: 24,
  },
  streakContent: {
    flexDirection: 'row',
  },
  streakInfo: {
    flex: 1,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  streakText: {
    marginLeft: 8,
  },
  meditationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusText: {
    marginLeft: 8,
  },
  meditateButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  streakAnimation: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 100,
    height: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  horizontalScroll: {
    paddingRight: 20,
  },
  premiumCard: {
    marginBottom: 40,
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumInfo: {
    flex: 1,
    marginRight: 16,
  },
  premiumText: {
    marginVertical: 8,
  },
  upgradeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-start',
  },
});

export default HomeScreen;
