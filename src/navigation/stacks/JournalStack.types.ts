// This file contains type definitions for the Journal stack
export type JournalStackParamList = {
  JournalList: undefined;
  JournalEntry: { journalId?: string; id?: string; date?: string };
  JournalDetail: { journalId: string; refresh?: number };
  NewJournalEntry: { existingJournalId?: string };
  JournalCalendar: undefined;
  JournalMain: undefined;
}; 