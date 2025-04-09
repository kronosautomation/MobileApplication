import { migrateLocalJournals } from './migrateLocalJournals';
import { userPreferencesService } from '../api/userPreferencesService';
import apiClient from '../api/apiClient';

// Time between migration attempts (1 day)
const MIGRATION_INTERVAL = 24 * 60 * 60 * 1000;
const LAST_MIGRATION_ATTEMPT_KEY = '@MindfulMastery:lastMigrationAttempt';

/**
 * Perform startup tasks that need to run when the app loads
 */
export const performStartupTasks = async (): Promise<void> => {
  try {
    console.log('Performing app startup tasks...');
    
    // Check authentication status
    const isAuthenticated = await apiClient.isAuthenticated();
    
    if (isAuthenticated) {
      console.log('User is authenticated, performing authenticated startup tasks');
      
      // Get user ID
      const userId = await apiClient.getUserId();
      
      if (userId) {
        // Get app settings
        const appSettings = await userPreferencesService.getAppSettings();
        
        // Check when we last attempted migration
        const lastMigrationAttempt = appSettings[LAST_MIGRATION_ATTEMPT_KEY] || 0;
        const now = Date.now();
        
        // Only attempt migration if enough time has passed since last attempt
        if (now - lastMigrationAttempt > MIGRATION_INTERVAL) {
          console.log('Attempting to migrate local journals to backend');
          
          // Save current time as last attempt regardless of success
          await userPreferencesService.saveAppSettings({
            [LAST_MIGRATION_ATTEMPT_KEY]: now
          });
          
          // Run migration
          const result = await migrateLocalJournals();
          
          console.log('Journal migration results:', result);
        } else {
          console.log('Skipping journal migration (attempted recently)');
        }
      }
    } else {
      console.log('User is not authenticated, skipping authenticated startup tasks');
    }
    
    // Add other startup tasks here as needed
    
    console.log('App startup tasks completed');
  } catch (error) {
    console.error('Error during app startup tasks:', error);
  }
};

export default performStartupTasks;
