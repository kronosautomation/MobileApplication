/**
 * DiagnosticHelper - Utility for logging and diagnosing issues
 * 
 * This helper provides functions for enhanced logging during development
 * and enables more detailed diagnostic output when needed.
 */

// Enable/disable debug mode globally
const DEBUG_MODE = __DEV__;

/**
 * Log a debug message (only in development)
 */
export const debugLog = (message: string, data?: any): void => {
  if (!DEBUG_MODE) return;

  if (data !== undefined) {
    console.log(`[DEBUG] ${message}`, data);
  } else {
    console.log(`[DEBUG] ${message}`);
  }
};

/**
 * Log an info message
 */
export const infoLog = (message: string, data?: any): void => {
  if (data !== undefined) {
    console.log(`[INFO] ${message}`, data);
  } else {
    console.log(`[INFO] ${message}`);
  }
};

/**
 * Log a warning message
 */
export const warnLog = (message: string, data?: any): void => {
  if (data !== undefined) {
    console.warn(`[WARN] ${message}`, data);
  } else {
    console.warn(`[WARN] ${message}`);
  }
};

/**
 * Log an error message
 */
export const errorLog = (message: string, error?: any): void => {
  if (error !== undefined) {
    console.error(`[ERROR] ${message}`, error);
  } else {
    console.error(`[ERROR] ${message}`);
  }
};

/**
 * Start measuring time for performance monitoring
 */
export const startPerformanceTimer = (label: string): string => {
  if (!DEBUG_MODE) return label;
  
  console.time(`⏱️ ${label}`);
  return label;
};

/**
 * End measuring time for performance monitoring
 */
export const endPerformanceTimer = (label: string): void => {
  if (!DEBUG_MODE) return;
  
  console.timeEnd(`⏱️ ${label}`);
};

/**
 * Check for circular dependencies (simplified method)
 * This is a simplified check and may not catch all cases
 */
export const checkCircularDependencies = (obj: any, seen = new WeakSet()): boolean => {
  if (!DEBUG_MODE) return false;

  // If obj is not an object or is null, it can't be circular
  if (obj === null || typeof obj !== 'object') return false;

  // If we've seen this object before, we have a circular reference
  if (seen.has(obj)) return true;

  // Add the current object to the set of seen objects
  seen.add(obj);

  // Check all properties recursively
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (checkCircularDependencies(obj[key], seen)) {
        console.warn(`[CIRCULAR] Detected potential circular dependency at key: ${key}`);
        return true;
      }
    }
  }
  
  return false;
};

/**
 * Diagnostics module
 */
export const Diagnostics = {
  // Check if navigation is properly initialized
  checkNavigation: (navigation: any): boolean => {
    if (!navigation) {
      errorLog('Navigation object is undefined or null');
      return false;
    }

    const methods = ['navigate', 'goBack'];
    for (const method of methods) {
      if (typeof navigation[method] !== 'function') {
        errorLog(`Navigation is missing required method: ${method}`);
        return false;
      }
    }

    infoLog('Navigation check passed');
    return true;
  },

  // Check if context is properly initialized
  checkContext: (contextValue: any, requiredProps: string[]): boolean => {
    if (!contextValue) {
      errorLog('Context value is undefined or null');
      return false;
    }

    for (const prop of requiredProps) {
      if (contextValue[prop] === undefined) {
        errorLog(`Context is missing required property: ${prop}`);
        return false;
      }
    }

    infoLog('Context check passed');
    return true;
  },
};

export default {
  debugLog,
  infoLog,
  warnLog,
  errorLog,
  startPerformanceTimer,
  endPerformanceTimer,
  checkCircularDependencies,
  Diagnostics,
};