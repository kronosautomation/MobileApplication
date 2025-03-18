import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MeditationStackParamList } from '../../navigation/stacks/MeditationStack';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<MeditationStackParamList, 'MeditationPlayer'>;

const MeditationPlayerScreen = ({ route, navigation }: Props) => {
  const { id, title, duration } = route.params;
  
  // State for meditation timer
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  
  // Total duration in seconds
  const totalDuration = duration * 60;
  
  // Calculate progress percentage
  const progress = (currentTime / totalDuration) * 100;
  
  // Format time in MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Toggle play/pause
  const togglePlayPause = () => {
    if (isPlaying) {
      // Pause the timer
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    } else {
      // Start or resume the timer
      const id = setInterval(() => {
        setCurrentTime(prevTime => {
          if (prevTime >= totalDuration) {
            clearInterval(id);
            setIntervalId(null);
            setIsPlaying(false);
            // Navigate to completion screen
            navigation.navigate('MeditationCompleted', { sessionTime: totalDuration });
            return totalDuration;
          }
          return prevTime + 1;
        });
      }, 1000);
      setIntervalId(id);
    }
    setIsPlaying(!isPlaying);
  };
  
  // Reset timer
  const resetTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setCurrentTime(0);
    setIsPlaying(false);
  };
  
  // Clean up interval on component unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.closeButtonContainer}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <View style={styles.meditationImage}>
          <Ionicons name="leaf" size={60} color="#4A62FF" />
        </View>
        
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{duration} minute meditation</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progress}%` }
              ]} 
            />
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
            <Text style={styles.timeText}>{formatTime(totalDuration)}</Text>
          </View>
        </View>
        
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.controlButton} onPress={resetTimer}>
            <Ionicons name="refresh" size={24} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.playPauseButton} onPress={togglePlayPause}>
            <Ionicons 
              name={isPlaying ? "pause" : "play"} 
              size={36} 
              color="#FFF" 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => {
              resetTimer();
              navigation.navigate('MeditationCompleted', { sessionTime: currentTime });
            }}
          >
            <Ionicons name="flag" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  meditationImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#e8efff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 10,
    marginBottom: 40,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 40,
  },
  progressBackground: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A62FF',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  timeText: {
    fontSize: 16,
    color: '#666',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f1f1f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A62FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
});

export default MeditationPlayerScreen;