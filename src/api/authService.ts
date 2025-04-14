import apiClient, { getActionPath, getApiPath, getResourcePath, getSubResourcePath } from './apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginCredentials, RegisterData, AuthTokens, User } from '../types';

// Service for authentication-related API calls
class AuthService {
  // Login with email and password
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    try {
      console.log('🔐 Attempting login with email:', credentials.email);
      
      const response = await apiClient.post<{
        token?: string;
        accessToken?: string;  // Add support for this alternative property name
        refreshToken: string;
        expiresAt: string;
        userId?: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        user?: User;
      }>(getActionPath('auth', 'login'), {
        email: credentials.email,
        password: credentials.password,
        deviceToken: 'mobile-device' // Use a device identifier
      });
      
      console.log('✅ Login successful');
      console.log('📦 Response structure:', Object.keys(response));
      
      // Extract the accessToken, handling both naming conventions
      const accessToken = response.token || response.accessToken;
      
      // Check that both tokens exist before storing
      if (accessToken && response.refreshToken) {
        // Store the tokens
        await apiClient.setAuthTokens(accessToken, response.refreshToken);
      } else {
        console.error('❌ Login response missing token or refreshToken:', 
          { hasToken: !!accessToken, hasRefreshToken: !!response.refreshToken });
        throw new Error('Login successful but authentication tokens are missing');
      }
      
      // If the login response includes user data, store it
      if (response.user) {
        console.log('User data included in login response, storing...');
        await apiClient.storeUserData(response.user);
      } else if (response.userId && response.email) {
        console.log('Basic user data included in login response, storing...');
        // Create simplified user object from response properties
        const userData = {
          id: response.userId,
          email: response.email,
          username: response.email.split('@')[0], // Generate username from email
          firstName: response.firstName || '',
          lastName: response.lastName || '',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
        await apiClient.storeUserData(userData);
      }
      
      return {
        accessToken: accessToken!,
        refreshToken: response.refreshToken,
        expiresIn: new Date(response.expiresAt).getTime() - Date.now()
      };
    } catch (error) {
      console.log('❌ Login failed:', error);
      throw this.handleError(error, 'Login failed');
    }
  }

  // Register a new user
  async register(data: RegisterData): Promise<AuthTokens> {
    try {
      console.log('📝 Attempting to register user:', data.email);
      
      // Updated to handle both response formats (with or without tokens)
      const response = await apiClient.post<{
        userId: string;
        email: string;
        firstName: string;
        lastName: string;
        accessToken?: string;
        refreshToken?: string;
      }>(getActionPath('auth', 'register'), {
        email: data.email,
        password: data.password,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        deviceToken: 'mobile-device' // Use a device identifier
      });
      
      console.log('✅ Registration successful');
      
      // Check if the response includes tokens
      if (response.accessToken && response.refreshToken) {
        console.log('🔑 Tokens received from registration');
        
        // Store the tokens
        try {
          await apiClient.setAuthTokens(response.accessToken, response.refreshToken);
        } catch (tokenError) {
          console.error('⚠️ Error storing tokens:', tokenError);
          throw new Error('Registration successful but failed to store authentication tokens');
        }
        
        // Store user data from registration response
        try {
          const userData = {
            id: response.userId,
            email: response.email,
            username: response.email.split('@')[0],
            firstName: response.firstName || '',
            lastName: response.lastName || '',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          };
          
          await apiClient.storeUserData(userData);
          console.log('💾 Stored basic user data from registration response');
        } catch (storeError) {
          console.log('⚠️ Error storing user data:', storeError);
        }
        
        return {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresIn: 900000 // Default to 15 minutes
        };
      } else {
        // Fall back to login if tokens aren't in the response
        console.log('🔑 Tokens not found in registration response, logging in...');
        const loginResult = await this.login({
          email: data.email,
          password: data.password
        });
        
        return loginResult;
      }
    } catch (error) {
      console.log('❌ Registration failed:', error);
      throw this.handleError(error, 'Registration failed');
    }
  }

  // Logout the current user
  async logout(): Promise<void> {
    try {
      console.log('🚪 Attempting to logout');
      
      // Call logout endpoint
      await apiClient.post(getActionPath('auth', 'logout'));
      
      console.log('✅ Logout successful');
      
      // Clear tokens regardless of the response
      await apiClient.clearTokens();
    } catch (error) {
      console.log('❌ Logout error (will still clear tokens):', error);
      
      // Still clear tokens even if the API call fails
      await apiClient.clearTokens();
      throw this.handleError(error, 'Logout failed');
    }
  }

  // Verify if the current token is valid
  async verifyToken(): Promise<boolean> {
    try {
      console.log('🔍 Verifying token');
      await apiClient.get(getActionPath('auth', 'verify'));
      console.log('✅ Token is valid');
      return true;
    } catch (error) {
      console.log('❌ Token verification failed:', error);
      return false;
    }
  }

  // Get the current user's profile
  async getCurrentUser(): Promise<User> {
    try {
      console.log('👤 Fetching current user profile');
      // Try multiple approaches to get user profile
      
      // 1. First try to get from cached data for quick response
      try {
        const userData = await AsyncStorage.getItem('@MindfulMastery:user');
        if (userData) {
          const user = JSON.parse(userData);
          console.log('✅ Retrieved user profile from local cache');
          return user;
        }
      } catch (cacheError) {
        console.log('⚠️ Error reading from cache:', cacheError);
      }
      
      // 2. Try to get user ID and use standardized API route
      try {
        const userId = await apiClient.getUserId();
        if (userId) {
          console.log(`Fetching profile for user ID: ${userId}`);
          const user = await apiClient.get<User>(getResourcePath('user-profiles', userId));
          console.log('✅ User profile retrieved successfully');
          // Cache it for next time
          await AsyncStorage.setItem('@MindfulMastery:user', JSON.stringify(user));
          return user;
        }
      } catch (apiError) {
        console.log('⚠️ Failed to fetch user profile from API:', apiError);
      }
      
      // 3. Fallback to modern endpoint without userId as last resort
      try {
        console.log('⚠️ No user ID available, attempting alternative endpoint');
        const user = await apiClient.get<User>(getApiPath('user-profiles/me'));
        console.log('✅ User profile retrieved successfully (me endpoint)');
        // Cache it for next time
        await AsyncStorage.setItem('@MindfulMastery:user', JSON.stringify(user));
        return user;
      } catch (alternativeError) {
        console.log('⚠️ Alternative endpoint also failed:', alternativeError);
      }
      
      // If all approaches failed, throw an error
      throw new Error('Could not retrieve user profile through any method');
    } catch (error) {
      console.log('❌ Failed to get user profile:', error);
      throw this.handleError(error, 'Failed to get user profile');
    }
  }

  // Request a password reset
  async requestPasswordReset(email: string): Promise<void> {
    try {
      console.log('🔑 Requesting password reset for:', email);
      
      // Use standardized API route pattern
      await apiClient.post(getApiPath('auth/password-reset/request'), { email });
      
      console.log('✅ Password reset request sent');
    } catch (error) {
      console.log('❌ Password reset request failed:', error);
      throw this.handleError(error, 'Failed to request password reset');
    }
  }

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      console.log('🔐 Resetting password with token');
      
      // Use standardized API route pattern
      await apiClient.post(getApiPath('auth/password-reset/confirm'), { token, newPassword });
      
      console.log('✅ Password reset successful');
    } catch (error) {
      console.log('❌ Password reset failed:', error);
      throw this.handleError(error, 'Failed to reset password');
    }
  }

  // Update password (when logged in)
  async updatePassword(currentPassword: string, newPassword: string, confirmNewPassword: string): Promise<void> {
    try {
      console.log('🔐 Updating password');
      
      // Use standardized API route pattern
      const userId = await apiClient.getUserId();
      await apiClient.put(getSubResourcePath('user-profiles', userId, 'password'), {
        currentPassword,
        newPassword,
        confirmNewPassword
      });
      
      console.log('✅ Password updated successfully');
    } catch (error) {
      console.log('❌ Password update failed:', error);
      throw this.handleError(error, 'Failed to update password');
    }
  }

  // Update user profile
  async updateUserProfile(userData: Partial<User>): Promise<User> {
    try {
      console.log('👤 Updating user profile');
      
      const userId = await apiClient.getUserId();
      const response = await apiClient.put<User>(getResourcePath('user-profiles', userId), userData);
      
      console.log('✅ User profile updated successfully');
      
      // Cache the updated user data
      await AsyncStorage.setItem('@MindfulMastery:user', JSON.stringify(response));
      
      return response;
    } catch (error) {
      console.log('❌ User profile update failed:', error);
      throw this.handleError(error, 'Failed to update user profile');
    }
  }

  // Helper method to handle errors
  private handleError(error: any, defaultMessage: string): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    return new Error(defaultMessage);
  }
}

export const authService = new AuthService();
export default authService;