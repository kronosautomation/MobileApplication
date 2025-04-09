import { AppSettings } from '../types/settings';

type ValidationResult = {
  isValid: boolean;
  error?: string;
};

export const validateSetting = (id: keyof AppSettings, value: any): ValidationResult => {
  const validators: Record<keyof AppSettings, (value: any) => ValidationResult> = {
    syncData: (v) => ({
      isValid: typeof v === 'boolean',
      error: typeof v !== 'boolean' ? 'Sync data must be a boolean value' : undefined
    }),
    soundEffects: (v) => ({
      isValid: typeof v === 'boolean',
      error: typeof v !== 'boolean' ? 'Sound effects must be a boolean value' : undefined
    }),
    hapticFeedback: (v) => ({
      isValid: typeof v === 'boolean',
      error: typeof v !== 'boolean' ? 'Haptic feedback must be a boolean value' : undefined
    }),
    preferredBackgroundSound: (v) => ({
      isValid: typeof v === 'string' && ['rain', 'ocean', 'forest', 'white-noise'].includes(v),
      error: typeof v !== 'string' ? 'Background sound must be a string' : 
             !['rain', 'ocean', 'forest', 'white-noise'].includes(v) ? 'Invalid background sound' : undefined
    }),
    sessionEndBell: (v) => ({
      isValid: typeof v === 'boolean',
      error: typeof v !== 'boolean' ? 'Session end bell must be a boolean value' : undefined
    }),
    keepScreenAwake: (v) => ({
      isValid: typeof v === 'boolean',
      error: typeof v !== 'boolean' ? 'Keep screen awake must be a boolean value' : undefined
    }),
    shareAnalytics: (v) => ({
      isValid: typeof v === 'boolean',
      error: typeof v !== 'boolean' ? 'Share analytics must be a boolean value' : undefined
    })
  };

  return validators[id]?.(value) ?? { isValid: true };
};

export const validateSyncQueueItem = (item: any): ValidationResult => {
  if (!item || typeof item !== 'object') {
    return { isValid: false, error: 'Invalid sync queue item' };
  }

  const requiredFields = ['id', 'type', 'action', 'data', 'timestamp'];
  const missingFields = requiredFields.filter(field => !(field in item));
  
  if (missingFields.length > 0) {
    return { 
      isValid: false, 
      error: `Missing required fields: ${missingFields.join(', ')}` 
    };
  }

  if (!['meditation', 'journal', 'settings'].includes(item.type)) {
    return { 
      isValid: false, 
      error: 'Invalid sync item type' 
    };
  }

  if (!['create', 'update', 'delete'].includes(item.action)) {
    return { 
      isValid: false, 
      error: 'Invalid sync action' 
    };
  }

  if (typeof item.timestamp !== 'number' || item.timestamp <= 0) {
    return { 
      isValid: false, 
      error: 'Invalid timestamp' 
    };
  }

  return { isValid: true };
}; 