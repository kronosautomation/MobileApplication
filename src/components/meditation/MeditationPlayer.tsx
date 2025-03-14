import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Text, Button } from '../ui';
import { Ionicons } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus } from 'expo-av';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { GuidedMeditation } from '../../types';

interface MeditationPlayerProps {
  meditation: GuidedMeditation;
  onComplete: () => void;
  onBack: () => void;
  onSubmitAnxietyRating?: (rating: number) => void;
  initialAnxietyRating?: number;
}

const MeditationPlayer: React.FC<MeditationPlayerProps> = ({
  meditation,
  onComplete,
  onBack,
  onSubmitAnxietyRating,
  initialAnxietyRating,
}) => {
  const { currentTheme } = useTheme();
  const { colors, spacing } = currentTheme;
  
  // Audio player hooks
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [position, setPosition] = useState<number>(0);
  const [duration, setDuration] = useState<number>(meditation.durationInSeconds);
  const [didJustFinish, setDidJustFinish] = useState<boolean>(false);
  const [anxietyRating, setAnxietyRating] = useState<number>(initialAnxietyRating || 0);
  const [showAnxietyRating, setShowAnxietyRating] = useState<boolean>(false);
  
  // Interval for updating position
  const positionUpdateInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Default image if none provided
  const backgroundImage = meditation.imageUrl || 'https://via.placeholder.com/600x800?text=Meditation';

  // Initialize audio player
  useEffect(() => {
    const setupAudio = async () => {
      try {
        // Set audio mode
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        
        // Load the sound
        setIsLoading(true);
        
        // Use streaming URL or local audio path if downloaded
        const source = meditation.localAudioPath
          ? { uri: meditation.localAudioPath }
          : { uri: meditation.streamingUrl || meditation.audioUrl };
          
        const { sound: newSound } = await Audio.Sound.createAsync(
          source,
          { shouldPlay: false },
          onPlaybackStatusUpdate
        );
        
        setSound(newSound);
        setIsLoading(false);
      } catch (error) {
        console.error('Error setting up audio:', error);
        setIsLoading(false);
      }
    };
    
    setupAudio();
    
    // Cleanup
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (positionUpdateInterval.current) {
        clearInterval(positionUpdateInterval.current);
      }
    };
  }, [meditation]);

  // Handle playback status updates
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    
    // Update duration if we have it
    if (status.durationMillis) {
      setDuration(status.durationMillis / 1000);
    }
    
    // Update position if the sound is playing
    if (status.isPlaying) {
      setPosition(status.positionMillis / 1000);
    }
    
    // Check if the sound just finished playing
    if (status.didJustFinish && !didJustFinish) {
      setDidJustFinish(true);
      setIsPlaying(false);
      
      // Show anxiety rating after meditation completes
      if (onSubmitAnxietyRating) {
        setShowAnxietyRating(true);
      } else {
        onComplete();
      }
    }
  };

  // Toggle play/pause
  const togglePlayPause = async () => {
    if (!sound) return;
    
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
    
    setIsPlaying(!isPlaying);
  };

  // Seek to a specific position
  const seekTo = async (value: number) => {
    if (!sound) return;
    
    await sound.setPositionAsync(value * 1000);
    setPosition(value);
  };

  // Forward 15 seconds
  const forward15 = async () => {
    if (!sound) return;
    
    const newPosition = Math.min(position + 15, duration);
    await sound.setPositionAsync(newPosition * 1000);
    setPosition(newPosition);
  };

  // Rewind 15 seconds
  const rewind15 = async () => {
    if (!sound) return;
    
    const newPosition = Math.max(position - 15, 0);
    await sound.setPositionAsync(newPosition * 1000);
    setPosition(newPosition);
  };

  // Format time string from seconds
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Submit anxiety rating
  const submitAnxietyRating = () => {
    if (onSubmitAnxietyRating) {
      onSubmitAnxietyRating(anxietyRating);
    }
    onComplete();
  };

  return (
    <ImageBackground 
      source={{ uri: backgroundImage }} 
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)']}
        style={styles.overlay}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Ionicons name="chevron-down" size={28} color={colors.text.light} />
            </TouchableOpacity>
            
            <Text variant="caption" color="light">
              GUIDED MEDITATION
            </Text>
          </View>
          
          {/* Content */}
          <View style={styles.content}>
            <Text variant="h2" color="light" style={styles.title}>
              {meditation.title}
            </Text>
            
            <Text variant="body2" color="light" style={styles.narrator}>
              by {meditation.narrator}
            </Text>
            
            {showAnxietyRating ? (
              // Anxiety rating view
              <View style={styles.anxietyRatingContainer}>
                <Text variant="h3" color="light" style={styles.anxietyTitle}>
                  How do you feel now?
                </Text>
                
                <Text variant="body" color="light" style={styles.anxietySubtitle}>
                  Rate your anxiety level after meditation
                </Text>
                
                <View style={styles.anxietySliderContainer}>
                  <Text variant="body2" color="light">Low</Text>
                  <Slider
                    style={styles.anxietySlider}
                    minimumValue={0}
                    maximumValue={10}
                    step={1}
                    value={anxietyRating}
                    onValueChange={setAnxietyRating}
                    minimumTrackTintColor={colors.primary.light}
                    maximumTrackTintColor={colors.neutral.light}
                    thumbTintColor={colors.primary.main}
                  />
                  <Text variant="body2" color="light">High</Text>
                </View>
                
                <Text variant="h2" color="light" style={styles.anxietyValue}>
                  {anxietyRating}
                </Text>
                
                <Button
                  title="Submit & Complete"
                  onPress={submitAnxietyRating}
                  style={styles.submitButton}
                />
              </View>
            ) : (
              // Player controls
              <View style={styles.playerContainer}>
                {/* Timer and progress */}
                <View style={styles.progressContainer}>
                  <Text variant="body2" color="light">{formatTime(position)}</Text>
                  <Slider
                    style={styles.progressSlider}
                    minimumValue={0}
                    maximumValue={duration}
                    value={position}
                    onSlidingComplete={seekTo}
                    minimumTrackTintColor={colors.primary.light}
                    maximumTrackTintColor={colors.neutral.light}
                    thumbTintColor={colors.primary.main}
                  />
                  <Text variant="body2" color="light">{formatTime(duration)}</Text>
                </View>
                
                {/* Playback controls */}
                <View style={styles.controlsContainer}>
                  <TouchableOpacity onPress={rewind15} style={styles.controlButton}>
                    <Ionicons name="play-back" size={24} color={colors.text.light} />
                    <Text variant="caption" color="light" style={styles.controlText}>
                      15s
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
                    {isLoading ? (
                      <ActivityIndicator color={colors.primary.contrast} size="large" />
                    ) : (
                      <Ionicons
                        name={isPlaying ? 'pause' : 'play'}
                        size={36}
                        color={colors.primary.contrast}
                      />
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={forward15} style={styles.controlButton}>
                    <Ionicons name="play-forward" size={24} color={colors.text.light} />
                    <Text variant="caption" color="light" style={styles.controlText}>
                      15s
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </ImageBackground>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    paddingHorizontal: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  narrator: {
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 60,
  },
  playerContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  progressSlider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  controlButton: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  controlText: {
    marginTop: 4,
  },
  playButton: {
    backgroundColor: 'rgba(74, 98, 255, 0.8)',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 30,
  },
  anxietyRatingContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  anxietyTitle: {
    textAlign: 'center',
    marginBottom: 12,
  },
  anxietySubtitle: {
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 40,
  },
  anxietySliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  anxietySlider: {
    flex: 1,
    height: 40,
    marginHorizontal: 16,
  },
  anxietyValue: {
    fontSize: 48,
    marginBottom: 40,
  },
  submitButton: {
    minWidth: width * 0.6,
  },
});

export default MeditationPlayer;
