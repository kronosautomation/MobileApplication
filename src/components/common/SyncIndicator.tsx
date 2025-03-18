import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { syncService } from '../../services/storage';
import { useNetworkStatus } from '../../hooks';

/**
 * Component to display synchronization status
 */
const SyncIndicator: React.FC = () => {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;
  const { isConnected } = useNetworkStatus();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNeeded, setSyncNeeded] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  
  // Animation for the loading icon
  const spinValue = new Animated.Value(0);
  
  // Set up rotation animation
  useEffect(() => {
    if (isSyncing) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.setValue(0);
    }
    
    return () => {
      spinValue.setValue(0);
    };
  }, [isSyncing]);
  
  // Check sync status periodically
  useEffect(() => {
    let isMounted = true;
    
    const checkSyncStatus = async () => {
      try {
        if (isMounted) {
          const needsSync = await syncService.isSyncNeeded();
          setSyncNeeded(needsSync);
          
          // Update last sync time
          const timestamp = syncService.getLastSyncTimestamp();
          if (timestamp > 0) {
            setLastSyncTime(timestamp);
          }
        }
      } catch (error) {
        console.error('Error checking sync status:', error);
      }
    };
    
    const intervalId = setInterval(checkSyncStatus, 10000); // Check every 10 seconds
    checkSyncStatus(); // Initial check
    
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);
  
  // Trigger sync when online and needed
  useEffect(() => {
    let isMounted = true;
    
    const performSync = async () => {
      // Only sync if online and sync is needed
      if (isConnected && syncNeeded && !isSyncing) {
        setIsSyncing(true);
        
        try {
          await syncService.processSyncQueue();
          if (isMounted) {
            setSyncNeeded(false);
            
            // Update last sync time
            const timestamp = syncService.getLastSyncTimestamp();
            if (timestamp > 0) {
              setLastSyncTime(timestamp);
            }
          }
        } catch (error) {
          console.error('Error processing sync queue:', error);
        } finally {
          if (isMounted) {
            setIsSyncing(false);
          }
        }
      }
    };
    
    performSync();
    
    return () => {
      isMounted = false;
    };
  }, [isConnected, syncNeeded, isSyncing]);
  
  // Format last sync time
  const formatLastSync = (): string => {
    if (!lastSyncTime) {
      return 'Never synced';
    }
    
    const now = Date.now();
    const diffMs = now - lastSyncTime;
    
    // Convert to minutes
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else {
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      } else {
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      }
    }
  };
  
  // If nothing to show, return null
  if (!isSyncing && !syncNeeded && !lastSyncTime) {
    return null;
  }
  
  // Create spin animation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  return (
    <View 
      style={[styles.container, { backgroundColor: colors.background.paper }]}
      accessible={true}
      accessibilityRole="status"
      accessibilityLabel={isSyncing ? 'Syncing data' : syncNeeded ? 'Sync needed' : `Last synced ${formatLastSync()}`}
    >
      {isSyncing ? (
        <>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons name="sync" size={16} color={colors.primary.main} />
          </Animated.View>
          <Text style={[styles.text, { color: colors.text.secondary }]}>
            Syncing...
          </Text>
        </>
      ) : syncNeeded ? (
        <>
          <Ionicons name="cloud-offline" size={16} color={colors.warning.main} />
          <Text style={[styles.text, { color: colors.text.secondary }]}>
            Sync pending
          </Text>
        </>
      ) : (
        <>
          <Ionicons name="checkmark-circle" size={16} color={colors.success.main} />
          <Text style={[styles.text, { color: colors.text.secondary }]}>
            Last sync: {formatLastSync()}
          </Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    position: 'absolute',
    bottom: 16,
    left: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  text: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginLeft: 6,
  },
});

export default SyncIndicator;
