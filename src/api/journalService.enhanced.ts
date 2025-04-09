import apiClient from './apiClient';
import { PerformanceJournal } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSubscription } from '../hooks/useSubscription';
import { SubscriptionTier } from '../types';

// Storage key for local journals
const LOCAL_JOURNALS_KEY = '@MindfulMastery:local_journals';

class JournalService {
  private subscriptionService: any;

  constructor() {
    // We'll get the subscription status directly when needed
    this.subscriptionService = null;
  }

  // Check if the user has a premium subscription
  private async isPremiumUser(): Promise<boolean> {
    try {
      // Get subscription status from storage
      const subscriptionJson = await AsyncStorage.getItem('@MindfulMastery:subscription');
      if (subscriptionJson) {
        const subscription = JSON.parse(subscriptionJson);
        return subscription.tier === SubscriptionTier.Premium;
      }
      return false;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false; // Default to free tier on error
    }
  }

  // Get user's journal entries
  async getJournals(startDate?: Date, endDate?: Date): Promise<PerformanceJournal[]> {
    try {
      console.log('Fetching journal entries');
      
      const isPremium = await this.isPremiumUser();
      
      // For premium users, try to get from backend first
      if (isPremium) {
        try {
          let url = '/performance-journal';
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
          
          console.log('Premium user - fetching from API:', url);
          const response = await apiClient.get<PerformanceJournal[]>(url);
          console.log('API returned', response?.length || 0, 'entries');
          
          // Get local entries too and combine them
          const localEntries = await this.getJournalsFromLocalStorage();
          console.log('Local storage has', localEntries.length, 'entries');
          
          // Combine and deduplicate entries
          const allEntries = [...response, ...localEntries];
          const uniqueEntries = this.deduplicateEntries(allEntries);
          
          return this.transformEntries(uniqueEntries);
        } catch (error) {
          console.error('Backend fetch failed, falling back to local storage:', error);
          // Fall back to local storage
          return this.getJournalsFromLocalStorage();
        }
      } else {
        // For free users, only get from local storage
        console.log('Free user - fetching from local storage only');
        return this.getJournalsFromLocalStorage();
      }
    } catch (error) {
      console.error('Error fetching journals:', error);
      return []; // Return empty array as a fallback
    }
  }
  
  // Helper method to get journals from local storage
  private async getJournalsFromLocalStorage(): Promise<PerformanceJournal[]> {
    try {
      const journalsJson = await AsyncStorage.getItem(LOCAL_JOURNALS_KEY);
      if (journalsJson) {
        return JSON.parse(journalsJson);
      }
      return [];
    } catch (error) {
      console.error('Error reading from local storage:', error);
      return [];
    }
  }
  
  // Helper method to save journal to local storage
  private async saveJournalToLocalStorage(journal: PerformanceJournal): Promise<void> {
    try {
      // Get existing journals
      const journals = await this.getJournalsFromLocalStorage();
      
      // Add the new journal to the beginning of the array
      journals.unshift(journal);
      
      // Save back to local storage
      await AsyncStorage.setItem(LOCAL_JOURNALS_KEY, JSON.stringify(journals));
      console.log('Saved journal to local storage');
    } catch (error) {
      console.error('Error saving to local storage:', error);
    }
  }
  
  // Helper to deduplicate entries by ID
  private deduplicateEntries(entries: PerformanceJournal[]): PerformanceJournal[] {
    const uniqueEntries: {[key: string]: PerformanceJournal} = {};
    
    entries.forEach(entry => {
      uniqueEntries[entry.id] = entry;
    });
    
    return Object.values(uniqueEntries);
  }
  
  // Helper to transform entries for frontend
  private transformEntries(entries: PerformanceJournal[]): PerformanceJournal[] {
    return entries.map(entry => ({
      ...entry,
      // Map backend fields to frontend fields
      title: entry.title || entry.situation,
      content: entry.content || entry.thoughts
    }));
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
      const isPremium = await this.isPremiumUser();
      
      if (isPremium) {
        try {
          const response = await apiClient.get<PerformanceJournal>(`/performance-journal/${id}`);
          return this.transformEntries([response])[0];
        } catch (error) {
          console.error(`Error fetching journal ${id} from API:`, error);
          throw new Error('Failed to fetch journal entry from server');
        }
      } else {
        throw new Error('Premium subscription required to access server-stored journals');
      }
    } catch (error) {
      console.error(`Error getting journal entry ${id}:`, error);
      throw error;
    }
  }

  // Create a new journal entry
  async createJournal(journal: Omit<PerformanceJournal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<PerformanceJournal> {
    try {
      console.log('Creating journal entry with data:', journal);
      
      // Check subscription status first
      const isPremium = await this.isPremiumUser();
      
      // Generate a local unique ID
      const newJournal: PerformanceJournal = {
        ...journal as any, // Type assertion to avoid property errors
        id: (isPremium ? 'remote-' : 'local-') + Date.now(),
        userId: 'user-' + Date.now(), // This will be overwritten by the backend
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // For premium users, try to save to backend
      if (isPremium) {
        try {
          console.log('Premium user - attempting to save to backend');
          
          // Map frontend fields to backend fields
          const requestData = {
            situation: journal.title,
            thoughts: journal.content,
            anxietyLevel: journal.anxietyLevel,
            confidenceLevel: journal.confidenceLevel,
            emotions: Array.isArray(journal.emotions) ? journal.emotions : [],
            techniquesUsed: Array.isArray(journal.techniquesUsed) ? journal.techniquesUsed : [],
            date: new Date().toISOString(),
            isPublic: journal.isPrivate === false,
            
            // Premium fields
            eventName: journal.event,
            eventDate: journal.eventDate,
            triggers: journal.triggers,
            copingStrategies: journal.copingStrategies
          };

          const response = await apiClient.post<PerformanceJournal>('/performance-journal', requestData);
          console.log('Backend save successful:', response);
          
          return response;
        } catch (apiError) {
          console.error('Backend save failed, using local storage fallback:', apiError);
          
          // Save to local storage as a fallback
          await this.saveJournalToLocalStorage(newJournal);
          
          // Return the locally created journal
          return newJournal;
        }
      } else {
        console.log('Free user - saving to local storage only');
        
        // For free users, only save locally
        await this.saveJournalToLocalStorage(newJournal);
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
      // Check if this is a local entry
      if (id.startsWith('local-')) {
        return this.updateLocalJournal(id, journal);
      }
      
      // Otherwise, it's a remote entry
      const isPremium = await this.isPremiumUser();
      
      if (isPremium) {
        try {
          const response = await apiClient.put<PerformanceJournal>(`/performance-journal/${id}`, {
            ...journal,
            id,
          });
          return response;
        } catch (error) {
          console.error(`Error updating remote journal ${id}:`, error);
          throw new Error('Failed to update journal on server');
        }
      } else {
        throw new Error('Premium subscription required to update server-stored journals');
      }
    } catch (error) {
      console.error(`Error updating journal ${id}:`, error);
      throw error;
    }
  }
  
  // Helper to update a local journal entry
  private async updateLocalJournal(id: string, journal: Partial<PerformanceJournal>): Promise<PerformanceJournal> {
    try {
      const journals = await this.getJournalsFromLocalStorage();
      const index = journals.findIndex(j => j.id === id);
      
      if (index === -1) {
        throw new Error('Journal entry not found in local storage');
      }
      
      // Update the journal entry
      journals[index] = {
        ...journals[index],
        ...journal,
        updatedAt: new Date().toISOString()
      };
      
      // Save back to local storage
      await AsyncStorage.setItem(LOCAL_JOURNALS_KEY, JSON.stringify(journals));
      
      return journals[index];
    } catch (error) {
      console.error(`Error updating local journal ${id}:`, error);
      throw error;
    }
  }

  // Delete a journal entry
  async deleteJournal(id: string): Promise<boolean> {
    try {
      // Check if this is a local entry
      if (id.startsWith('local-')) {
        return this.deleteLocalJournal(id);
      }
      
      // Otherwise, it's a remote entry
      const isPremium = await this.isPremiumUser();
      
      if (isPremium) {
        try {
          await apiClient.delete(`/performance-journal/${id}`);
          return true;
        } catch (error) {
          console.error(`Error deleting remote journal ${id}:`, error);
          throw new Error('Failed to delete journal from server');
        }
      } else {
        throw new Error('Premium subscription required to delete server-stored journals');
      }
    } catch (error) {
      console.error(`Error deleting journal ${id}:`, error);
      throw error;
    }
  }
  
  // Helper to delete a local journal entry
  private async deleteLocalJournal(id: string): Promise<boolean> {
    try {
      const journals = await this.getJournalsFromLocalStorage();
      const filteredJournals = journals.filter(j => j.id !== id);
      
      if (journals.length === filteredJournals.length) {
        // No journal was removed
        return false;
      }
      
      // Save back to local storage
      await AsyncStorage.setItem(LOCAL_JOURNALS_KEY, JSON.stringify(filteredJournals));
      
      return true;
    } catch (error) {
      console.error(`Error deleting local journal ${id}:`, error);
      throw error;
    }
  }
}

export const journalService = new JournalService();
export default journalService;
