// This file contains type definitions for use in other files
// The implementation is in MeditationStack.tsx

export type MeditationStackParamList = {
  MeditationMain: undefined;
  MeditationDetail: { id: string; title: string };
  MeditationPlayer: { id: string; title: string; duration: number };
  MeditationCompleted: { sessionTime: number };
  MeditationList: { categoryId: string; title: string; };
  Subscription: undefined;
  // Add other screens related to meditation here
};

// Export everything from the TSX file to ensure correct type usage
export * from './MeditationStack.tsx';
