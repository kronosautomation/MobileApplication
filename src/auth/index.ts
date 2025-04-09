/**
 * Authentication context entry point
 * This file provides a single source of truth for auth-related imports
 */

// Re-export from the contexts folder (plural)
export {
  AuthProvider,
  useAuth,
  default as AuthContext
} from '../contexts/AuthContext';
