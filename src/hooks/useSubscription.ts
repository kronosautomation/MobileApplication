import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SubscriptionInfo, SubscriptionTier, SubscriptionStatus } from '../types';

// Storage key for subscription info
const SUBSCRIPTION_KEY = '@MindfulMastery:subscription';

// Mock function to check if a user has premium features
// In a real app, this would call an API endpoint
const checkSubscriptionStatus = async (): Promise<SubscriptionInfo> => {
  try {
    // Try to get cached subscription info
    const cached = await AsyncStorage.getItem(SUBSCRIPTION_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // In a real app, this would be a call to the subscription API
    // For demo purposes, we're using a mock implementation
    
    // Randomly return premium (20% chance) or free (80% chance)
    // This is just for demo purposes - in a real app, this would
    // check with the API
    const isPremium = Math.random() < 0.2;
    
    const subscriptionInfo: SubscriptionInfo = {
      tier: isPremium ? SubscriptionTier.Premium : SubscriptionTier.Free,
      status: isPremium ? SubscriptionStatus.Active : SubscriptionStatus.None,
      features: {
        tier: isPremium ? SubscriptionTier.Premium : SubscriptionTier.Free,
        maxDownloads: isPremium ? 100 : 5,
        offlineAccess: isPremium,
        premiumMeditations: isPremium,
        unlimitedJournaling: isPremium,
        performanceAnalytics: isPremium,
        customizableBackground: isPremium,
        adFree: isPremium
      }
    };
    
    // Cache the result
    await AsyncStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(subscriptionInfo));
    
    return subscriptionInfo;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    
    // Return a default free tier on error
    return {
      tier: SubscriptionTier.Free,
      status: SubscriptionStatus.None,
      features: {
        tier: SubscriptionTier.Free,
        maxDownloads: 5,
        offlineAccess: false,
        premiumMeditations: false,
        unlimitedJournaling: false,
        performanceAnalytics: false,
        customizableBackground: false,
        adFree: false
      }
    };
  }
};

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const loadSubscription = async () => {
      try {
        setLoading(true);
        const subscriptionInfo = await checkSubscriptionStatus();
        setSubscription(subscriptionInfo);
        setError(null);
      } catch (err) {
        console.error('Error in useSubscription hook:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };
    
    loadSubscription();
  }, []);
  
  const refreshSubscription = async () => {
    try {
      setLoading(true);
      // Force a fresh check by skipping the cache
      await AsyncStorage.removeItem(SUBSCRIPTION_KEY);
      const subscriptionInfo = await checkSubscriptionStatus();
      setSubscription(subscriptionInfo);
      setError(null);
      return subscriptionInfo;
    } catch (err) {
      console.error('Error refreshing subscription:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    subscription,
    loading,
    error,
    isPremium: subscription?.tier === SubscriptionTier.Premium,
    refreshSubscription
  };
};
