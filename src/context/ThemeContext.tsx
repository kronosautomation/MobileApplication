import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import { theme } from '../styles';
import userPreferencesService, { ExtendedUserPreferences } from '../api/userPreferencesService';

// Theme modes
type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  currentTheme: typeof theme;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleDarkMode: () => void;
}

// Create context with default value
const ThemeContext = createContext<ThemeContextType>({
  currentTheme: theme,
  themeMode: 'system',
  isDark: false,
  setThemeMode: () => {},
  toggleDarkMode: () => {},
});

// Provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [userDarkMode, setUserDarkMode] = useState<boolean | null>(null);
  
  // Determine if dark mode is active based on mode and system setting
  const isDark = 
    themeMode === 'dark' || 
    (themeMode === 'system' && systemColorScheme === 'dark') ||
    (userDarkMode === true); // Also respect user setting from preferences
  
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
        light: isDark ? '#545D70' : theme.colors.background.paper,
      },
      text: {
        primary: isDark ? '#FFFFFF' : theme.colors.text.primary,
        secondary: isDark ? '#B0B7C3' : theme.colors.text.secondary,
        disabled: isDark ? '#545D70' : theme.colors.text.disabled,
        hint: isDark ? '#848D9F' : theme.colors.text.hint,
        light: isDark ? '#FFFFFF' : theme.colors.text.light,
      },
      neutral: {
        ...theme.colors.neutral,
        lightest: isDark ? '#2E3645' : theme.colors.neutral.lightest,
        lighter: isDark ? '#545D70' : theme.colors.neutral.lighter,
      },
    },
  };

  // Toggle dark mode
  const toggleDarkMode = async () => {
    const newDarkMode = !isDark;
    
    // Update local state
    setUserDarkMode(newDarkMode);
    
    // Save to preferences
    try {
      await userPreferencesService.updateDarkMode(newDarkMode);
    } catch (error) {
      console.error('Failed to save dark mode preference:', error);
    }
  };

  // Set theme mode and save to userPreferencesService
  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      
      // For dark/light modes, also update the user's dark mode preference
      if (mode === 'dark') {
        setUserDarkMode(true);
        await userPreferencesService.updateDarkMode(true);
      } else if (mode === 'light') {
        setUserDarkMode(false);
        await userPreferencesService.updateDarkMode(false);
      }
      
      // Save the theme mode to user preferences
      await userPreferencesService.saveUserPreferences(undefined, { themeMode: mode });
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  };

  // Load saved theme mode from userPreferencesService
  useEffect(() => {
    const loadThemeSettings = async () => {
      try {
        const preferences = await userPreferencesService.getUserPreferences();
        
        // If preferences exist, load the theme mode and dark mode setting
        if (preferences) {
          // Set theme mode if available
          if (preferences.themeMode) {
            setThemeModeState(preferences.themeMode as ThemeMode);
          }
          
          // Set dark mode preference if available
          if (preferences.darkMode !== undefined) {
            setUserDarkMode(preferences.darkMode);
          }
        } else {
          // No preferences found, initialize with system defaults
          const systemDark = systemColorScheme === 'dark';
          // Save initial preferences based on system settings
          try {
            await userPreferencesService.saveUserPreferences(undefined, {
              darkMode: systemDark,
              themeMode: 'system'
            });
            // Set userDarkMode based on system settings
            setUserDarkMode(systemDark);
          } catch (error) {
            console.error('Failed to save initial theme settings:', error);
          }
        }
      } catch (error) {
        console.error('Failed to load theme settings:', error);
      }
    };

    loadThemeSettings();
  }, [systemColorScheme]);

  // Context value
  const value = {
    currentTheme,
    themeMode,
    isDark,
    setThemeMode,
    toggleDarkMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
