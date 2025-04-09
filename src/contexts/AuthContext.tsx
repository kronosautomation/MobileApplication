import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { authService } from '../api/authService';
import { User, LoginCredentials, RegisterData } from '../types';

// Define types for user and auth context
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
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updateEmailSettings: (settings: EmailSettings) => Promise<void>;
  getEmailSettings: () => Promise<EmailSettings | null>;
  updateUser: (userData: Partial<User>) => Promise<void>;
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
  updateUser: async () => {},
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
      
      // Create the credentials object
      const credentials: LoginCredentials = {
        email,
        password
      };
      
      // Call the auth service to login
      const result = await authService.login(credentials);
      
      // Get current user profile
      const userProfile = await authService.getCurrentUser();
      
      // Save data to AsyncStorage
      await Promise.all([
        AsyncStorage.setItem('@MindfulMastery:user', JSON.stringify(userProfile)),
        AsyncStorage.setItem('@MindfulMastery:token', result.accessToken),
        AsyncStorage.setItem('@MindfulMastery:refreshToken', result.refreshToken)
      ]);
      
      // Update state
      setUser(userProfile);
      setToken(result.accessToken);
      setRefreshToken(result.refreshToken);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string, firstName: string, lastName: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Create register data object
      const registerData: RegisterData = {
        email,
        password,
        firstName,
        lastName,
        username: email.split('@')[0] // Generate username from email
      };
      
      const response = await authService.register(registerData);
      
      // Store tokens
      await AsyncStorage.setItem('@MindfulMastery:token', response.accessToken);
      await AsyncStorage.setItem('@MindfulMastery:refreshToken', response.refreshToken);
      
      // Get user profile
      const userProfile = await authService.getCurrentUser();
      
      // Store user data
      await AsyncStorage.setItem('@MindfulMastery:user', JSON.stringify(userProfile));
      
      // Update state
      setUser(userProfile);
      setToken(response.accessToken);
      setRefreshToken(response.refreshToken);
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
      
      // Call auth service to logout
      await authService.logout();
      
      // Clear local storage
      await AsyncStorage.multiRemove([
        '@MindfulMastery:user',
        '@MindfulMastery:token',
        '@MindfulMastery:refreshToken',
        '@MindfulMastery:tokenExpiration'
      ]);
      
      // Clear state
      setUser(null);
      setToken(null);
      setRefreshToken(null);
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if the API call fails, clear local state
      await AsyncStorage.multiRemove([
        '@MindfulMastery:user',
        '@MindfulMastery:token',
        '@MindfulMastery:refreshToken',
        '@MindfulMastery:tokenExpiration'
      ]);
      
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      
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

  // Continue as guest function - we need to implement this with a real API call if backend supports it
  const continueAsGuest = async () => {
    try {
      setIsLoading(true);
      
      // TODO: Replace with actual API call to create a guest session
      // For now, we'll create a temporary guest user
      const guestUser: User = {
        id: `guest-${Date.now()}`,
        email: 'guest@example.com',
        username: 'guest',
        firstName: 'Guest',
        lastName: 'User',
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        isVerified: false,
        lastLogin: new Date().toISOString()
      };
      
      // Store guest user data in AsyncStorage
      await AsyncStorage.setItem('@MindfulMastery:user', JSON.stringify(guestUser));
      
      // Set a temporary token for guest users
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
      
      // Call service to request password reset
      await authService.requestPasswordReset(email);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update user function
  const updateUser = async (userData: Partial<User>): Promise<void> => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }
      
      // Call the auth service to update the user profile
      const updatedUser = await authService.updateUserProfile(userData);
      
      // Update local state
      setUser(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
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
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;