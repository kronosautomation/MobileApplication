import apiClient from './apiClient';
import { SubscriptionInfo, SubscriptionStatus, SubscriptionTier } from '../types';
import * as Purchases from 'react-native-purchases';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// RevenueCat API keys from environment
const REVENUECAT_API_KEY_IOS = Constants.expoConfig?.extra?.revenueCatApiKeyIos || '';
const REVENUECAT_API_KEY_ANDROID = Constants.expoConfig?.extra?.revenueCatApiKeyAndroid || '';

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  PREMIUM_MONTHLY: 'premium_monthly',
  PREMIUM_ANNUAL: 'premium_annual',
};

// Entitlement ID used in RevenueCat
const PREMIUM_ENTITLEMENT_ID = 'premium_access';

class SubscriptionService {
  initialized = false;

  // Initialize RevenueCat
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Configure RevenueCat with the appropriate API key
      const apiKey = Platform.OS === 'ios' ? REVENUECAT_API_KEY_IOS : REVENUECAT_API_KEY_ANDROID;
      
      await Purchases.configure({
        apiKey,
        appUserID: await apiClient.getUserId(),
      });
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize RevenueCat:', error);
      throw this.handleError(error, 'Failed to initialize subscription service');
    }
  }

  // Get current subscription status from backend
  async getSubscriptionStatus(): Promise<SubscriptionInfo> {
    try {
      const response = await apiClient.get<SubscriptionInfo>('/subscription/status');
      return response;
    } catch (error) {
      throw this.handleError(error, 'Failed to get subscription status');
    }
  }

  // Get available subscription offerings from RevenueCat
  async getOfferings(): Promise<Purchases.Offerings> {
    await this.initialize();
    
    try {
      const offerings = await Purchases.getOfferings();
      return offerings;
    } catch (error) {
      throw this.handleError(error, 'Failed to get subscription offerings');
    }
  }

  // Purchase a subscription package
  async purchasePackage(package_: Purchases.Package): Promise<void> {
    await this.initialize();
    
    try {
      // Make the purchase through RevenueCat
      const { customerInfo } = await Purchases.purchasePackage(package_);
      
      // Verify if the user has the premium entitlement
      const isPremium = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
      
      if (isPremium) {
        // Notify our backend about the purchase
        await apiClient.post('/subscription/purchase', {
          productId: package_.product.identifier,
          transactionId: customerInfo.originalAppUserId // This should be replaced with the actual transaction ID if available
        });
      }
    } catch (error) {
      if (error.userCancelled) {
        throw new Error('Purchase was cancelled');
      }
      throw this.handleError(error, 'Failed to purchase subscription');
    }
  }

  // Restore purchases
  async restorePurchases(): Promise<boolean> {
    await this.initialize();
    
    try {
      const { customerInfo } = await Purchases.restorePurchases();
      
      // Check if premium entitlement is active
      const isPremium = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
      
      if (isPremium) {
        // Notify our backend about the restored purchase
        await apiClient.post('/subscription/restore', {
          userId: await apiClient.getUserId()
        });
      }
      
      return isPremium;
    } catch (error) {
      throw this.handleError(error, 'Failed to restore purchases');
    }
  }

  // Cancel subscription
  async cancelSubscription(reason?: string): Promise<void> {
    try {
      await apiClient.post('/subscription/cancel', reason);
    } catch (error) {
      throw this.handleError(error, 'Failed to cancel subscription');
    }
  }

  // Check if a user can access premium features
  async canAccessPremiumFeature(): Promise<boolean> {
    try {
      const status = await this.getSubscriptionStatus();
      return status.tier === SubscriptionTier.Premium && status.status === SubscriptionStatus.Active;
    } catch (error) {
      console.error('Error checking premium access:', error);
      return false;
    }
  }

  // Helper method to handle errors
  private handleError(error: any, defaultMessage: string): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return new Error(defaultMessage);
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;
