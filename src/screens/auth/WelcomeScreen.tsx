import React from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  Image,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { Text, Button } from '../../components/ui';
import { LinearGradient } from 'expo-linear-gradient';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Welcome'
>;

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const { currentTheme } = useTheme();
  const { colors, spacing } = currentTheme;
  const { width, height } = useWindowDimensions();

  // Navigate to login screen
  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  // Navigate to register screen
  const handleRegisterPress = () => {
    navigation.navigate('Register');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ImageBackground
        source={require('../../../assets/images/welcome-bg.jpg')}
        style={styles.backgroundImage}
        defaultSource={require('../../../assets/images/welcome-bg.jpg')}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea}>
            {/* Logo and App Name */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text variant="h1" color="light" style={styles.appName}>
                Mindful Mastery
              </Text>
              <Text variant="body" color="light" style={styles.tagline}>
                Master your performance anxiety with mindfulness
              </Text>
            </View>
            
            {/* Features Highlights */}
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: colors.primary.main }]}>
                  <Text variant="h3" color="light">🧘</Text>
                </View>
                <View style={styles.featureText}>
                  <Text variant="h4" color="light">
                    Guided Meditations
                  </Text>
                  <Text variant="body2" color="light">
                    Specialized to help with performance anxiety
                  </Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: colors.primary.main }]}>
                  <Text variant="h3" color="light">📝</Text>
                </View>
                <View style={styles.featureText}>
                  <Text variant="h4" color="light">
                    Anxiety Journal
                  </Text>
                  <Text variant="body2" color="light">
                    Track your progress and identify triggers
                  </Text>
                </View>
              </View>
              
              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: colors.primary.main }]}>
                  <Text variant="h3" color="light">🏆</Text>
                </View>
                <View style={styles.featureText}>
                  <Text variant="h4" color="light">
                    Achievements
                  </Text>
                  <Text variant="body2" color="light">
                    Stay motivated with rewards and milestones
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Authentication Buttons */}
            <View style={styles.authButtonsContainer}>
              <Button
                title="Sign In"
                variant="primary"
                size="large"
                fullWidth
                style={styles.loginButton}
                onPress={handleLoginPress}
              />
              
              <Button
                title="Create Account"
                variant="outline"
                size="large"
                fullWidth
                style={[styles.registerButton, { borderColor: colors.primary.contrast }]}
                textStyle={{ color: colors.primary.contrast }}
                onPress={handleRegisterPress}
              />
            </View>
            
            {/* Terms and Privacy */}
            <View style={styles.termsContainer}>
              <Text variant="caption" color="light" style={styles.termsText}>
                By continuing, you agree to our{' '}
                <Text variant="caption" color="light" style={styles.termsLink}>
                  Terms of Service
                </Text>{' '}
                and{' '}
                <Text variant="caption" color="light" style={styles.termsLink}>
                  Privacy Policy
                </Text>
              </Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  appName: {
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    textAlign: 'center',
    opacity: 0.8,
  },
  featuresContainer: {
    marginVertical: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  authButtonsContainer: {
    marginBottom: 20,
  },
  loginButton: {
    marginBottom: 16,
  },
  registerButton: {
    backgroundColor: 'transparent',
  },
  termsContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  termsText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  termsLink: {
    textDecorationLine: 'underline',
  },
});

export default WelcomeScreen;
