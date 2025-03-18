import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Define types for user and auth context
type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  lastLoginAt?: string;
  preferences?: UserPreferences;
  hasActiveSubscription: boolean;
  subscriptionTier?: string;
  isGuest?: boolean;
};

type UserPreferences = {
  theme: string;
  enableNotifications: boolean;
  reminderTime?: string;
  reminderDays: number[];
};

// Add email settings
type EmailSettings = {
  smtpServer: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  fromEmail: string;
  isConfigured: boolean;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  token: string | null;
  refreshToken: string | null;
  login: (email: string, password: string, deviceToken: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string, deviceToken: string) => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updateEmailSettings: (settings: EmailSettings) => Promise<void>;
  getEmailSettings: () => Promise<EmailSettings | null>;
};

// Default email settings
const DEFAULT_EMAIL_SETTINGS: EmailSettings = {
  smtpServer: '',
  smtpPort: 587,
  smtpUsername: '',
  smtpPassword: '',
  fromEmail: '',
  isConfigured: false
};

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  token: null,
  refreshToken: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  continueAsGuest: async () => {},
  forgotPassword: async () => {},
  updateEmailSettings: async () => {},
  getEmailSettings: async () => null,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored auth data on mount
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const [userDataStr, tokenStr, refreshTokenStr] = await Promise.all([
          AsyncStorage.getItem('@MindfulMastery:user'),
          AsyncStorage.getItem('@MindfulMastery:token'),
          AsyncStorage.getItem('@MindfulMastery:refreshToken')
        ]);
        
        if (userDataStr && tokenStr && refreshTokenStr) {
          setUser(JSON.parse(userDataStr));
          setToken(tokenStr);
          setRefreshToken(refreshTokenStr);
        }
      } catch (error) {
        console.error('Error restoring user session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // Login function
  const login = async (email: string, password: string, deviceToken: string) => {
    try {
      setIsLoading(true);
      
      // In a real app, this would be an API call to your backend
      // For example:
      // const response = await fetch('https://api.mindfulmastery.com/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password, deviceToken })
      // });
      //
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Login failed');
      // }
      //
      // const data = await response.json();
      
      // Simulate successful API response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response data
      const mockResponseData = {
        token: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        user: {
          id: 'user-1',
          email,
          firstName: 'Sarah',
          lastName: 'Johnson',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          preferences: {
            theme: 'light',
            enableNotifications: true,
            reminderTime: '08:00',
            reminderDays: [1, 2, 3, 4, 5]
          },
          hasActiveSubscription: true,
          subscriptionTier: 'Premium'
        },
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
      };
      
      // Store auth data in AsyncStorage
      await Promise.all([
        AsyncStorage.setItem('@MindfulMastery:user', JSON.stringify(mockResponseData.user)),
        AsyncStorage.setItem('@MindfulMastery:token', mockResponseData.token),
        AsyncStorage.setItem('@MindfulMastery:refreshToken', mockResponseData.refreshToken),
        AsyncStorage.setItem('@MindfulMastery:tokenExpiration', mockResponseData.expiresAt)
      ]);
      
      // Update state
      setUser(mockResponseData.user);
      setToken(mockResponseData.token);
      setRefreshToken(mockResponseData.refreshToken);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (firstName: string, lastName: string, email: string, password: string, deviceToken: string) => {
    try {
      setIsLoading(true);
      
      // In a real app, this would be an API call to register the user
      // For example:
      // const response = await fetch('https://api.mindfulmastery.com/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ firstName, lastName, email, password, deviceToken })
      // });
      //
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Registration failed');
      // }
      //
      // const data = await response.json();
      
      // Simulate successful API response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock success response (no auto-login after registration)
      // In a real implementation, we could return tokens here if the API does auto-login
      return;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // In a real app, we would call the logout API endpoint:
      // if (token) {
      //   await fetch('https://api.mindfulmastery.com/auth/logout', {
      //     method: 'POST',
      //     headers: {
      //       'Authorization': `Bearer ${token}`,
      //       'Content-Type': 'application/json'
      //     },
      //     body: JSON.stringify({ deviceId: getDeviceId() })
      //   });
      // }
      
      // Clear auth data from AsyncStorage
      await AsyncStorage.multiRemove([
        '@MindfulMastery:user',
        '@MindfulMastery:token',
        '@MindfulMastery:refreshToken',
        '@MindfulMastery:tokenExpiration'
      ]);
      
      // Update state
      setUser(null);
      setToken(null);
      setRefreshToken(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get device ID helper
  const getDeviceId = (): string => {
    return Device.deviceName ?? 
      Device.modelName ?? 
      'mobile-device';
  };

  // Continue as guest function
  const continueAsGuest = async () => {
    try {
      setIsLoading(true);
      
      // Create a guest user
      const guestUser: User = {
        id: `guest-${Date.now()}`,
        email: 'guest@example.com',
        firstName: 'Guest',
        lastName: 'User',
        createdAt: new Date().toISOString(),
        hasActiveSubscription: false,
        isGuest: true,
      };
      
      // Store guest user data in AsyncStorage
      await AsyncStorage.setItem('@MindfulMastery:user', JSON.stringify(guestUser));
      
      // Set a dummy token for guest users
      const guestToken = 'guest-token-' + Date.now();
      await AsyncStorage.setItem('@MindfulMastery:token', guestToken);
      
      // Update state
      setUser(guestUser);
      setToken(guestToken);
    } catch (error) {
      console.error('Guest login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update email settings for password reset functionality
  const updateEmailSettings = async (settings: EmailSettings) => {
    try {
      await AsyncStorage.setItem('@MindfulMastery:emailSettings', JSON.stringify({
        ...settings,
        isConfigured: true
      }));
    } catch (error) {
      console.error('Error updating email settings:', error);
      throw error;
    }
  };

  // Get email settings
  const getEmailSettings = async (): Promise<EmailSettings | null> => {
    try {
      const settings = await AsyncStorage.getItem('@MindfulMastery:emailSettings');
      if (settings) {
        return JSON.parse(settings);
      }
      return DEFAULT_EMAIL_SETTINGS;
    } catch (error) {
      console.error('Error getting email settings:', error);
      return DEFAULT_EMAIL_SETTINGS;
    }
  };

  // Forgot password function
  const forgotPassword = async (email: string) => {
    try {
      setIsLoading(true);
      
      // Get email settings
      const emailSettings = await getEmailSettings();
      
      if (!emailSettings || !emailSettings.isConfigured) {
        throw new Error('Email settings not configured. Please set up email configuration in settings.');
      }
      
      // In a real app with email functionality, this would:
      // 1. Generate a reset token and store it in the database
      // 2. Send an email with the reset link
      
      // For now, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`Password reset email would be sent to ${email} using SMTP server: ${emailSettings.smtpServer}`);
      
      return;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Value object with all the auth functions and state
  const value = {
    user,
    isLoading,
    token,
    refreshToken,
    login,
    register,
    logout,
    continueAsGuest,
    forgotPassword,
    updateEmailSettings,
    getEmailSettings,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;