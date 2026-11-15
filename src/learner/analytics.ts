import { coreExerciseList, getCategory, pack } from '../content';
import type { AttemptEvent, CompetencyId, Dimension, Exercise, LearnerState } from '../domain/types';

/**
 * Transparent prototype scoring. Everything here is derived from the attempt
 * log by counting; nothing is a validated measure of proficiency.
 */

export const COMPETENCIES: { id: CompetencyId; label: string }[] = [
  { id: 'accusative', label: 'Accusative case' },
  { id: 'genitive', label: 'Genitive case' },
  { id: 'instrumental', label: 'Instrumental case' },
  { id: 'locative', label: 'Locative case' },
  { id: 'adjective-agreement', label: 'Adjective agreement' },
  { id: 'professional-vocabulary', label: 'Professional vocabulary' },
  { id: 'verb-aspect', label: 'Verb aspect' },
  { id: 'sentence-construction', label: 'Sentence construction' },
];

export const DIMENSIONS: { id: Dimension; label: string; description: string }[] = [
  { id: 'recognition', label: 'Recognition', description: 'Identifying a form in a sentence' },
  { id: 'production', label: 'Production', description: 'Typing the correct form unaided' },
  { id: 'understanding', label: 'Understanding', description: 'Choosing the correct reason' },
  { id: 'transfer', label: 'Transfer', description: 'Unfamiliar sentences: after practice, and in lesson tasks' },
];

export const competencyLabel = (id: CompetencyId) => COMPETENCIES.find((c) => c.id === id)?.label ?? id;

export type Status = 'not-assessed' | 'early' | 'needs-work' | 'developing' | 'solid';

export const STATUS_LABEL: Record<Status, string> = {
  'not-assessed': 'Not yet assessed',
  early: 'Too few answers to judge',
  'needs-work': 'Mostly incorrect so far',
  developing: 'Mixed so far',
  solid: 'Consistently correct so far',
};

export interface Cell {
  firstTry: number;
  firstTryCorrect: number;
  status: Status;
}

/** Minimum first attempts before a label other than "too little evidence" is shown. */
export const MIN_EVIDENCE = 3;

export function statusFor(firstTry: number, firstTryCorrect: number): Status {
  if (firstTry === 0) return 'not-assessed';
  if (firstTry < MIN_EVIDENCE) return 'early';
  const ratio = firstTryCorrect / firstTry;
  if (ratio < 0.5) return 'needs-work';
  if (ratio < 0.8) return 'developing';
  return 'solid';
}

export type Matrix = Record<CompetencyId, Record<Dimension, Cell>>;

export function competencyMatrix(state: LearnerState): Matrix {
  const matrix = {} as Matrix;
  for (const c of COMPETENCIES) {
    matrix[c.id] = {} as Record<Dimension, Cell>;
    for (const d of DIMENSIONS) matrix[c.id][d.id] = { firstTry: 0, firstTryCorrect: 0, status: 'not-assessed' };
  }
  for (const a of state.attempts) {
    if (a.attemptNumber !== 1) continue;
    // Guided practice after an error is reported with the error, not as transfer.
    if (a.source === 'remediation' && !a.transfer) continue;
    for (const c of a.competencies) {
      const cell = matrix[c]?.[a.dimension];
      if (!cell) continue;
      cell.firstTry += 1;
      if (a.correct) cell.firstTryCorrect += 1;
    }
  }
  for (const c of COMPETENCIES) {
    for (const d of DIMENSIONS) {
      const cell = matrix[c.id][d.id];
      cell.status = statusFor(cell.firstTry, cell.firstTryCorrect);
    }
  }
  return matrix;
}

// ---------- Exercises ----------

export function itemIds(exercise: Exercise): string[] {
  const ids =
    exercise.type === 'case-id'
      ? exercise.tasks.map((t) => t.id)
      : [...(exercise.plan ?? []).map((r) => r.id), ...exercise.blanks.map((b) => b.id)];
  return exercise.reasoning ? [...ids, exercise.reasoning.id] : ids;
}

/** Wrong attempts allowed before the answer is shown. */
export const REVEAL_AFTER = 2;

export type ExerciseStatus = 'not-started' | 'in-progress' | 'completed';

export function exerciseStatus(state: LearnerState, exercise: Exercise): ExerciseStatus {
  const mine = state.attempts.filter((a) => a.exerciseId === exercise.id);
  if (mine.length === 0) return 'not-started';
  // An item is resolved once answered correctly, or once its answer has been
  // revealed (after two attempts; reasoning questions are answered once).
  const done = itemIds(exercise).every((id) => {
    const attempts = mine.filter((a) => a.itemId === id);
    return attempts.some((a) => a.correct || a.dimension === 'understanding') || attempts.length >= REVEAL_AFTER;
  });
  return done ? 'completed' : 'in-progress';
}

// ---------- Errors ----------

export interface ErrorSummary {
  categoryId: string;
  label: string;
  count: number;
  lastAt: number;
  examples: { response: string; expected: string }[];
  remediationsCompleted: number;
  /** True until the most recent practice set is later than the last error and fully correct. */
  outstanding: boolean;
  hasRemediation: boolean;
  /** What the learner said they were thinking (self-reported, most recent first). */
  statedReasons: string[];
  /** Result of the most recent practice set, if any. */
  practice?: { correct: number; total: number };
  /** Result on unfamiliar transfer questions in the most recent practice set. */
  transfer: 'not-attempted' | 'none-in-set' | 'correct' | 'incorrect';
}

/** Retention needs repeated sessions days apart, which this prototype does not schedule. */
export const RETENTION_NOTE = 'Not yet assessed: it needs a later session.';

export function errorSummaries(state: LearnerState): ErrorSummary[] {
  const byCategory = new Map<string, AttemptEvent[]>();
  for (const a of state.attempts) {
    if (a.correct || !a.errorCategory) continue;
    byCategory.set(a.errorCategory, [...(byCategory.get(a.errorCategory) ?? []), a]);
  }
  const summaries: ErrorSummary[] = [];
  for (const [categoryId, errors] of byCategory) {
    const category = getCategory(categoryId);
    if (!category) continue;
    const done = state.remediations.filter((r) => r.categoryId === categoryId);
    const latest = done.length ? done.reduce((a, b) => (b.at >= a.at ? b : a)) : undefined;
    const lastDone = latest ? latest.at : -1;
    // Practice with mistakes in it does not close the gap.
    const cleanPractice = latest ? latest.correct === latest.total : false;
    const lastAt = Math.max(...errors.map((e) => e.at));
    const examples: ErrorSummary['examples'] = [];
    for (const e of [...errors].reverse()) {
      if (examples.length >= 3) break;
      if (!examples.some((x) => x.response === e.response && x.expected === e.expected)) {
        examples.push({ response: e.response, expected: e.expected });
      }
    }
    const hasRemediation = category.remediation.length > 0;
    const statedReasons = [
      ...new Set(
        state.diagnostics
          .filter((d) => d.suspectedCategory === categoryId)
          .sort((a, b) => b.at - a.at)
          .map((d) => pack.pathways[d.pathwayId]?.belief)
          .filter((b): b is string => !!b),
      ),
    ];
    const transfer: ErrorSummary['transfer'] = !latest
      ? 'not-attempted'
      : !latest.transferTotal
        ? 'none-in-set'
        : latest.transferCorrect === latest.transferTotal
          ? 'correct'
          : 'incorrect';
    summaries.push({
      statedReasons,
      practice: latest ? { correct: latest.correct, total: latest.total } : undefined,
      transfer,
      categoryId,
      label: category.label,
      count: errors.length,
      lastAt,
      examples,
      remediationsCompleted: done.length,
      outstanding: hasRemediation && (lastAt > lastDone || !cleanPractice),
      hasRemediation,
    });
  }
  return summaries.sort((a, b) => b.count - a.count || b.lastAt - a.lastAt);
}

// ---------- Totals ----------

export interface Totals {
  attempts: number;
  correct: number;
  errors: number;
  remediationsCompleted: number;
  /** First attempts in exercises and the lesson (not practice after an error). */
  firstTry: number;
  firstTryCorrect: number;
  /** Practice sets finished with every answer correct. */
  remediationsClean: number;
  transferFirstTry: number;
  transferFirstTryCorrect: number;
  reasoningAnswered: number;
  reasoningCorrect: number;
  coreCompleted: number;
  coreTotal: number;
}

export function totals(state: LearnerState): Totals {
  const first = state.attempts.filter((a) => a.attemptNumber === 1);
  // Transfer means an unfamiliar sentence: flagged questions after practice, and lesson tasks.
  const transfer = first.filter((a) => a.dimension === 'transfer' && (a.source === 'lesson' || a.transfer));
  const unaided = first.filter((a) => a.source !== 'remediation');
  const reasoning = first.filter((a) => a.dimension === 'understanding');
  return {
    attempts: state.attempts.length,
    correct: state.attempts.filter((a) => a.correct).length,
    errors: state.attempts.filter((a) => !a.correct).length,
    remediationsCompleted: state.remediations.length,
    firstTry: unaided.length,
    firstTryCorrect: unaided.filter((a) => a.correct).length,
    remediationsClean: state.remediations.filter((r) => r.correct === r.total).length,
    transferFirstTry: transfer.length,
    transferFirstTryCorrect: transfer.filter((a) => a.correct).length,
    reasoningAnswered: reasoning.length,
    reasoningCorrect: reasoning.filter((a) => a.correct).length,
    coreCompleted: coreExerciseList.filter((e) => exerciseStatus(state, e) === 'completed').length,
    coreTotal: coreExerciseList.length,
  };
}

// ---------- Strengths and gaps ----------

export function strengths(state: LearnerState): string[] {
  const matrix = competencyMatrix(state);
  const out: string[] = [];
  for (const c of COMPETENCIES) {
    for (const d of DIMENSIONS) {
      const cell = matrix[c.id][d.id];
      if (cell.status === 'solid') {
        out.push(`${c.label}, ${d.label.toLowerCase()}: ${cell.firstTryCorrect} of ${cell.firstTry} first attempts correct (a small sample)`);
      }
    }
  }
  return out;
}

export function notAssessed(state: LearnerState): { competencies: string[]; dimensions: string[] } {
  const matrix = competencyMatrix(state);
  const competencies: string[] = [];
  const dimensions: string[] = [];
  for (const c of COMPETENCIES) {
    const cells = DIMENSIONS.map((d) => ({ d, cell: matrix[c.id][d.id] }));
    if (cells.every((x) => x.cell.firstTry === 0)) {
      competencies.push(c.label);
    } else {
      const missing = cells.filter((x) => x.cell.firstTry === 0).map((x) => x.d.label.toLowerCase());
      if (missing.length) dimensions.push(`${c.label}: ${missing.join(', ')}`);
    }
  }
  return { competencies, dimensions };
}

// ---------- Recommendation ----------

/** Order that alternates recognition and production and starts with the demo path. */
export const CORE_SEQUENCE = ['ci-1', 'fi-1', 'fi-2', 'fi-3', 'ci-3', 'fi-4', 'fi-5', 'fi-6', 'ci-2', 'fi-7', 'fi-8', 'ci-4', 'fi-9', 'fi-10'];

export interface Recommendation {
  kind: 'remediation' | 'exercise' | 'lesson' | 'review';
  title: string;
  href: string;
  reason: string;
}

export function recommendNext(state: LearnerState): Recommendation {
  const outstanding = errorSummaries(state).find((e) => e.outstanding);
  if (outstanding) {
    return {
      kind: 'remediation',
      title: `Targeted practice: ${outstanding.label.toLowerCase()}`,
      href: `#/lab/practice/${outstanding.categoryId}`,
      reason: `You made ${outstanding.count} ${outstanding.count === 1 ? 'error' : 'errors'} in this area and have not yet completed its targeted practice without mistakes. Fixing a known gap comes before new material.`,
    };
  }
  const matrix = competencyMatrix(state);
  for (const id of CORE_SEQUENCE) {
    const exercise = coreExerciseList.find((e) => e.id === id);
    if (!exercise || exerciseStatus(state, exercise) === 'completed') continue;
    const dimension: Dimension = exercise.type === 'case-id' ? 'recognition' : 'production';
    const competencies =
      exercise.type === 'case-id' ? exercise.tasks.flatMap((t) => t.competencies) : exercise.blanks.flatMap((b) => b.competencies);
    const unassessed = [...new Set(competencies)].filter((c) => matrix[c][dimension].firstTry === 0);
    const started = exerciseStatus(state, exercise) === 'in-progress';
    return {
      kind: 'exercise',
      title: exercise.title,
      href: `#/lab/${exercise.id}`,
      reason: started
        ? 'You started this exercise but have not yet answered every part of it.'
        : unassessed.length
          ? `There is no ${dimension} evidence yet for: ${unassessed.map((c) => competencyLabel(c).toLowerCase()).join(', ')}.`
          : `It is the next exercise in the sequence and adds ${dimension} evidence for ${[...new Set(competencies)].map((c) => competencyLabel(c).toLowerCase()).join(', ')}.`,
    };
  }
  const lessonDone = pack.lesson.exerciseIds
    .concat(pack.lesson.interview.exerciseId)
    .every((id) => {
      const ex = pack.exercises.find((e) => e.id === id);
      return ex ? exerciseStatus(state, ex) === 'completed' : true;
    });
  if (!lessonDone) {
    return {
      kind: 'lesson',
      title: `Lesson: ${pack.lesson.title}`,
      href: '#/lesson',
      reason: 'You have completed the core exercises. The lesson tests whether the same rules transfer to professional sentences.',
    };
  }
  return {
    kind: 'review',
    title: 'Review your results',
    href: '#/progress',
    reason: 'You have completed every exercise in this prototype. Review the areas marked for revisiting, or reset to try again.',
  };
}

// ---------- Tutor briefing ----------

export interface TutorBriefing {
  hasActivity: boolean;
  totals: Totals;
  strengths: string[];
  weaknesses: ErrorSummary[];
  reasoningMisses: string[];
  notes: { question: string; text: string }[];
  suggestedTopics: string[];
  notAssessed: string[];
}

function reasoningQuestion(promptId: string): string {
  return pack.exercises.find((e) => e.reasoning?.id === promptId)?.reasoning?.question ?? promptId;
}

export function tutorBriefing(state: LearnerState): TutorBriefing {
  const weaknesses = errorSummaries(state);
  const reasoningMisses = state.attempts
    .filter((a) => a.dimension === 'understanding' && !a.correct)
    .map((a) => reasoningQuestion(a.itemId));

  const suggestedTopics: string[] = [];
  for (const w of weaknesses.slice(0, 3)) {
    const concept = pack.concepts[getCategory(w.categoryId)?.conceptId ?? ''];
    suggestedTopics.push(
      `${w.label}${concept ? ` (${concept.title.toLowerCase()})` : ''}: ${w.count} ${w.count === 1 ? 'error' : 'errors'}` +
        (w.outstanding ? ', targeted practice not yet completed without mistakes.' : ', targeted practice completed; check retention in conversation.'),
    );
  }
  if (reasoningMisses.length) {
    suggestedTopics.push('Ask the learner to explain aloud why a case is used; some reasoning questions were answered incorrectly.');
  }
  const gaps = notAssessed(state);
  if (suggestedTopics.length < 3 && gaps.competencies.length) {
    suggestedTopics.push(`Not assessed by the platform, worth probing in the session: ${gaps.competencies.join(', ').toLowerCase()}.`);
  }

  return {
    hasActivity: state.attempts.length > 0,
    totals: totals(state),
    strengths: strengths(state),
    weaknesses,
    reasoningMisses: [...new Set(reasoningMisses)],
    notes: state.notes.filter((n) => n.text.trim()).map((n) => ({ question: reasoningQuestion(n.promptId), text: n.text })),
    suggestedTopics,
    notAssessed: [...gaps.competencies, 'Retention over time (needs repeated sessions)', 'Speaking, listening and free writing'],
  };
}

export function briefingToText(b: TutorBriefing, goal: string): string {
  const lines: string[] = ['TUTOR BRIEFING (generated from recorded exercise activity)', ''];
  if (goal) lines.push(`Goal: ${goal}`, '');
  lines.push(
    `Activity: ${b.totals.attempts} graded responses, ${b.totals.errors} incorrect, ${b.totals.remediationsCompleted} targeted practice sets completed.`,
    `Unfamiliar transfer questions: ${b.totals.transferFirstTry ? `${b.totals.transferFirstTryCorrect} of ${b.totals.transferFirstTry} correct` : 'none attempted'}. Retention: not assessed.`,
    '',
    'Observed strengths:',
    ...(b.strengths.length ? b.strengths.map((s) => `- ${s}`) : ['- Not enough evidence yet.']),
    '',
    'Observed weaknesses:',
    ...(b.weaknesses.length
      ? b.weaknesses.map(
          (w) =>
            `- Suspected: ${w.label} (${w.count}x). ${w.examples.map((e) => `Wrote "${e.response}" for "${e.expected}"`).join('; ')}.` +
            (w.statedReasons.length ? ` Learner's stated reasoning: ${w.statedReasons.join('; ')}.` : ''),
        )
      : ['- No errors recorded.']),
    '',
    'Suggested topics for the next session:',
    ...(b.suggestedTopics.length ? b.suggestedTopics.map((s) => `- ${s}`) : ['- None yet.']),
    '',
    'Not assessed:',
    ...b.notAssessed.map((s) => `- ${s}`),
  );
  if (b.notes.length) {
    lines.push('', "Learner's own explanations (not graded):", ...b.notes.map((n) => `- ${n.question} -> "${n.text}"`));
  }
  return lines.join('\n');
}
