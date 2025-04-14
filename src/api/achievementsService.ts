import apiClient from './apiClient';
import { Achievement } from '../types';

class AchievementsService {
  // Get all user achievements for the current user
  async getUserAchievements(): Promise<Achievement[]> {
    try {
      const response = await apiClient.get<Achievement[]>('/api/v1/achievements/user');
      return response;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      throw this.handleError(error, 'Failed to fetch achievements');
    }
  }

  // Get a single achievement by ID
  async getAchievementById(id: string): Promise<Achievement> {
    try {
      const response = await apiClient.get<Achievement>(`/api/v1/achievements/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching achievement:', error);
      throw this.handleError(error, 'Failed to fetch achievement');
    }
  }

  // Get newly unlocked achievements
  async getNewlyUnlockedAchievements(): Promise<Achievement[]> {
    try {
      const response = await apiClient.get<Achievement[]>('/api/v1/achievements/user/new');
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch newly unlocked achievements');
    }
  }

  // Mark achievement as seen
  async markAchievementAsSeen(achievementId: string): Promise<void> {
    try {
      await apiClient.post(`/api/v1/achievements/user/seen/${achievementId}`);
    } catch (error) {
      console.error('Error marking achievement as seen:', error);
      throw this.handleError(error, 'Failed to mark achievement as seen');
    }
  }

  // Get current streak information
  async getStreakInfo(): Promise<{
    currentStreak: number;
    longestStreak: number;
    lastSessionDate: string | null;
    nextMilestone: number;
  }> {
    try {
      const userId = await apiClient.getUserId();
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      const response = await apiClient.get<{
        currentStreak: number;
        longestStreak: number;
        lastSessionDate: string | null;
        nextMilestone: number;
      }>(`/api/v1/achievements/user/${userId}/streak`);
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch streak information');
    }
  }

  // Helper method to handle errors
  private handleError(error: any, message: string): Error {
    console.error(message, error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return new Error(error.response.data?.message || message);
    } else if (error.request) {
      // The request was made but no response was received
      return new Error('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      return new Error(error.message || message);
    }
  }
}

export const achievementsService = new AchievementsService();
export default achievementsService;
