import apiClient from './apiClient';
import { PerformanceJournal, PerformanceFocusArea } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import userProfileService from './userProfileService';

// Storage keys
const APP_PREFERENCES_KEY = '@MindfulMastery:appPreferences';

class JournalService {
  // Get user's journal entries
  async getJournals(startDate?: Date, endDate?: Date): Promise<PerformanceJournal[]> {
    try {
      console.log('Fetching journal entries from API');
      
      // Build query parameters
      let queryParams = new URLSearchParams();
      if (startDate) {
        queryParams.append('startDate', startDate.toISOString());
      }
      if (endDate) {
        queryParams.append('endDate', endDate.toISOString());
      }
      
      // Fetch from API
      const queryString = queryParams.toString();
      const url = `/performance-journal${queryString ? `?${queryString}` : ''}`;
      
      try {
        const response = await apiClient.get(url);
        console.log('Retrieved journals from API:', response.entries?.length || 0);
        
        // The API response has the format { entries: PerformanceJournal[] }
        if (response.entries && Array.isArray(response.entries)) {
          // Map the backend fields to match the frontend interface
          console.log('First raw journal entry from API:', response.entries[0]);
          
          return response.entries.map((entry: any) => {
          // Parse anxiety level and confidence level as numbers
          // Log the raw values for debugging
          console.log(`Raw journal data - id: ${entry.id}, anxietyLevel: ${entry.anxietyLevel} (type: ${typeof entry.anxietyLevel}), confidenceLevel: ${entry.confidenceLevel} (type: ${typeof entry.confidenceLevel})`);
          
          // Ensure we're working with number values for levels
          const anxietyLevel = typeof entry.anxietyLevel === 'number' ? entry.anxietyLevel : 
                               entry.anxietyLevel ? parseInt(String(entry.anxietyLevel), 10) : 5;
          
          const confidenceLevel = typeof entry.confidenceLevel === 'number' ? entry.confidenceLevel :
                                  entry.confidenceLevel ? parseInt(String(entry.confidenceLevel), 10) : 5;
          
          // Create a meaningful title if not provided
          const entryDate = new Date(entry.date || entry.createdAt);
          const defaultTitle = `Journal Entry - ${entryDate.toLocaleDateString()}`;
            
            // Make sure we have a valid title - explicitly log it for debugging
            const title = entry.title || defaultTitle;
            console.log(`Processed journal ${entry.id}: title="${title}", anxietyLevel=${anxietyLevel}, confidenceLevel=${confidenceLevel}`);
            
            return {
              id: entry.id,
              userId: entry.userId || 'unknown',
              title: title,
              content: entry.situation || entry.thoughts || entry.reflection || 'No content',
              situation: entry.situation,
              thoughts: entry.thoughts,
              physicalSensations: entry.physicalSensations,
              actions: entry.actions,
              outcome: entry.outcome,
              reflection: entry.reflection,
              anxietyLevel: anxietyLevel,
              confidenceLevel: confidenceLevel,
              performanceFocusArea: entry.focusAreaId ? this.mapIdToFocusArea(entry.focusAreaId) : PerformanceFocusArea.Other,
              emotions: entry.emotions || [],
              techniquesUsed: entry.techniquesUsed || [],
              isPrivate: !entry.isPublic,
              createdAt: entry.createdAt,
              updatedAt: entry.updatedAt
            };
          });
        }
        return [];
      } catch (apiError) {
        console.error('Error fetching journals from API:', apiError);
        
        // Try to recover locally saved journals as a fallback for network errors only
        try {
          const localJournals = await this.getJournalsFromLocalStorage();
          console.log('Fallback: Retrieved journals from local storage:', localJournals.length);
          return localJournals;
        } catch (storageError) {
          console.error('Error accessing local storage:', storageError);
          return [];
        }
      }
    } catch (error) {
      console.error('Error in getJournals:', error);
      return [];
    }
  }
  
  // Helper method to get locally saved journals (fallback only)
  private async getJournalsFromLocalStorage(): Promise<PerformanceJournal[]> {
    try {
      const journalsJson = await AsyncStorage.getItem('local_journals');
      if (journalsJson) {
        return JSON.parse(journalsJson);
      }
      return [];
    } catch (error) {
      console.error('Error reading from local storage:', error);
      return [];
    }
  }
  
  // Helper method to save a journal to local storage (fallback only)
  private async saveJournalToLocalStorage(journal: PerformanceJournal): Promise<void> {
    try {
      // Get existing journals
      const journals = await this.getJournalsFromLocalStorage();
      
      // Add the new journal to the beginning of the array
      journals.unshift(journal);
      
      // Save back to local storage
      await AsyncStorage.setItem('local_journals', JSON.stringify(journals));
      console.log('Saved journal to local storage as fallback');
    } catch (error) {
      console.error('Error saving to local storage:', error);
    }
  }

  // Get a single journal entry by ID
  async getJournalById(id: string): Promise<PerformanceJournal> {
    try {
      // Check if this is a local ID (starts with 'local-')
      if (id.startsWith('local-')) {
        // Retrieve from local storage
        const journals = await this.getJournalsFromLocalStorage();
        const journal = journals.find(j => j.id === id);
        
        if (!journal) {
          throw new Error('Journal entry not found in local storage');
        }
        
        return journal;
      }
      
      // Otherwise fetch from the backend
      const response = await apiClient.get<any>(`/performance-journal/${id}`);
      console.log('Raw journal detail response:', response);

      // Log the raw values for debugging
      console.log(`Raw journal detail data - id: ${id}, anxietyLevel: ${response.anxietyLevel} (type: ${typeof response.anxietyLevel}), confidenceLevel: ${response.confidenceLevel} (type: ${typeof response.confidenceLevel}), title: ${response.title} (type: ${typeof response.title})`);
      
      // Parse anxiety level and confidence level as numbers
      const anxietyLevel = typeof response.anxietyLevel === 'number' ? response.anxietyLevel : 
                           response.anxietyLevel ? parseInt(String(response.anxietyLevel), 10) : 5;

      const confidenceLevel = typeof response.confidenceLevel === 'number' ? response.confidenceLevel :
                              response.confidenceLevel ? parseInt(String(response.confidenceLevel), 10) : 5;

      // Create a meaningful title if not provided
      const entryDate = new Date(response.date || response.createdAt);
      const defaultTitle = `Journal Entry - ${entryDate.toLocaleDateString()}`;
      
      // Make sure we have a valid title - explicitly log it for debugging
      const title = response.title || defaultTitle;
      console.log(`Processed journal detail ${id}: title="${title}", anxietyLevel=${anxietyLevel}, confidenceLevel=${confidenceLevel}`);

      // Construct a journal object with consistent property types
      const journalData: PerformanceJournal = {
        id: response.id,
        userId: response.userId || 'unknown',
        title: title,
        content: response.situation || response.thoughts || response.reflection || 'No content',
        situation: response.situation,
        thoughts: response.thoughts,
        physicalSensations: response.physicalSensations,
        actions: response.actions,
        outcome: response.outcome,
        reflection: response.reflection,
        anxietyLevel: anxietyLevel,
        confidenceLevel: confidenceLevel,
        performanceFocusArea: response.focusAreaId ? this.mapIdToFocusArea(response.focusAreaId) : PerformanceFocusArea.Other,
        emotions: response.emotions || [],
        techniquesUsed: response.techniquesUsed || [],
        isPrivate: !response.isPublic,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt
      };

      return journalData;
    } catch (error) {
      console.error(`Error getting journal entry ${id}:`, error);
      throw new Error('Failed to fetch journal entry');
    }
  }

  // Create a new journal entry
  async createJournal(journal: Omit<PerformanceJournal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<PerformanceJournal> {
    try {
      // Log the incoming journal data
      console.log('Creating journal entry with data:', journal);
      
      // Check subscription status
      const subscriptionJson = await AsyncStorage.getItem('@MindfulMastery:subscription');
      const subscription = subscriptionJson ? JSON.parse(subscriptionJson) : { tier: 'Free' };
      
      if (subscription.tier === 'Free') {
        // For free tier, check the number of entries this month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        // Get entries for the current month
        const entries = await this.getJournals(startOfMonth, endOfMonth);
        console.log(`Found ${entries.length} entries for the current month`);
        
        if (entries.length >= 5) {
          throw new Error('You have reached the monthly limit of 5 journal entries. Please upgrade to Premium to create more entries.');
        }
      }
      
      // Generate a local unique ID for fallback
      const newJournal: PerformanceJournal = {
        ...journal as any, // Type assertion to avoid property errors
        id: 'local-' + Date.now(),
        userId: 'local-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      try {
        // Try to save to the backend
        console.log('Attempting to save journal to backend');
        const requestData = {
          // Map fields to match the API's CreateJournalEntryCommand structure
          
          // Basic info - directly map existing fields that match backend
          title: journal.title || `Journal Entry - ${new Date().toLocaleDateString()}`, // Ensure title is sent
          date: journal.date || new Date().toISOString(),
          anxietyLevel: journal.anxietyLevel || 5,
          confidenceLevel: journal.confidenceLevel || 5,
          isPublic: journal.isPrivate === false, // Convert isPrivate to isPublic
          
          // CBT framework fields
          situation: journal.situation,
          thoughts: journal.thoughts,
          physicalSensations: journal.physicalSensations,
          actions: journal.actions,
          outcome: journal.outcome,
          reflection: journal.reflection,
          
          // Arrays - ensure they're always defined
          emotions: Array.isArray(journal.emotions) ? journal.emotions : [],
          techniquesUsed: Array.isArray(journal.techniquesUsed) ? journal.techniquesUsed : [],
          
          // Performance focus
          focusAreaId: typeof journal.performanceFocusArea === 'number' ? this.mapFocusAreaToId(journal.performanceFocusArea) : null,
          
          // Additional fields
          event: journal.event,
          eventDate: journal.eventDate,
          
          // Coping strategies - convert to proper format for backend
          copingStrategies: Array.isArray(journal.copingStrategies) ? journal.copingStrategies : [],
        };

        // Log the outgoing request data
        console.log('Sending to API:', requestData);
        
        const response = await apiClient.post<PerformanceJournal>('/performance-journal', requestData);
        console.log('Received response from API:', response);
        
        // Update local user stats
        try {
          await userProfileService.updateStatsAfterJournalEntry();
        } catch (statsError) {
          console.error('Error updating local user stats:', statsError);
          // Don't fail the operation if stats update fails
        }
        
        // If backend save succeeded, return the response
        return response;
      } catch (apiError) {
        console.error('Backend save failed, using local storage fallback:', apiError);
        
        // Only use local storage as a fallback for network errors
        await this.saveJournalToLocalStorage(newJournal);
        
        // Update local user stats even for local journal entries
        try {
          await userProfileService.updateStatsAfterJournalEntry();
        } catch (statsError) {
          console.error('Error updating local user stats for local journal:', statsError);
        }
        
        // Return the locally created journal
        return newJournal;
      }
    } catch (error) {
      console.error('Error in createJournal:', error);
      throw new Error('Failed to create journal entry');
    }
  }

  // Map focus area enum to server-side ID
  private mapFocusAreaToId(focusArea: number): string {
    // Map the enum values to the database IDs
    const focusAreaMap: Record<number, string> = {
      0: 'fa-01', // PublicSpeaking
      1: 'fa-03', // Sports
      2: 'fa-04', // SexualPerformance (mapped to Creative Performance)
      3: 'fa-06', // WorkPresentation
      4: 'fa-07', // SocialAnxiety
      5: 'fa-05', // TestTaking
      6: 'fa-02', // JobInterview
      7: 'fa-15', // Other
    };
    
    return focusAreaMap[focusArea] || 'fa-15';
  }
  
  // Get available focus areas from backend
  async getFocusAreas(): Promise<any[]> {
    try {
      const response = await apiClient.get<any[]>('/performance-focus-areas');
      return response;
    } catch (error) {
      console.error('Error fetching focus areas:', error);
      // Return default focus areas if API call fails
      return [
        { id: 'fa-01', name: 'Public Speaking', description: 'Presentations, speeches, and verbal communication in front of audiences' },
        { id: 'fa-02', name: 'Job Interviews', description: 'Preparation and performance during employment interviews' },
        { id: 'fa-03', name: 'Sports', description: 'Athletic competitions and physical performance activities' },
        { id: 'fa-04', name: 'Creative Performance', description: 'Music, acting, dance, and other performing arts' },
        { id: 'fa-05', name: 'Academic Testing', description: 'Exams, standardized tests, and educational assessments' },
        { id: 'fa-06', name: 'Work Presentations', description: 'Delivering professional presentations in workplace settings' },
        { id: 'fa-07', name: 'Social Situations', description: 'Navigating social events, networking, and interpersonal interactions' },
        { id: 'fa-15', name: 'Other', description: 'Other performance situations not listed' }
      ];
    }
  }

  // Update an existing journal entry
  async updateJournal(id: string, journal: Partial<PerformanceJournal>): Promise<PerformanceJournal> {
    try {
      const response = await apiClient.put<PerformanceJournal>(`/performance-journal/${id}`, {
        ...journal,
        id, // Ensure the ID is included
      });
      
      // Update local user stats
      try {
        await userProfileService.updateStatsAfterJournalEntry();
      } catch (statsError) {
        console.error('Error updating local user stats after journal update:', statsError);
        // Don't fail the operation if stats update fails
      }
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to update journal entry');
    }
  }

  // Delete a journal entry
  async deleteJournal(id: string): Promise<boolean> {
    try {
      // Special handling for local entries
      if (id.startsWith('local-')) {
        const journals = await this.getJournalsFromLocalStorage();
        const updatedJournals = journals.filter(j => j.id !== id);
        await AsyncStorage.setItem('local_journals', JSON.stringify(updatedJournals));
        return true;
      }
      
      // Otherwise delete from the API
      await apiClient.delete(`/performance-journal/${id}`);
      return true;
    } catch (error) {
      throw this.handleError(error, 'Failed to delete journal entry');
    }
  }

  // Helper method to handle errors
  private handleError(error: any, defaultMessage: string): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return new Error(defaultMessage);
  }
  
  // Application preferences (to be stored in local storage)
  
  // Save application preferences to local storage
  async saveAppPreferences(preferences: any): Promise<void> {
    try {
      await AsyncStorage.setItem(APP_PREFERENCES_KEY, JSON.stringify(preferences));
      console.log('Saved app preferences to local storage');
    } catch (error) {
      console.error('Error saving app preferences:', error);
      throw new Error('Failed to save preferences');
    }
  }
  
  // Get application preferences from local storage
  async getAppPreferences(): Promise<any> {
    try {
      const preferencesJson = await AsyncStorage.getItem(APP_PREFERENCES_KEY);
      if (preferencesJson) {
        return JSON.parse(preferencesJson);
      }
      return {};
    } catch (error) {
      console.error('Error getting app preferences:', error);
      return {};
    }
  }

  // Helper to map focus area IDs to the enum
  private mapIdToFocusArea(focusAreaId: string): PerformanceFocusArea {
    // Map the database IDs to enum values
    const focusAreaMap: Record<string, PerformanceFocusArea> = {
      'fa-01': PerformanceFocusArea.PublicSpeaking,
      'fa-03': PerformanceFocusArea.Sports,
      'fa-04': PerformanceFocusArea.SexualPerformance,
      'fa-06': PerformanceFocusArea.WorkPresentation,
      'fa-07': PerformanceFocusArea.SocialAnxiety,
      'fa-05': PerformanceFocusArea.TestTaking,
      'fa-02': PerformanceFocusArea.JobInterview,
      'fa-15': PerformanceFocusArea.Other
    };
    
    return focusAreaMap[focusAreaId] || PerformanceFocusArea.Other;
  }
}

export const journalService = new JournalService();
export default journalService;
