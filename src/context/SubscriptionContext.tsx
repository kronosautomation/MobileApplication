import React, { createContext, useState, useEffect, useContext } from 'react';
import { subscriptionService } from '../api';
import { SubscriptionInfo, SubscriptionTier, SubscriptionStatus } from '../types';
import { useAuth } from './AuthContext';
import * as Purchases from 'react-native-purchases';

interface SubscriptionContextType {
  subscriptionInfo: SubscriptionInfo | null;
  offerings: Purchases.Offerings | null;
  isLoading: boolean;
  error: string | null;
  refreshSubscriptionStatus: () => Promise<void>;
  purchasePackage: (pkg: Purchases.Package) => Promise<void>;
  restorePurchases: () => Promise<boolean>;
  cancelSubscription: (reason?: string) => Promise<void>;
  isPremium: boolean;
}

// Default subscription info
const defaultSubscriptionInfo: SubscriptionInfo = {
  tier: SubscriptionTier.Free,
  status: SubscriptionStatus.None,
  features: {
    tier: SubscriptionTier.Free,
    maxDownloads: 3,
    offlineAccess: false,
    premiumMeditations: false,
    unlimitedJournaling: false,
    performanceAnalytics: false,
    customizableBackground: false,
    adFree: false,
  },
};

// Create context with default value
const SubscriptionContext = createContext<SubscriptionContextType>({
  subscriptionInfo: defaultSubscriptionInfo,
  offerings: null,
  isLoading: true,
  error: null,
  refreshSubscriptionStatus: async () => {},
  purchasePackage: async () => {},
  restorePurchases: async () => false,
  cancelSubscription: async () => {},
  isPremium: false,
});

// Provider component
export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(defaultSubscriptionInfo);
  const [offerings, setOfferings] = useState<Purchases.Offerings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user has premium access
  const isPremium = 
    subscriptionInfo?.tier === SubscriptionTier.Premium && 
    subscriptionInfo?.status === SubscriptionStatus.Active;

  // Fetch subscription status
  const fetchSubscriptionStatus = async () => {
    if (!isAuthenticated) {
      setSubscriptionInfo(defaultSubscriptionInfo);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Get subscription status from backend
      const info = await subscriptionService.getSubscriptionStatus();
      setSubscriptionInfo(info);
    } catch (err) {
      console.error('Failed to fetch subscription status:', err);
      setError('Failed to load subscription information');
      // Set default subscription info on error
      setSubscriptionInfo(defaultSubscriptionInfo);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch available subscription packages
  const fetchOfferings = async () => {
    try {
      setIsLoading(true);
      const availableOfferings = await subscriptionService.getOfferings();
      setOfferings(availableOfferings);
    } catch (err) {
      console.error('Failed to fetch offerings:', err);
      setError('Failed to load subscription options');
    } finally {
      setIsLoading(false);
    }
  };

  // Purchase a subscription package
  const purchasePackage = async (pkg: Purchases.Package) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await subscriptionService.purchasePackage(pkg);
      
      // Refresh subscription status after purchase
      await fetchSubscriptionStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to purchase subscription');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Restore purchases
  const restorePurchases = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const restored = await subscriptionService.restorePurchases();
      
      // Refresh subscription status after restore
      await fetchSubscriptionStatus();
      
      return restored;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore purchases');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel subscription
  const cancelSubscription = async (reason?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await subscriptionService.cancelSubscription(reason);
      
      // Refresh subscription status after cancellation
      await fetchSubscriptionStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh subscription status
  const refreshSubscriptionStatus = async () => {
    await fetchSubscriptionStatus();
    await fetchOfferings();
  };

  // Effect to fetch subscription status when auth changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscriptionStatus();
      fetchOfferings();
    } else {
      setSubscriptionInfo(defaultSubscriptionInfo);
    }
  }, [isAuthenticated]);

  // Context value
  const value = {
    subscriptionInfo,
    offerings,
    isLoading,
    error,
    refreshSubscriptionStatus,
    purchasePackage,
    restorePurchases,
    cancelSubscription,
    isPremium,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
};

// Custom hook to use the subscription context
export const useSubscription = () => useContext(SubscriptionContext);

export default SubscriptionContext;
