import type { ChoiceOption, Misconception } from '../domain/types';

/**
 * Deterministic grading against reviewed answer keys.
 * Pure functions: no UI, no storage, no network.
 */

const DIACRITICS: Record<string, string> = {
  ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z',
};

/** Trim, collapse whitespace, lowercase, drop trailing punctuation, normalise Unicode. */
export function normalizeAnswer(input: string): string {
  return input
    .normalize('NFC')
    .toLocaleLowerCase('pl')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.,!?;:]+$/g, '')
    .trim();
}

export function stripDiacritics(input: string): string {
  return input.replace(/[ąćęłńóśźż]/g, (ch) => DIACRITICS[ch] ?? ch);
}

export interface TextSpec {
  answer: string;
  accepted?: string[];
  misconceptions?: Misconception[];
  fallbackCategory: string;
}

export type TextVerdict =
  | { verdict: 'empty' }
  | { verdict: 'correct' }
  /** Right letters, missing or wrong Polish diacritics. Not recorded as an attempt. */
  | { verdict: 'diacritics' }
  | { verdict: 'incorrect'; errorCategory: string; note?: string; recognised: boolean };

export function gradeText(input: string, spec: TextSpec): TextVerdict {
  const given = normalizeAnswer(input);
  if (!given) return { verdict: 'empty' };

  const keys = [spec.answer, ...(spec.accepted ?? [])].map(normalizeAnswer);
  if (keys.includes(given)) return { verdict: 'correct' };

  // A known wrong form is diagnosed before the diacritics check, because a
  // missing ogonek can be a real case error (kultura vs kulturą).
  const known = spec.misconceptions?.find((mc) => normalizeAnswer(mc.form) === given);
  if (known) {
    return { verdict: 'incorrect', errorCategory: known.errorCategory, note: known.note, recognised: true };
  }

  if (keys.some((k) => stripDiacritics(k) === stripDiacritics(given))) return { verdict: 'diacritics' };

  return { verdict: 'incorrect', errorCategory: spec.fallbackCategory, recognised: false };
}

export interface SelectionResult {
  correct: boolean;
  /** Selected and in the target set. */
  hits: number[];
  /** Selected but not in the target set. */
  falsePositives: number[];
  /** How many target words were not selected (which ones is not disclosed). */
  missedCount: number;
}

export function gradeSelection(selected: number[], target: number[]): SelectionResult {
  const targetSet = new Set(target);
  const selectedSet = new Set(selected);
  const hits = [...selectedSet].filter((i) => targetSet.has(i)).sort((a, b) => a - b);
  const falsePositives = [...selectedSet].filter((i) => !targetSet.has(i)).sort((a, b) => a - b);
  const missedCount = target.length - hits.length;
  return { correct: missedCount === 0 && falsePositives.length === 0, hits, falsePositives, missedCount };
}

export function gradeChoice(optionId: string, options: ChoiceOption[]): { correct: boolean; feedback: string } {
  const chosen = options.find((o) => o.id === optionId);
  if (!chosen) return { correct: false, feedback: '' };
  return { correct: chosen.correct, feedback: chosen.feedback };
}
