import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const PremiumContentScreen: React.FC = () => {
  const navigation = useNavigation();
  const { currentTheme } = useTheme();
  const { colors, spacing } = currentTheme;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
          Premium Content
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.premiumBadge, { backgroundColor: colors.primary.main }]}>
          <Ionicons name="diamond" size={24} color={colors.primary.contrast} />
          <Text style={[styles.premiumText, { color: colors.primary.contrast }]}>
            Premium Feature
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.text.primary }]}>
          Unlock Advanced Content
        </Text>

        <Text style={[styles.description, { color: colors.text.secondary }]}>
          This premium content helps you dive deeper into performance anxiety management with advanced techniques and personalized guidance.
        </Text>

        <View style={[styles.featureCard, { backgroundColor: colors.background.paper }]}>
          <View style={styles.featureHeader}>
            <Ionicons name="book-outline" size={24} color={colors.primary.main} />
            <Text style={[styles.featureTitle, { color: colors.text.primary }]}>
              Advanced Meditation Techniques
            </Text>
          </View>
          <Text style={[styles.featureDescription, { color: colors.text.secondary }]}>
            Access our complete library of specialized guided meditations designed for performance anxiety.
          </Text>
        </View>

        <View style={[styles.featureCard, { backgroundColor: colors.background.paper }]}>
          <View style={styles.featureHeader}>
            <Ionicons name="analytics-outline" size={24} color={colors.primary.main} />
            <Text style={[styles.featureTitle, { color: colors.text.primary }]}>
              Detailed Progress Analytics
            </Text>
          </View>
          <Text style={[styles.featureDescription, { color: colors.text.secondary }]}>
            Track your improvement over time with comprehensive analytics and insights.
          </Text>
        </View>

        <View style={[styles.featureCard, { backgroundColor: colors.background.paper }]}>
          <View style={styles.featureHeader}>
            <Ionicons name="journal-outline" size={24} color={colors.primary.main} />
            <Text style={[styles.featureTitle, { color: colors.text.primary }]}>
              Unlimited Journal Entries
            </Text>
          </View>
          <Text style={[styles.featureDescription, { color: colors.text.secondary }]}>
            Document your journey without limits and access advanced journaling tools.
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.subscribeButton, { backgroundColor: colors.primary.main }]}
          onPress={() => navigation.navigate('Profile', { screen: 'Subscription' })}
        >
          <Text style={[styles.buttonText, { color: colors.primary.contrast }]}>
            Upgrade to Premium
          </Text>
        </TouchableOpacity>
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
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  premiumText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  featureCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 36,
  },
  subscribeButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default PremiumContentScreen;
