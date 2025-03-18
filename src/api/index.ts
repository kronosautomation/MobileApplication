import apiClient from './apiClient';
import authService from './authService';
import meditationService from './meditationService';
import journalService from './journalService';
import subscriptionService from './subscriptionService';
import achievementsService from './achievementsService';
import { MeditationSession, PerformanceJournal } from '../types';

// Create a unified API object for simpler access
export const api = {
  ...authService,
  ...meditationService,
  ...journalService,
  ...subscriptionService,
  ...achievementsService,
  
  // Methods for the statistics screen that connect to real API endpoints
  getMeditationSessions: async (userId: string): Promise<{ data: MeditationSession[] }> => {
    try {
      // Use the real API endpoint for meditation history
      const sessions = await apiClient.get<MeditationSession[]>('/meditation/history');
      return { data: sessions };
    } catch (error) {
      console.error('Error fetching meditation sessions:', error);
      return { data: [] };
    }
  },
  
  getJournalEntries: async (userId: string): Promise<{ data: PerformanceJournal[] }> => {
    try {
      // Use the real API endpoint for user journals
      const journals = await apiClient.get<PerformanceJournal[]>('/performance-journal');
      return { data: journals };
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      return { data: [] };
    }
  },
  
  getMeditationStats: async (): Promise<any> => {
    try {
      // Use the real API endpoint for meditation stats
      return await apiClient.get('/meditation/stats');
    } catch (error) {
      console.error('Error fetching meditation stats:', error);
      return {};
    }
  }
};

export {
  apiClient,
  authService,
  meditationService,
  journalService,
  subscriptionService,
  achievementsService,
};

export * from './subscriptionService';