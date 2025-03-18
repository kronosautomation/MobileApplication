import { GuidedMeditation } from '../types';
import { fileService, FileType, databaseService, syncService, EntityType, SyncOperation, subscriptionValidator, encryptionService } from './storage';
import { meditationService as apiMeditationService } from '../api';
import { Platform } from 'react-native';

/**
 * Enhanced meditation service with offline support
 */
class MeditationService {
  /**
   * Get all meditations with offline support
   * @returns Promise resolving to an array of meditations
   */
  async getMeditations(): Promise<{ meditations: GuidedMeditation[] }> {
    try {
      // Try to get from local DB first
      const localMeditations = await this.getLocalMeditations();
      
      // If online, sync with server
      try {
        const { isConnected } = await import('expo-network').then(
          module => module.getNetworkStateAsync()
        );
        
        if (isConnected) {
          // Get from API and update local DB
          const apiResponse = await apiMeditationService.getMeditations();
          await this.updateLocalMeditations(apiResponse.meditations);
          return apiResponse;
        }
      } catch (error) {
        console.log('Network error or offline, using local data:', error);
      }
      
      // Return local data if available or empty array
      return { meditations: localMeditations };
    } catch (error) {
      console.error('Error getting meditations:', error);
      throw error;
    }
  }
  
  /**
   * Get meditation by ID with offline support
   * @param id Meditation ID
   * @returns Promise resolving to meditation or null
   */
  async getMeditationById(id: string): Promise<GuidedMeditation | null> {
    try {
      // Try to get from local DB first
      const localMeditation = await this.getLocalMeditationById(id);
      
      // If online, try to get from API
      try {
        const { isConnected } = await import('expo-network').then(
          module => module.getNetworkStateAsync()
        );
        
        if (isConnected) {
          // Get from API and update local DB
          const apiMeditation = await apiMeditationService.getMeditationById(id);
          await this.updateLocalMeditation(apiMeditation);
          return apiMeditation;
        }
      } catch (error) {
        console.log('Network error or offline, using local data:', error);
      }
      
      // Return local data if available
      return localMeditation;
    } catch (error) {
      console.error(`Error getting meditation ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Get playable file path for a meditation
   * @param meditation Meditation to get playable path for
   * @returns Path to playable file (may be temporary decrypted file)
   */
  async getPlayableFilePath(meditation: GuidedMeditation): Promise<string | null> {
    try {
      // First check if we have valid subscription for premium content
      if (meditation.minimumSubscriptionTier > 0) {
        const isValid = await subscriptionValidator.validateSubscription(meditation.minimumSubscriptionTier);
        if (!isValid) {
          console.log(`Subscription validation failed for premium playback: ${meditation.id}`);
          throw new Error('Valid subscription required to play premium content');
        }
      }
      
      // Get the local path
      const localMeditation = await this.getLocalMeditationById(meditation.id);
      if (!localMeditation?.localAudioPath) {
        return null; // Not downloaded
      }
      
      // If encrypted (premium content), get decrypted path for playback
      if (meditation.minimumSubscriptionTier > 0 && localMeditation.localAudioPath.endsWith('.encrypted')) {
        return await fileService.getDecryptedFilePath(localMeditation.localAudioPath, meditation.id);
      }
      
      // Return the local path directly if not encrypted
      return localMeditation.localAudioPath;
    } catch (error) {
      console.error(`Error getting playable file path for ${meditation.id}:`, error);
      return null;
    }
  }
  
  /**
   * Clean up temporary decrypted files after playback
   * @param tempPath Temporary file path
   */
  async cleanupAfterPlayback(tempPath: string): Promise<void> {
    if (tempPath && tempPath.endsWith('.temp')) {
      await fileService.cleanupDecryptedFile(tempPath);
    }
  }
  
  /**
   * Play meditation audio with subscription validation
   * @param meditation Meditation to play
   * @returns Promise resolving to playback success status
   */
  async playMeditation(meditation: GuidedMeditation): Promise<boolean> {
    try {
      // Validate subscription for premium content
      if (meditation.minimumSubscriptionTier > 0) {
        const isValid = await subscriptionValidator.validateSubscription(meditation.minimumSubscriptionTier);
        
        if (!isValid) {
          console.log(`Subscription validation failed for premium content: ${meditation.id}`);
          throw new Error('Subscription required');
        }
      }
      
      // Continue with playback...
      console.log(`Playing meditation: ${meditation.id}`);
      // Actual playback would be implemented by the player component
      return true;
    } catch (error) {
      console.error(`Error playing meditation ${meditation.id}:`, error);
      return false;
    }
  }
  
  /**
   * Download meditation audio for offline use
   * @param meditation Meditation to download
   * @param progressCallback Optional callback for download progress
   * @returns Promise resolving to success status
   */
  async downloadMeditationAudio(
    meditation: GuidedMeditation,
    progressCallback?: (progress: number) => void
  ): Promise<boolean> {
    if (Platform.OS === 'web') {
      console.warn('Downloads not supported on web platform');
      return false;
    }
    
    try {
      if (!meditation.audioUrl) {
        throw new Error('Meditation has no audio URL');
      }
      
      // Validate subscription for premium content
      if (meditation.minimumSubscriptionTier > 0) {
        const isValid = await subscriptionValidator.validateSubscription(meditation.minimumSubscriptionTier);
        
        if (!isValid) {
          console.log(`Subscription validation failed for premium download: ${meditation.id}`);
          throw new Error('Valid subscription required to download premium content');
        }
      }
      
      // Generate a safe filename
      const fileExtension = meditation.audioUrl.split('.').pop() || 'mp3';
      const fileName = `meditation_${meditation.id}.${fileExtension}`;
      
      // Download the file with encryption for premium content
      const localPath = await fileService.downloadFile(
        meditation.audioUrl,
        fileName,
        FileType.AUDIO,
        progressCallback,
        meditation.minimumSubscriptionTier > 0, // Encrypt if premium
        meditation.id // Content ID for encryption key
      );
      
      // Update local DB to mark as downloaded
      await databaseService.executeUpdate(
        `UPDATE meditations SET isDownloaded = 1, localAudioPath = ? WHERE id = ?`,
        [localPath, meditation.id]
      );
      
      // Update the sync queue
      await syncService.queueForSync(
        EntityType.MEDITATION,
        meditation.id,
        SyncOperation.UPDATE,
        { isDownloaded: true }
      );
      
      return true;
    } catch (error) {
      console.error(`Error downloading meditation ${meditation.id}:`, error);
      return false;
    }
  }
  
  /**
   * Remove downloaded meditation audio
   * @param meditation Meditation to remove downloads for
   * @returns Promise resolving to success status
   */
  async removeMeditationDownload(meditation: GuidedMeditation): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }
    
    try {
      // Get the meditation from local DB to get the file path
      const localMeditation = await this.getLocalMeditationById(meditation.id);
      
      if (localMeditation?.localAudioPath) {
        // Delete the file
        await fileService.deleteFile(localMeditation.localAudioPath);
        
        // Remove encryption key if premium content
        if (meditation.minimumSubscriptionTier > 0) {
          await encryptionService.removeEncryptionKey(meditation.id);
        }
        
        // Update local DB
        await databaseService.executeUpdate(
          `UPDATE meditations SET isDownloaded = 0, localAudioPath = NULL WHERE id = ?`,
          [meditation.id]
        );
        
        
        // Update the sync queue
        await syncService.queueForSync(
          EntityType.MEDITATION,
          meditation.id,
          SyncOperation.UPDATE,
          { isDownloaded: false }
        );
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error removing meditation download ${meditation.id}:`, error);
      return false;
    }
  }
  
  /**
   * Get all downloaded meditations
   * @returns Promise resolving to array of downloaded meditations
   */
  async getDownloadedMeditations(): Promise<GuidedMeditation[]> {
    try {
      return await databaseService.executeQuery<GuidedMeditation>(
        `SELECT * FROM meditations WHERE isDownloaded = 1`
      );
    } catch (error) {
      console.error('Error getting downloaded meditations:', error);
      return [];
    }
  }
  
  /**
   * Check if a meditation is downloaded
   * @param id Meditation ID
   * @returns Promise resolving to boolean
   */
  async isMeditationDownloaded(id: string): Promise<boolean> {
    try {
      const result = await databaseService.executeQuery<{ isDownloaded: number }>(
        `SELECT isDownloaded FROM meditations WHERE id = ?`,
        [id]
      );
      
      return result.length > 0 && result[0].isDownloaded === 1;
    } catch (error) {
      console.error(`Error checking if meditation ${id} is downloaded:`, error);
      return false;
    }
  }
  
  /**
   * Get local meditations from database
   * @returns Promise resolving to array of meditations
   */
  private async getLocalMeditations(): Promise<GuidedMeditation[]> {
    try {
      const meditations = await databaseService.executeQuery<any>(
        `SELECT * FROM meditations`
      );
      
      // Parse JSON fields
      return meditations.map(meditation => ({
        ...meditation,
        categories: meditation.categories ? JSON.parse(meditation.categories) : [],
        tags: meditation.tags ? JSON.parse(meditation.tags) : []
      }));
    } catch (error) {
      console.error('Error getting local meditations:', error);
      return [];
    }
  }
  
  /**
   * Get local meditation by ID
   * @param id Meditation ID
   * @returns Promise resolving to meditation or null
   */
  private async getLocalMeditationById(id: string): Promise<GuidedMeditation | null> {
    try {
      const meditations = await databaseService.executeQuery<any>(
        `SELECT * FROM meditations WHERE id = ?`,
        [id]
      );
      
      if (meditations.length === 0) {
        return null;
      }
      
      const meditation = meditations[0];
      
      // Parse JSON fields
      return {
        ...meditation,
        categories: meditation.categories ? JSON.parse(meditation.categories) : [],
        tags: meditation.tags ? JSON.parse(meditation.tags) : []
      };
    } catch (error) {
      console.error(`Error getting local meditation ${id}:`, error);
      return null;
    }
  }
  
  /**
   * Update local meditations database with data from API
   * @param meditations Meditations from API
   */
  private async updateLocalMeditations(meditations: GuidedMeditation[]): Promise<void> {
    try {
      // Insert or update each meditation
      const now = new Date().toISOString();
      
      for (const meditation of meditations) {
        await this.updateLocalMeditation(meditation, now);
      }
    } catch (error) {
      console.error('Error updating local meditations:', error);
      throw error;
    }
  }
  
  /**
   * Update a single meditation in local database
   * @param meditation Meditation data
   * @param timestamp Optional timestamp for last synced time
   */
  private async updateLocalMeditation(
    meditation: GuidedMeditation,
    timestamp?: string
  ): Promise<void> {
    try {
      // Check if meditation exists
      const existing = await this.getLocalMeditationById(meditation.id);
      
      // Prepare JSON fields
      const categories = JSON.stringify(meditation.categories || []);
      const tags = JSON.stringify(meditation.tags || []);
      const lastSyncedAt = timestamp || new Date().toISOString();
      
      if (existing) {
        // Preserve downloaded status and local path
        const isDownloaded = existing.isDownloaded;
        const localAudioPath = existing.localAudioPath;
        
        // Update existing record
        await databaseService.executeUpdate(
          `UPDATE meditations SET
            title = ?,
            description = ?,
            narrator = ?,
            durationInSeconds = ?,
            difficultyLevel = ?,
            imageUrl = ?,
            audioUrl = ?,
            minimumSubscriptionTier = ?,
            categories = ?,
            tags = ?,
            lastSyncedAt = ?,
            updatedAt = ?
          WHERE id = ?`,
          [
            meditation.title,
            meditation.description,
            meditation.narrator,
            meditation.durationInSeconds,
            meditation.difficultyLevel,
            meditation.imageUrl,
            meditation.audioUrl,
            meditation.minimumSubscriptionTier,
            categories,
            tags,
            lastSyncedAt,
            new Date().toISOString(),
            meditation.id
          ]
        );
      } else {
        // Insert new record
        await databaseService.executeInsert(
          `INSERT INTO meditations (
            id, title, description, narrator, durationInSeconds, 
            difficultyLevel, imageUrl, audioUrl, isDownloaded, 
            minimumSubscriptionTier, categories, tags, 
            lastSyncedAt, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            meditation.id,
            meditation.title,
            meditation.description,
            meditation.narrator,
            meditation.durationInSeconds,
            meditation.difficultyLevel,
            meditation.imageUrl,
            meditation.audioUrl,
            0, // Not downloaded by default
            meditation.minimumSubscriptionTier,
            categories,
            tags,
            lastSyncedAt,
            new Date().toISOString(),
            new Date().toISOString()
          ]
        );
      }
    } catch (error) {
      console.error(`Error updating local meditation ${meditation.id}:`, error);
      throw error;
    }
  }
}

export default new MeditationService();
