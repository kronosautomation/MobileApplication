import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Text, Card } from '../ui';
import { Ionicons } from '@expo/vector-icons';
import { Achievement } from '../../types';
import LottieView from 'lottie-react-native';

interface AchievementCardProps {
  achievement: Achievement;
  onPress?: (achievement: Achievement) => void;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ 
  achievement, 
  onPress 
}) => {
  const { currentTheme } = useTheme();
  const { colors, spacing, borderRadius } = currentTheme;
  
  // Determine if achievement is unlocked
  const isUnlocked = achievement.isUnlocked;
  
  // Calculate progress percentage
  const progressPercentage = Math.min(
    Math.round((achievement.progress / achievement.totalRequired) * 100),
    100
  );
  
  // Get icon color based on unlock status
  const getIconColor = () => {
    if (isUnlocked) {
      return colors.primary.main;
    }
    return colors.neutral.light;
  };
  
  // Get achievement date text
  const getDateText = () => {
    if (isUnlocked && achievement.unlockedAt) {
      const date = new Date(achievement.unlockedAt);
      return `Unlocked on ${date.toLocaleDateString()}`;
    }
    return `${achievement.progress} / ${achievement.totalRequired}`;
  };
  
  // Handle press event
  const handlePress = () => {
    if (onPress) {
      onPress(achievement);
    }
  };
  
  return (
    <Card 
      style={styles.container}
      onPress={onPress ? handlePress : undefined}
      elevation={isUnlocked ? 'md' : 'sm'}
    >
      <View style={styles.content}>
        {/* Achievement Icon */}
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isUnlocked
                ? colors.primary.light
                : colors.neutral.lightest,
              borderColor: isUnlocked
                ? colors.primary.main
                : colors.neutral.lighter,
            },
          ]}
        >
          {isUnlocked ? (
            achievement.iconUrl ? (
              <Image
                source={{ uri: achievement.iconUrl }}
                style={styles.icon}
                resizeMode="contain"
              />
            ) : (
              <LottieView
                source={require('../../../assets/animations/achievement.json')}
                autoPlay
                loop={false}
                style={styles.animation}
              />
            )
          ) : (
            <Ionicons
              name="trophy-outline"
              size={32}
              color={colors.neutral.light}
            />
          )}
        </View>
        
        {/* Achievement Details */}
        <View style={styles.details}>
          <Text
            variant="h4"
            color={isUnlocked ? 'primary' : 'secondary'}
            style={styles.title}
          >
            {achievement.title}
          </Text>
          
          <Text
            variant="body2"
            color="secondary"
            numberOfLines={2}
            style={styles.description}
          >
            {achievement.description}
          </Text>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  backgroundColor: colors.neutral.lightest,
                },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progressPercentage}%`,
                    backgroundColor: isUnlocked
                      ? colors.primary.main
                      : colors.neutral.light,
                  },
                ]}
              />
            </View>
            
            <Text variant="caption" color="secondary" style={styles.progressText}>
              {getDateText()}
            </Text>
          </View>
        </View>
        
        {/* Unlock Indicator */}
        {isUnlocked && (
          <View style={styles.unlockedBadge}>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={colors.success.main}
            />
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginRight: 12,
  },
  icon: {
    width: 36,
    height: 36,
  },
  animation: {
    width: 60,
    height: 60,
  },
  details: {
    flex: 1,
  },
  title: {
    marginBottom: 4,
  },
  description: {
    marginBottom: 8,
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    textAlign: 'right',
  },
  unlockedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
});

export default AchievementCard;
