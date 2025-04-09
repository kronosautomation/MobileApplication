import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/apiClient';
import { PerformanceJournal, PerformanceFocusArea } from '../types';

// Map focus area enum to server-side ID
const mapFocusAreaToId = (focusArea: number): string => {
  // Map the enum values to the database IDs
  const focusAreaMap = {
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
};

// Get locally stored journal entries
const getLocalJournals = async (): Promise<PerformanceJournal[]> => {
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
};

// Save journal to backend
const saveJournalToBackend = async (journal: PerformanceJournal): Promise<boolean> => {
  try {
    const requestData = {
      // Map fields to match the API's CreateJournalEntryCommand structure
      title: journal.title,
      date: journal.date || journal.createdAt,
      anxietyLevel: journal.anxietyLevel,
      confidenceLevel: journal.confidenceLevel,
      isPublic: !journal.isPrivate,
      
      // CBT framework fields
      situation: journal.situation,
      thoughts: journal.thoughts,
      physicalSensations: journal.physicalSensations,
      actions: journal.actions,
      outcome: journal.outcome,
      reflection: journal.reflection,
      
      // Arrays
      emotions: Array.isArray(journal.emotions) ? journal.emotions : [],
      techniquesUsed: Array.isArray(journal.techniquesUsed) ? journal.techniquesUsed : [],
      
      // Performance focus
      focusAreaId: typeof journal.performanceFocusArea === 'number' ? 
        mapFocusAreaToId(journal.performanceFocusArea) : 'fa-15',
      
      // Additional fields
      event: journal.event,
      eventDate: journal.eventDate,
      
      // Coping strategies
      copingStrategies: Array.isArray(journal.copingStrategies) ? journal.copingStrategies : [],
    };
    
    await apiClient.post('/performance-journal', requestData);
    return true;
  } catch (error) {
    console.error('Error saving journal to backend:', error);
    return false;
  }
};

// Migrate all local journals to the backend
export const migrateLocalJournals = async (): Promise<{
  total: number;
  migrated: number;
  failed: number;
}> => {
  try {
    // Make sure we're authenticated before attempting migration
    const isAuthenticated = await apiClient.isAuthenticated();
    if (!isAuthenticated) {
      console.error('Cannot migrate journals: Not authenticated');
      return { total: 0, migrated: 0, failed: 0 };
    }
    
    // Get all local journals
    const localJournals = await getLocalJournals();
    
    if (localJournals.length === 0) {
      console.log('No local journals to migrate');
      return { total: 0, migrated: 0, failed: 0 };
    }
    
    console.log(`Found ${localJournals.length} local journals to migrate`);
    
    // Attempt to migrate each journal
    let migratedCount = 0;
    let failedCount = 0;
    
    for (const journal of localJournals) {
      const success = await saveJournalToBackend(journal);
      if (success) {
        migratedCount++;
      } else {
        failedCount++;
      }
    }
    
    // If all journals were successfully migrated, clear local storage
    if (failedCount === 0) {
      await AsyncStorage.removeItem('local_journals');
      console.log('All journals migrated successfully, local storage cleared');
    } else {
      // Filter out successfully migrated journals
      const remainingJournals = localJournals.filter((_, index) => {
        const journalIndex = localJournals.length - 1 - index;
        return journalIndex >= migratedCount;
      });
      
      // Save remaining journals back to local storage
      await AsyncStorage.setItem('local_journals', JSON.stringify(remainingJournals));
      console.log(`${migratedCount} journals migrated, ${failedCount} failed, local storage updated`);
    }
    
    return {
      total: localJournals.length,
      migrated: migratedCount,
      failed: failedCount,
    };
  } catch (error) {
    console.error('Error during journal migration:', error);
    return { total: 0, migrated: 0, failed: 0 };
  }
};

export default migrateLocalJournals;
