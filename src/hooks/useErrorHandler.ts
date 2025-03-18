import { useState, useCallback, useRef, useEffect } from 'react';

type ErrorSeverity = 'error' | 'warning' | 'info' | 'success';

interface ErrorState {
  message: string;
  severity: ErrorSeverity;
  visible: boolean;
  duration?: number;
}

interface UseErrorHandlerResult {
  error: ErrorState | null;
  showError: (message: string, severity?: ErrorSeverity, duration?: number) => void;
  hideError: () => void;
}

/**
 * Custom hook for handling errors and toast notifications
 * @param initialDuration - Default duration for error messages in milliseconds
 * @returns Error state and control functions
 */
export const useErrorHandler = (initialDuration = 3000): UseErrorHandlerResult => {
  const [error, setError] = useState<ErrorState | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any existing timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Show error message with optional auto-hide
  const showError = useCallback((
    message: string, 
    severity: ErrorSeverity = 'error',
    duration?: number
  ) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Set the error
    setError({
      message,
      severity,
      visible: true,
      duration: duration || initialDuration,
    });

    // Auto-hide after duration if specified
    if (duration !== 0) {
      timeoutRef.current = setTimeout(() => {
        hideError();
      }, duration || initialDuration);
    }
  }, [initialDuration]);

  // Hide the error message
  const hideError = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setError(null);
  }, []);

  return {
    error,
    showError,
    hideError,
  };
};

export default useErrorHandler;
