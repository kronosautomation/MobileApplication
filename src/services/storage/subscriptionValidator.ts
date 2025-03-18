import { subscriptionService } from '../../api';
import { databaseService } from './index';

// Time constants
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

interface SubscriptionStatus {
  isValid: boolean;
  expiryDate: number | null;
  tier: number;
  lastVerifiedOnline: number;
}

/**
 * Service for validating subscription status for offline content access
 */
class SubscriptionValidator {
  // Maximum offline grace period (days)
  private readonly MAX_OFFLINE_GRACE_PERIOD = 3; // days
  
  // Store last known subscription status
  private cachedStatus: SubscriptionStatus = {
    isValid: false,
    expiryDate: null,
    tier: 0,
    lastVerifiedOnline: 0
  };

  /**
   * Initialize subscription validator
   */
  async initialize(): Promise<void> {
    try {
      // Load cached subscription data from database
      const result = await databaseService.executeQuery<{
        isValid: number;
        expiryDate: string;
        tier: number;
        lastVerifiedOnline: string;
      }>(`SELECT * FROM subscription_status LIMIT 1`);
      
      if (result.length > 0) {
        const status = result[0];
        this.cachedStatus = {
          isValid: status.isValid === 1,
          expiryDate: status.expiryDate ? new Date(status.expiryDate).getTime() : null,
          tier: status.tier,
          lastVerifiedOnline: new Date(status.lastVerifiedOnline).getTime()
        };
      }
      
      // Attempt to sync with server
      await this.refreshSubscriptionStatus();
    } catch (error) {
      console.error('Error initializing subscription validator:', error);
    }
  }

  /**
   * Validate subscription for content access
   * @param requiredTier Required subscription tier
   * @returns Whether the subscription is valid for the required tier
   */
  async validateSubscription(requiredTier: number = 1): Promise<boolean> {
    try {
      // If no subscription is required, always allow access
      if (requiredTier === 0) {
        return true;
      }
      
      // Try to get latest status from server if possible
      await this.refreshSubscriptionStatus();
      
      // Check if subscription is valid
      if (!this.cachedStatus.isValid) {
        return false;
      }
      
      // Check subscription tier
      if (this.cachedStatus.tier < requiredTier) {
        return false;
      }
      
      // Check expiry date if available
      if (this.cachedStatus.expiryDate && this.cachedStatus.expiryDate < Date.now()) {
        return false;
      }
      
      // If offline for too long, enforce grace period
      const offlineDuration = Date.now() - this.cachedStatus.lastVerifiedOnline;
      const gracePeriodMs = this.MAX_OFFLINE_GRACE_PERIOD * ONE_DAY_MS;
      
      if (offlineDuration > gracePeriodMs) {
        console.log('Subscription offline grace period exceeded');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error validating subscription:', error);
      
      // In case of error, fall back to cached status
      return this.cachedStatus.isValid && this.cachedStatus.tier >= requiredTier;
    }
  }

  /**
   * Refresh subscription status from server
   */
  async refreshSubscriptionStatus(): Promise<void> {
    try {
      // Check network connection
      const { isConnected } = await import('expo-network').then(
        module => module.getNetworkStateAsync()
      );
      
      if (!isConnected) {
        return; // Can't refresh without network
      }
      
      // Get latest subscription status from server
      const status = await subscriptionService.getSubscriptionStatus();
      
      // Update cached status
      this.cachedStatus = {
        isValid: status.isActive,
        expiryDate: status.expiryDate ? new Date(status.expiryDate).getTime() : null,
        tier: status.tier,
        lastVerifiedOnline: Date.now()
      };
      
      // Save to database
      await this.saveStatusToDatabase();
      
      // Trigger cleanup if subscription has changed
      if (!status.isActive) {
        this.cleanupExpiredContent();
      }
    } catch (error) {
      console.error('Error refreshing subscription status:', error);
    }
  }

  /**
   * Save current status to database
   */
  private async saveStatusToDatabase(): Promise<void> {
    try {
      // First delete existing record
      await databaseService.executeUpdate('DELETE FROM subscription_status');
      
      // Then insert new record
      const expiryDate = this.cachedStatus.expiryDate 
        ? new Date(this.cachedStatus.expiryDate).toISOString() 
        : null;
      
      const lastVerifiedOnline = new Date(this.cachedStatus.lastVerifiedOnline).toISOString();
      
      await databaseService.executeInsert(
        `INSERT INTO subscription_status (
          isValid, expiryDate, tier, lastVerifiedOnline
        ) VALUES (?, ?, ?, ?)`,
        [
          this.cachedStatus.isValid ? 1 : 0,
          expiryDate,
          this.cachedStatus.tier,
          lastVerifiedOnline
        ]
      );
    } catch (error) {
      console.error('Error saving subscription status to database:', error);
    }
  }

  /**
   * Clean up content that should no longer be accessible
   */
  private async cleanupExpiredContent(): Promise<void> {
    try {
      console.log('Cleaning up expired premium content');
      
      // Get list of premium content downloads
      const premiumContent = await databaseService.executeQuery<{
        id: string;
        localAudioPath: string;
      }>(
        `SELECT id, localAudioPath FROM meditations 
         WHERE minimumSubscriptionTier > 0 
         AND isDownloaded = 1 
         AND localAudioPath IS NOT NULL`
      );
      
      // Import necessary services
      const { fileService, meditationService } = await import('./index');
      
      // Remove each premium item
      for (const item of premiumContent) {
        await meditationService.removeMeditationDownload({ id: item.id } as any);
      }
      
      console.log(`Cleaned up ${premiumContent.length} premium items`);
    } catch (error) {
      console.error('Error cleaning up expired content:', error);
    }
  }

  /**
   * Get current subscription status
   * @returns Current subscription status
   */
  getSubscriptionStatus(): SubscriptionStatus {
    return { ...this.cachedStatus }; // Return copy to prevent modification
  }
}

export default new SubscriptionValidator();
