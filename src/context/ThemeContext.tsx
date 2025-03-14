import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { theme } from '../styles';

// Theme modes
type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  currentTheme: typeof theme;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
}

// Create context with default value
const ThemeContext = createContext<ThemeContextType>({
  currentTheme: theme,
  themeMode: 'system',
  isDark: false,
  setThemeMode: () => {},
});

// Theme storage key
const THEME_MODE_KEY = '@MindfulMastery:themeMode';

// Provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  
  // Determine if dark mode is active
  const isDark = 
    themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');
  
  // Store current theme based on mode
  const currentTheme = {
    ...theme,
    // Override specific theme values for dark mode
    colors: {
      ...theme.colors,
      background: {
        default: isDark ? '#161C2C' : theme.colors.background.default,
        paper: isDark ? '#2E3645' : theme.colors.background.paper,
        dark: isDark ? '#000000' : theme.colors.background.dark,
      },
      text: {
        primary: isDark ? '#FFFFFF' : theme.colors.text.primary,
        secondary: isDark ? '#B0B7C3' : theme.colors.text.secondary,
        disabled: isDark ? '#545D70' : theme.colors.text.disabled,
        hint: isDark ? '#848D9F' : theme.colors.text.hint,
        light: isDark ? '#FFFFFF' : theme.colors.text.light,
      },
    },
  };

  // Set theme mode and save to storage
  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem(THEME_MODE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  };

  // Load saved theme mode from storage
  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_MODE_KEY);
        if (savedMode) {
          setThemeModeState(savedMode as ThemeMode);
        }
      } catch (error) {
        console.error('Failed to load theme mode:', error);
      }
    };

    loadThemeMode();
  }, []);

  // Context value
  const value = {
    currentTheme,
    themeMode,
    isDark,
    setThemeMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
