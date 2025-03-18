import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Simplified storage service
 */
class StorageService {
  private isInitialized = false;
  private readonly STORAGE_KEYS = {
    MEDITATIONS: '@MindfulMastery:meditations',
    JOURNAL_ENTRIES: '@MindfulMastery:journalEntries',
    USER_SETTINGS: '@MindfulMastery:userSettings',
  };

  /**
   * Initialize the storage service
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    try {
      // Test storage functionality
      await AsyncStorage.setItem('@MindfulMastery:test', 'Storage Test');
      const testValue = await AsyncStorage.getItem('@MindfulMastery:test');
      
      if (testValue !== 'Storage Test') {
        throw new Error('Storage test failed: value mismatch');
      }
      
      // Initialize storage keys
      await this.initializeStorageKeys();
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Storage service initialization failed:', error);
      return false;
    }
  }

  /**
   * Initialize storage keys
   */
  private async initializeStorageKeys(): Promise<void> {
    const initializeKey = async (key: string, defaultValue: any = []): Promise<void> => {
      try {
        const value = await AsyncStorage.getItem(key);
        if (value === null) {
          await AsyncStorage.setItem(key, JSON.stringify(defaultValue));
        }
      } catch (error) {
        console.error(`Error initializing storage key ${key}:`, error);
      }
    };

    // Initialize all storage keys with empty arrays or objects
    await initializeKey(this.STORAGE_KEYS.MEDITATIONS, []);
    await initializeKey(this.STORAGE_KEYS.JOURNAL_ENTRIES, []);
    await initializeKey(this.STORAGE_KEYS.USER_SETTINGS, {
      theme: 'light',
      notifications: true,
      lastSyncDate: null
    });
  }

  /**
   * Get all items from a collection
   */
  async getItems<T>(key: keyof typeof this.STORAGE_KEYS): Promise<T[]> {
    try {
      const jsonValue = await AsyncStorage.getItem(this.STORAGE_KEYS[key]);
      return jsonValue ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error(`Error getting items from ${key}:`, error);
      return [];
    }
  }

  /**
   * Save items to a collection
   */
  async saveItems<T>(key: keyof typeof this.STORAGE_KEYS, items: T[]): Promise<boolean> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS[key], JSON.stringify(items));
      return true;
    } catch (error) {
      console.error(`Error saving items to ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all app data
   */
  async clearAllData(): Promise<boolean> {
    try {
      await AsyncStorage.multiRemove(Object.values(this.STORAGE_KEYS));
      this.isInitialized = false;
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();

// Simple export for backward compatibility
export const initializeOfflineServices = async (): Promise<boolean> => {
  return storageService.initialize();
};

export default { 
  initialize: initializeOfflineServices,
  storageService
};