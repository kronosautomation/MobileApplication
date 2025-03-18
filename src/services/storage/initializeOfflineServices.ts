import { Platform } from 'react-native';
import databaseService from './databaseService';
import syncService from './syncService';
import fileService from './fileService';
import subscriptionValidator from './subscriptionValidator';
import { defineTask } from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

// Background sync task name
const BACKGROUND_SYNC_TASK = 'BACKGROUND_SYNC_TASK';

/**
 * Initialize all offline storage services
 */
export const initializeOfflineServices = async (): Promise<void> => {
  try {
    // Skip on web platform
    if (Platform.OS === 'web') {
      console.log('Offline services not fully supported on web platform');
      return;
    }

    // Initialize AsyncStorage database service first
    console.log('Initializing storage service...');
    const dbInitResult = await databaseService.initialize();
    if (!dbInitResult) {
      console.warn('Storage initialization failed, some features may not work');
    } else {
      console.log('Storage initialization successful');
    }

    // Initialize sync service
    await syncService.initialize();
    
    // Initialize subscription validator
    await subscriptionValidator.initialize();
    
    // Register background sync task
    await registerBackgroundSyncTask();
    
    console.log('Offline services initialized successfully');
  } catch (error) {
    console.error('Error initializing offline services:', error);
    // Continue even with errors to allow partial functionality
  }
};

/**
 * Register background sync task
 */
const registerBackgroundSyncTask = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  
  try {
    // Check if the task is already defined
    const isTaskDefined = await isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
    
    if (!isTaskDefined) {
      // Define the background task
      defineTask(BACKGROUND_SYNC_TASK, async () => {
        try {
          const isSyncNeeded = await syncService.isSyncNeeded();
          
          if (isSyncNeeded) {
            const { isConnected } = await import('expo-network').then(
              module => module.getNetworkStateAsync()
            );
            
            if (isConnected) {
              // Process sync queue
              await syncService.processSyncQueue();
              return BackgroundFetch.BackgroundFetchResult.NewData;
            }
          }
          
          return BackgroundFetch.BackgroundFetchResult.NoData;
        } catch (error) {
          console.error('Error in background sync task:', error);
          return BackgroundFetch.BackgroundFetchResult.Failed;
        }
      });
      
      // Register the task
      await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
        minimumInterval: 15 * 60, // 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      });
      
      console.log('Background sync task registered');
    }
  } catch (error) {
    console.error('Error registering background sync task:', error);
  }
};

/**
 * Check if a task is registered
 * @param taskName Task name
 * @returns Whether the task is registered
 */
const isTaskRegisteredAsync = async (taskName: string): Promise<boolean> => {
  try {
    const tasks = await BackgroundFetch.getRegisteredTasksAsync();
    return tasks.some(task => task.taskName === taskName);
  } catch (error) {
    console.error('Error checking registered tasks:', error);
    return false;
  }
};

export default initializeOfflineServices;
