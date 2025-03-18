import apiClient from './apiClient';
import { LoginCredentials, RegisterData, AuthTokens, User } from '../types';

// Service for authentication-related API calls
class AuthService {
  // Login with email and password
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    try {
      const response = await apiClient.post<{
        token: string;
        refreshToken: string;
        expiresAt: string;
        user: User;
      }>('/auth/login', {
        email: credentials.email,
        password: credentials.password,
        deviceToken: 'mobile-device' // Use a device identifier
      });
      
      // Store the tokens
      await apiClient.setAuthTokens(response.token, response.refreshToken);
      
      return {
        accessToken: response.token,
        refreshToken: response.refreshToken,
        expiresIn: new Date(response.expiresAt).getTime() - Date.now()
      };
    } catch (error) {
      throw this.handleError(error, 'Login failed');
    }
  }

  // Register a new user
  async register(data: RegisterData): Promise<AuthTokens> {
    try {
      const response = await apiClient.post<{
        userId: string;
        accessToken: string;
        refreshToken: string;
      }>('/auth/register', {
        email: data.email,
        password: data.password,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        deviceToken: 'mobile-device' // Use a device identifier
      });
      
      // Store the tokens
      await apiClient.setAuthTokens(response.accessToken, response.refreshToken);
      
      return {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        expiresIn: 900000 // Default to 15 minutes
      };
    } catch (error) {
      throw this.handleError(error, 'Registration failed');
    }
  }

  // Logout the current user
  async logout(): Promise<void> {
    try {
      // Call logout endpoint
      await apiClient.post('/auth/logout');
      
      // Clear tokens regardless of the response
      await apiClient.clearTokens();
    } catch (error) {
      // Still clear tokens even if the API call fails
      await apiClient.clearTokens();
      throw this.handleError(error, 'Logout failed');
    }
  }

  // Verify if the current token is valid
  async verifyToken(): Promise<boolean> {
    try {
      await apiClient.get('/auth/verify');
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get the current user's profile
  async getCurrentUser(): Promise<User> {
    try {
      return await apiClient.get<User>('/user-profile');
    } catch (error) {
      throw this.handleError(error, 'Failed to get user profile');
    }
  }

  // Request a password reset
  async requestPasswordReset(email: string): Promise<void> {
    try {
      // Note: This endpoint may need to be updated once the backend adds this functionality
      await apiClient.post('/user-profile/request-password-reset', { email });
    } catch (error) {
      throw this.handleError(error, 'Failed to request password reset');
    }
  }

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // Note: This endpoint may need to be updated once the backend adds this functionality
      await apiClient.post('/user-profile/reset-password', { token, newPassword });
    } catch (error) {
      throw this.handleError(error, 'Failed to reset password');
    }
  }

  // Update password (when logged in)
  async updatePassword(currentPassword: string, newPassword: string, confirmNewPassword: string): Promise<void> {
    try {
      await apiClient.put('/user-profile/password', {
        currentPassword,
        newPassword,
        confirmNewPassword
      });
    } catch (error) {
      throw this.handleError(error, 'Failed to update password');
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
