// Import renamed component to match the updated hook interface
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useNetworkStatus } from '../../hooks';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

/**
 * Component that shows a banner when the device is offline
 */
const OfflineNotice: React.FC = () => {
  const { isConnected } = useNetworkStatus();
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;

  if (isConnected) {
    return null;
  }

  return (
    <View 
      style={[styles.offlineContainer, { backgroundColor: colors.error.main }]}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel="You are offline. Some features may be unavailable."
    >
      <Ionicons name="cloud-offline" size={18} color={colors.error.contrast} />
      <Text style={[styles.offlineText, { color: colors.error.contrast }]}>
        You are currently offline
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  offlineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    height: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width,
    paddingHorizontal: 20,
    paddingTop: 3, // Additional padding for status bar
  },
  offlineText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
});

export default OfflineNotice;
