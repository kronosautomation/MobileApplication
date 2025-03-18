import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { Text } from '../../components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context';
import { SubscriptionTier, SubscriptionStatus } from '../../types';

const SubscriptionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { currentTheme, isDark } = useTheme();
  const { colors } = currentTheme;
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  
  // Mock data for the subscription tiers
  const subscriptionTiers = [
    {
      id: 'free',
      title: 'Free Tier',
      price: { monthly: 0, annual: 0 },
      features: [
        'Access to basic meditation sessions',
        'Limited journal entries (5 per month)',
        'Basic performance tracking',
      ],
      limitations: [
        'No offline access',
        'Limited meditation library',
        'Basic analytics only',
      ],
    },
    {
      id: 'premium',
      title: 'Premium',
      price: { monthly: 9.99, annual: 89.99 },
      features: [
        'Full meditation library',
        'Unlimited journal entries',
        'Advanced performance analytics',
        'Download meditations for offline use',
        'Ad-free experience',
        'Early access to new content',
        'Customizable backgrounds and themes',
      ],
      limitations: [],
    },
  ];
  
  // Calculate savings for annual plan
  const monthlyCost = subscriptionTiers[1].price.monthly;
  const annualCost = subscriptionTiers[1].price.annual;
  const annualSavings = (monthlyCost * 12 - annualCost).toFixed(2);
  const annualSavingsPercentage = Math.round((1 - (annualCost / (monthlyCost * 12))) * 100);
  
  // Simulate purchase
  const handlePurchase = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      Alert.alert(
        'Subscription Activated',
        `Your ${selectedPlan} Premium subscription has been activated successfully!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error purchasing subscription:', error);
      Alert.alert('Error', 'Failed to process your payment. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Simulate restoring purchase
  const handleRestorePurchase = async () => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show message
      Alert.alert(
        'Subscription Restored',
        'Your previous subscription has been restored.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error restoring purchase:', error);
      Alert.alert('Error', 'Failed to restore your purchase. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h3">Subscription</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero section */}
        <View style={styles.heroSection}>
          <View 
            style={[styles.heroImagePlaceholder, { backgroundColor: colors.primary.light }]}
          >
            <Ionicons name="diamond" size={80} color={colors.primary.main} />
          </View>
          <Text variant="h2" style={styles.heroTitle}>
            Upgrade to Premium
          </Text>
          <Text variant="body" color="secondary" style={styles.heroSubtitle}>
            Unlock all features and take your mindfulness journey to the next level
          </Text>
        </View>
        
        {/* Plan selection */}
        <View style={styles.planSelection}>
          <TouchableOpacity 
            style={[
              styles.planOption,
              { 
                backgroundColor: selectedPlan === 'monthly' 
                  ? colors.primary.main 
                  : isDark ? colors.background.paper : colors.background.light,
                borderColor: selectedPlan === 'monthly' 
                  ? colors.primary.main 
                  : colors.neutral.light,
              }
            ]}
            onPress={() => setSelectedPlan('monthly')}
          >
            <Text 
              variant="subtitle" 
              color={selectedPlan === 'monthly' ? 'light' : 'text'}
            >
              Monthly
            </Text>
            <Text 
              variant="body" 
              color={selectedPlan === 'monthly' ? 'light' : 'secondary'}
            >
              ${subscriptionTiers[1].price.monthly}/mo
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.planOption,
              { 
                backgroundColor: selectedPlan === 'annual' 
                  ? colors.primary.main 
                  : isDark ? colors.background.paper : colors.background.light,
                borderColor: selectedPlan === 'annual' 
                  ? colors.primary.main 
                  : colors.neutral.light,
              }
            ]}
            onPress={() => setSelectedPlan('annual')}
          >
            <View style={styles.annualLabelContainer}>
              <Text 
                variant="subtitle" 
                color={selectedPlan === 'annual' ? 'light' : 'text'}
              >
                Annual
              </Text>
              <View style={[styles.savingsPill, { backgroundColor: colors.success.main }]}>
                <Text variant="caption" color="light">
                  Save {annualSavingsPercentage}%
                </Text>
              </View>
            </View>
            <Text 
              variant="body" 
              color={selectedPlan === 'annual' ? 'light' : 'secondary'}
            >
              ${subscriptionTiers[1].price.annual}/yr
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Premium features */}
        <View style={[styles.featuresCard, { backgroundColor: colors.background.paper }]}>
          <Text variant="h4" style={styles.featuresTitle}>
            Premium Features
          </Text>
          
          {subscriptionTiers[1].features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success.main} />
              <Text variant="body" style={styles.featureText}>
                {feature}
              </Text>
            </View>
          ))}
        </View>
        
        {/* Comparison */}
        <View style={styles.comparisonSection}>
          <Text variant="h4" style={styles.comparisonTitle}>
            Plan Comparison
          </Text>
          
          <View style={[styles.comparisonTable, { backgroundColor: colors.background.paper }]}>
            {/* Header row */}
            <View style={[styles.comparisonRow, { 
              borderBottomColor: isDark ? colors.neutral.darker : colors.neutral.lighter 
            }]}>
              <View style={styles.comparisonFeatureCell}>
                <Text variant="caption" color="secondary">
                  Features
                </Text>
              </View>
              <View style={styles.comparisonCell}>
                <Text variant="caption" color="secondary">
                  Free
                </Text>
              </View>
              <View style={styles.comparisonCell}>
                <Text variant="caption" color="secondary">
                  Premium
                </Text>
              </View>
            </View>
            
            {/* Feature rows */}
            <View style={[styles.comparisonRow, { 
              borderBottomColor: isDark ? colors.neutral.darker : colors.neutral.lighter 
            }]}>
              <View style={styles.comparisonFeatureCell}>
                <Text variant="body2">Meditation Library</Text>
              </View>
              <View style={styles.comparisonCell}>
                <Text variant="body2">Basic</Text>
              </View>
              <View style={styles.comparisonCell}>
                <Text variant="body2" color="primary">Full</Text>
              </View>
            </View>
            
            <View style={[styles.comparisonRow, { 
              borderBottomColor: isDark ? colors.neutral.darker : colors.neutral.lighter 
            }]}>
              <View style={styles.comparisonFeatureCell}>
                <Text variant="body2">Journal Entries</Text>
              </View>
              <View style={styles.comparisonCell}>
                <Text variant="body2">5 / month</Text>
              </View>
              <View style={styles.comparisonCell}>
                <Text variant="body2" color="primary">Unlimited</Text>
              </View>
            </View>
            
            <View style={[styles.comparisonRow, { 
              borderBottomColor: isDark ? colors.neutral.darker : colors.neutral.lighter 
            }]}>
              <View style={styles.comparisonFeatureCell}>
                <Text variant="body2">Offline Access</Text>
              </View>
              <View style={styles.comparisonCell}>
                <Ionicons name="close" size={20} color={colors.error.main} />
              </View>
              <View style={styles.comparisonCell}>
                <Ionicons name="checkmark" size={20} color={colors.success.main} />
              </View>
            </View>
            
            <View style={[styles.comparisonRow, { 
              borderBottomColor: isDark ? colors.neutral.darker : colors.neutral.lighter 
            }]}>
              <View style={styles.comparisonFeatureCell}>
                <Text variant="body2">Analytics</Text>
              </View>
              <View style={styles.comparisonCell}>
                <Text variant="body2">Basic</Text>
              </View>
              <View style={styles.comparisonCell}>
                <Text variant="body2" color="primary">Advanced</Text>
              </View>
            </View>
            
            <View style={styles.comparisonRow}>
              <View style={styles.comparisonFeatureCell}>
                <Text variant="body2">Ad-Free Experience</Text>
              </View>
              <View style={styles.comparisonCell}>
                <Ionicons name="close" size={20} color={colors.error.main} />
              </View>
              <View style={styles.comparisonCell}>
                <Ionicons name="checkmark" size={20} color={colors.success.main} />
              </View>
            </View>
          </View>
        </View>
        
        {/* Purchase button */}
        <TouchableOpacity
          style={[styles.purchaseButton, { backgroundColor: colors.primary.main }]}
          onPress={handlePurchase}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary.contrastText} />
          ) : (
            <>
              <Text variant="button" color="light">
                Subscribe Now
              </Text>
              <Text variant="caption" color="light">
                {selectedPlan === 'monthly' 
                  ? `$${subscriptionTiers[1].price.monthly}/month`
                  : `$${subscriptionTiers[1].price.annual}/year`}
              </Text>
            </>
          )}
        </TouchableOpacity>
        
        {/* Restore purchase */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestorePurchase}
          disabled={loading}
        >
          <Text variant="body2" color="secondary">
            Restore Purchase
          </Text>
        </TouchableOpacity>
        
        {/* Terms */}
        <Text variant="caption" color="secondary" style={styles.termsText}>
          By subscribing, you agree to our Terms of Service and Privacy Policy. Your subscription will automatically renew unless canceled at least 24 hours before the end of the current period. You can manage your subscription in your app store account settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  placeholder: {
    width: 32,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  heroImagePlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  planSelection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  planOption: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
    borderWidth: 1,
  },
  annualLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingsPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  featuresCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  featuresTitle: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    marginLeft: 12,
  },
  comparisonSection: {
    marginBottom: 24,
  },
  comparisonTitle: {
    marginBottom: 16,
  },
  comparisonTable: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  comparisonRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  comparisonFeatureCell: {
    flex: 2,
    paddingHorizontal: 16,
  },
  comparisonCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchaseButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  restoreButton: {
    alignItems: 'center',
    padding: 8,
    marginBottom: 16,
  },
  termsText: {
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});

export default SubscriptionScreen;