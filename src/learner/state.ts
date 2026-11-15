import type { AttemptEvent, DiagnosticRecord, LearnerProfile, LearnerState, ReasoningNote, RemediationRecord } from '../domain/types';

/** Learner-state model: an append-only event log plus the profile. Pure reducers. */

export const emptyState = (): LearnerState => ({
  version: 1,
  profile: null,
  attempts: [],
  remediations: [],
  notes: [],
  diagnostics: [],
});

export const demoProfile: LearnerProfile = {
  nativeLanguage: 'English',
  targetLanguage: 'Polish',
  currentLevel: 'A2',
  targetLevel: 'B2/C1',
  purpose: 'Interview for and work in renewable energy strategy in Poland.',
  deadlineMonths: 9,
  hoursPerWeek: 7,
  professionalInterests: 'Renewable energy, energy policy, consulting',
  personalInterests: 'Family life, travel, Polish culture',
  tutor: 'weekly',
};

export type NewAttempt = Omit<AttemptEvent, 'at' | 'attemptNumber'>;

export type Action =
  | { type: 'setProfile'; profile: LearnerProfile }
  | { type: 'recordAttempts'; attempts: NewAttempt[]; at?: number }
  | { type: 'recordRemediation'; record: Omit<RemediationRecord, 'at'>; at?: number }
  | { type: 'recordDiagnostic'; record: Omit<DiagnosticRecord, 'at'>; at?: number }
  | { type: 'addNote'; note: Omit<ReasoningNote, 'at'>; at?: number }
  | { type: 'resetProgress' }
  | { type: 'resetAll' };

export function nextAttemptNumber(state: LearnerState, exerciseId: string, itemId: string): number {
  return state.attempts.filter((a) => a.exerciseId === exerciseId && a.itemId === itemId).length + 1;
}

export function reduce(state: LearnerState, action: Action): LearnerState {
  switch (action.type) {
    case 'setProfile':
      return { ...state, profile: action.profile };
    case 'recordAttempts': {
      const at = action.at ?? Date.now();
      let next = state;
      for (const a of action.attempts) {
        const event: AttemptEvent = { ...a, at, attemptNumber: nextAttemptNumber(next, a.exerciseId, a.itemId) };
        next = { ...next, attempts: [...next.attempts, event] };
      }
      return next;
    }
    case 'recordRemediation':
      return { ...state, remediations: [...state.remediations, { ...action.record, at: action.at ?? Date.now() }] };
    case 'recordDiagnostic':
      return { ...state, diagnostics: [...state.diagnostics, { ...action.record, at: action.at ?? Date.now() }] };
    case 'addNote':
      return {
        ...state,
        notes: [...state.notes.filter((n) => n.promptId !== action.note.promptId), { ...action.note, at: action.at ?? Date.now() }],
      };
    case 'resetProgress':
      return { ...emptyState(), profile: state.profile };
    case 'resetAll':
      return emptyState();
  }
}
