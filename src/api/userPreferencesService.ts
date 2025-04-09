import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences } from '../types';
import apiClient from './apiClient';

// Storage keys
const USER_PREFERENCES_KEY = '@MindfulMastery:userPreferences';
const APP_SETTINGS_KEY = '@MindfulMastery:appSettings';
const DEFAULT_USER_KEY = 'app_default'; // Used when no specific userId is provided

// Extend UserPreferences type for theme-related properties
export interface ExtendedUserPreferences extends UserPreferences {
  themeMode?: 'light' | 'dark' | 'system';
}

class UserPreferencesService {
  // Get user preferences from local storage
  async getUserPreferences(userId?: string): Promise<ExtendedUserPreferences | null> {
    try {
      // If no userId provided, try to get from apiClient
      let effectiveUserId: string | undefined = userId;
      
      if (!effectiveUserId) {
        try {
          const apiUserId = await apiClient.getUserId();
          if (apiUserId) {
            effectiveUserId = apiUserId;
          }
        } catch (error) {
          console.log('No authenticated user, using default preferences');
        }
      }
      
      // If still no userId, use default
      effectiveUserId = effectiveUserId || DEFAULT_USER_KEY;
      
      const preferencesJson = await AsyncStorage.getItem(USER_PREFERENCES_KEY);
      if (preferencesJson) {
        const allPreferences = JSON.parse(preferencesJson);
        // Return the preferences for this specific user
        return allPreferences[effectiveUserId] || null;
      }
      return null;
    } catch (error) {
      console.error('Error reading user preferences from local storage:', error);
      return null;
    }
  }

  // Save user preferences to local storage
  async saveUserPreferences(userId?: string, preferences: Partial<ExtendedUserPreferences> = {}): Promise<void> {
    try {
      // If no userId provided, try to get from apiClient
      let effectiveUserId: string | undefined = userId;
      
      if (!effectiveUserId) {
        try {
          const apiUserId = await apiClient.getUserId();
          if (apiUserId) {
            effectiveUserId = apiUserId;
          }
        } catch (error) {
          console.log('No authenticated user, using default preferences');
        }
      }
      
      // If still no userId, use default
      effectiveUserId = effectiveUserId || DEFAULT_USER_KEY;
      
      // Get existing preferences
      const preferencesJson = await AsyncStorage.getItem(USER_PREFERENCES_KEY);
      const allPreferences = preferencesJson ? JSON.parse(preferencesJson) : {};
      
      // Update preferences for this user
      allPreferences[effectiveUserId] = {
        ...allPreferences[effectiveUserId],
        ...preferences,
        userId: effectiveUserId, // Ensure userId is always set
      };
      
      // Save back to local storage
      await AsyncStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(allPreferences));
      console.log('User preferences saved to local storage');
    } catch (error) {
      console.error('Error saving user preferences to local storage:', error);
      throw new Error('Failed to save user preferences');
    }
  }

  // Alias for saveUserPreferences for backward compatibility
  async updateUserPreferences(preferences: Partial<ExtendedUserPreferences>): Promise<void> {
    return this.saveUserPreferences(undefined, preferences);
  }

  // Get app settings (not tied to a specific user)
  async getAppSettings(): Promise<Record<string, any>> {
    try {
      const settingsJson = await AsyncStorage.getItem(APP_SETTINGS_KEY);
      if (settingsJson) {
        return JSON.parse(settingsJson);
      }
      return {};
    } catch (error) {
      console.error('Error reading app settings from local storage:', error);
      return {};
    }
  }

  // Save app settings (not tied to a specific user)
  async saveAppSettings(settings: Record<string, any>): Promise<void> {
    try {
      // Get existing settings
      const settingsJson = await AsyncStorage.getItem(APP_SETTINGS_KEY);
      const existingSettings = settingsJson ? JSON.parse(settingsJson) : {};
      
      // Update settings
      const updatedSettings = {
        ...existingSettings,
        ...settings,
      };
      
      // Save back to local storage
      await AsyncStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(updatedSettings));
      console.log('App settings saved to local storage');
    } catch (error) {
      console.error('Error saving app settings to local storage:', error);
      throw new Error('Failed to save app settings');
    }
  }

  // Clear all user data (useful for logout)
  async clearUserData(userId: string): Promise<void> {
    try {
      // Remove only this user's preferences
      const preferencesJson = await AsyncStorage.getItem(USER_PREFERENCES_KEY);
      if (preferencesJson) {
        const allPreferences = JSON.parse(preferencesJson);
        if (allPreferences[userId]) {
          delete allPreferences[userId];
          await AsyncStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(allPreferences));
        }
      }
      
      console.log('User data cleared from local storage');
    } catch (error) {
      console.error('Error clearing user data from local storage:', error);
    }
  }
  
  // Update user preferences with a dark mode setting
  async updateDarkMode(isDarkMode: boolean): Promise<void> {
    await this.saveUserPreferences(undefined, { darkMode: isDarkMode });
  }
}

export const userPreferencesService = new UserPreferencesService();
export default userPreferencesService;
