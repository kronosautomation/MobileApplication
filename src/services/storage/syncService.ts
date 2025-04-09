import { useNetworkStatus } from '../../hooks';
import databaseService from './databaseService';
import asyncStorageService from './asyncStorageService';

// Entity types
export enum EntityType {
  MEDITATION = 'meditation',
  JOURNAL_ENTRY = 'journal_entry',
  USER_PREFERENCE = 'user_preference',
  ACHIEVEMENT = 'achievement'
}

// Sync operations
export enum SyncOperation {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete'
}

// Sync queue item interface
export interface SyncQueueItem {
  id?: number;
  entityType: EntityType;
  entityId: string;
  operation: SyncOperation;
  data?: string;
  createdAt: string;
  attempts: number;
}

// Sync result interface
export interface SyncResult {
  success: boolean;
  syncedItems: number;
  error?: string;
}

/**
 * Service for handling data synchronization between local and remote storage
 */
class SyncService {
  private isSyncing = false;
  private syncInProgress = false;
  private lastSyncTimestamp: number = 0;
  
  // Constants
  private readonly LAST_SYNC_KEY = '@MindfulMastery:lastSync';
  private readonly MAX_SYNC_ATTEMPTS = 5;
  private readonly SYNC_RETRY_DELAY = 60000; // 1 minute
  
  /**
   * Initialize the sync service
   */
  async initialize(): Promise<void> {
    try {
      // Get last sync timestamp
      const lastSync = await asyncStorageService.getData<number>(this.LAST_SYNC_KEY);
      if (lastSync) {
        this.lastSyncTimestamp = lastSync;
      }
    } catch (error) {
      console.error('Error initializing sync service:', error);
    }
  }
  
  /**
   * Add an item to the sync queue
   * @param entityType Type of entity
   * @param entityId ID of the entity
   * @param operation Operation to perform
   * @param data Data to sync (stringified JSON)
   */
  async queueForSync(
    entityType: EntityType,
    entityId: string,
    operation: SyncOperation,
    data?: any
  ): Promise<void> {
    try {
      const now = new Date().toISOString();
      const stringifiedData = data ? JSON.stringify(data) : undefined;

      // Create the new queue item
      const newItem: SyncQueueItem = {
        // ID will be implicitly handled if DatabaseService manages arrays
        // Or assign a unique ID if needed: id: Date.now() + Math.random(),
        entityType,
        entityId,
        operation,
        data: stringifiedData,
        createdAt: now,
        attempts: 0,
      };

      // Fetch current queue, add new item, save back
      const currentQueue = await databaseService.getAll<SyncQueueItem>('SYNC_QUEUE');
      currentQueue.push(newItem);
      // Assuming DatabaseService.saveItem can handle saving the whole array back under the key
      // NOTE: This assumes DatabaseService.saveItem replaces the entire value for the key.
      // If DatabaseService needs a specific method to save the whole array, adjust this call.
      // We might need a method like `databaseService.saveCollection`.
      // For now, we assume saving an item updates the *whole collection* based on the key.
      // This needs verification based on DatabaseService implementation details.
      // A safer approach might be to add a dedicated method in DatabaseService to save a collection.
      await databaseService.saveItem('SYNC_QUEUE', currentQueue as any); // Use `as any` for now, needs proper DatabaseService method

      console.log(`Added ${entityType}:${entityId} to sync queue for ${operation}`);
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      throw error;
    }
  }
  
  /**
   * Process the sync queue (should be called when connection is established)
   * @returns Promise resolving to SyncResult
   */
  async processSyncQueue(): Promise<SyncResult> {
    if (this.syncInProgress) {
      console.log('Sync already in progress.');
      return { success: false, error: 'Sync already in progress', syncedItems: 0 };
    }

    this.syncInProgress = true;
    let success = true;
    let syncedItems = 0;

    try {
      // Get items from sync queue stored in AsyncStorage
      const queueItems = await databaseService.getAll<SyncQueueItem>('SYNC_QUEUE');

      if (queueItems.length === 0) {
        console.log('Sync queue is empty.');
        this.syncInProgress = false;
        return { success: true, syncedItems: 0 };
      }

      console.log(`Processing ${queueItems.length} items in sync queue`);

      // Process items one by one for simplicity, could be parallelized
      const remainingItems: SyncQueueItem[] = [];
      for (const item of queueItems) {
        const processedSuccessfully = await this.processSyncItem(item);
        if (!processedSuccessfully) {
          remainingItems.push(item); // Keep failed/retry items
          success = false; // Mark overall process as potentially incomplete
        } else {
          syncedItems++;
        }
      }

      // Save the remaining items back to the queue
      await databaseService.saveItem('SYNC_QUEUE', remainingItems as any);

      // Update last sync timestamp only if all items were processed successfully
      if (success && remainingItems.length === 0) {
        this.lastSyncTimestamp = Date.now();
        await asyncStorageService.storeData(this.LAST_SYNC_KEY, this.lastSyncTimestamp);
        console.log('Sync queue processed successfully.');
      } else {
        console.log('Sync queue processed with some items remaining.');
      }

      return { 
        success, 
        syncedItems,
        error: success ? undefined : 'Some items failed to sync'
      };
    } catch (error) {
      console.error('Error processing sync queue:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred during sync',
        syncedItems: 0
      };
    } finally {
      this.syncInProgress = false;
    }
  }
  
  /**
   * Process a single sync queue item
   * @param item Sync queue item to process
   * @returns Promise resolving to boolean indicating if the item was successfully processed (and should be removed)
   */
  private async processSyncItem(item: SyncQueueItem): Promise<boolean> {
    try {
      // Skip items that have exceeded max attempts
      if (item.attempts >= this.MAX_SYNC_ATTEMPTS) {
        console.warn(`Sync item ${item.entityId} (${item.operation}) exceeded max attempts, removing.`);
        return true; // Remove from queue
      }

      // Increment attempt counter IN THE ITEM OBJECT (will be saved back if processing fails)
      item.attempts += 1;

      // Process based on entity type and operation
      let syncFunctionSucceeded = false;
      switch (item.entityType) {
        case EntityType.JOURNAL_ENTRY:
          syncFunctionSucceeded = await this.syncJournalEntry(item);
          break;
        case EntityType.MEDITATION:
          syncFunctionSucceeded = await this.syncMeditation(item);
          break;
        // Add other entity types as needed
        default:
          console.warn(`Unknown entity type for sync: ${item.entityType}`);
          syncFunctionSucceeded = false; // Treat as failure to be safe
      }

      // If the specific sync function succeeded, the item should be removed from the queue
      if (syncFunctionSucceeded) {
        console.log(`Successfully synced ${item.entityType}:${item.entityId} (${item.operation})`);
        return true; // Signal to remove from queue
      } else {
        console.warn(`Failed to sync ${item.entityType}:${item.entityId} (${item.operation}), attempt ${item.attempts}. Will retry.`);
        return false; // Signal to keep in queue (with updated attempts)
      }

    } catch (error) {
      console.error(`Error processing sync item ${item.entityId} (${item.operation}):`, error);
      item.attempts = item.attempts || 1; // Ensure attempts incremented even on error
      return false; // Keep item in queue on error
    }
  }
  
  /**
   * Sync a journal entry with the server
   * @param item Sync queue item
   * @returns Success status
   */
  private async syncJournalEntry(item: SyncQueueItem): Promise<boolean> {
    console.log(`Syncing journal entry ${item.entityId} with operation ${item.operation}`);
    try {
      // --- Real API call simulation --- 
      // Replace this section with actual API calls to your backend
      let apiSuccess = false;
      const entryData = item.data ? JSON.parse(item.data) : null;

      if (item.operation === SyncOperation.CREATE && entryData) {
        // await api.journal.create(entryData); // Example API call
        apiSuccess = true; // Assume success
      } else if (item.operation === SyncOperation.UPDATE && entryData) {
        // await api.journal.update(item.entityId, entryData); // Example API call
        apiSuccess = true; // Assume success
      } else if (item.operation === SyncOperation.DELETE) {
        // await api.journal.delete(item.entityId); // Example API call
        apiSuccess = true; // Assume success
      }
      // --- End API call simulation ---

      if (!apiSuccess) {
        console.warn(`API call failed for journal entry ${item.entityId} (${item.operation})`);
        return false; // API call failed, keep in queue
      }

      // Mark the entry as synced in the local AsyncStorage database
      // Only needed for CREATE/UPDATE, not DELETE
      if (item.operation !== SyncOperation.DELETE) {
        const entry = await databaseService.getById<{ id: string, isSynced?: boolean, serverUpdatedAt?: string }>(
          'JOURNAL_ENTRIES', item.entityId
        );
        if (entry) {
          entry.isSynced = true;
          entry.serverUpdatedAt = new Date().toISOString();
          await databaseService.saveItem('JOURNAL_ENTRIES', entry);
        }
      }

      return true; // API call and local update succeeded

    } catch (error) {
      console.error(`Error during syncJournalEntry for ${item.entityId}:`, error);
      return false; // Error occurred, keep in queue
    }
  }
  
  /**
   * Sync a meditation record with the server (e.g., progress)
   * @param item Sync queue item
   * @returns Success status
   */
  private async syncMeditation(item: SyncQueueItem): Promise<boolean> {
    console.log(`Syncing meditation record ${item.entityId} with operation ${item.operation}`);
    try {
      // --- Real API call simulation --- 
      // Replace with actual API calls to sync meditation progress/state
      let apiSuccess = true; // Assume success for now
      // Example: const meditationData = JSON.parse(item.data || '{}');
      // await api.meditation.updateProgress(item.entityId, meditationData);
      // --- End API call simulation ---

      if (!apiSuccess) {
        console.warn(`API call failed for meditation record ${item.entityId} (${item.operation})`);
        return false; // API call failed, keep in queue
      }

      // Mark the local meditation record as synced if necessary
      // Example: Update a specific meditation record in AsyncStorage
      // const meditation = await databaseService.getById<...>('MEDITATIONS', item.entityId);
      // if (meditation) { ... update and save ... }

      return true; // API call succeeded

    } catch (error) {
      console.error(`Error during syncMeditation for ${item.entityId}:`, error);
      return false; // Error occurred, keep in queue
    }
  }
  
  /**
   * Check if there are pending sync operations
   * @returns Promise resolving to boolean indicating if sync is needed
   */
  async isSyncNeeded(): Promise<boolean> {
    try {
      // Get all items from the sync queue stored in AsyncStorage
      const syncQueueItems = await databaseService.getAll<SyncQueueItem>('SYNC_QUEUE');
      return syncQueueItems.length > 0;
    } catch (error) {
      console.error('Error checking sync status:', error);
      return false; // Assume sync not needed or fail safely
    }
  }
  
  /**
   * Get the last sync timestamp
   * @returns Last sync timestamp
   */
  getLastSyncTimestamp(): number {
    return this.lastSyncTimestamp;
  }
  
  /**
   * Clear the sync queue (use with caution)
   */
  async clearSyncQueue(): Promise<void> {
    try {
      // Save an empty array to the SYNC_QUEUE key in AsyncStorage
      // Assuming saveItem overwrites the entire collection
      await databaseService.saveItem('SYNC_QUEUE', [] as any);
      console.log('Sync queue cleared.');
    } catch (error) {
      console.error('Error clearing sync queue:', error);
      throw error; // Rethrow the error after logging
    }
  }
}

export default new SyncService();
