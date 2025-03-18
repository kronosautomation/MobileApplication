import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

type NavigationProps = NativeStackNavigationProp<ProfileStackParamList, 'About'>;

const AboutScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const { currentTheme, isDark } = useTheme();
  const { colors } = currentTheme;

  const appVersion = '1.0.0'; // This should come from app.json or a config file

  const handleVisitWebsite = () => {
    Linking.openURL('https://www.mindfulmastery.app');
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@mindfulmastery.app');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>About</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.logoContainer}>
          <Ionicons name="leaf" size={60} color={colors.primary.main} />
          <Text style={[styles.appName, { color: colors.text.primary }]}>Mindful Mastery</Text>
          <Text style={[styles.versionText, { color: colors.text.secondary }]}>Version {appVersion}</Text>
        </View>
        
        <View style={[styles.sectionContainer, { backgroundColor: isDark ? colors.background.paper : colors.background.light }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>About Us</Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary }]}>
            Mindful Mastery is a comprehensive meditation and journaling app designed to help you overcome performance anxiety and build confidence through mindfulness practices.
          </Text>
          <Text style={[styles.sectionText, { color: colors.text.secondary, marginTop: 10 }]}>
            Our team of meditation experts, psychologists, and performance coaches have created a unique approach that combines guided meditations, journaling, and achievement tracking to help you succeed in all areas of life.
          </Text>
        </View>
        
        <View style={[styles.sectionContainer, { backgroundColor: isDark ? colors.background.paper : colors.background.light }]}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Contact Us</Text>
          
          <TouchableOpacity style={styles.linkButton} onPress={handleVisitWebsite}>
            <Ionicons name="globe-outline" size={24} color={colors.primary.main} />
            <Text style={[styles.linkText, { color: colors.primary.main }]}>Visit our website</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.linkButton} onPress={handleContactSupport}>
            <Ionicons name="mail-outline" size={24} color={colors.primary.main} />
            <Text style={[styles.linkText, { color: colors.primary.main }]}>Contact support</Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.creditsContainer, { borderTopColor: colors.neutral.light }]}>
          <Text style={[styles.creditText, { color: colors.text.hint }]}>
            © {new Date().getFullYear()} Mindful Mastery. All rights reserved.
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
  logoContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  appName: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    marginTop: 12,
  },
  versionText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginTop: 4,
  },
  sectionContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  linkText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginLeft: 12,
  },
  creditsContainer: {
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  creditText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default AboutScreen;