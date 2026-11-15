import { getCategory, pack } from '../content';
import type { Concept, DiagnosticPathway, DiagnosticProbe, ErrorCategory, Exercise, LearnerState, RemediationItem } from '../domain/types';

/**
 * The seam where a future AI teaching service plugs in.
 *
 * The UI talks to a TeachingService and never decides these things itself.
 * The prototype ships one implementation, backed entirely by the reviewed
 * local dataset: every method below is a table lookup. A server-backed
 * implementation (called through a Netlify Function so that no API key
 * reaches the browser) can replace it without changes to the components.
 */

export type ExplanationReview =
  | { status: 'unavailable'; message: string }
  | { status: 'reviewed'; feedback: string };

/** One practice sequence, either the default for a suspected issue or a pathway chosen from stated reasoning. */
export interface PracticePlan {
  categoryId: string;
  pathwayId?: string;
  label: string;
  intro: string;
  concept?: Concept;
  items: RemediationItem[];
}

export interface TeachingService {
  readonly kind: 'local-deterministic' | 'ai';
  listExercises(track: 'core' | 'lesson'): Exercise[];
  /** The suspected issue behind an error category, with its default practice. */
  remediationFor(categoryId: string): { category: ErrorCategory; concept?: Concept } | undefined;
  /** A question about the learner's reasoning, if one exists for this exercise and suspected issue. */
  probeFor(exerciseId: string, categoryId: string): DiagnosticProbe | undefined;
  pathway(pathwayId: string): DiagnosticPathway | undefined;
  /** The practice to run: the pathway if the learner stated their reasoning, otherwise the category default. */
  practicePlan(categoryId: string, pathwayId?: string): PracticePlan | undefined;
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
  probeFor(exerciseId, categoryId) {
    return pack.probes.find((p) => p.suspectedCategory === categoryId && p.exerciseIds.includes(exerciseId));
  },
  pathway: (pathwayId) => pack.pathways[pathwayId],
  practicePlan(categoryId, pathwayId) {
    const category = getCategory(categoryId);
    if (!category) return undefined;
    const pathway = pathwayId ? pack.pathways[pathwayId] : undefined;
    if (pathway) {
      return {
        categoryId,
        pathwayId: pathway.id,
        label: category.label,
        intro: pathway.explanation,
        concept: pack.concepts[pathway.conceptId],
        items: pathway.items,
      };
    }
    if (category.remediation.length === 0) return undefined;
    return {
      categoryId,
      label: category.label,
      intro: category.diagnosis,
      concept: pack.concepts[category.conceptId],
      items: category.remediation,
    };
  },
  async reviewExplanation() {
    return {
      status: 'unavailable',
      message: 'Free-text explanations are saved for your tutor but are not assessed in this prototype.',
    };
  },
};

export const teachingService: TeachingService = localTeachingService;

/** The pathway from the learner's most recent stated reasoning about a suspected issue, if any. */
export function latestPathwayId(state: LearnerState, categoryId: string): string | undefined {
  const mine = state.diagnostics.filter((d) => d.suspectedCategory === categoryId);
  if (mine.length === 0) return undefined;
  const pathwayId = mine.reduce((a, b) => (b.at >= a.at ? b : a)).pathwayId;
  // A one-question confirmation ("it was a slip") that then failed is not repeated:
  // the claim did not hold, so the fuller default practice is used instead.
  const confirmationOnly = (pack.pathways[pathwayId]?.items.length ?? 0) === 1;
  const failed = state.remediations.some((r) => r.pathwayId === pathwayId && r.correct < r.total);
  return confirmationOnly && failed ? undefined : pathwayId;
}
