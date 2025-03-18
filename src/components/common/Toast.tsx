import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  TouchableOpacity,
  AccessibilityInfo 
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  visible: boolean;
  onDismiss?: () => void;
  autoHideDuration?: number;
}

/**
 * Toast notification component for user feedback
 */
const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  visible,
  onDismiss,
  autoHideDuration = 3000,
}) => {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;
  const translateY = useRef(new Animated.Value(-100)).current;

  // Get icon and colors based on toast type
  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: colors.success.main,
          textColor: colors.success.contrast,
          icon: 'checkmark-circle',
        };
      case 'error':
        return {
          backgroundColor: colors.error.main,
          textColor: colors.error.contrast,
          icon: 'alert-circle',
        };
      case 'warning':
        return {
          backgroundColor: colors.warning.main,
          textColor: colors.warning.contrast,
          icon: 'warning',
        };
      case 'info':
      default:
        return {
          backgroundColor: colors.info.main,
          textColor: colors.info.contrast,
          icon: 'information-circle',
        };
    }
  };

  const config = getToastConfig();

  // Animate toast in/out
  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        speed: 12,
        bounciness: 5,
      }).start();

      // Announce toast message for screen readers
      AccessibilityInfo.announceForAccessibility(message);

      // Auto-hide if duration is provided
      if (autoHideDuration && onDismiss) {
        const timer = setTimeout(() => {
          handleDismiss();
        }, autoHideDuration);
        return () => clearTimeout(timer);
      }
    } else {
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, autoHideDuration, message]);

  const handleDismiss = () => {
    Animated.timing(translateY, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (onDismiss) onDismiss();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { 
          backgroundColor: config.backgroundColor,
          transform: [{ translateY }],
        },
      ]}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <View style={styles.content}>
        <Ionicons name={config.icon as any} size={24} color={config.textColor} style={styles.icon} />
        <Text style={[styles.message, { color: config.textColor }]} numberOfLines={2}>
          {message}
        </Text>
        {onDismiss && (
          <TouchableOpacity 
            onPress={handleDismiss}
            accessibilityRole="button"
            accessibilityLabel="Dismiss notification"
          >
            <Ionicons name="close" size={20} color={config.textColor} />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    elevation: 5,
    zIndex: 1000,
    paddingTop: 45, // For status bar
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  icon: {
    marginRight: 8,
  },
  message: {
    flex: 1,
    fontFamily: 'Inter-Medium',
    fontSize: 14,
  },
});

export default Toast;
