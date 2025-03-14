import { AuthProvider, useAuth } from './AuthContext';
import { SubscriptionProvider, useSubscription } from './SubscriptionContext';
import { ThemeProvider, useTheme } from './ThemeContext';

// App provider that wraps the entire application with all contexts
import React from 'react';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SubscriptionProvider>
          {children}
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export {
  AuthProvider,
  useAuth,
  SubscriptionProvider,
  useSubscription,
  ThemeProvider,
  useTheme,
};
