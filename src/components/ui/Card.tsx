import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  elevation = 'sm',
  borderRadius = 'md',
  padding = 'md',
}) => {
  const { currentTheme } = useTheme();
  const { colors, shadows, spacing } = currentTheme;

  // Get shadow based on elevation
  const getElevationStyle = (): ViewStyle => {
    switch (elevation) {
      case 'none':
        return {};
      case 'sm':
        return shadows.sm;
      case 'md':
        return shadows.md;
      case 'lg':
        return shadows.lg;
      default:
        return shadows.sm;
    }
  };

  // Get border radius based on size
  const getBorderRadiusStyle = (): ViewStyle => {
    switch (borderRadius) {
      case 'none':
        return { borderRadius: 0 };
      case 'sm':
        return { borderRadius: currentTheme.borderRadius.sm };
      case 'md':
        return { borderRadius: currentTheme.borderRadius.md };
      case 'lg':
        return { borderRadius: currentTheme.borderRadius.lg };
      default:
        return { borderRadius: currentTheme.borderRadius.md };
    }
  };

  // Get padding based on size
  const getPaddingStyle = (): ViewStyle => {
    switch (padding) {
      case 'none':
        return { padding: 0 };
      case 'sm':
        return { padding: spacing.sm };
      case 'md':
        return { padding: spacing.md };
      case 'lg':
        return { padding: spacing.lg };
      default:
        return { padding: spacing.md };
    }
  };

  const cardStyles = [
    styles.card,
    { backgroundColor: colors.background.paper },
    getElevationStyle(),
    getBorderRadiusStyle(),
    getPaddingStyle(),
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyles} onPress={onPress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};

interface CardTitleProps {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, style }) => {
  return <View style={[styles.cardTitle, style]}>{children}</View>;
};

interface CardContentProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const CardContent: React.FC<CardContentProps> = ({ children, style }) => {
  return <View style={[styles.cardContent, style]}>{children}</View>;
};

interface CardFooterProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, style }) => {
  return <View style={[styles.cardFooter, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardTitle: {
    marginBottom: 8,
  },
  cardContent: {
    marginVertical: 4,
  },
  cardFooter: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

export default Card;
