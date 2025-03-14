import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { jwtDecode } from 'jwt-decode';

// Environment variables
const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:5000/api/v1';

// Storage keys
const ACCESS_TOKEN_KEY = '@MindfulMastery:accessToken';
const REFRESH_TOKEN_KEY = '@MindfulMastery:refreshToken';

// JWT token interface
interface JwtToken {
  exp: number;
  sub: string;
  name: string;
  role: string;
}

class ApiClient {
  private api: AxiosInstance;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    // Create axios instance with default config
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Setup request interceptor for adding auth token
    this.api.interceptors.request.use(
      async (config) => {
        // Add auth token to request if available
        const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Setup response interceptor for handling auth errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        // Handle 401 Unauthorized errors by refreshing token
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          originalRequest.url !== '/auth/refresh-token'
        ) {
          originalRequest._retry = true;

          try {
            // Get a new access token
            const accessToken = await this.refreshAccessToken();
            
            // Retry the original request with the new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return this.api(originalRequest);
          } catch (refreshError) {
            // If token refresh fails, redirect to login
            await this.clearTokens();
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Method to set the auth tokens in storage
  async setAuthTokens(accessToken: string, refreshToken: string): Promise<void> {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  // Method to clear tokens from storage
  async clearTokens(): Promise<void> {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  // Check if the user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      
      if (!token) {
        return false;
      }
      
      // Decode and check token expiration
      const decoded = jwtDecode<JwtToken>(token);
      const currentTime = Date.now() / 1000;
      
      // Return true if token is still valid, otherwise try to refresh
      if (decoded.exp > currentTime) {
        return true;
      }
      
      // Token expired, try to refresh
      await this.refreshAccessToken();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get the current user's ID from the token
  async getUserId(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) return null;
      
      const decoded = jwtDecode<JwtToken>(token);
      return decoded.sub;
    } catch (error) {
      return null;
    }
  }

  // Refresh the access token
  async refreshAccessToken(): Promise<string> {
    // If there's already a refresh in progress, return that promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    // Create a new refresh promise
    this.refreshPromise = (async () => {
      try {
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        // Call the refresh token endpoint
        const response = await this.api.post<{ accessToken: string; refreshToken: string }>('/auth/refresh-token', {
          refreshToken,
        });
        
        // Save the new tokens
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        await this.setAuthTokens(accessToken, newRefreshToken);
        
        return accessToken;
      } catch (error) {
        // Clear tokens on refresh failure
        await this.clearTokens();
        throw error;
      } finally {
        // Clear the refresh promise
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // Generic GET request method
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<T>(url, config);
    return response.data;
  }

  // Generic POST request method
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }

  // Generic PUT request method
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  // Generic DELETE request method
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }

  // File upload method
  async uploadFile<T = any>(url: string, file: FormData, onProgress?: (percentage: number) => void): Promise<T> {
    const response = await this.api.post<T>(url, file, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentage);
        }
      },
    });
    return response.data;
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();
export default apiClient;
