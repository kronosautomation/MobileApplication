import apiClient, { getApiPath } from './apiClient';
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
      console.log('Fetching meditation sessions for user:', userId);
      // Use the real API endpoint for meditation history
      const endpointPath = getApiPath('meditation/history');
      console.log('Fetching meditation sessions from:', endpointPath);
      const sessions = await apiClient.get<any[]>(endpointPath);
      
      // Process and normalize the data to ensure consistent types
      const processedSessions = sessions.map((session: any) => {
        return {
          id: session.id || `session-${Date.now()}`,
          userId: session.userId || userId,
          guidedMeditationId: session.guidedMeditationId,
          meditationId: session.meditationId || session.guidedMeditationId,
          title: session.title || 'Meditation Session',
          durationInSeconds: typeof session.durationInSeconds === 'number' 
            ? session.durationInSeconds
            : parseInt(String(session.durationInSeconds || '0'), 10),
          anxietyBefore: typeof session.anxietyBefore === 'number'
            ? session.anxietyBefore
            : session.anxietyBefore ? parseInt(String(session.anxietyBefore), 10) : undefined,
          anxietyAfter: typeof session.anxietyAfter === 'number'
            ? session.anxietyAfter
            : session.anxietyAfter ? parseInt(String(session.anxietyAfter), 10) : undefined,
          isCompleted: !!session.isCompleted,
          startedAt: session.startedAt || new Date().toISOString(),
          completedAt: session.completedAt,
          startTime: session.startTime || session.startedAt || new Date().toISOString(),
          status: session.status || (session.isCompleted ? 'completed' : 'started'),
          techniquesUsed: session.techniquesUsed || [],
          createdAt: session.createdAt || new Date().toISOString(),
          notes: session.notes || '',
          rating: typeof session.rating === 'number' ? session.rating : undefined
        } as MeditationSession;
      });
      
      console.log(`Processed ${processedSessions.length} meditation sessions`);
      return { data: processedSessions };
    } catch (error) {
      console.error('Error fetching meditation sessions:', error);
      return { data: [] };
    }
  },
  
  getJournalEntries: async (userId: string): Promise<{ data: PerformanceJournal[] }> => {
    try {
      console.log('Fetching journal entries for user:', userId);
      // Use the real API endpoint for user journals
      const response = await apiClient.get<any>('/api/v1/performance-journal');
      
      // Process and normalize the data to ensure consistent types
      const processedJournals = (response.entries || []).map((journal: any) => {
        const anxietyLevel = typeof journal.anxietyLevel === 'number' 
          ? journal.anxietyLevel 
          : journal.anxietyLevel ? parseInt(String(journal.anxietyLevel), 10) : 5;
          
        const confidenceLevel = typeof journal.confidenceLevel === 'number' 
          ? journal.confidenceLevel 
          : journal.confidenceLevel ? parseInt(String(journal.confidenceLevel), 10) : 5;
          
        // Create a meaningful title if not provided
        const entryDate = new Date(journal.date || journal.createdAt);
        const defaultTitle = `Journal Entry - ${entryDate.toLocaleDateString()}`;
        
        return {
          id: journal.id,
          userId: journal.userId || userId,
          title: journal.title || defaultTitle,
          content: journal.situation || journal.thoughts || journal.reflection || 'No content',
          situation: journal.situation || '',
          thoughts: journal.thoughts || '',
          physicalSensations: journal.physicalSensations || '',
          actions: journal.actions || '',
          outcome: journal.outcome || '',
          reflection: journal.reflection || '',
          anxietyLevel,
          confidenceLevel,
          performanceFocusArea: journal.performanceFocusArea || journal.focusAreaId || 'Other',
          emotions: journal.emotions || [],
          techniquesUsed: journal.techniquesUsed || [],
          isPrivate: journal.isPrivate === undefined ? true : journal.isPrivate,
          createdAt: journal.createdAt || new Date().toISOString(),
          updatedAt: journal.updatedAt || journal.createdAt || new Date().toISOString(),
        } as PerformanceJournal;
      });
      
      console.log(`Processed ${processedJournals.length} journal entries`);
      return { data: processedJournals };
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      return { data: [] };
    }
  },
  
  getMeditationStats: async (): Promise<any> => {
    try {
      console.log('Fetching meditation stats');
      // Use the real API endpoint for meditation stats
      const stats = await apiClient.get('/meditation/stats');
      
      // Ensure stats fields are properly typed
      return {
        totalSessions: typeof stats.totalSessions === 'number' ? stats.totalSessions : 0,
        totalMinutes: typeof stats.totalMinutes === 'number' ? stats.totalMinutes : 0,
        completedSessions: typeof stats.completedSessions === 'number' ? stats.completedSessions : 0,
        abandonedSessions: typeof stats.abandonedSessions === 'number' ? stats.abandonedSessions : 0,
        averageSessionLength: typeof stats.averageSessionLength === 'number' ? stats.averageSessionLength : 0,
        currentStreak: typeof stats.currentStreak === 'number' ? stats.currentStreak : 0,
        longestStreak: typeof stats.longestStreak === 'number' ? stats.longestStreak : 0,
        totalDaysActive: typeof stats.totalDaysActive === 'number' ? stats.totalDaysActive : 0,
        averageAnxietyReduction: typeof stats.averageAnxietyReduction === 'number' ? stats.averageAnxietyReduction : 0,
        completionRate: typeof stats.completionRate === 'number' ? stats.completionRate : 0,
      };
    } catch (error) {
      console.error('Error fetching meditation stats:', error);
      return {
        totalSessions: 0,
        totalMinutes: 0,
        completedSessions: 0,
        abandonedSessions: 0,
        averageSessionLength: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalDaysActive: 0,
        averageAnxietyReduction: 0,
        completionRate: 0,
      };
    }
  }
};

export {
  apiClient,
  getApiPath,
  authService,
  meditationService,
  journalService,
  subscriptionService,
  achievementsService,
};

export * from './subscriptionService';