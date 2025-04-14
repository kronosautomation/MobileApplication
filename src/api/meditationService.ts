import apiClient, { getActionPath, getApiPath, getResourcePath, getSubResourcePath } from './apiClient';
import { GuidedMeditation, DifficultyLevel, MeditationSession } from '../types';
import userProfileService from './userProfileService';

// Interface for meditation statistics
export interface MeditationStats {
  totalMeditations: number;
  totalMinutes: number;
  completedSessions: number;
  abandonedSessions: number;
  averageSessionLength: number;
  currentStreak: number;
  longestStreak: number;
  totalCalendarDays: number;
  totalCompletionDays: number;
  lastSessionDate?: string;
  averageAnxietyReduction: number;
  completionRate: number;
  calendarData?: Array<{ date: string; minutes: number; completed: boolean }>;
  weeklyComparison?: { thisWeek: number; lastWeek: number; percentChange: number };
  monthlyComparison?: { thisMonth: number; lastMonth: number; percentChange: number };
}

class MeditationService {
  // Get a list of guided meditations with optional filtering
  async getMeditations(
    page: number = 1,
    pageSize: number = 10,
    language?: string,
    difficultyLevel?: DifficultyLevel,
    category?: string,
    tags?: string[]
  ): Promise<{ meditations: GuidedMeditation[]; totalCount: number; totalPages: number }> {
    try {
      // Build query parameters
      let queryParams = `?page=${page}&pageSize=${pageSize}`;
      if (language) queryParams += `&language=${language}`;
      if (difficultyLevel !== undefined) queryParams += `&difficultyLevel=${difficultyLevel}`;
      if (category) queryParams += `&category=${category}`;
      if (tags && tags.length > 0) queryParams += `&tags=${tags.join(',')}`;

      const response = await apiClient.get<{
        items: GuidedMeditation[];
        totalCount: number;
        totalPages: number;
      }>(getApiPath(`guided-meditations${queryParams}`));

      return {
        meditations: response.items,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch meditations');
    }
  }

  // Get a single meditation by ID
  async getMeditationById(id: string, includeStreamingUrl: boolean = true): Promise<GuidedMeditation> {
    try {
      const response = await apiClient.get<GuidedMeditation>(
        `${getResourcePath('guided-meditations', id)}?includeStreamingUrl=${includeStreamingUrl}`
      );
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch meditation');
    }
  }

  // Get featured meditations
  async getFeaturedMeditations(take: number = 5): Promise<GuidedMeditation[]> {
    try {
      const response = await apiClient.get<{ meditations: GuidedMeditation[] }>(
        `${getApiPath('guided-meditations/featured')}?take=${take}`
      );
      return response.meditations;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch featured meditations');
    }
  }

  // Get accessible meditations based on subscription status
  async getAccessibleMeditations(): Promise<string[]> {
    try {
      const response = await apiClient.get<{ meditationIds: string[] }>(
        getApiPath('subscriptions/accessible-content')
      );
      return response.meditationIds;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch accessible meditations');
    }
  }

  // Start a meditation session
  async startMeditationSession(
    meditationId: string,
    anxietyBefore?: number,
    performanceFocusArea?: number
  ): Promise<MeditationSession> {
    try {
      const response = await apiClient.post<MeditationSession>(getActionPath('meditation-sessions', 'start'), {
        meditationId,
        anxietyBefore,
        performanceFocusArea,
      });
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to start meditation session');
    }
  }

  // Complete a meditation session
  async completeMeditationSession(
    sessionId: string,
    anxietyAfter?: number,
    techniquesUsed?: string[],
    notes?: string,
    moodAfter?: string
  ): Promise<MeditationSession> {
    try {
      const response = await apiClient.post<MeditationSession>(getActionPath('meditation-sessions', 'complete'), {
        sessionId,
        anxietyAfter,
        techniquesUsed,
        notes,
        moodAfter,
      });
      
      // Update local user stats
      try {
        // Get session duration in minutes
        const durationMinutes = response.durationInSeconds ? Math.round(response.durationInSeconds / 60) : 5;
        
        // Update stats (consider the session completed if it has a status of "Completed")
        await userProfileService.updateStatsAfterMeditation(
          durationMinutes, 
          response.status === "Completed"
        );
      } catch (statsError) {
        console.error('Error updating local user stats:', statsError);
        // Don't fail the operation if stats update fails
      }
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to complete meditation session');
    }
  }

  // Get user's meditation history
  async getMeditationHistory(
    startDate?: Date,
    endDate?: Date
  ): Promise<MeditationSession[]> {
    try {
      let url = getApiPath('meditation-sessions');
      const params = [];
      
      if (startDate) {
        params.push(`startDate=${startDate.toISOString()}`);
      }
      
      if (endDate) {
        params.push(`endDate=${endDate.toISOString()}`);
      }
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const response = await apiClient.get<MeditationSession[]>(url);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch meditation history');
    }
  }

  // Get user's meditation statistics with enhanced data
  async getUserMeditationStats(
    includeCalendar: boolean = false,
    includeComparisons: boolean = false,
    calendarStartDate?: Date,
    calendarEndDate?: Date
  ): Promise<MeditationStats> {
    try {
      let url = getApiPath('meditation-sessions/stats');
      const params = [];
      
      if (includeCalendar) {
        params.push(`includeCalendar=true`);
        
        if (calendarStartDate) {
          params.push(`calendarStartDate=${calendarStartDate.toISOString()}`);
        }
        
        if (calendarEndDate) {
          params.push(`calendarEndDate=${calendarEndDate.toISOString()}`);
        }
      }
      
      if (includeComparisons) {
        params.push(`includeComparisons=true`);
      }
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const response = await apiClient.get<MeditationStats>(url);
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch meditation statistics');
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

export const meditationService = new MeditationService();
export default meditationService;
