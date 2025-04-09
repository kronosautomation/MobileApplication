export interface AppSettings {
  syncData: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;
  preferredBackgroundSound: 'rain' | 'ocean' | 'forest' | 'white-noise';
  sessionEndBell: boolean;
  keepScreenAwake: boolean;
  shareAnalytics: boolean;
}

export interface SyncQueueItem {
  id: string;
  type: 'meditation' | 'journal' | 'settings';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

export interface SyncResult {
  success: boolean;
  error?: string;
  syncedItems?: number;
} 