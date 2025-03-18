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
      
      await databaseService.executeInsert(
        `INSERT INTO sync_queue (entityType, entityId, operation, data, createdAt, attempts)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [entityType, entityId, operation, stringifiedData, now, 0]
      );
      
      console.log(`Added ${entityType}:${entityId} to sync queue for ${operation}`);
    } catch (error) {
      console.error('Error adding to sync queue:', error);
      throw error;
    }
  }
  
  /**
   * Process the sync queue (should be called when connection is established)
   * @returns Promise resolving to success status
   */
  async processSyncQueue(): Promise<boolean> {
    // Prevent multiple sync operations
    if (this.syncInProgress) {
      return false;
    }
    
    this.syncInProgress = true;
    
    try {
      // Get items from sync queue ordered by creation date
      const queueItems = await databaseService.executeQuery<SyncQueueItem>(
        `SELECT * FROM sync_queue ORDER BY createdAt ASC`
      );
      
      if (queueItems.length === 0) {
        this.syncInProgress = false;
        return true;
      }
      
      console.log(`Processing ${queueItems.length} items in sync queue`);
      
      // Process each item
      const processPromises = queueItems.map(item => this.processSyncItem(item));
      await Promise.all(processPromises);
      
      // Update last sync timestamp
      this.lastSyncTimestamp = Date.now();
      await asyncStorageService.storeData(this.LAST_SYNC_KEY, this.lastSyncTimestamp);
      
      this.syncInProgress = false;
      return true;
    } catch (error) {
      console.error('Error processing sync queue:', error);
      this.syncInProgress = false;
      return false;
    }
  }
  
  /**
   * Process a single sync queue item
   * @param item Sync queue item to process
   */
  private async processSyncItem(item: SyncQueueItem): Promise<void> {
    try {
      // Skip items that have exceeded max attempts
      if (item.attempts >= this.MAX_SYNC_ATTEMPTS) {
        console.warn(`Sync item ${item.id} exceeded max attempts, removing from queue`);
        await databaseService.executeUpdate(
          `DELETE FROM sync_queue WHERE id = ?`,
          [item.id]
        );
        return;
      }
      
      // Increment attempt counter
      await databaseService.executeUpdate(
        `UPDATE sync_queue SET attempts = attempts + 1 WHERE id = ?`,
        [item.id]
      );
      
      // Process based on entity type and operation
      let success = false;
      
      switch (item.entityType) {
        case EntityType.JOURNAL_ENTRY:
          success = await this.syncJournalEntry(item);
          break;
        case EntityType.MEDITATION:
          success = await this.syncMeditation(item);
          break;
        // Add other entity types as needed
        default:
          console.warn(`Unknown entity type: ${item.entityType}`);
          success = false;
      }
      
      // If successful, remove from queue
      if (success && item.id) {
        await databaseService.executeUpdate(
          `DELETE FROM sync_queue WHERE id = ?`,
          [item.id]
        );
      }
    } catch (error) {
      console.error(`Error processing sync item ${item.id}:`, error);
    }
  }
  
  /**
   * Sync a journal entry with the server
   * @param item Sync queue item
   * @returns Success status
   */
  private async syncJournalEntry(item: SyncQueueItem): Promise<boolean> {
    // This would call the journal API service to sync the entry
    // For now, we'll just mock the implementation
    console.log(`Syncing journal entry ${item.entityId} with operation ${item.operation}`);
    
    // In a real implementation, this would call the appropriate API service
    // For example:
    // if (item.operation === SyncOperation.CREATE) {
    //   const data = JSON.parse(item.data || '{}');
    //   await journalService.createJournalEntry(data);
    // }
    
    // Mark the entry as synced in the local database
    if (item.operation !== SyncOperation.DELETE) {
      await databaseService.executeUpdate(
        `UPDATE journal_entries SET isSynced = 1, serverUpdatedAt = ? WHERE id = ?`,
        [new Date().toISOString(), item.entityId]
      );
    }
    
    return true; // Assume success for this example
  }
  
  /**
   * Sync a meditation with the server
   * @param item Sync queue item
   * @returns Success status
   */
  private async syncMeditation(item: SyncQueueItem): Promise<boolean> {
    // This would be implemented to handle meditation syncing
    // For example, updating progress, ratings, etc.
    console.log(`Syncing meditation ${item.entityId} with operation ${item.operation}`);
    
    return true; // Assume success for this example
  }
  
  /**
   * Check if there are pending sync operations
   * @returns Promise resolving to boolean indicating if sync is needed
   */
  async isSyncNeeded(): Promise<boolean> {
    try {
      const count = await databaseService.executeQuery<{ count: number }>(
        `SELECT COUNT(*) as count FROM sync_queue`
      );
      return count[0]?.count > 0;
    } catch (error) {
      console.error('Error checking sync status:', error);
      return false;
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
      await databaseService.executeUpdate(`DELETE FROM sync_queue`);
      console.log('Sync queue cleared');
    } catch (error) {
      console.error('Error clearing sync queue:', error);
      throw error;
    }
  }
}

export default new SyncService();
