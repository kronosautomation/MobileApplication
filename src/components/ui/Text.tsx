import React from 'react';
import { Text as RNText, StyleSheet, TextStyle, TextProps as RNTextProps } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export type TextVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4' 
  | 'body' 
  | 'body2' 
  | 'caption' 
  | 'button' 
  | 'overline';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: 'primary' | 'secondary' | 'hint' | 'disabled' | 'light' | 'error' | 'success' | 'warning';
  weight?: 'regular' | 'medium' | 'semiBold' | 'bold';
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  style?: TextStyle;
}

const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = 'primary',
  weight = 'regular',
  align = 'left',
  style,
  children,
  ...props
}) => {
  const { currentTheme } = useTheme();
  const { colors, typography } = currentTheme;

  // Get font family based on weight
  const getFontFamily = (): string => {
    switch (weight) {
      case 'regular':
        return typography.fontFamily.regular;
      case 'medium':
        return typography.fontFamily.medium;
      case 'semiBold':
        return typography.fontFamily.semiBold;
      case 'bold':
        return typography.fontFamily.bold;
      default:
        return typography.fontFamily.regular;
    }
  };

  // Get text color
  const getTextColor = (): string => {
    switch (color) {
      case 'primary':
        return colors.text.primary;
      case 'secondary':
        return colors.text.secondary;
      case 'hint':
        return colors.text.hint;
      case 'disabled':
        return colors.text.disabled;
      case 'light':
        return colors.text.light;
      case 'error':
        return colors.error.main;
      case 'success':
        return colors.success.main;
      case 'warning':
        return colors.warning.main;
      default:
        return colors.text.primary;
    }
  };

  // Get variant style
  const getVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'h1':
        return {
          fontSize: typography.fontSize.xxxl,
          lineHeight: typography.lineHeight.xxxl,
          fontFamily: typography.fontFamily.bold,
        };
      case 'h2':
        return {
          fontSize: typography.fontSize.xxl,
          lineHeight: typography.lineHeight.xxl,
          fontFamily: typography.fontFamily.bold,
        };
      case 'h3':
        return {
          fontSize: typography.fontSize.xl,
          lineHeight: typography.lineHeight.xl,
          fontFamily: typography.fontFamily.semiBold,
        };
      case 'h4':
        return {
          fontSize: typography.fontSize.lg,
          lineHeight: typography.lineHeight.lg,
          fontFamily: typography.fontFamily.semiBold,
        };
      case 'body':
        return {
          fontSize: typography.fontSize.md,
          lineHeight: typography.lineHeight.md,
          fontFamily: typography.fontFamily.regular,
        };
      case 'body2':
        return {
          fontSize: typography.fontSize.sm,
          lineHeight: typography.lineHeight.sm,
          fontFamily: typography.fontFamily.regular,
        };
      case 'caption':
        return {
          fontSize: typography.fontSize.xs,
          lineHeight: typography.lineHeight.xs,
          fontFamily: typography.fontFamily.regular,
        };
      case 'button':
        return {
          fontSize: typography.fontSize.md,
          lineHeight: typography.lineHeight.md,
          fontFamily: typography.fontFamily.semiBold,
        };
      case 'overline':
        return {
          fontSize: typography.fontSize.xs,
          lineHeight: typography.lineHeight.xs,
          fontFamily: typography.fontFamily.medium,
          textTransform: 'uppercase',
          letterSpacing: 1,
        };
      default:
        return {
          fontSize: typography.fontSize.md,
          lineHeight: typography.lineHeight.md,
          fontFamily: typography.fontFamily.regular,
        };
    }
  };

  return (
    <RNText
      style={[
        getVariantStyle(),
        {
          color: getTextColor(),
          fontFamily: getFontFamily(),
          textAlign: align,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

export default Text;
