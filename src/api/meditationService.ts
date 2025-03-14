import apiClient from './apiClient';
import { GuidedMeditation, DifficultyLevel, MeditationSession } from '../types';

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
      }>(`/meditation${queryParams}`);

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
        `/guided-meditation/${id}?includeStreamingUrl=${includeStreamingUrl}`
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
        `/guided-meditation/featured?take=${take}`
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
        '/subscription/accessible-meditations'
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
      const response = await apiClient.post<MeditationSession>('/meditation/session/start', {
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
      const response = await apiClient.post<MeditationSession>('/meditation/session/complete', {
        sessionId,
        anxietyAfter,
        techniquesUsed,
        notes,
        moodAfter,
      });
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
      let url = '/meditation/sessions';
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
