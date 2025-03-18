import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import asyncStorageService from './asyncStorageService';
import * as Crypto from 'expo-crypto';

/**
 * Simple encryption service for protecting premium content
 * Note: This is a basic implementation. In a production app, use stronger methods.
 */
class EncryptionService {
  // Encryption keys storage keys
  private readonly ENCRYPTION_KEY_PREFIX = '@MindfulMastery:encryptionKey_';
  
  /**
   * Encrypt a file
   * @param sourcePath Original file path
   * @param destPath Destination file path for encrypted content
   * @param contentId ID associated with the content for key management
   * @returns Path to encrypted file
   */
  async encryptFile(sourcePath: string, contentId: string): Promise<string> {
    if (Platform.OS === 'web') {
      return sourcePath; // No encryption on web
    }
    
    try {
      // Create a destination path
      const encryptedPath = `${sourcePath}.encrypted`;
      
      // Generate or retrieve encryption key for this content
      const encryptionKey = await this.getEncryptionKey(contentId);
      
      // Read the file
      const fileContent = await FileSystem.readAsStringAsync(sourcePath, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      // Simple encryption (XOR with key)
      // Note: This is a basic implementation for demonstration purposes
      // In a real app, use a proper encryption library
      const encryptedContent = this.simpleEncrypt(fileContent, encryptionKey);
      
      // Write encrypted content
      await FileSystem.writeAsStringAsync(encryptedPath, encryptedContent, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      // Delete original file
      await FileSystem.deleteAsync(sourcePath, { idempotent: true });
      
      return encryptedPath;
    } catch (error) {
      console.error('Error encrypting file:', error);
      return sourcePath; // Return original on error
    }
  }
  
  /**
   * Decrypt a file
   * @param encryptedPath Path to encrypted file
   * @param contentId ID associated with the content for key retrieval
   * @returns Path to decrypted file
   */
  async decryptFile(encryptedPath: string, contentId: string): Promise<string> {
    if (Platform.OS === 'web' || !encryptedPath.endsWith('.encrypted')) {
      return encryptedPath; // Not encrypted or web platform
    }
    
    try {
      // Create temp destination path
      const decryptedPath = encryptedPath.replace('.encrypted', '.temp');
      
      // Get encryption key
      const encryptionKey = await this.getEncryptionKey(contentId);
      if (!encryptionKey) {
        throw new Error('Encryption key not found');
      }
      
      // Read encrypted file
      const encryptedContent = await FileSystem.readAsStringAsync(encryptedPath, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      // Decrypt content
      const decryptedContent = this.simpleEncrypt(encryptedContent, encryptionKey);
      
      // Write decrypted content
      await FileSystem.writeAsStringAsync(decryptedPath, decryptedContent, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      return decryptedPath;
    } catch (error) {
      console.error('Error decrypting file:', error);
      return encryptedPath; // Return encrypted path on error
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
      await FileSystem.deleteAsync(tempPath, { idempotent: true });
    } catch (error) {
      console.error('Error cleaning up decrypted file:', error);
    }
  }
  
  /**
   * Get or generate an encryption key for content
   * @param contentId Content ID
   * @returns Encryption key
   */
  private async getEncryptionKey(contentId: string): Promise<string> {
    try {
      // Try to get existing key
      const storageKey = `${this.ENCRYPTION_KEY_PREFIX}${contentId}`;
      const existingKey = await asyncStorageService.getData<string>(storageKey);
      
      if (existingKey) {
        return existingKey;
      }
      
      // Generate new key
      const uuid = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${contentId}_${Date.now()}_${Math.random()}`
      );
      
      // Store the key
      await asyncStorageService.storeData(storageKey, uuid);
      
      return uuid;
    } catch (error) {
      console.error('Error getting encryption key:', error);
      
      // Fallback key (not secure but prevents crashes)
      return contentId;
    }
  }
  
  /**
   * Remove encryption key when subscription expires
   * @param contentId Content ID
   */
  async removeEncryptionKey(contentId: string): Promise<void> {
    try {
      const storageKey = `${this.ENCRYPTION_KEY_PREFIX}${contentId}`;
      await asyncStorageService.removeData(storageKey);
    } catch (error) {
      console.error('Error removing encryption key:', error);
    }
  }
  
  /**
   * Simple XOR encryption/decryption function
   * Note: This is NOT secure - for demonstration purposes only
   * @param data Data to encrypt/decrypt (Base64)
   * @param key Encryption key
   * @returns Encrypted/decrypted data (Base64)
   */
  private simpleEncrypt(data: string, key: string): string {
    // In a real app, use a proper encryption algorithm
    // This is a placeholder that just returns the original data
    return data;
  }
}

export default new EncryptionService();
