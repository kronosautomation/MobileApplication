import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context';
import { ProfileStackParamList } from '../../types';
import { Text } from '../../components/ui';
import { Ionicons } from '@expo/vector-icons';

type ProfileNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

const ProfileMainScreen: React.FC = () => {
  const navigation = useNavigation<ProfileNavigationProp>();
  const { currentTheme, isDark } = useTheme();
  const { colors } = currentTheme;
  const { user, logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  const navigateToScreen = (screen: keyof ProfileStackParamList) => {
    navigation.navigate(screen);
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <View style={styles.header}>
        <Text variant="h3" color="primary">Profile</Text>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* User Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.background.paper }]}>
          <View style={styles.profileHeader}>
            {user?.profileImageUrl ? (
              <Image 
                source={{ uri: user.profileImageUrl }} 
                style={styles.profileImage} 
              />
            ) : (
              <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.primary.light }]}>
                <Text variant="h3" color="primary">
                  {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                </Text>
              </View>
            )}
            
            <View style={styles.profileInfo}>
              <Text variant="h4">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.username || 'User'}
              </Text>
              <Text variant="body2" color="secondary" style={styles.emailText}>
                {user?.email || 'email@example.com'}
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.editButton, { backgroundColor: isDark ? colors.background.dark : colors.background.light }]}
              onPress={() => navigateToScreen('EditProfile')}
            >
              <Ionicons name="pencil" size={18} color={colors.primary.main} />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.divider, { backgroundColor: isDark ? colors.neutral.darker : colors.neutral.lighter }]} />
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text variant="h4" color="primary">
                {user?.createdAt ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0}
              </Text>
              <Text variant="body2" color="secondary">
                Days Active
              </Text>
            </View>
            
            <View style={[styles.statDivider, { backgroundColor: isDark ? colors.neutral.darker : colors.neutral.lighter }]} />
            
            <View style={styles.statItem}>
              <Text variant="h4" color="primary">
                14
              </Text>
              <Text variant="body2" color="secondary">
                Meditations
              </Text>
            </View>
            
            <View style={[styles.statDivider, { backgroundColor: isDark ? colors.neutral.darker : colors.neutral.lighter }]} />
            
            <View style={styles.statItem}>
              <Text variant="h4" color="primary">
                3
              </Text>
              <Text variant="body2" color="secondary">
                Achievements
              </Text>
            </View>
          </View>
        </View>
        
        {/* Subscription Card */}
        <TouchableOpacity 
          style={[styles.subscriptionCard, { backgroundColor: colors.primary.main }]}
          onPress={() => navigateToScreen('Subscription')}
        >
          <View style={styles.subscriptionContent}>
            <Ionicons name="diamond" size={24} color={colors.primary.contrastText} />
            <View style={styles.subscriptionInfo}>
              <Text variant="subtitle" color="light">
                Premium Subscription
              </Text>
              <Text variant="body2" color="light" style={styles.subscriptionDetail}>
                Unlock all features and content
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.primary.contrastText} />
        </TouchableOpacity>
        
        {/* Menu Options */}
        <View style={[styles.menuCard, { backgroundColor: colors.background.paper }]}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigateToScreen('Statistics')}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="stats-chart" size={22} color={colors.primary.main} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text>Statistics</Text>
              <Text variant="body2" color="secondary">
                View your meditation and anxiety stats
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
          
          <View style={[styles.menuDivider, { backgroundColor: isDark ? colors.neutral.darker : colors.neutral.lighter }]} />
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigateToScreen('Settings')}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="settings-outline" size={22} color={colors.primary.main} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text>Settings</Text>
              <Text variant="body2" color="secondary">
                App preferences and account settings
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
          
          <View style={[styles.menuDivider, { backgroundColor: isDark ? colors.neutral.darker : colors.neutral.lighter }]} />
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigateToScreen('About')}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="information-circle-outline" size={22} color={colors.primary.main} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text>About</Text>
              <Text variant="body2" color="secondary">
                Information about the app
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
          
          <View style={[styles.menuDivider, { backgroundColor: isDark ? colors.neutral.darker : colors.neutral.lighter }]} />
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigateToScreen('PrivacyPolicy')}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="shield-outline" size={22} color={colors.primary.main} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text>Privacy Policy</Text>
              <Text variant="body2" color="secondary">
                How we protect your data
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
          
          <View style={[styles.menuDivider, { backgroundColor: isDark ? colors.neutral.darker : colors.neutral.lighter }]} />
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigateToScreen('TermsOfService')}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="document-text-outline" size={22} color={colors.primary.main} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text>Terms of Service</Text>
              <Text variant="body2" color="secondary">
                Usage terms and conditions
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
        
        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.logoutButton, { borderColor: colors.error.main }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error.main} />
          <Text color="error" style={styles.logoutText}>
            Logout
          </Text>
        </TouchableOpacity>
        
        {/* Version info */}
        <Text variant="caption" color="secondary" style={styles.versionText}>
          Version 1.0.0
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profileImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  emailText: {
    marginTop: 4,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  subscriptionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subscriptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscriptionInfo: {
    marginLeft: 12,
  },
  subscriptionDetail: {
    marginTop: 2,
    opacity: 0.9,
  },
  menuCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuDivider: {
    height: 1,
    marginLeft: 68,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  logoutText: {
    marginLeft: 8,
    fontFamily: 'Inter-Medium',
    fontSize: 16,
  },
  versionText: {
    textAlign: 'center',
  },
});

export default ProfileMainScreen;