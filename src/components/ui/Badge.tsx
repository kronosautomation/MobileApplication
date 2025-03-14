import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Text from './Text';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning';
type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeProps {
  value?: number | string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  outlined?: boolean;
  visible?: boolean;
  max?: number;
  style?: ViewStyle;
  showZero?: boolean;
  anchor?: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  value,
  variant = 'primary',
  size = 'medium',
  outlined = false,
  visible = true,
  max = 99,
  style,
  showZero = false,
  anchor,
}) => {
  const { currentTheme } = useTheme();
  const { colors, borderRadius } = currentTheme;

  if (!visible || (value === 0 && !showZero)) {
    return anchor ? <>{anchor}</> : null;
  }

  // Get color based on variant
  const getColor = () => {
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.secondary;
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'warning':
        return colors.warning;
      default:
        return colors.primary;
    }
  };

  // Get size based on size prop
  const getSize = (): number => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 24;
      case 'medium':
      default:
        return 20;
    }
  };

  // Format the badge value
  const formattedValue = () => {
    if (value === undefined || value === null) {
      return '';
    }

    if (typeof value === 'number') {
      return value > max ? `${max}+` : value.toString();
    }

    return value;
  };

  const badgeSize = getSize();
  const color = getColor();
  const badgeText = formattedValue();
  const isEmpty = badgeText === '';

  // Dot badge (no value)
  if (isEmpty) {
    return (
      <View style={[styles.badgeContainer, anchor && styles.absolute]}>
        {anchor}
        <View
          style={[
            styles.dot,
            {
              width: badgeSize / 2,
              height: badgeSize / 2,
              borderRadius: badgeSize / 4,
              backgroundColor: outlined ? colors.background.paper : color.main,
              borderWidth: outlined ? 1.5 : 0,
              borderColor: color.main,
            },
            anchor && styles.dotPosition,
            style,
          ]}
        />
      </View>
    );
  }

  // Badge with value
  return (
    <View style={[styles.badgeContainer, anchor && styles.absolute]}>
      {anchor}
      <View
        style={[
          styles.badge,
          {
            minWidth: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            backgroundColor: outlined ? colors.background.paper : color.main,
            borderWidth: outlined ? 1.5 : 0,
            borderColor: color.main,
            paddingHorizontal: badgeText.length > 1 ? 6 : 0,
          },
          anchor && styles.badgePosition,
          style,
        ]}
      >
        <Text
          variant="caption"
          color={outlined ? 'primary' : 'light'}
          align="center"
          style={styles.text}
        >
          {badgeText}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    position: 'relative',
  },
  absolute: {
    position: 'relative',
  },
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgePosition: {
    position: 'absolute',
    top: -8,
    right: -8,
    zIndex: 1,
  },
  dot: {
    position: 'absolute',
  },
  dotPosition: {
    position: 'absolute',
    top: -3,
    right: -3,
    zIndex: 1,
  },
  text: {
    fontSize: 10,
    lineHeight: 14,
  },
});

export default Badge;
