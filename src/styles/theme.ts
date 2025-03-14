import { Platform, StatusBar } from 'react-native';

// Define the color palette
export const colors = {
  // Primary colors
  primary: {
    light: '#7B90FE',
    main: '#4A62FF',
    dark: '#3347DB',
    contrast: '#FFFFFF',
  },
  
  // Secondary colors
  secondary: {
    light: '#61D6F6',
    main: '#00B8EC',
    dark: '#0096C7',
    contrast: '#FFFFFF',
  },

  // Success colors
  success: {
    light: '#80E0A7',
    main: '#4CC78E',
    dark: '#3AA771',
    contrast: '#FFFFFF',
  },

  // Warning colors
  warning: {
    light: '#FFD872',
    main: '#FFBF42',
    dark: '#F0A90D',
    contrast: '#FFFFFF',
  },

  // Error colors
  error: {
    light: '#FF8A8A',
    main: '#FF5252',
    dark: '#E63939',
    contrast: '#FFFFFF',
  },

  // Neutral colors
  neutral: {
    white: '#FFFFFF',
    offWhite: '#F7F8FA',
    lightest: '#EAEDF2',
    lighter: '#D1D6E0',
    light: '#B0B7C3',
    medium: '#848D9F',
    dark: '#545D70',
    darker: '#2E3645',
    darkest: '#161C2C',
    black: '#000000',
  },

  // Background colors
  background: {
    default: '#F7F8FA',
    paper: '#FFFFFF',
    dark: '#161C2C',
  },

  // Text colors
  text: {
    primary: '#161C2C',
    secondary: '#545D70',
    disabled: '#B0B7C3',
    hint: '#848D9F',
    light: '#FFFFFF',
  },

  // Gradient colors for meditation backgrounds
  gradients: {
    calm: ['#4A62FF', '#7B90FE'],
    focus: ['#00B8EC', '#61D6F6'],
    sleep: ['#3A40BC', '#8183E5'],
    relax: ['#4CC78E', '#80E0A7'],
    energy: ['#FFBF42', '#FFD872'],
    anxiety: ['#7464F3', '#AEA2F2'],
  },
};

// Typography configuration
export const typography = {
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    display: 36,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 36,
    xxxl: 42,
    display: 48,
  },
};

// Spacing scale for consistent layout
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border radius options
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999,
};

// Shadows for different elevations
export const shadows = {
  xs: {
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 6,
  },
};

// Animation timing
export const animation = {
  durations: {
    short: 150,
    medium: 300,
    long: 500,
  },
  easings: {
    easeInOut: 'ease-in-out',
    easeOut: 'ease-out',
    easeIn: 'ease-in',
    linear: 'linear',
  },
};

// Layout constants
export const layout = {
  // Screen padding
  screenPadding: spacing.md,
  // Status bar height
  statusBarHeight: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0,
  // Navigation bar height
  navBarHeight: Platform.OS === 'ios' ? 44 : 56,
  // Tab bar height
  tabBarHeight: Platform.OS === 'ios' ? 83 : 64,
  // Maximum content width (for tablet/web)
  maxContentWidth: 600,
};

// Full theme object
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  layout,
};

export default theme;
