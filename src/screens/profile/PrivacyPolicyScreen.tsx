import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type NavigationProps = NativeStackNavigationProp<ProfileStackParamList, 'PrivacyPolicy'>;

const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;

  const lastUpdated = 'January 1, 2025';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        <Text style={[styles.lastUpdated, { color: colors.text.secondary }]}>
          Last Updated: {lastUpdated}
        </Text>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Introduction
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            Mindful Mastery ("we," "our," or "us") respects your privacy and is committed to protecting it through our compliance with this policy. This Privacy Policy describes the types of information we may collect from you or that you may provide when you use our mobile application (the "App") and our practices for collecting, using, maintaining, protecting, and disclosing that information.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Information We Collect
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            We collect several types of information from and about users of our App, including:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text.secondary }]}>
            • Personal information you provide to us when registering for an account, such as your name, email address, and profile information.
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text.secondary }]}>
            • Information about your meditation sessions, journal entries, and usage of the app features.
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text.secondary }]}>
            • Device information, including your device type, operating system, and usage data.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            How We Use Your Information
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            We use your information to:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text.secondary }]}>
            • Provide, maintain, and improve our App and services.
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text.secondary }]}>
            • Process and manage your account, including tracking your progress and achievements.
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text.secondary }]}>
            • Communicate with you about updates, features, or respond to your inquiries.
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text.secondary }]}>
            • Analyze usage patterns to enhance user experience and develop new features.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Data Security
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet or electronic storage is 100% secure, so we cannot guarantee absolute security.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Your Rights
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            You have the right to access, correct, or delete your personal information. You can manage most of your data directly through the App settings. For additional assistance, please contact us at privacy@mindfulmastery.app.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Changes to Our Privacy Policy
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Contact Us
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            If you have questions or concerns about this Privacy Policy, please contact us at privacy@mindfulmastery.app.
          </Text>
        </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 24,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  lastUpdated: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    marginBottom: 12,
  },
  sectionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoint: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
    paddingLeft: 4,
  },
});

export default PrivacyPolicyScreen;