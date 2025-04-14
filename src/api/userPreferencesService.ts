import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences } from '../types';
import apiClient, { getApiPath, getResourcePath, getSubResourcePath } from './apiClient';

// Storage keys
const USER_PREFERENCES_KEY = '@MindfulMastery:userPreferences';
const APP_SETTINGS_KEY = '@MindfulMastery:appSettings';
const DEFAULT_USER_KEY = 'app_default'; // Used when no specific userId is provided
const SYNC_TIMESTAMP_KEY = '@MindfulMastery:preferencesLastSync';

// Extend UserPreferences type for theme-related properties
export interface ExtendedUserPreferences extends UserPreferences {
  themeMode?: 'light' | 'dark' | 'system';
}

class UserPreferencesService {
  // Get user preferences from local storage first, then try to sync with the server
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
      
      // First try to get preferences from local storage
      const preferencesJson = await AsyncStorage.getItem(USER_PREFERENCES_KEY);
      let localPreferences: ExtendedUserPreferences | null = null;
      
      if (preferencesJson) {
        const allPreferences = JSON.parse(preferencesJson);
        // Get the preferences for this specific user
        localPreferences = allPreferences[effectiveUserId] || null;
      }

      // If this is an authenticated user (not default), try to sync with server
      if (effectiveUserId !== DEFAULT_USER_KEY && apiClient.isNetworkConnected) {
        const lastSyncJson = await AsyncStorage.getItem(SYNC_TIMESTAMP_KEY);
        const lastSyncData = lastSyncJson ? JSON.parse(lastSyncJson) : {};
        const lastSync = lastSyncData[effectiveUserId] || 0;
        const now = Date.now();
        
        // Only sync if it's been more than 1 hour since last sync or if we don't have local preferences
        if (!localPreferences || (now - lastSync > 3600000)) {
          try {
            console.log('Syncing preferences with server...');
            const serverPreferences = await this.fetchPreferencesFromServer(effectiveUserId);
            
            if (serverPreferences) {
              // Save the server preferences locally
              await this.saveUserPreferences(effectiveUserId, serverPreferences);
              
              // Update sync timestamp
              lastSyncData[effectiveUserId] = now;
              await AsyncStorage.setItem(SYNC_TIMESTAMP_KEY, JSON.stringify(lastSyncData));
              
              return serverPreferences;
            }
          } catch (syncError) {
            console.error('Failed to sync preferences with server:', syncError);
            // Fall back to local preferences if sync fails
          }
        }
      }
      
      return localPreferences;
    } catch (error) {
      console.error('Error reading user preferences from local storage:', error);
      return null;
    }
  }

  // Save user preferences to local storage and sync with server if connected
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
      
      // Save to local storage
      await AsyncStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(allPreferences));
      console.log('User preferences saved to local storage');
      
      // If authenticated user and we have network, sync with server
      if (effectiveUserId !== DEFAULT_USER_KEY && apiClient.isNetworkConnected) {
        try {
          await this.syncPreferencesToServer(effectiveUserId, allPreferences[effectiveUserId]);
          
          // Update sync timestamp
          const lastSyncJson = await AsyncStorage.getItem(SYNC_TIMESTAMP_KEY);
          const lastSyncData = lastSyncJson ? JSON.parse(lastSyncJson) : {};
          lastSyncData[effectiveUserId] = Date.now();
          await AsyncStorage.setItem(SYNC_TIMESTAMP_KEY, JSON.stringify(lastSyncData));
          
          console.log('Preferences synced with server');
        } catch (syncError) {
          console.error('Failed to sync preferences with server:', syncError);
          // Continue anyway, local changes are saved
        }
      }
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

  // Helper method to fetch preferences from the server
  private async fetchPreferencesFromServer(userId: string): Promise<ExtendedUserPreferences | null> {
    try {
      // Call the API endpoint to get user preferences
      // Fixed the endpoint URL, removing the extra 's' from "user-profiles"
      // Use the correct endpoint path with the standardized helper
      const response = await apiClient.get(getSubResourcePath('user-profiles', userId, 'preferences'));
      
      if (!response) {
        return null;
      }
      
      // Convert the API response to our ExtendedUserPreferences format
      const serverPreferences: ExtendedUserPreferences = {
        userId,
        meditationRemindersEnabled: response.meditationRemindersEnabled || false,
        reminderTime: response.reminderTime,
        preferredMeditationDuration: response.preferredMeditationDuration,
        preferredBackgroundSound: response.preferredBackgroundSound,
        soundVolume: response.soundVolume,
        theme: response.theme,
        language: response.language,
        notificationsEnabled: response.notificationsEnabled || false,
        darkMode: response.darkMode || false,
        soundEffects: response.soundEffects !== undefined ? response.soundEffects : true,
        hapticFeedback: response.hapticFeedback !== undefined ? response.hapticFeedback : true,
        sessionEndBell: response.sessionEndBell !== undefined ? response.sessionEndBell : true,
        keepScreenAwake: response.keepScreenAwake !== undefined ? response.keepScreenAwake : true,
        syncData: response.syncData !== undefined ? response.syncData : true,
        shareAnalytics: response.shareAnalytics || false,
        // If the server returns a theme value but no themeMode, infer it
        themeMode: response.theme === 'dark' ? 'dark' : (response.theme === 'light' ? 'light' : 'system')
      };
      
      return serverPreferences;
    } catch (error) {
      console.error('Error fetching preferences from server:', error);
      return null;
    }
  }
  
  // Helper method to sync preferences to the server
  private async syncPreferencesToServer(userId: string, preferences: ExtendedUserPreferences): Promise<boolean> {
    try {
      // Convert from our preferences format to API format
      const apiPreferences = {
        meditationRemindersEnabled: preferences.meditationRemindersEnabled,
        reminderTime: preferences.reminderTime,
        preferredMeditationDuration: preferences.preferredMeditationDuration,
        preferredBackgroundSound: preferences.preferredBackgroundSound,
        soundVolume: preferences.soundVolume,
        theme: preferences.theme,
        language: preferences.language,
        notificationsEnabled: preferences.notificationsEnabled,
        darkMode: preferences.darkMode,
        soundEffects: preferences.soundEffects,
        hapticFeedback: preferences.hapticFeedback,
        sessionEndBell: preferences.sessionEndBell,
        keepScreenAwake: preferences.keepScreenAwake,
        syncData: preferences.syncData,
        shareAnalytics: preferences.shareAnalytics
      };
      
      // Call the API endpoint to update preferences
      // Fixed the endpoint URL, removing the extra 's' from "user-profiles"
      // Use the correct endpoint path with the standardized helper
      await apiClient.put(getSubResourcePath('user-profiles', userId, 'preferences'), apiPreferences);
      
      return true;
    } catch (error) {
      console.error('Error syncing preferences to server:', error);
      return false;
    }
  }
}

export const userPreferencesService = new UserPreferencesService();
export default userPreferencesService;