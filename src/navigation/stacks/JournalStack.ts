// This file contains type definitions for the Journal stack
// The implementation is in JournalStack.tsx and used in JournalNavigator.tsx

export type JournalStackParamList = {
  JournalList: undefined;
  JournalEntry: { journalId?: string; id?: string; date?: string };
  JournalDetail: { journalId: string };
  NewJournalEntry: { existingJournalId?: string };
  JournalCalendar: undefined;
  JournalMain: undefined;
};

// Re-export from the tsx file to ensure consistent implementation
export { default } from './JournalStack.tsx';
