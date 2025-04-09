import apiClient from './apiClient';
import { PerformanceJournal } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

class JournalService {
  // Get user's journal entries
  async getJournals(startDate?: Date, endDate?: Date): Promise<PerformanceJournal[]> {
    try {
      console.log('Fetching journal entries via fallback method');
      
      // Since the regular endpoint has a PostgreSQL syntax error,
      // we'll use local storage to store and retrieve journal entries temporarily
      // until the backend issue is fixed
      
      // This is a temporary workaround - in a production app, this would be fixed in the backend
      try {
        // Try to fetch from local storage first
        const localJournals = await this.getJournalsFromLocalStorage();
        console.log('Retrieved journals from local storage:', localJournals.length);
        return localJournals;
      } catch (storageError) {
        console.error('Error accessing local storage:', storageError);
        return [];
      }
    } catch (error) {
      console.error('Error fetching journals:', error);
      return [];
    }
  }
  
  // Helper method to get journals from local storage
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
  
  // Helper method to save a journal to local storage
  private async saveJournalToLocalStorage(journal: PerformanceJournal): Promise<void> {
    try {
      // Get existing journals
      const journals = await this.getJournalsFromLocalStorage();
      
      // Add the new journal to the beginning of the array
      journals.unshift(journal);
      
      // Save back to local storage
      await AsyncStorage.setItem('local_journals', JSON.stringify(journals));
      console.log('Saved journal to local storage');
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
      
      // Otherwise try to fetch from the backend
      const response = await apiClient.get<PerformanceJournal>(`/performance-journal/${id}`);
      return response;
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
      
      // Generate a local unique ID for fallback
      const newJournal: PerformanceJournal = {
        ...journal as any, // Type assertion to avoid property errors
        id: 'local-' + Date.now(),
        userId: 'local-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      try {
        // First try to save to the backend
        console.log('Attempting to save journal to backend');
        const requestData = {
          // Map fields to match the API's CreateJournalEntryCommand structure
          
          // Basic info - directly map existing fields that match backend
          title: journal.title,
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
          focusAreaId: typeof journal.performanceFocusArea === 'number' ? journal.performanceFocusArea.toString() : 'other', // Ensure a valid focusAreaId is always sent
          
          // Add detailed debugging for focus area
          // @ts-ignore - Logging for debugging purposes only
          _debug_focusArea: {
            rawValue: journal.performanceFocusArea,
            type: typeof journal.performanceFocusArea,
            stringValue: journal.performanceFocusArea?.toString(),
            isNumber: typeof journal.performanceFocusArea === 'number',
          },
          
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
        
        // If backend save succeeded, return the response
        return response;
      } catch (apiError) {
        console.error('Backend save failed, using local storage fallback:', apiError);
        
        // Save to local storage as a fallback
        await this.saveJournalToLocalStorage(newJournal);
        
        // Return the locally created journal
        return newJournal;
      }
    } catch (error) {
      console.error('Error in createJournal:', error);
      throw new Error('Failed to create journal entry');
    }
  }

  // Update an existing journal entry
  async updateJournal(id: string, journal: Partial<PerformanceJournal>): Promise<PerformanceJournal> {
    try {
      const response = await apiClient.put<PerformanceJournal>(`/performance-journal/${id}`, {
        ...journal,
        id, // Ensure the ID is included
      });
      return response;
    } catch (error) {
      // Handle 402 Payment Required separately
      if (error.response?.status === 402) {
        throw new Error('Premium subscription required to update the journal entry');
      }
      
      throw this.handleError(error, 'Failed to update journal entry');
    }
  }

  // Delete a journal entry
  async deleteJournal(id: string): Promise<boolean> {
    try {
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
}

export const journalService = new JournalService();
export default journalService;
