import NetInfo from '@react-native-community/netinfo';
import databaseService from '../storage/databaseService';
import { Alert } from 'react-native';
import { validateSyncQueueItem } from '../../utils/validation';
import { SyncQueueItem, SyncResult } from '../../types/settings';
import { debounce } from 'lodash';

class SyncService {
  private static instance: SyncService;
  private databaseService: typeof databaseService;
  private isOnline: boolean = false;
  private syncQueue: SyncQueueItem[] = [];
  private isProcessing: boolean = false;
  private readonly BATCH_SIZE = 10;
  private readonly SYNC_INTERVAL = 5000; // 5 seconds

  private constructor() {
    this.databaseService = databaseService;
    this.initializeNetworkListener();
    this.startSyncInterval();
  }

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private initializeNetworkListener() {
    NetInfo.addEventListener((state: { isConnected: boolean | null }) => {
      this.isOnline = state.isConnected ?? false;
      if (this.isOnline && this.syncQueue.length > 0) {
        this.processSyncQueue();
      }
    });
  }

  private startSyncInterval() {
    setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0 && !this.isProcessing) {
        this.processSyncQueue();
      }
    }, this.SYNC_INTERVAL);
  }

  public async initialize(): Promise<SyncResult> {
    try {
      const savedQueue = await this.databaseService.getItem<SyncQueueItem[]>('SYNC_QUEUE');
      if (savedQueue) {
        // Validate all items in the queue
        const validItems = savedQueue.filter(item => {
          const validation = validateSyncQueueItem(item);
          if (!validation.isValid) {
            console.warn('Invalid sync queue item:', validation.error);
          }
          return validation.isValid;
        });
        this.syncQueue = validItems;
      }

      const networkState = await NetInfo.fetch();
      this.isOnline = networkState.isConnected ?? false;

      return { success: true };
    } catch (error) {
      console.error('Error initializing sync service:', error);
      return { success: false, error: 'Failed to initialize sync service' };
    }
  }

  private processBatch = debounce(async (items: SyncQueueItem[]): Promise<SyncResult> => {
    let syncedItems = 0;
    const errors: string[] = [];

    for (const item of items) {
      try {
        switch (item.type) {
          case 'meditation':
            await this.syncMeditation(item);
            break;
          case 'journal':
            await this.syncJournal(item);
            break;
          case 'settings':
            await this.syncSettings(item);
            break;
        }
        syncedItems++;
      } catch (error) {
        console.error(`Error syncing item ${item.id}:`, error);
        errors.push(`Failed to sync ${item.type} ${item.id}`);
      }
    }

    return {
      success: errors.length === 0,
      error: errors.length > 0 ? errors.join(', ') : undefined,
      syncedItems
    };
  }, 1000);

  public async processSyncQueue(): Promise<SyncResult> {
    if (this.isProcessing || !this.isOnline || this.syncQueue.length === 0) {
      return { success: true };
    }

    this.isProcessing = true;
    let results: SyncResult[] = [];
    let queueCopy = [...this.syncQueue];

    try {
      // Process in batches
      while (queueCopy.length > 0) {
        const batch = queueCopy.splice(0, this.BATCH_SIZE);
        const result = await this.processBatch(batch);
        if (result) {
          results.push(result);
        }
      }

      // Update the queue
      this.syncQueue = queueCopy;
      await this.databaseService.saveItem('SYNC_QUEUE', { 
        id: 'sync-queue', 
        items: queueCopy 
      });

      // Aggregate results
      const totalSynced = results.reduce((sum, r) => sum + (r.syncedItems || 0), 0);
      const errors = results.filter(r => !r.success).map(r => r.error).filter(Boolean);

      return {
        success: errors.length === 0,
        error: errors.length > 0 ? errors.join(', ') : undefined,
        syncedItems: totalSynced
      };
    } catch (err) {
      console.error('Error processing sync queue:', err);
      return { success: false, error: 'Failed to process sync queue' };
    } finally {
      this.isProcessing = false;
    }
  }

  public async queueSyncItem(item: SyncQueueItem): Promise<SyncResult> {
    const validation = validateSyncQueueItem(item);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    try {
      this.syncQueue.push(item);
      await this.databaseService.saveItem('SYNC_QUEUE', { 
        id: 'sync-queue', 
        items: this.syncQueue 
      });

      if (this.isOnline) {
        return this.processSyncQueue();
      }

      return { success: true };
    } catch (error) {
      console.error('Error queueing sync item:', error);
      return { success: false, error: 'Failed to queue sync item' };
    }
  }

  private async syncMeditation(item: SyncQueueItem): Promise<void> {
    // Implement meditation sync logic
    // This would typically involve API calls to your backend
  }

  private async syncJournal(item: SyncQueueItem): Promise<void> {
    // Implement journal sync logic
    // This would typically involve API calls to your backend
  }

  private async syncSettings(item: SyncQueueItem): Promise<void> {
    // Implement settings sync logic
    // This would typically involve API calls to your backend
  }
}

export const syncService = SyncService.getInstance(); 