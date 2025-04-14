import apiClient from './apiClient';
import { User, DailyMeditationData } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interface for user stats
export interface UserStats {
  userId: string;
  daysActive: number;
  totalMeditations: number;
  completedMeditations: number;
  abandonedMeditations: number;
  totalMinutes: number;
  averageSessionMinutes: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate?: string;
  averageAnxietyReduction: number;
  totalAchievements: number;
  completionRate: number;
}

// Storage keys
const USER_PROFILE_KEY = '@MindfulMastery:userProfile';
const USER_STATS_KEY = '@MindfulMastery:userStats';

// Service for user profile-related API calls
class UserProfileService {
  // Get user profile from API
  async getUserProfile(): Promise<User> {
    try {
      console.log('👤 Fetching user profile');
      const userId = await apiClient.getUserId();
      
      if (!userId) {
        throw new Error('User ID not available');
      }
      
      const user = await apiClient.get<User>(`/api/v1/user-profiles/${userId}`);
      console.log('✅ User profile retrieved successfully');
      
      // Cache user profile for offline use
      await this.cacheUserProfile(user);
      
      return user;
    } catch (error) {
      console.log('❌ Failed to get user profile:', error);
      
      // Try to get cached profile if API fails
      const cachedProfile = await this.getCachedUserProfile();
      if (cachedProfile) {
        console.log('📂 Using cached user profile');
        return cachedProfile;
      }
      
      throw this.handleError(error, 'Failed to get user profile');
    }
  }

  // Update user profile via API
  async updateProfile(profileData: Partial<User>): Promise<User> {
    try {
      console.log('🔄 Updating user profile');
      const userId = await apiClient.getUserId();
      
      if (!userId) {
        throw new Error('User ID not available');
      }
      
      const updatedUser = await apiClient.put<User>(`/api/v1/user-profiles/${userId}`, profileData);
      console.log('✅ User profile updated successfully');
      
      // Update cached profile
      const currentCached = await this.getCachedUserProfile();
      if (currentCached) {
        await this.cacheUserProfile({
          ...currentCached,
          ...updatedUser
        });
      }
      
      return updatedUser;
    } catch (error) {
      console.log('❌ Failed to update user profile:', error);
      throw this.handleError(error, 'Failed to update user profile');
    }
  }

  // Upload profile image
  async uploadProfileImage(imageUri: string): Promise<string> {
    try {
      console.log('📷 Uploading profile image');
      const userId = await apiClient.getUserId();
      
      if (!userId) {
        throw new Error('User ID not available');
      }
      
      // Create a FormData object to send the image
      const formData = new FormData();
      
      // Add the image file to the form data
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : 'image';
      
      formData.append('profileImage', {
        uri: imageUri,
        name: filename,
        type,
      } as any);
      
      // Upload the image
      const response = await apiClient.uploadFile<{imageUrl: string}>(
        `/api/v1/user-profiles/${userId}/image`,
        formData
      );
      
      console.log('✅ Profile image uploaded successfully');
      return response.imageUrl;
    } catch (error) {
      console.log('❌ Failed to upload profile image:', error);
      throw this.handleError(error, 'Failed to upload profile image');
    }
  }

  // Get user stats from API with local storage fallback
  async getUserStats(): Promise<UserStats> {
    try {
      console.log('📊 Fetching user stats');
      const userId = await apiClient.getUserId();
      
      if (!userId) {
        throw new Error('User ID not available');
      }
      
      try {
        const stats = await apiClient.get<UserStats>(`/api/v1/user-profiles/${userId}/stats`);
        console.log('✅ User stats retrieved successfully from API');
        
        // Save to local storage for offline access
        await this.saveUserStatsToLocalStorage(userId, stats);
        
        return stats;
      } catch (apiError) {
        console.log('⚠️ Failed to get user stats from API, trying local storage', apiError);
        
        // Try to get stats from local storage
        const localStats = await this.getUserStatsFromLocalStorage(userId);
        if (localStats) {
          console.log('📂 Using cached user stats');
          return localStats;
        }
        
        // If no local stats, create default ones
        console.log('⚠️ No cached stats found, using defaults');
        const defaultStats: UserStats = {
          userId: userId,
          daysActive: 1,
          totalMeditations: 0,
          completedMeditations: 0,
          abandonedMeditations: 0,
          totalMinutes: 0,
          averageSessionMinutes: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastSessionDate: new Date().toISOString(),
          averageAnxietyReduction: 0,
          totalAchievements: 0,
          completionRate: 0
        };
        
        // Save default stats to local storage
        await this.saveUserStatsToLocalStorage(userId, defaultStats);
        
        return defaultStats;
      }
    } catch (error) {
      console.log('❌ Failed to get user stats:', error);
      throw this.handleError(error, 'Failed to get user stats');
    }
  }

  // Get user meditation data for profile display
  async getUserMeditationData(): Promise<DailyMeditationData[]> {
    try {
      console.log('📊 Fetching user meditation data');
      const userId = await apiClient.getUserId();
      
      if (!userId) {
        throw new Error('User ID not available');
      }
      
      const data = await apiClient.get<DailyMeditationData[]>(
        `/api/v1/user-profiles/${userId}/meditation-data`
      );
      console.log('✅ User meditation data retrieved successfully');
      return data;
    } catch (error) {
      console.log('❌ Failed to get user meditation data:', error);
      throw this.handleError(error, 'Failed to get user meditation data');
    }
  }

  // Update local user stats when completing a meditation session
  async updateStatsAfterMeditation(sessionDurationMinutes: number, completed: boolean): Promise<void> {
    try {
      const userId = await apiClient.getUserId();
      if (!userId) return;
      
      // Get current stats
      const currentStats = await this.getUserStatsFromLocalStorage(userId) || {
        userId: userId,
        daysActive: 1,
        totalMeditations: 0,
        completedMeditations: 0,
        abandonedMeditations: 0,
        totalMinutes: 0,
        averageSessionMinutes: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageAnxietyReduction: 0,
        totalAchievements: 0,
        completionRate: 0
      };
      
      // Calculate new completion rate
      const totalSessions = currentStats.totalMeditations + 1;
      const completedSessions = completed 
        ? currentStats.completedMeditations + 1
        : currentStats.completedMeditations;
      const abandonedSessions = completed
        ? currentStats.abandonedMeditations
        : currentStats.abandonedMeditations + 1;
      
      // Update total meditation time
      const totalMinutes = currentStats.totalMinutes + sessionDurationMinutes;
      
      // Check if this is a new day for streak calculation
      const today = new Date().toISOString().split('T')[0];
      const lastSessionDay = currentStats.lastSessionDate 
        ? currentStats.lastSessionDate.split('T')[0] 
        : null;
      
      // Update streak if completed session
      let streak = currentStats.currentStreak;
      if (completed) {
        if (lastSessionDay !== today) {
          // New day, increment streak
          streak += 1;
        }
      } else {
        // Reset streak if session was abandoned
        streak = 0;
      }
      
      // Update longest streak if current streak is longer
      const longestStreak = Math.max(currentStats.longestStreak, streak);
      
      // Calculate new average session minutes
      const averageSessionMinutes = totalMinutes / totalSessions;
      
      // Calculate new completion rate
      const completionRate = (completedSessions / totalSessions) * 100;
      
      // Update stats
      const updatedStats: UserStats = {
        ...currentStats,
        totalMeditations: totalSessions,
        completedMeditations: completedSessions,
        abandonedMeditations: abandonedSessions,
        totalMinutes,
        averageSessionMinutes,
        currentStreak: streak,
        longestStreak,
        lastSessionDate: today,
        completionRate
      };
      
      // Save updated stats to local storage
      await this.saveUserStatsToLocalStorage(userId, updatedStats);
      
      // Try to sync with server
      try {
        await apiClient.put(`/api/v1/user-profiles/${userId}/stats`, updatedStats);
        console.log('✅ User stats synced with server');
      } catch (syncError) {
        console.log('⚠️ Failed to sync user stats with server:', syncError);
        // Continue without throwing error - local stats are still updated
      }
    } catch (error) {
      console.log('❌ Failed to update user stats after meditation:', error);
      throw this.handleError(error, 'Failed to update user stats after meditation');
    }
  }

  // Update local user stats when creating a journal entry
  async updateStatsAfterJournalEntry(): Promise<void> {
    try {
      const userId = await apiClient.getUserId();
      if (!userId) return;
      
      // Get current stats
      const currentStats = await this.getUserStatsFromLocalStorage(userId) || {
        userId: userId,
        daysActive: 1,
        totalMeditations: 0,
        completedMeditations: 0,
        abandonedMeditations: 0,
        totalMinutes: 0,
        averageSessionMinutes: 0,
        currentStreak: 0,
        longestStreak: 0,
        averageAnxietyReduction: 0,
        totalAchievements: 0,
        completionRate: 0
      };
      
      // Update days active
      const today = new Date().toISOString().split('T')[0];
      const lastActiveDay = currentStats.lastSessionDate 
        ? currentStats.lastSessionDate.split('T')[0] 
        : null;
      
      if (lastActiveDay !== today) {
        const updatedStats: UserStats = {
          ...currentStats,
          daysActive: currentStats.daysActive + 1,
          lastSessionDate: today
        };
        
        // Save updated stats to local storage
        await this.saveUserStatsToLocalStorage(userId, updatedStats);
        
        // Try to sync with server
        try {
          await apiClient.put(`/api/v1/user-profiles/${userId}/stats`, updatedStats);
          console.log('✅ User stats synced with server');
        } catch (syncError) {
          console.log('⚠️ Failed to sync user stats with server:', syncError);
          // Continue without throwing error - local stats are still updated
        }
      }
    } catch (error) {
      console.log('❌ Failed to update user stats after journal entry:', error);
      throw this.handleError(error, 'Failed to update user stats after journal entry');
    }
  }

  // Save user stats to local storage
  private async saveUserStatsToLocalStorage(userId: string, stats: UserStats): Promise<void> {
    try {
      const key = `${USER_STATS_KEY}:${userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(stats));
      console.log('✅ User stats saved to local storage');
    } catch (error) {
      console.log('❌ Failed to save user stats to local storage:', error);
      throw this.handleError(error, 'Failed to save user stats to local storage');
    }
  }

  // Get user stats from local storage
  private async getUserStatsFromLocalStorage(userId: string): Promise<UserStats | null> {
    try {
      const key = `${USER_STATS_KEY}:${userId}`;
      const statsJson = await AsyncStorage.getItem(key);
      
      if (!statsJson) {
        return null;
      }
      
      return JSON.parse(statsJson) as UserStats;
    } catch (error) {
      console.log('❌ Failed to get user stats from local storage:', error);
      return null;
    }
  }

  // Cache user profile in local storage
  private async cacheUserProfile(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(user));
      console.log('✅ User profile cached successfully');
    } catch (error) {
      console.log('❌ Failed to cache user profile:', error);
      throw this.handleError(error, 'Failed to cache user profile');
    }
  }

  // Get cached user profile from local storage
  private async getCachedUserProfile(): Promise<User | null> {
    try {
      const cachedProfile = await AsyncStorage.getItem(USER_PROFILE_KEY);
      
      if (!cachedProfile) {
        return null;
      }
      
      return JSON.parse(cachedProfile) as User;
    } catch (error) {
      console.log('❌ Failed to get cached user profile:', error);
      return null;
    }
  }

  // Handle API errors
  private handleError(error: any, defaultMessage: string): Error {
    console.error('Error:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      
      return new Error(error.response.data?.message || defaultMessage);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request:', error.request);
      
      return new Error('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
      
      return new Error(error.message || defaultMessage);
    }
  }
}

export const userProfileService = new UserProfileService();
export default userProfileService; 