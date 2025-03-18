import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { SubscriptionProvider, useSubscription } from './SubscriptionContext';
import { ThemeProvider, useTheme } from './ThemeContext';

// App provider that wraps the entire application with all contexts
export const AppProvider = ({ children }: { children: React.ReactNode }) => {
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
