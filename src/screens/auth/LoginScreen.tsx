import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { useAuth } from '../../auth';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login } = useAuth();
  const { currentTheme } = useTheme();
  const { colors } = currentTheme;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    try {
      const deviceToken = Device.deviceName ?? Device.modelName ?? 'mobile-device';
      await login(email, password, deviceToken);
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to login. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background.default }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={[styles.logoText, { color: colors.primary.main }]}>MindfulMastery</Text>
            <Text style={[styles.tagline, { color: colors.text.secondary }]}>Begin your mindfulness journey</Text>
          </View>

          <View style={[styles.formContainer, { backgroundColor: colors.background.paper }]}>
            <Text style={[styles.formTitle, { color: colors.text.primary }]}>Log in to your account</Text>

            <View style={[styles.inputContainer, { backgroundColor: colors.background.paper, borderColor: colors.neutral.lighter }]}>
              <Ionicons name="mail-outline" size={22} color={colors.text.hint} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                placeholder="Email"
                placeholderTextColor={colors.text.hint}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                testID="login-email-input"
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: colors.background.paper, borderColor: colors.neutral.lighter }]}>
              <Ionicons name="lock-closed-outline" size={22} color={colors.text.hint} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                placeholder="Password"
                placeholderTextColor={colors.text.hint}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                testID="login-password-input"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.showPasswordButton}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={colors.text.hint}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotPasswordLink}
              onPress={() => navigation.navigate('ForgotPassword')}
              testID="forgot-password-button"
            >
              <Text style={[styles.forgotPasswordText, { color: colors.primary.main }]}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              testID="login-button"
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Log In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.neutral.lighter }]} />
              <Text style={[styles.dividerText, { color: colors.text.hint }]}>OR</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.neutral.lighter }]} />
            </View>

            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => navigation.navigate('Register')}
              testID="register-link"
            >
              <Text style={[styles.registerText, { color: colors.text.secondary }]}>
                Don't have an account?{' '}
                <Text style={[styles.registerLinkText, { color: colors.primary.main }]}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  tagline: {
    fontSize: 16,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#f8f9fa',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#333',
    fontSize: 16,
  },
  showPasswordButton: {
    padding: 10,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#4A62FF',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#4A62FF',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#999',
  },
  registerLink: {
    alignItems: 'center',
  },
  registerText: {
    color: '#666',
    fontSize: 14,
  },
  registerLinkText: {
    color: '#4A62FF',
    fontWeight: 'bold',
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default LoginScreen;