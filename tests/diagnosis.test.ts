import { describe, expect, it } from 'vitest';
import { getExercise, pack } from '../src/content';
import type { FillInExercise } from '../src/domain/types';
import { gradeText } from '../src/grading/grade';
import { competencyMatrix, errorSummaries, exerciseStatus, recommendNext, totals, tutorBriefing, briefingToText } from '../src/learner/analytics';
import { emptyState, reduce, type NewAttempt } from '../src/learner/state';
import { createLocalStore, STORAGE_KEY } from '../src/learner/storage';
import { latestPathwayId, teachingService } from '../src/services/teachingService';

const blank = (exerciseId: string, blankId: string) => (getExercise(exerciseId) as FillInExercise).blanks.find((b) => b.id === blankId)!;

describe('suspected issue, then a question about reasoning', () => {
  it('treats a recognised wrong form as a suspicion that has a probe attached', () => {
    const verdict = gradeText('dyrektora', blank('fi-1', 'noun'));
    expect(verdict).toMatchObject({ verdict: 'incorrect', errorCategory: 'instr-trigger' });
    const probe = teachingService.probeFor('fi-1', 'instr-trigger');
    expect(probe?.id).toBe('probe-z-case');
    expect(probe!.options.length).toBeGreaterThanOrEqual(3);
  });

  it('asks different questions for the two directions of the animacy error', () => {
    expect(teachingService.probeFor('fi-4', 'acc-animacy')?.id).toBe('probe-animate-unchanged');
    expect(teachingService.probeFor('fi-5', 'acc-animacy')?.id).toBe('probe-inanimate-changed');
  });

  it('has no probe where none was written, and falls back to the default practice', () => {
    expect(teachingService.probeFor('fi-2', 'instr-trigger')).toBeUndefined();
    const plan = teachingService.practicePlan('instr-trigger');
    expect(plan?.pathwayId).toBeUndefined();
    expect(plan?.items).toEqual(pack.errorCategories['instr-trigger'].remediation);
    expect(teachingService.practicePlan('vocab-recall')).toBeUndefined();
  });

  it('chooses a different explanation and sequence for each stated reason', () => {
    const probe = teachingService.probeFor('fi-1', 'instr-trigger')!;
    const plans = probe.options.map((o) => teachingService.practicePlan('instr-trigger', o.pathwayId)!);
    expect(new Set(plans.map((p) => p.pathwayId)).size).toBe(probe.options.length);
    expect(new Set(plans.map((p) => p.intro)).size).toBe(probe.options.length);
    const [objectRole, twoMeanings] = plans;
    expect(objectRole.items.map((i) => i.id)).not.toEqual(twoMeanings.items.map((i) => i.id));
    // The same stated reason always gives the same plan: the mapping is a lookup.
    expect(teachingService.practicePlan('instr-trigger', 'z-two-meanings')).toEqual(twoMeanings);
  });

  it('routes "I knew the case but not the endings" to ending practice, not case practice', () => {
    const plan = teachingService.practicePlan('instr-trigger', 'z-endings-unknown')!;
    expect(plan.concept?.id).toBe('instr-sg');
    expect(plan.items[0].id).toBe('rem-instr-noun-1');
  });

  it('lets a claimed slip be confirmed with a single unfamiliar sentence', () => {
    const plan = teachingService.practicePlan('acc-animacy', 'anim-slip')!;
    expect(plan.items).toHaveLength(1);
    expect(plan.items[0].transfer).toBe(true);
  });
});

describe('probe and pathway dataset', () => {
  it('maps every probe option to an existing pathway, exercise and category', () => {
    for (const probe of pack.probes) {
      expect(pack.errorCategories[probe.suspectedCategory], probe.id).toBeDefined();
      for (const id of probe.exerciseIds) expect(getExercise(id), `${probe.id} ${id}`).toBeDefined();
      for (const o of probe.options) expect(pack.pathways[o.pathwayId], `${probe.id}/${o.id}`).toBeDefined();
      expect(new Set(probe.options.map((o) => o.pathwayId)).size).toBe(probe.options.length);
    }
  });

  it('ends every pathway with an unfamiliar transfer question and uses a real concept', () => {
    for (const pathway of Object.values(pack.pathways)) {
      expect(pack.concepts[pathway.conceptId], pathway.id).toBeDefined();
      expect(pathway.items.at(-1)?.transfer, pathway.id).toBe(true);
      expect(new Set(pathway.items.map((i) => i.id)).size, pathway.id).toBe(pathway.items.length);
      for (const item of pathway.items) {
        if (item.type === 'choice') expect(item.options.filter((o) => o.correct).length, item.id).toBe(1);
        else expect(gradeText(item.answer, { answer: item.answer, fallbackCategory: 'x' }).verdict).toBe('correct');
      }
    }
  });

  it('is reachable: every pathway is offered by some probe', () => {
    const offered = new Set(pack.probes.flatMap((p) => p.options.map((o) => o.pathwayId)));
    expect(Object.keys(pack.pathways).filter((id) => !offered.has(id))).toEqual([]);
  });
});

describe('rule precision', () => {
  it('classifies every reference rule and keeps the review status', () => {
    for (const concept of Object.values(pack.concepts)) {
      expect(concept.rules.length, concept.id).toBeGreaterThan(0);
      for (const rule of concept.rules) expect(['reliable', 'conditional', 'lexical']).toContain(rule.reliability);
    }
    const kinds = new Set(Object.values(pack.concepts).flatMap((c) => c.rules.map((r) => r.reliability)));
    expect(kinds.size).toBe(3);
    expect(pack.exercises.every((e) => e.reviewStatus === 'needs-native-review')).toBe(true);
  });

  it('flags unresolved statements for teacher review rather than asserting them', () => {
    const flagged = Object.values(pack.concepts).flatMap((c) => c.rules.filter((r) => r.review));
    expect(flagged.length).toBeGreaterThanOrEqual(3);
    expect(flagged.every((r) => r.reliability === 'lexical')).toBe(true);
  });
});

const error: NewAttempt = {
  exerciseId: 'fi-1', itemId: 'noun', source: 'core', dimension: 'production', competencies: ['instrumental'],
  correct: false, errorCategory: 'instr-trigger', response: 'dyrektora', expected: 'dyrektorem',
};
const practice = (itemId: string, correct: boolean, transfer: boolean): NewAttempt => ({
  exerciseId: 'practice:instr-trigger', itemId, source: 'remediation', dimension: 'transfer', transfer,
  competencies: ['instrumental'], correct, response: 'x', expected: 'y', errorCategory: correct ? undefined : 'instr-trigger',
});

describe('evidence: first attempt, remediation, transfer, retention', () => {
  it('records the stated reasoning and reports it as the learner’s own account', () => {
    let state = reduce(emptyState(), { type: 'recordAttempts', attempts: [error], at: 1 });
    expect(errorSummaries(state)[0]).toMatchObject({ statedReasons: [], transfer: 'not-attempted', practice: undefined });

    state = reduce(state, {
      type: 'recordDiagnostic', at: 2,
      record: { exerciseId: 'fi-1', probeId: 'probe-z-case', suspectedCategory: 'instr-trigger', optionId: 'genitive', pathwayId: 'z-two-meanings' },
    });
    expect(errorSummaries(state)[0].statedReasons).toEqual(['Believed that z takes the genitive']);
    expect(latestPathwayId(state, 'instr-trigger')).toBe('z-two-meanings');
    expect(latestPathwayId(state, 'acc-animacy')).toBeUndefined();
    expect(briefingToText(tutorBriefing(state), '')).toContain("Learner's stated reasoning: Believed that z takes the genitive");
  });

  it('stops offering the one-question confirmation once a claimed slip has failed', () => {
    let state = reduce(emptyState(), {
      type: 'recordDiagnostic', at: 1,
      record: { exerciseId: 'fi-4', probeId: 'probe-animate-unchanged', suspectedCategory: 'acc-animacy', optionId: 'slip', pathwayId: 'anim-slip' },
    });
    expect(latestPathwayId(state, 'acc-animacy')).toBe('anim-slip');
    state = reduce(state, {
      type: 'recordRemediation', at: 2,
      record: { categoryId: 'acc-animacy', pathwayId: 'anim-slip', correct: 0, total: 1, transferCorrect: 0, transferTotal: 1 },
    });
    expect(latestPathwayId(state, 'acc-animacy')).toBeUndefined();
    expect(teachingService.practicePlan('acc-animacy', latestPathwayId(state, 'acc-animacy'))?.items).toHaveLength(3);
  });

  it('does not count guided practice as transfer', () => {
    let state = reduce(emptyState(), { type: 'recordAttempts', attempts: [error], at: 1 });
    state = reduce(state, { type: 'recordAttempts', attempts: [practice('p1', true, false), practice('p2', true, false)], at: 2 });
    expect(competencyMatrix(state).instrumental.transfer.firstTry).toBe(0);
    expect(totals(state)).toMatchObject({ firstTry: 1, firstTryCorrect: 0, transferFirstTry: 0 });

    state = reduce(state, { type: 'recordAttempts', attempts: [practice('p3', true, true)], at: 3 });
    expect(competencyMatrix(state).instrumental.transfer).toMatchObject({ firstTry: 1, firstTryCorrect: 1 });
    expect(totals(state)).toMatchObject({ firstTry: 1, transferFirstTry: 1, transferFirstTryCorrect: 1 });
  });

  it('keeps the gap open when practice succeeds but the unfamiliar sentence fails', () => {
    let state = reduce(emptyState(), { type: 'recordAttempts', attempts: [error], at: 1 });
    state = reduce(state, {
      type: 'recordRemediation', at: 5,
      record: { categoryId: 'instr-trigger', pathwayId: 'z-two-meanings', correct: 2, total: 3, transferCorrect: 0, transferTotal: 1 },
    });
    expect(errorSummaries(state)[0]).toMatchObject({ transfer: 'incorrect', outstanding: true, practice: { correct: 2, total: 3 } });
    expect(recommendNext(state).kind).toBe('remediation');

    state = reduce(state, {
      type: 'recordRemediation', at: 9,
      record: { categoryId: 'instr-trigger', pathwayId: 'z-two-meanings', correct: 3, total: 3, transferCorrect: 1, transferTotal: 1 },
    });
    expect(errorSummaries(state)[0]).toMatchObject({ transfer: 'correct', outstanding: false });
    expect(totals(state)).toMatchObject({ remediationsCompleted: 2, remediationsClean: 1 });
  });

  it('never reports a label on fewer than three answers', () => {
    const state = reduce(emptyState(), { type: 'recordAttempts', attempts: [{ ...error, correct: true, errorCategory: undefined }] });
    expect(competencyMatrix(state).instrumental.production.status).toBe('early');
  });

  it('counts the case-planning step toward completing the email task', () => {
    const email = getExercise('l-email') as FillInExercise;
    expect(email.plan).toHaveLength(4);
    const blanksOnly = email.blanks.map<NewAttempt>((b) => ({
      exerciseId: 'l-email', itemId: b.id, source: 'lesson', dimension: 'transfer', competencies: b.competencies,
      correct: true, response: b.answer, expected: b.answer,
    }));
    let state = reduce(emptyState(), { type: 'recordAttempts', attempts: blanksOnly });
    expect(exerciseStatus(state, email)).toBe('in-progress');
    state = reduce(state, {
      type: 'recordAttempts',
      attempts: email.plan!.map<NewAttempt>((r) => ({
        exerciseId: 'l-email', itemId: r.id, source: 'lesson', dimension: 'understanding', competencies: r.competencies,
        correct: true, response: r.case, expected: r.case,
      })),
    });
    expect(exerciseStatus(state, email)).toBe('completed');
  });
});

describe('existing learner records', () => {
  it('loads a record saved before diagnostics existed, without losing anything', () => {
    const legacy = {
      version: 1, profile: null, notes: [],
      attempts: [{ ...error, at: 1, attemptNumber: 1 }, { ...practice('rem-instr-trig-1', true, false), transfer: undefined, at: 2, attemptNumber: 1 }],
      remediations: [{ at: 3, categoryId: 'instr-trigger', correct: 3, total: 3 }],
    };
    const data = new Map([[STORAGE_KEY, JSON.stringify(legacy)]]);
    const store = createLocalStore({ getItem: (k) => data.get(k) ?? null, setItem: (k, v) => void data.set(k, v), removeItem: (k) => void data.delete(k) });
    const state = store.load();
    expect(state.attempts).toHaveLength(2);
    expect(state.remediations).toHaveLength(1);
    expect(state.diagnostics).toEqual([]);
    // Old practice sets had no flagged transfer question, and say so rather than claiming transfer.
    expect(errorSummaries(state)[0]).toMatchObject({ transfer: 'none-in-set', outstanding: false, statedReasons: [] });
    expect(() => tutorBriefing(state)).not.toThrow();
  });
});
