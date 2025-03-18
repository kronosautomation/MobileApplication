import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { currentTheme } = useTheme();
  const { colors, spacing } = currentTheme;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.text.primary }]}>
            Good morning
          </Text>
          <Text style={[styles.date, { color: colors.text.secondary }]}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </View>
        
        <View style={[styles.profileButton, { backgroundColor: colors.background.paper }]}>
          <Ionicons name="person" size={24} color={colors.primary.main} />
        </View>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        {/* Daily Progress Card */}
        <View style={[styles.card, { backgroundColor: colors.background.paper }]}>
          <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
            Your Daily Progress
          </Text>
          
          <View style={styles.streakRow}>
            <Ionicons name="flame" size={24} color={colors.warning.main} />
            <Text style={[styles.streakText, { color: colors.text.primary }]}>
              0 days streak
            </Text>
          </View>
          
          <View style={styles.statusRow}>
            <Ionicons name="timer-outline" size={20} color={colors.text.secondary} />
            <Text style={[styles.statusText, { color: colors.text.secondary }]}>
              No meditation yet today
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: colors.primary.main }]}
            onPress={() => navigation.navigate('Meditations')}
          >
            <Text style={[styles.buttonText, { color: colors.primary.contrast }]}>
              Meditate Now
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Featured Meditations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Featured Meditations
            </Text>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: colors.primary.main }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {[1, 2, 3].map((item) => (
              <View 
                key={item} 
                style={[styles.meditationCard, { backgroundColor: colors.background.paper }]}
              >
                <View style={styles.cardContent}>
                  <Text style={[styles.meditationTitle, { color: colors.text.primary }]}>
                    Calming Anxiety
                  </Text>
                  <Text style={[styles.meditationInfo, { color: colors.text.secondary }]}>
                    10 min • Beginner
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
        
        {/* Premium Banner */}
        <View style={[styles.premiumCard, { backgroundColor: colors.primary.light }]}>
          <View style={styles.premiumContent}>
            <Text style={[styles.premiumTitle, { color: colors.primary.contrast }]}>
              Upgrade to Premium
            </Text>
            <Text style={[styles.premiumText, { color: colors.primary.contrast }]}>
              Unlock all meditations and features
            </Text>
            <TouchableOpacity 
              style={[styles.premiumButton, { backgroundColor: colors.primary.main }]}
              onPress={() => navigation.navigate('Profile', { screen: 'Subscription' })}
            >
              <Text style={[styles.premiumButtonText, { color: colors.primary.contrast }]}>
                Upgrade
              </Text>
            </TouchableOpacity>
          </View>
          <Ionicons name="diamond" size={60} color={colors.primary.contrast} style={styles.premiumIcon} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 80,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  streakText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 14,
  },
  horizontalScroll: {
    marginLeft: -6,
  },
  meditationCard: {
    width: 200,
    height: 120,
    marginHorizontal: 6,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'flex-end',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  meditationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  meditationInfo: {
    fontSize: 12,
  },
  premiumCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  premiumContent: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  premiumText: {
    fontSize: 14,
    marginBottom: 12,
    opacity: 0.9,
  },
  premiumButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  premiumButtonText: {
    fontWeight: '600',
  },
  premiumIcon: {
    marginLeft: 16,
    opacity: 0.9,
  },
});

export default HomeScreen;
