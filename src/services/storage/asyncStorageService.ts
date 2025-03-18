import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Service for interacting with AsyncStorage
 * Used for storing simple key-value data
 */
class AsyncStorageService {
  /**
   * Store data in AsyncStorage
   * @param key Storage key
   * @param data Data to store (will be JSON stringified)
   */
  async storeData<T>(key: string, data: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error storing data in AsyncStorage:', error);
      throw error;
    }
  }

  /**
   * Retrieve data from AsyncStorage
   * @param key Storage key
   * @returns Parsed data or null if not found
   */
  async getData<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error retrieving data from AsyncStorage:', error);
      throw error;
    }
  }

  /**
   * Remove data from AsyncStorage
   * @param key Storage key
   */
  async removeData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data from AsyncStorage:', error);
      throw error;
    }
  }

  /**
   * Store multiple data items in AsyncStorage
   * @param items Array of key-value pairs to store
   */
  async storeMultipleData(items: Array<[string, any]>): Promise<void> {
    try {
      const pairs = items.map(([key, value]) => [key, JSON.stringify(value)]);
      await AsyncStorage.multiSet(pairs);
    } catch (error) {
      console.error('Error storing multiple data in AsyncStorage:', error);
      throw error;
    }
  }

  /**
   * Retrieve multiple data items from AsyncStorage
   * @param keys Array of keys to retrieve
   * @returns Object with key-value pairs of retrieved data
   */
  async getMultipleData(keys: string[]): Promise<Record<string, any>> {
    try {
      const result = await AsyncStorage.multiGet(keys);
      return result.reduce((acc, [key, value]) => {
        if (value) {
          acc[key] = JSON.parse(value);
        }
        return acc;
      }, {} as Record<string, any>);
    } catch (error) {
      console.error('Error retrieving multiple data from AsyncStorage:', error);
      throw error;
    }
  }

  /**
   * Get all keys stored in AsyncStorage with a specific prefix
   * @param prefix Key prefix to filter by
   * @returns Array of keys
   */
  async getAllKeys(prefix?: string): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      if (prefix) {
        return keys.filter(key => key.startsWith(prefix));
      }
      return keys;
    } catch (error) {
      console.error('Error getting all keys from AsyncStorage:', error);
      throw error;
    }
  }

  /**
   * Clear all data from AsyncStorage
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
      throw error;
    }
  }
}

export default new AsyncStorageService();
