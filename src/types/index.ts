// User and Authentication Types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  createdAt: string;
  lastLoginAt: string;
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
  narrator: string;
  durationInSeconds: number;
  imageUrl?: string;
  audioUrl?: string;
  streamingUrl?: string;
  transcriptUrl?: string;
  language: string;
  difficultyLevel: DifficultyLevel;
  tags: string[];
  categories: string[];
  isPublic: boolean;
  isFeatured: boolean;
  minimumSubscriptionTier: number;
  createdAt: string;
  updatedAt: string;
  downloadProgress?: number;
  isDownloaded?: boolean;
  localAudioPath?: string;
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
  anxietyLevel: number;
  performanceFocusArea: PerformanceFocusArea;
  event?: string;
  eventDate?: string;
  triggers?: string[];
  copingStrategies?: string[];
  emotions?: string[];
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
  userId: string;
  type: AchievementType;
  title: string;
  description: string;
  iconUrl: string;
  unlockedAt?: string;
  progress: number;
  totalRequired: number;
  isUnlocked: boolean;
}

export enum AchievementType {
  ConsistencyStreak = 0,
  TotalMeditationTime = 1,
  AnxietyReduction = 2,
  JournalEntries = 3,
  MeditationCount = 4,
  SpecificFocusArea = 5,
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  PremiumContent: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Meditations: undefined;
  Journal: undefined;
  Achievements: undefined;
  Profile: undefined;
};

export type MeditationStackParamList = {
  MeditationList: undefined;
  MeditationDetail: { meditationId: string };
  MeditationPlayer: { meditation: GuidedMeditation };
  MeditationComplete: { sessionId: string };
};

export type JournalStackParamList = {
  JournalList: undefined;
  JournalEntry: { journalId?: string };
  JournalDetail: { journalId: string };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  Subscription: undefined;
  Settings: undefined;
  Statistics: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  About: undefined;
};

export type AchievementsStackParamList = {
  AchievementsList: undefined;
  AchievementDetail: { achievementId: string };
};
