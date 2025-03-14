import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { authService, apiClient } from '../api';
import { User, LoginCredentials, RegisterData } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  clearError: () => {},
});

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is authenticated
        const isAuth = await apiClient.isAuthenticated();
        setIsAuthenticated(isAuth);
        
        if (isAuth) {
          // Fetch user data
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Login via the API
      await authService.login(credentials);
      
      // Fetch user data
      const userData = await authService.getCurrentUser();
      
      // Update state
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Register via API
      await authService.register(data);
      
      // Fetch user data
      const userData = await authService.getCurrentUser();
      
      // Update state
      setUser(userData);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Logout via API
      await authService.logout();
      
      // Clear state
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout error:', err);
      // Even if API logout fails, clear local state
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear any authentication errors
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Context value
  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
