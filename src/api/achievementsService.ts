import apiClient from './apiClient';
import { Achievement } from '../types';

class AchievementsService {
  // Get all user achievements for the current user
  async getUserAchievements(): Promise<Achievement[]> {
    try {
      const response = await apiClient.get<Achievement[]>('/achievements');
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch achievements');
    }
  }

  // Get a single achievement by ID
  async getAchievementById(id: string): Promise<Achievement> {
    try {
      const response = await apiClient.get<Achievement>(`/achievements/${id}`);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch achievement');
    }
  }

  // Get newly unlocked achievements
  async getNewlyUnlockedAchievements(): Promise<Achievement[]> {
    try {
      const response = await apiClient.get<Achievement[]>('/achievements/newly-unlocked');
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch newly unlocked achievements');
    }
  }

  // Mark achievement as seen
  async markAchievementAsSeen(id: string): Promise<void> {
    try {
      await apiClient.post(`/achievements/${id}/mark-seen`);
    } catch (error) {
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
      const response = await apiClient.get<{
        currentStreak: number;
        longestStreak: number;
        lastSessionDate: string | null;
        nextMilestone: number;
      }>('/achievements/streak');
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch streak information');
    }
  }

  // Helper method to handle errors
  private handleError(error: any, defaultMessage: string): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return new Error(defaultMessage);
  }
}

export const achievementsService = new AchievementsService();
export default achievementsService;
