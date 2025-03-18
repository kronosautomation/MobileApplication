import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import asyncStorageService from './asyncStorageService';
import encryptionService from './encryptionService';

// File types
export enum FileType {
  AUDIO = 'audio',
  IMAGE = 'image',
  DOCUMENT = 'document'
}

// Storage directories
const BASE_DIRECTORY = FileSystem.documentDirectory || '';
const DIRECTORIES = {
  [FileType.AUDIO]: `${BASE_DIRECTORY}audio/`,
  [FileType.IMAGE]: `${BASE_DIRECTORY}images/`,
  [FileType.DOCUMENT]: `${BASE_DIRECTORY}documents/`
};

// Storage tracking
const STORAGE_INFO_KEY = '@MindfulMastery:storageInfo';

interface StorageInfo {
  totalSize: number;
  files: {
    [key: string]: {
      size: number;
      type: FileType;
      lastAccessed: number;
    };
  };
}

/**
 * Service for handling file downloads and storage
 */
class FileService {
  private storageInfo: StorageInfo = {
    totalSize: 0,
    files: {}
  };

  // Storage limits (in bytes)
  private readonly DEFAULT_STORAGE_LIMIT = 500 * 1024 * 1024; // 500MB
  private readonly DEFAULT_FILE_EXPIRATION = 30 * 24 * 60 * 60 * 1000; // 30 days

  constructor() {
    this.initializeDirectories();
    this.loadStorageInfo();
  }

  /**
   * Initialize storage directories
   */
  private async initializeDirectories(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        console.warn('FileSystem is not fully supported on web platform');
        return;
      }

      // Create directories if they don't exist
      await Promise.all(
        Object.values(DIRECTORIES).map(async (dir) => {
          const dirInfo = await FileSystem.getInfoAsync(dir);
          if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
            console.log(`Created directory: ${dir}`);
          }
        })
      );
    } catch (error) {
      console.error('Error initializing file directories:', error);
    }
  }

  /**
   * Load storage info from AsyncStorage
   */
  private async loadStorageInfo(): Promise<void> {
    try {
      const info = await asyncStorageService.getData<StorageInfo>(STORAGE_INFO_KEY);
      if (info) {
        this.storageInfo = info;
      }
    } catch (error) {
      console.error('Error loading storage info:', error);
    }
  }

  /**
   * Save storage info to AsyncStorage
   */
  private async saveStorageInfo(): Promise<void> {
    try {
      await asyncStorageService.storeData(STORAGE_INFO_KEY, this.storageInfo);
    } catch (error) {
      console.error('Error saving storage info:', error);
    }
  }

  /**
   * Download a file from a URL and store it locally
   * @param url URL of the file to download
   * @param fileName Name to save the file as
   * @param type Type of file
   * @param progressCallback Optional callback for download progress
   * @param encrypt Whether to encrypt the file (for premium content)
   * @param contentId ID of the content (used for encryption key)
   * @returns Path to the downloaded file
   */
  async downloadFile(
    url: string,
    fileName: string,
    type: FileType,
    progressCallback?: (progress: number) => void,
    encrypt: boolean = false,
    contentId: string = ''
  ): Promise<string> {
    if (Platform.OS === 'web') {
      console.warn('File downloads are not supported on web platform');
      return url;
    }

    try {
      // Check if we have enough storage space
      await this.ensureStorageSpace(type);

      // Create the destination path
      const directory = DIRECTORIES[type];
      const filePath = `${directory}${fileName}`;

      // Check if file already exists
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (fileInfo.exists) {
        // Update last accessed time
        this.updateFileAccessTime(filePath);
        return filePath;
      }

      // Download the file
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        filePath,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          progressCallback?.(progress);
        }
      );

      const result = await downloadResumable.downloadAsync();
      
      if (!result) {
        throw new Error('Download failed');
      }

      // Encrypt the file if needed
      let finalPath = filePath;
      if (encrypt && contentId) {
        finalPath = await encryptionService.encryptFile(filePath, contentId);
      }
      
      // Update storage info
      const fileSize = result.size || 0;
      this.storageInfo.files[finalPath] = {
        size: fileSize,
        type,
        lastAccessed: Date.now()
      };
      this.storageInfo.totalSize += fileSize;
      
      await this.saveStorageInfo();
      
      return finalPath;
    } catch (error) {
      console.error(`Error downloading file from ${url}:`, error);
      throw error;
    }
  }

  /**
   * Get decrypted file path for playback
   * @param filePath Path to possibly encrypted file
   * @param contentId Content ID for decryption
   * @returns Path to decrypted file (temporary)
   */
  async getDecryptedFilePath(filePath: string, contentId: string): Promise<string> {
    if (Platform.OS === 'web' || !filePath.endsWith('.encrypted')) {
      return filePath; // Not encrypted or web platform
    }
    
    try {
      return await encryptionService.decryptFile(filePath, contentId);
    } catch (error) {
      console.error('Error decrypting file:', error);
      return filePath;
    }
  }
  
  /**
   * Clean up temporary decrypted files
   * @param tempPath Path to temporary decrypted file
   */
  async cleanupDecryptedFile(tempPath: string): Promise<void> {
    if (!tempPath.endsWith('.temp')) {
      return; // Not a temp file
    }
    
    try {
      await encryptionService.cleanupDecryptedFile(tempPath);
    } catch (error) {
      console.error('Error cleaning up decrypted file:', error);
    }
  }

  /**
   * Ensure there's enough storage space for a new file
   * @param fileType Type of file to make space for
   */
  private async ensureStorageSpace(fileType: FileType): Promise<void> {
    try {
      // Check current storage usage
      const storageLimit = this.DEFAULT_STORAGE_LIMIT;
      
      if (this.storageInfo.totalSize >= storageLimit * 0.9) {
        // We're approaching the limit, clean up old files
        await this.cleanupOldFiles(fileType);
      }
    } catch (error) {
      console.error('Error ensuring storage space:', error);
    }
  }

  /**
   * Clean up old files to free storage space
   * @param priorityFileType File type to prioritize keeping
   */
  private async cleanupOldFiles(priorityFileType?: FileType): Promise<void> {
    try {
      // Get all files sorted by last accessed time
      const files = Object.entries(this.storageInfo.files)
        .map(([path, info]) => ({
          path,
          ...info
        }))
        .filter(file => !priorityFileType || file.type !== priorityFileType)
        .sort((a, b) => a.lastAccessed - b.lastAccessed);
      
      // Delete files until we're under 70% of the limit or run out of files
      const targetSize = this.DEFAULT_STORAGE_LIMIT * 0.7;
      let totalDeleted = 0;
      
      for (const file of files) {
        if (this.storageInfo.totalSize - totalDeleted <= targetSize) {
          break;
        }
        
        // Check if file hasn't been accessed recently
        const fileAge = Date.now() - file.lastAccessed;
        if (fileAge > this.DEFAULT_FILE_EXPIRATION) {
          await FileSystem.deleteAsync(file.path, { idempotent: true });
          totalDeleted += file.size;
          delete this.storageInfo.files[file.path];
        }
      }
      
      // Update total size
      this.storageInfo.totalSize -= totalDeleted;
      await this.saveStorageInfo();
      
      console.log(`Cleaned up ${totalDeleted / (1024 * 1024)}MB of storage space`);
    } catch (error) {
      console.error('Error cleaning up old files:', error);
    }
  }

  /**
   * Update the last accessed time for a file
   * @param filePath Path to the file
   */
  private updateFileAccessTime(filePath: string): void {
    if (this.storageInfo.files[filePath]) {
      this.storageInfo.files[filePath].lastAccessed = Date.now();
      this.saveStorageInfo().catch(console.error);
    }
  }

  /**
   * Delete a file from storage
   * @param filePath Path to the file
   */
  async deleteFile(filePath: string): Promise<void> {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(filePath, { idempotent: true });
        
        // Update storage info
        if (this.storageInfo.files[filePath]) {
          this.storageInfo.totalSize -= this.storageInfo.files[filePath].size;
          delete this.storageInfo.files[filePath];
          await this.saveStorageInfo();
        }
      }
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Get the local path for a file if it exists
   * @param fileName Name of the file
   * @param type Type of file
   * @returns Local file path or null if not found
   */
  async getLocalFilePath(fileName: string, type: FileType): Promise<string | null> {
    if (Platform.OS === 'web') {
      return null;
    }

    const filePath = `${DIRECTORIES[type]}${fileName}`;
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    
    if (fileInfo.exists) {
      this.updateFileAccessTime(filePath);
      return filePath;
    }
    
    return null;
  }

  /**
   * Get storage usage information
   * @returns Storage usage details
   */
  getStorageUsage(): {
    totalSize: number,
    usedPercentage: number,
    limit: number
  } {
    return {
      totalSize: this.storageInfo.totalSize,
      usedPercentage: (this.storageInfo.totalSize / this.DEFAULT_STORAGE_LIMIT) * 100,
      limit: this.DEFAULT_STORAGE_LIMIT
    };
  }

  /**
   * Clear all downloaded files (use with caution)
   */
  async clearAllFiles(): Promise<void> {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      // Delete files from each directory
      await Promise.all(
        Object.values(DIRECTORIES).map(async (dir) => {
          const dirContent = await FileSystem.readDirectoryAsync(dir);
          await Promise.all(
            dirContent.map(async (fileName) => {
              const filePath = `${dir}${fileName}`;
              await FileSystem.deleteAsync(filePath, { idempotent: true });
            })
          );
        })
      );
      
      // Reset storage info
      this.storageInfo = {
        totalSize: 0,
        files: {}
      };
      await this.saveStorageInfo();
      
      console.log('All files cleared from storage');
    } catch (error) {
      console.error('Error clearing all files:', error);
      throw error;
    }
  }
}

export default new FileService();
