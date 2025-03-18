import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  showIcon?: boolean;
  variant?: 'full' | 'inline' | 'toast';
}

/**
 * Standardized error display component with retry capability
 */
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  showIcon = true,
  variant = 'full'
}) => {
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;

  if (variant === 'inline') {
    return (
      <View 
        style={[styles.inlineContainer, { borderColor: colors.error.main }]}
        accessible={true}
        accessibilityRole="alert"
        accessibilityLabel={`Error: ${error}`}
      >
        {showIcon && (
          <Ionicons 
            name="alert-circle-outline" 
            size={20} 
            color={colors.error.main}
            style={styles.inlineIcon} 
          />
        )}
        <Text style={[styles.inlineText, { color: colors.error.main }]}>
          {error}
        </Text>
        {onRetry && (
          <TouchableOpacity 
            onPress={onRetry}
            style={styles.inlineRetryButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Retry"
            accessibilityHint="Attempts to resolve the error by retrying"
          >
            <Text style={[styles.inlineRetryText, { color: colors.primary.main }]}>
              Retry
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (variant === 'toast') {
    return (
      <View 
        style={[styles.toastContainer, { backgroundColor: colors.error.main }]}
        accessible={true}
        accessibilityRole="alert"
        accessibilityLabel={`Error: ${error}`}
      >
        {showIcon && (
          <Ionicons 
            name="alert-circle" 
            size={20} 
            color={colors.error.contrast}
            style={styles.toastIcon} 
          />
        )}
        <Text style={[styles.toastText, { color: colors.error.contrast }]}>
          {error}
        </Text>
      </View>
    );
  }

  // Default full screen error display
  return (
    <View 
      style={[styles.container, { backgroundColor: colors.background.default }]}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel={`Error: ${error}`}
    >
      {showIcon && (
        <Ionicons 
          name="alert-circle-outline" 
          size={48} 
          color={colors.error.main} 
        />
      )}
      <Text style={[styles.errorText, { color: colors.text.primary }]}>
        {error}
      </Text>
      {onRetry && (
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.primary.main }]}
          onPress={onRetry}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Retry"
          accessibilityHint="Attempts to resolve the error by retrying"
        >
          <Text style={[styles.retryButtonText, { color: colors.primary.contrast }]}>
            Try Again
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
  },
  inlineIcon: {
    marginRight: 8,
  },
  inlineText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  inlineRetryButton: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  inlineRetryText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  toastIcon: {
    marginRight: 8,
  },
  toastText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
});

export default ErrorDisplay;
