import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type NavigationProps = NativeStackNavigationProp<ProfileStackParamList, 'TermsOfService'>;

const TermsOfServiceScreen: React.FC = () => {
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
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Terms of Service</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        <Text style={[styles.lastUpdated, { color: colors.text.secondary }]}>
          Last Updated: {lastUpdated}
        </Text>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Agreement to Terms
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            By accessing or using the Mindful Mastery mobile application ("App"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing the App.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Use License
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            Permission is granted to download and use the App for personal, non-commercial use only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text.secondary }]}>
            • Modify or copy the materials;
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text.secondary }]}>
            • Use the materials for any commercial purpose or for any public display;
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text.secondary }]}>
            • Attempt to reverse engineer any software contained in the App;
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text.secondary }]}>
            • Remove any copyright or other proprietary notations from the materials;
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text.secondary }]}>
            • Transfer the materials to another person or "mirror" the materials on any other server.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Subscription Terms
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            Some features of the App require a paid subscription. When you purchase a subscription:
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text.secondary }]}>
            • Payment will be charged to your Apple ID or Google Play account at confirmation of purchase;
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text.secondary }]}>
            • Subscription automatically renews unless auto-renew is turned off at least 24 hours before the end of the current period;
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text.secondary }]}>
            • Your account will be charged for renewal within 24 hours prior to the end of the current period;
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text.secondary }]}>
            • You can manage and cancel your subscriptions by going to your account settings in the App Store or Google Play Store after purchase;
          </Text>
          <Text style={[styles.bulletPoint, { color: colors.text.secondary }]}>
            • No refunds will be granted for any partially used subscription period.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Disclaimer
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            The materials in the App are provided "as is". Mindful Mastery makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties, including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary, marginTop: 8 }]}>
            The App is not intended to diagnose, treat, cure, or prevent any disease or health condition. Consult with a healthcare professional before using this App for any health-related concerns.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Limitations
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            In no event shall Mindful Mastery or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the App, even if Mindful Mastery or a Mindful Mastery authorized representative has been notified orally or in writing of the possibility of such damage.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Changes to Terms
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            Mindful Mastery may revise these Terms of Service at any time without notice. By using the App, you agree to be bound by the current version of these Terms of Service.
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Contact Us
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            If you have any questions about these Terms, please contact us at legal@mindfulmastery.app.
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

export default TermsOfServiceScreen;