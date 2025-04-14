import { NavigatorScreenParams } from '@react-navigation/native';
// Assuming stack param lists are defined in navigation folders
// import { HomeStackParamList } from '../navigation/stacks/HomeStack'; 
// import { MeditationStackParamList } from '../navigation/stacks/MeditationStack'; 
// import { JournalStackParamList } from '../navigation/stacks/JournalStack'; 
// import { AchievementsStackParamList } from '../navigation/stacks/AchievementsStack'; 
// import { ProfileStackParamList } from '../navigation/stacks/ProfileStack'; 

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  name?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
  bio?: string | null;
  timeZone?: string | null;
  profileImageUrl?: string | null;
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: string;
  preferences?: Record<string, any>;
  meditationStats?: {
    totalMinutes: number;
    completedSessions: number;
    currentStreak: number;
    longestStreak: number;
  };
  journalEntriesCount?: number;
  achievements?: string[];
}

export interface UserPreferences {
  userId: string;
  meditationRemindersEnabled: boolean;
  reminderTime?: string;
  preferredMeditationDuration?: number;
  preferredBackgroundSound?: string;
  soundVolume?: number;
  theme?: string;
  language?: string;
  notificationsEnabled: boolean;
  darkMode?: boolean;
  soundEffects?: boolean;
  hapticFeedback?: boolean;
  sessionEndBell?: boolean;
  keepScreenAwake?: boolean;
  syncData?: boolean;
  shareAnalytics?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  username: string;
  firstName?: string;
  lastName?: string;
}

// Theme Types
export interface ThemeType {
  isDark: boolean;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    disabled: string;
  };
  spacing: {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
    xxl: number;
  };
  typography: {
    fontFamily: {
      regular: string;
      medium: string;
      semiBold: string;
      bold: string;
    };
    fontSize: {
      xs: number;
      s: number;
      m: number;
      l: number;
      xl: number;
      xxl: number;
    };
  };
}

// Authentication Context Type
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, deviceToken?: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string, deviceToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshUserData: () => Promise<User | null>;
  checkAuthStatus: () => Promise<void>;
}

// Meditation Types
export enum DifficultyLevel {
  Beginner = 0,
  Intermediate = 1,
  Advanced = 2,
}

export interface GuidedMeditation {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  imageUrl?: string;
  transcriptUrl?: string;
  duration: number; // Duration in seconds
  language: string;
  author?: string;
  narrator?: string;
  difficultyLevel: DifficultyLevel;
  tags: string[];
  categories: string[];
  category?: string; // Potentially derived, keep consistent with backend
  backgroundSound?: BackgroundSoundOptions;
  audioFileSize?: number;
  isFeatured: boolean;
  isPublic: boolean;
  isPremium: boolean;
  subscriptionTier: string;
  minimumSubscriptionTier: string;
  performanceFocus?: PerformanceFocusArea;
  situationsFor: string[];
  techniquesIncluded: string[];
  createdAt: string; // ISO 8601 date string
  lastUpdated: string; // ISO 8601 date string
  viewCount: number;
  averageRating?: number;
  stats: MeditationStats;
}

export interface MeditationSession {
  id: string;
  userId: string;
  meditationId: string;
  startTime: string;
  endTime?: string;
  durationInSeconds: number;
  status: "Started" | "Completed" | "Paused" | "Abandoned";
  anxietyBefore?: number;
  anxietyAfter?: number;
  performanceFocusArea?: PerformanceFocusArea;
  techniquesUsed: string[];
  notes?: string;
  moodBefore?: string;
  moodAfter?: string;
  createdAt: string;
}

export enum PerformanceFocusArea {
  PublicSpeaking = 0,
  Sports = 1,
  SexualPerformance = 2,
  WorkPresentation = 3,
  SocialAnxiety = 4,
  TestTaking = 5,
  JobInterview = 6,
  Other = 7,
}

// Journal Types
export interface PerformanceJournal {
  id: string;
  userId: string;
  title: string;
  content: string;
  
  // CBT framework fields
  situation?: string;
  thoughts?: string;
  physicalSensations?: string;
  actions?: string;
  outcome?: string;
  reflection?: string;
  
  // Ratings
  anxietyLevel: number;
  confidenceLevel: number;
  
  // Focus area
  performanceFocusArea: PerformanceFocusArea;
  
  // Event information
  event?: string;
  eventDate?: string;
  
  // Lists
  triggers?: string[];
  copingStrategies?: string[];
  emotions: string[];
  techniquesUsed: string[];
  
  // Meta
  date?: string;  // For when an entry is about a specific date
  isPrivate: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Subscription Types
export enum SubscriptionTier {
  Free = 0,
  Premium = 1,
}

export enum SubscriptionStatus {
  None = 0,
  Active = 1,
  Cancelled = 2,
  Expired = 3,
  InGracePeriod = 4,
  OnHold = 5,
}

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  productIdentifier?: string;
  startDate?: string;
  expirationDate?: string;
  autoRenewEnabled?: boolean;
  features: SubscriptionFeatures;
}

export interface SubscriptionFeatures {
  tier: SubscriptionTier;
  maxDownloads: number;
  offlineAccess: boolean;
  premiumMeditations: boolean;
  unlimitedJournaling: boolean;
  performanceAnalytics: boolean;
  customizableBackground: boolean;
  adFree: boolean;
}

// Achievement Types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  points: number;
  type: AchievementType;
  criteria?: string;
  progressTarget: number;
  isUnlocked: boolean;
  progressCurrent: number;
  unlockedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum AchievementType {
  Streak = 0,
  SessionCount = 1,
  TimeSpent = 2,
  CompletedCourse = 3,
  JournalEntries = 4,
  Engagement = 5,
  Special = 6
}

// Meditation Stats Types
export interface MeditationStats {
  totalSessions: number;
  completedSessions: number;
  abandonedSessions: number;
  totalMinutes: number;
  averageSessionMinutes: number;
  totalDaysActive: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate?: string;
  averageAnxietyReduction: number;
  performanceAnxietySessions: number;
  averageFocusRating: number;
  sessionTypeBreakdown: Record<string, number>;
  completionRate: number;
  hasSessionToday: boolean;
  meditationDates?: string[]; // For calendar view
  comparisonStats?: ComparisonStats; // For period comparisons
}

export interface ComparisonStats {
  currentPeriod: PeriodStats;
  previousPeriod: PeriodStats;
  sessionCountChangePercent: number;
  timeChangePercent: number;
  streakChangePercent: number;
}

export interface PeriodStats {
  periodName: string;
  startDate: string;
  endDate: string;
  sessionCount: number;
  completedSessions: number;
  totalMinutes: number;
  streak: number;
}

export interface DailyMeditationData {
  date: string;
  sessionCount: number;
  totalMinutes: number;
  averageAnxietyReduction?: number;
}

// Network Status Types
export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  lastChecked: string;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// We're now importing the stack types from their respective files
// Update MainTabParamList to use those imports
export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Meditations: NavigatorScreenParams<MeditationStackParamList>;
  Journal: NavigatorScreenParams<JournalStackParamList>;
  Achievements: NavigatorScreenParams<AchievementsStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  Stats: undefined;
  Achievements: undefined;
};

// MeditationStackParamList is now defined in src/navigation/stacks/MeditationStack.ts
// Uncomment and update if needed
/* 
export type MeditationStackParamList = {
  MeditationMain: undefined;
  MeditationList: { categoryId: string; title: string; };
  MeditationDetail: { id: string; title: string };
  MeditationPlayer: { id: string; title: string; duration: number };
  MeditationCompleted: { sessionTime: number };
  Subscription: undefined;
};
*/

// Import these types instead
import { MeditationStackParamList } from '../navigation/stacks/MeditationStack';

// JournalStackParamList is now defined in src/navigation/stacks/JournalStack.ts
// Uncomment and update if needed
/*
export type JournalStackParamList = {
  JournalList: undefined;
  JournalEntry: { journalId?: string };
  JournalDetail: { journalId: string };
  NewJournalEntry: undefined;
};
*/

// Import these types instead
import { JournalStackParamList } from '../navigation/stacks/JournalStack';

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Statistics: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  About: undefined;
  Subscription: undefined;
};

export type AchievementsStackParamList = {
  AchievementsList: undefined;
  AchievementDetail: { achievementId: string };
};

// --- Placeholder for missing type --- 
export interface BackgroundSoundOptions {
  id: string;
  name: string;
  url: string;
}
// --- End Placeholder --- 
