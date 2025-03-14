import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  ...props
}) => {
  const { currentTheme, isDark } = useTheme();
  const { colors, spacing, borderRadius, typography } = currentTheme;

  // Get styles based on variant
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.primary.main,
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: colors.secondary.main,
          borderWidth: 0,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.primary.main,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        };
      default:
        return {
          backgroundColor: colors.primary.main,
          borderWidth: 0,
        };
    }
  };

  // Get text color based on variant
  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
        return colors.primary.contrast;
      case 'secondary':
        return colors.secondary.contrast;
      case 'outline':
      case 'text':
        return colors.primary.main;
      default:
        return colors.primary.contrast;
    }
  };

  // Get size styling
  const getSizeStyle = (): { 
    container: ViewStyle;
    text: TextStyle;
  } => {
    switch (size) {
      case 'small':
        return {
          container: {
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.sm,
            borderRadius: borderRadius.sm,
          },
          text: {
            fontSize: typography.fontSize.sm,
          },
        };
      case 'large':
        return {
          container: {
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            borderRadius: borderRadius.md,
          },
          text: {
            fontSize: typography.fontSize.lg,
          },
        };
      case 'medium':
      default:
        return {
          container: {
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
            borderRadius: borderRadius.md,
          },
          text: {
            fontSize: typography.fontSize.md,
          },
        };
    }
  };

  const sizeStyle = getSizeStyle();
  const variantStyle = getVariantStyle();
  const textColor = getTextColor();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variantStyle,
        sizeStyle.container,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'text' ? colors.primary.main : colors.primary.contrast}
        />
      ) : (
        <Text
          style={[
            styles.text,
            sizeStyle.text,
            { color: textColor },
            (disabled || loading) && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.8,
  },
});

export default Button;
