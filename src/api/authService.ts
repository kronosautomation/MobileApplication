import apiClient from './apiClient';
import { LoginCredentials, RegisterData, AuthTokens, User } from '../types';

// Service for authentication-related API calls
class AuthService {
  // Login with email and password
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    try {
      const response = await apiClient.post<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      }>('/auth/login', credentials);
      
      // Store the tokens
      await apiClient.setAuthTokens(response.accessToken, response.refreshToken);
      
      return response;
    } catch (error) {
      throw this.handleError(error, 'Login failed');
    }
  }

  // Register a new user
  async register(data: RegisterData): Promise<AuthTokens> {
    try {
      const response = await apiClient.post<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      }>('/auth/register', data);
      
      // Store the tokens
      await apiClient.setAuthTokens(response.accessToken, response.refreshToken);
      
      return response;
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
      await apiClient.post('/auth/request-password-reset', { email });
    } catch (error) {
      throw this.handleError(error, 'Failed to request password reset');
    }
  }

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await apiClient.post('/auth/reset-password', { token, newPassword });
    } catch (error) {
      throw this.handleError(error, 'Failed to reset password');
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
