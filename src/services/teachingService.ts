import { getCategory, pack } from '../content';
import type { Concept, ErrorCategory, Exercise } from '../domain/types';

/**
 * The seam where a future AI teaching service plugs in.
 *
 * The UI talks to a TeachingService and never imports content or grading rules
 * for these decisions directly. The prototype ships one implementation, backed
 * entirely by the reviewed local dataset. A server-backed implementation
 * (called through a Netlify Function so that no API key reaches the browser)
 * can replace it without changes to the components.
 */

export type ExplanationReview =
  | { status: 'unavailable'; message: string }
  | { status: 'reviewed'; feedback: string };

export interface TeachingService {
  readonly kind: 'local-deterministic' | 'ai';
  listExercises(track: 'core' | 'lesson'): Exercise[];
  /** Map an error category to its explanation and follow-up sequence. */
  remediationFor(categoryId: string): { category: ErrorCategory; concept?: Concept } | undefined;
  /** Assess a free-text grammatical explanation. Not available offline. */
  reviewExplanation(promptId: string, text: string): Promise<ExplanationReview>;
}

export const localTeachingService: TeachingService = {
  kind: 'local-deterministic',
  listExercises: (track) => pack.exercises.filter((e) => e.track === track),
  remediationFor(categoryId) {
    const category = getCategory(categoryId);
    if (!category) return undefined;
    return { category, concept: pack.concepts[category.conceptId] };
  },
  async reviewExplanation() {
    return {
      status: 'unavailable',
      message: 'Free-text explanations are saved for your tutor but are not assessed in this prototype.',
    };
  },
};

export const teachingService: TeachingService = localTeachingService;
