import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from './Toast';

interface ErrorContextProps {
  showError: (message: string, type?: 'error' | 'warning' | 'info' | 'success') => void;
  clearError: () => void;
}

// Create context with default values
const ErrorContext = createContext<ErrorContextProps>({
  showError: () => {},
  clearError: () => {},
});

// Custom hook to use the error context
export const useAppError = () => useContext(ErrorContext);

interface ErrorState {
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  visible: boolean;
}

// Provider component
export const AppErrorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [error, setError] = useState<ErrorState>({
    message: '',
    type: 'error',
    visible: false,
  });

  // Show an error message
  const showError = useCallback((
    message: string, 
    type: 'error' | 'warning' | 'info' | 'success' = 'error'
  ) => {
    setError({
      message,
      type,
      visible: true,
    });
  }, []);

  // Clear current error
  const clearError = useCallback(() => {
    setError(prev => ({
      ...prev,
      visible: false,
    }));
  }, []);

  return (
    <ErrorContext.Provider value={{ showError, clearError }}>
      {children}
      <Toast
        message={error.message}
        type={error.type}
        visible={error.visible}
        onDismiss={clearError}
        autoHideDuration={error.type === 'error' ? 5000 : 3000}
      />
    </ErrorContext.Provider>
  );
};

export default AppErrorProvider;
