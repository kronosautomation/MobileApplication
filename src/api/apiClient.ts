import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { jwtDecode } from 'jwt-decode';
import * as Network from 'expo-network';

// Get the appropriate API base URL based on platform and environment
const getApiBaseUrl = () => {
  const isDevelopment = Boolean(__DEV__);
  const extra = Constants.expoConfig?.extra || {};
  
  if (!isDevelopment) {
    return extra.apiBaseUrlProduction || 'https://api.mindfulmastery.app';
  }
  
  if (Platform.OS === 'ios') {
    return extra.apiBaseUrlIos || 'http://localhost:5000';
  }
  
  return extra.apiBaseUrl || 'http://10.0.2.2:5000';
};

// Environment variables - get from .env file via Constants
const API_BASE_URL = getApiBaseUrl();

// Create standardized API paths
const BASE_API_PATH = '/api';
const API_VERSION = 'v1';

// Function to construct API paths consistently
function getApiPath(resource: string, includeVersion = true): string {
  // Make sure resource doesn't start with a slash
  const cleanResource = resource.startsWith('/') ? resource.substring(1) : resource;
  
  // Construct the path with or without version
  return includeVersion 
    ? `${BASE_API_PATH}/${API_VERSION}/${cleanResource}` 
    : `${BASE_API_PATH}/${cleanResource}`;
}

// Helper function for resource with ID
function getResourcePath(resource: string, id: string | number): string {
  return getApiPath(`${resource}/${id}`);
}

// Helper function for sub-resources
function getSubResourcePath(resource: string, id: string | number, subResource: string): string {
  return getApiPath(`${resource}/${id}/${subResource}`);
}

// Helper function for action endpoints
function getActionPath(resource: string, action: string): string {
  return getApiPath(`${resource}/${action}`);
}

// Route mappings for API standardization (old routes to new routes)
// This helps with transition - if servers are updated before clients
const ROUTE_MAPPINGS: Record<string, string> = {
  // Authentication
  '/auth/login': getActionPath('auth', 'login'),
  '/auth/register': getActionPath('auth', 'register'),
  '/auth/logout': getActionPath('auth', 'logout'),
  '/auth/refresh-token': getActionPath('auth', 'refresh-token'),
  '/auth/verify': getActionPath('auth', 'verify'),
  '/api/v1/auth/password-reset': getApiPath('auth/password-reset'),
  
  // Guided Meditations
  '/guided-meditation': getApiPath('guided-meditations'),
  
  // User Profiles
  '/user-profile': getApiPath('user-profiles'),
  '/api/v1/user-profile': getApiPath('user-profiles'),
  
  // Meditation Sessions
  '/meditation/session/start': getActionPath('meditation-sessions', 'start'),
  '/meditation/session/complete': getActionPath('meditation-sessions', 'complete'),
  '/meditation/sessions': getApiPath('meditation-sessions'),
  '/meditation/stats': getApiPath('meditation-sessions/stats'),
  
  // Subscriptions
  '/subscription': getApiPath('subscriptions'),
  '/subscription/status': getApiPath('subscriptions/status'),
  '/subscription/purchase': getActionPath('subscriptions', 'purchase'),
  '/subscription/restore': getActionPath('subscriptions', 'restore'),
  '/subscription/cancel': getActionPath('subscriptions', 'cancel'),
  '/subscription/accessible-meditations': getApiPath('subscriptions/accessible-content'),
  
  // Performance Journal
  '/journal': getApiPath('journal-entries'),
  
  // Achievements
  '/achievements': getApiPath('achievements'),
};

// Log the API base URL during development
console.log('🔌 API Base URL:', API_BASE_URL);
console.log('🔌 API Path Pattern:', `${API_BASE_URL}${getApiPath('resource/action')}`);

// Storage keys
const ACCESS_TOKEN_KEY = '@MindfulMastery:token';
const REFRESH_TOKEN_KEY = '@MindfulMastery:refreshToken';
const USER_KEY = '@MindfulMastery:user';

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
  public isNetworkConnected: boolean = true;

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

    // Init network state
    this.checkNetworkConnection();

    // Setup request interceptor for adding auth token and handling route mapping
    this.api.interceptors.request.use(
      async (config) => {
        // Log the request URL and method
        console.log(`🌐 API REQUEST: ${config.method?.toUpperCase() || 'GET'} ${this.api.defaults.baseURL}${config.url}`);
        if (config.data) {
          console.log('📦 Request Data:', JSON.stringify(config.data, null, 2));
        }
        
        // Add auth token to request if available
        const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔑 Using auth token');
        }
        
        // Check network connection before sending request
        if (!this.isNetworkConnected) {
          // Return a rejected promise if offline and not a GET request
          // (GET requests might still work with caching)
          if (config.method !== 'get') {
            return Promise.reject(new Error('No internet connection available.'));
          }
        }
        
        return config;
      },
      (error) => {
        console.log('❌ Request error:', error);
        return Promise.reject(error);
      }
    );

    // Setup response interceptor for handling auth errors
    this.api.interceptors.response.use(
      (response) => {
        console.log(`✅ API RESPONSE: ${response.status} ${response.config.url}`);
        // Log the first 500 characters of the response data for debugging
        if (response.data) {
          const responseStr = typeof response.data === 'string' 
            ? response.data 
            : JSON.stringify(response.data);
          console.log('📦 Response Data:', responseStr.substring(0, 500));
          if (responseStr.length > 500) {
            console.log('...(response truncated)');
          }
        }
        return response;
      },
      async (error: AxiosError) => {
        // Handle network errors
        if (!error.response) {
          console.log('❌ Network error:', error.message);
          this.isNetworkConnected = false;
          await this.checkNetworkConnection();
          return Promise.reject(new Error('Network error. Please check your internet connection.'));
        }
        
        console.log(`❌ API ERROR: ${error.response.status} ${error.config?.url}`, error.response.data);
        
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        // Handle 301 redirects from old routes to new routes
        if (error.response?.status === 301 && !originalRequest._retry) {
          originalRequest._retry = true;
          console.log('🔄 Following redirection from old route to new route');
          
          // Extract the location header
          const newLocation = error.response.headers['location'];
          if (newLocation) {
            console.log(`🔄 Redirected to: ${newLocation}`);
            // Update the URL and retry the request
            originalRequest.url = newLocation;
            return this.api(originalRequest);
          }
        }
        
        // Handle 401 Unauthorized errors by refreshing token
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          originalRequest.url !== '/auth/refresh-token'
        ) {
          originalRequest._retry = true;
          console.log('🔄 Attempting token refresh...');

          try {
            // Get a new access token
            const accessToken = await this.refreshAccessToken();
            console.log('🔑 Token refreshed successfully');
            
            // Retry the original request with the new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return this.api(originalRequest);
          } catch (refreshError) {
            console.log('❌ Token refresh failed:', refreshError);
            // If token refresh fails, redirect to login
            await this.clearTokens();
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Check network connection
  async checkNetworkConnection(): Promise<boolean> {
    try {
      const networkState = await Network.getNetworkStateAsync();
      const isInternetReachable = networkState.isInternetReachable === undefined ? true : networkState.isInternetReachable;
      this.isNetworkConnected = networkState.isConnected && (isInternetReachable as boolean);
      console.log(`🌐 Network status: ${this.isNetworkConnected ? 'Connected' : 'Disconnected'}`);
      return this.isNetworkConnected;
    } catch (error) {
      console.error('Error checking network connection:', error);
      return false;
    }
  }

  // Method to set the auth tokens in storage
  async setAuthTokens(accessToken: string, refreshToken: string): Promise<void> {
    console.log('💾 Saving auth tokens to storage');
    
    // Validate tokens before saving
    if (!accessToken) {
      throw new Error('Cannot store null or undefined access token');
    }
    
    if (!refreshToken) {
      throw new Error('Cannot store null or undefined refresh token');
    }
    
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  // Method to clear tokens from storage
  async clearTokens(): Promise<void> {
    console.log('🧹 Clearing auth tokens from storage');
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  }

  // Method to store user data in storage
  async storeUserData(user: any): Promise<void> {
    console.log('💾 Storing user data to local storage');
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  // Check if the user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      
      if (!token) {
        console.log('🔑 No token found');
        return false;
      }
      
      // Try to decode token and check expiration
      try {
        const decoded = jwtDecode<JwtToken>(token);
        const currentTime = Date.now() / 1000;
        
        // Return true if token is still valid, otherwise try to refresh
        if (decoded.exp > currentTime) {
          console.log('🔑 Token is valid');
          return true;
        }
        
        console.log('🔑 Token expired, attempting refresh');
      } catch (decodeError) {
        console.log('❌ Failed to decode token:', decodeError);
        // Continue to try refresh anyway
      }
      
      // Token expired or invalid, try to refresh
      try {
        await this.refreshAccessToken();
        return true;
      } catch (refreshError) {
        console.log('❌ Token refresh failed:', refreshError);
        return false;
      }
    } catch (error) {
      console.log('❌ Authentication check failed:', error);
      return false;
    }
  }

  // Get the current user's ID from the token
  async getUserId(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) return null;
      
      try {
        const decoded = jwtDecode<JwtToken>(token);
        return decoded.sub;
      } catch (decodeError) {
        console.log('❌ Failed to decode token:', decodeError);
        
        // Try to extract userId from user data in storage
        try {
          const userData = await AsyncStorage.getItem(USER_KEY);
          if (userData) {
            const user = JSON.parse(userData);
            if (user && user.id) {
              console.log('✅ Retrieved userId from cached user data');
              return user.id;
            }
          }
        } catch (userDataError) {
          console.log('❌ Failed to get user data from storage:', userDataError);
        }
        
        return null;
      }
    } catch (error) {
      console.log('❌ Failed to get user ID:', error);
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
        
        console.log('🔄 Calling refresh token endpoint');
        // Call the refresh token endpoint with error handling
        try {
          // Call the refresh token endpoint
          const response = await this.api.post<{ accessToken: string; refreshToken: string }>(
            getActionPath('auth', 'refresh-token'), 
            { refreshToken }
          );
          
          // Save the new tokens
          const { accessToken, refreshToken: newRefreshToken } = response.data;
          await this.setAuthTokens(accessToken, newRefreshToken);
          
          return accessToken;
        } catch (apiError) {
          console.log('❌ Refresh token API error:', apiError);
          // Check if we can extract the message
          if (axios.isAxiosError(apiError) && apiError.response) {
            throw new Error(`Token refresh failed: ${apiError.response.data?.message || apiError.message}`);
          }
          throw apiError; // Re-throw if not an Axios error
        }
      } catch (error) {
        console.log('❌ Token refresh error:', error);
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
    try {
      const response = await this.api.get<T>(url, config);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }
  
  // Expose the axios instance for debugging purposes
  getAxiosInstance() {
    return this.api;
  }

  // Generic POST request method
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  // Generic PUT request method
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  // Generic DELETE request method
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.delete<T>(url, config);
      return response.data;
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  // File upload method
  async uploadFile<T = any>(url: string, file: FormData, onProgress?: (percentage: number) => void): Promise<T> {
    try {
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
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  // Helper method to log API errors in a consistent way
  private handleApiError(error: any): void {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        console.error('❌ Network Error:', error.message);
      } else {
        console.error(`❌ API Error (${error.response.status}):`, error.response?.data?.message || error.message);
      }
    } else {
      console.error('❌ Unexpected error:', error);
    }
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export the helpers for constructing API paths
export { getApiPath, getResourcePath, getSubResourcePath, getActionPath };

export default apiClient;