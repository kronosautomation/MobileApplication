import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ImageBackground } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Text, Badge } from '../ui';
import { Ionicons } from '@expo/vector-icons';
import { GuidedMeditation, DifficultyLevel } from '../../types';
import { LinearGradient } from 'expo-linear-gradient';
import { useSubscription } from '../../context/SubscriptionContext';

interface MeditationCardProps {
  meditation: GuidedMeditation;
  onPress: (meditation: GuidedMeditation) => void;
  style?: object;
  horizontal?: boolean;
}

const MeditationCard: React.FC<MeditationCardProps> = ({
  meditation,
  onPress,
  style,
  horizontal = false,
}) => {
  const { currentTheme } = useTheme();
  const { colors, spacing, borderRadius } = currentTheme;
  const { isPremium } = useSubscription();

  // Format duration from seconds to minutes
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Get difficulty level label
  const getDifficultyLabel = (level: DifficultyLevel): string => {
    switch (level) {
      case DifficultyLevel.Beginner:
        return 'Beginner';
      case DifficultyLevel.Intermediate:
        return 'Intermediate';
      case DifficultyLevel.Advanced:
        return 'Advanced';
      default:
        return 'Beginner';
    }
  };

  // Get difficulty color
  const getDifficultyColor = (level: DifficultyLevel) => {
    switch (level) {
      case DifficultyLevel.Beginner:
        return colors.success.main;
      case DifficultyLevel.Intermediate:
        return colors.primary.main;
      case DifficultyLevel.Advanced:
        return colors.warning.main;
      default:
        return colors.success.main;
    }
  };

  // Check if meditation is available or locked
  const isLocked = meditation.minimumSubscriptionTier > 0 && !isPremium;

  // Default placeholder image
  const placeholderImage = 'https://via.placeholder.com/300x200?text=Meditation';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        horizontal ? styles.horizontalContainer : styles.verticalContainer,
        { borderRadius: borderRadius.md },
        style,
      ]}
      onPress={() => onPress(meditation)}
      activeOpacity={0.8}
    >
      <ImageBackground
        source={{ uri: meditation.imageUrl || placeholderImage }}
        style={[
          horizontal ? styles.horizontalImage : styles.verticalImage,
          { borderRadius: borderRadius.md },
        ]}
        imageStyle={{ borderRadius: borderRadius.md }}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
          style={[
            styles.gradient,
            { borderRadius: borderRadius.md },
          ]}
        >
          {/* Info overlay */}
          <View style={styles.infoContainer}>
            {/* Top row with duration and difficulty */}
            <View style={styles.topRow}>
              <View style={styles.badge}>
                <Text variant="caption" color="light">
                  {formatDuration(meditation.durationInSeconds)}
                </Text>
              </View>
              
              <View
                style={[
                  styles.badge,
                  { backgroundColor: getDifficultyColor(meditation.difficultyLevel) },
                ]}
              >
                <Text variant="caption" color="light">
                  {getDifficultyLabel(meditation.difficultyLevel)}
                </Text>
              </View>
            </View>

            {/* Bottom content */}
            <View style={styles.bottomContent}>
              <Text variant="h4" color="light" numberOfLines={2}>
                {meditation.title}
              </Text>
              
              <Text variant="body2" color="light" numberOfLines={horizontal ? 2 : 1} style={styles.narrator}>
                by {meditation.narrator}
              </Text>
              
              {/* Tags */}
              {meditation.tags && meditation.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {meditation.tags.slice(0, 2).map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text variant="caption" color="light">
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
        
        {/* Downloaded indicator */}
        {meditation.isDownloaded && (
          <View style={styles.downloadedBadge}>
            <Ionicons name="arrow-down-circle" size={20} color={colors.primary.light} />
          </View>
        )}
        
        {/* Lock icon for premium content */}
        {isLocked && (
          <View style={styles.lockContainer}>
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={18} color={colors.text.light} />
              <Text variant="caption" color="light" style={styles.premiumText}>
                PREMIUM
              </Text>
            </View>
          </View>
        )}
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    marginBottom: 12,
  },
  verticalContainer: {
    width: '100%',
    height: 200,
  },
  horizontalContainer: {
    width: 280,
    height: 160,
    marginRight: 12,
  },
  verticalImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  horizontalImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bottomContent: {
    marginTop: 'auto',
  },
  narrator: {
    marginTop: 4,
    opacity: 0.8,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  downloadedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  lockBadge: {
    backgroundColor: 'rgba(74, 98, 255, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumText: {
    marginLeft: 6,
    fontWeight: 'bold',
  },
});

export default MeditationCard;
