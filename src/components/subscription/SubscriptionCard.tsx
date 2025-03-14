import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Text, Card } from '../ui';
import { Ionicons } from '@expo/vector-icons';
import * as Purchases from 'react-native-purchases';

interface SubscriptionCardProps {
  title: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
  package?: Purchases.Package;
  onSelect: (pkg?: Purchases.Package) => void;
  currentSubscription?: boolean;
  style?: ViewStyle;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  title,
  description,
  price,
  period,
  features,
  highlighted = false,
  package: pkg,
  onSelect,
  currentSubscription = false,
  style,
}) => {
  const { currentTheme } = useTheme();
  const { colors, spacing, borderRadius } = currentTheme;

  // Handle select
  const handleSelect = () => {
    if (!currentSubscription) {
      onSelect(pkg);
    }
  };

  return (
    <Card
      style={[
        styles.container,
        highlighted && {
          borderWidth: 2,
          borderColor: colors.primary.main,
        },
        currentSubscription && {
          borderWidth: 2,
          borderColor: colors.success.main,
        },
        style,
      ]}
      elevation={highlighted ? 'md' : 'sm'}
    >
      {/* Subscription Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: highlighted
              ? colors.primary.main
              : currentSubscription
              ? colors.success.main
              : colors.neutral.lightest,
          },
        ]}
      >
        <Text
          variant="h3"
          color={highlighted || currentSubscription ? 'light' : 'primary'}
        >
          {title}
        </Text>
        
        {currentSubscription && (
          <View style={styles.currentBadge}>
            <Text variant="caption" color="light" style={styles.currentText}>
              CURRENT PLAN
            </Text>
          </View>
        )}
      </View>

      {/* Subscription Body */}
      <View style={styles.body}>
        <Text variant="body2" color="secondary" style={styles.description}>
          {description}
        </Text>

        <View style={styles.priceContainer}>
          <Text
            variant="h2"
            color="primary"
            style={styles.price}
          >
            {price}
          </Text>
          <Text variant="body2" color="secondary">
            {period}
          </Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresList}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={highlighted ? colors.primary.main : colors.success.main}
                style={styles.featureIcon}
              />
              <Text variant="body2" style={styles.featureText}>
                {feature}
              </Text>
            </View>
          ))}
        </View>

        {/* Select Button */}
        <TouchableOpacity
          style={[
            styles.selectButton,
            {
              backgroundColor: currentSubscription
                ? colors.neutral.lightest
                : highlighted
                ? colors.primary.main
                : colors.background.paper,
              borderColor: currentSubscription
                ? colors.neutral.light
                : highlighted
                ? colors.primary.main
                : colors.primary.main,
            },
          ]}
          onPress={handleSelect}
          disabled={currentSubscription}
        >
          <Text
            variant="button"
            color={
              currentSubscription
                ? 'disabled'
                : highlighted
                ? 'light'
                : 'primary'
            }
          >
            {currentSubscription ? 'Current Plan' : 'Select'}
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    marginVertical: 12,
    padding: 0,
  },
  header: {
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  currentBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
  },
  currentText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  body: {
    padding: 16,
  },
  description: {
    marginBottom: 16,
    textAlign: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 20,
  },
  price: {
    marginRight: 4,
  },
  featuresList: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    marginRight: 8,
  },
  featureText: {
    flex: 1,
  },
  selectButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});

export default SubscriptionCard;
