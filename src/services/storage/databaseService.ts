import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Database service using AsyncStorage
 * This is a replacement for the SQLite implementation
 */
class DatabaseService {
  private isInitialized = false;
  private readonly STORAGE_KEYS = {
    MEDITATIONS: '@MindfulMastery:meditations',
    JOURNAL_ENTRIES: '@MindfulMastery:journalEntries',
    SYNC_QUEUE: '@MindfulMastery:syncQueue',
    SUBSCRIPTION_STATUS: '@MindfulMastery:subscriptionStatus',
  };

  constructor() {
    // Initialize the service when created
  }

  /**
   * Initialize the database service
   * @returns Promise<boolean> indicating success
   */
  public async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    try {
      // Ensure the storage keys exist with initial values
      await this.ensureStorageKeys();
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize database service:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  /**
   * Ensure all storage keys exist with initial values
   */
  private async ensureStorageKeys(): Promise<void> {
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
    await initializeKey(this.STORAGE_KEYS.SYNC_QUEUE, []);
    await initializeKey(this.STORAGE_KEYS.SUBSCRIPTION_STATUS, {
      isValid: false,
      tier: 0,
      lastVerifiedOnline: new Date().toISOString()
    });
  }

  /**
   * Get all items from a collection
   * @param collectionKey The storage key to query
   * @returns Promise resolving to the collection items
   */
  async getAll<T>(collectionKey: keyof typeof this.STORAGE_KEYS): Promise<T[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      const jsonValue = await AsyncStorage.getItem(this.STORAGE_KEYS[collectionKey]);
      return jsonValue ? JSON.parse(jsonValue) : [];
    } catch (error) {
      console.error(`Error getting items from ${collectionKey}:`, error);
      return [];
    }
  }

  /**
   * Get an item by ID from a collection
   * @param collectionKey The storage key to query
   * @param id The ID of the item to find
   * @returns Promise resolving to the item or null if not found
   */
  async getById<T extends { id: string }>(collectionKey: keyof typeof this.STORAGE_KEYS, id: string): Promise<T | null> {
    const items = await this.getAll<T>(collectionKey);
    return items.find(item => item.id === id) || null;
  }

  /**
   * Add or update an item in a collection
   * @param collectionKey The storage key to update
   * @param item The item to add or update
   * @returns Promise resolving to the updated item
   */
  async saveItem<T extends { id: string }>(collectionKey: keyof typeof this.STORAGE_KEYS, item: T): Promise<T> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      // Get the current items
      const items = await this.getAll<T>(collectionKey);
      
      // Find the index of the item if it exists
      const index = items.findIndex(existingItem => (existingItem as any).id === item.id);
      
      if (index >= 0) {
        // Update existing item
        items[index] = item;
      } else {
        // Add new item
        items.push(item);
      }
      
      // Save back to storage
      await AsyncStorage.setItem(this.STORAGE_KEYS[collectionKey], JSON.stringify(items));
      
      return item;
    } catch (error) {
      console.error(`Error saving item to ${collectionKey}:`, error);
      throw error;
    }
  }

  /**
   * Delete an item from a collection
   * @param collectionKey The storage key to update
   * @param id The ID of the item to delete
   * @returns Promise resolving to true if the item was deleted
   */
  async deleteItem(collectionKey: keyof typeof this.STORAGE_KEYS, id: string): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      // Get the current items
      const items = await this.getAll<{ id: string }>(collectionKey);
      
      // Filter out the item to delete
      const filteredItems = items.filter(item => item.id !== id);
      
      // Check if an item was removed
      if (filteredItems.length === items.length) {
        return false; // No item was removed
      }
      
      // Save back to storage
      await AsyncStorage.setItem(this.STORAGE_KEYS[collectionKey], JSON.stringify(filteredItems));
      
      return true;
    } catch (error) {
      console.error(`Error deleting item from ${collectionKey}:`, error);
      return false;
    }
  }

  /**
   * Query items in a collection with a filter function
   * @param collectionKey The storage key to query
   * @param filterFn The filter function to apply
   * @returns Promise resolving to the filtered items
   */
  async query<T>(collectionKey: keyof typeof this.STORAGE_KEYS, filterFn: (item: T) => boolean): Promise<T[]> {
    const items = await this.getAll<T>(collectionKey);
    return items.filter(filterFn);
  }

  /**
   * Clear all data from the database
   */
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(this.STORAGE_KEYS));
      this.isInitialized = false;
      await this.initialize();
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}

// Singleton instance
export default new DatabaseService();
