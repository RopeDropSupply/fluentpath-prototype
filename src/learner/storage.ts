import type { LearnerState } from '../domain/types';
import { emptyState } from './state';

/**
 * Persistence boundary. The prototype uses localStorage; a cloud-backed
 * adapter (after authentication is added) only has to implement this interface.
 */
export interface LearnerStore {
  load(): LearnerState;
  save(state: LearnerState): void;
  clear(): void;
}

export const STORAGE_KEY = 'fluentpath.learner.v1';

type KeyValue = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function isLearnerState(value: unknown): value is LearnerState {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return v.version === 1 && Array.isArray(v.attempts) && Array.isArray(v.remediations) && Array.isArray(v.notes);
}

export function createLocalStore(storage: KeyValue | undefined, key = STORAGE_KEY): LearnerStore {
  return {
    load() {
      try {
        const raw = storage?.getItem(key);
        if (!raw) return emptyState();
        const parsed: unknown = JSON.parse(raw);
        if (!isLearnerState(parsed)) return emptyState();
        // Records saved before diagnostics existed are kept and completed, not discarded.
        return { ...parsed, diagnostics: Array.isArray(parsed.diagnostics) ? parsed.diagnostics : [] };
      } catch {
        // Corrupt or unavailable storage: start clean rather than crash.
        return emptyState();
      }
    },
    save(state) {
      try {
        storage?.setItem(key, JSON.stringify(state));
      } catch {
        // Storage full or blocked (private mode). Progress then lasts for the session only.
      }
    },
    clear() {
      try {
        storage?.removeItem(key);
      } catch {
        /* nothing to clear */
      }
    },
  };
}

export function browserStore(): LearnerStore {
  let storage: Storage | undefined;
  try {
    storage = typeof window !== 'undefined' ? window.localStorage : undefined;
  } catch {
    storage = undefined;
  }
  return createLocalStore(storage);
}
