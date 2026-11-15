import { describe, expect, it } from 'vitest';
import { competencyMatrix, errorSummaries, recommendNext, statusFor, totals, tutorBriefing } from '../src/learner/analytics';
import { buildPlan } from '../src/learner/plan';
import { demoProfile, emptyState, reduce, type NewAttempt } from '../src/learner/state';
import { createLocalStore, STORAGE_KEY } from '../src/learner/storage';

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
}

const wrongNoun: NewAttempt = {
  exerciseId: 'fi-1', itemId: 'noun', source: 'core', dimension: 'production', competencies: ['instrumental'],
  correct: false, errorCategory: 'instr-noun-ending', response: 'dyrektorą', expected: 'dyrektorem',
};
const rightAdj: NewAttempt = {
  exerciseId: 'fi-1', itemId: 'adj', source: 'core', dimension: 'production', competencies: ['instrumental', 'adjective-agreement'],
  correct: true, response: 'nowym', expected: 'nowym',
};

describe('persistence', () => {
  it('survives a reload: a second store on the same storage sees the same state', () => {
    const storage = memoryStorage();
    let state = reduce(emptyState(), { type: 'setProfile', profile: demoProfile });
    state = reduce(state, { type: 'recordAttempts', attempts: [wrongNoun, rightAdj], at: 1000 });
    createLocalStore(storage).save(state);

    const reloaded = createLocalStore(storage).load();
    expect(reloaded).toEqual(state);
    expect(reloaded.attempts).toHaveLength(2);
    expect(reloaded.profile?.targetLevel).toBe('B2/C1');
  });

  it('starts clean when storage is empty, corrupt or from another version', () => {
    expect(createLocalStore(memoryStorage()).load()).toEqual(emptyState());
    expect(createLocalStore(memoryStorage({ [STORAGE_KEY]: '{not json' })).load()).toEqual(emptyState());
    expect(createLocalStore(memoryStorage({ [STORAGE_KEY]: '{"version":0}' })).load()).toEqual(emptyState());
    expect(createLocalStore(undefined).load()).toEqual(emptyState());
  });

  it('reset clears progress but keeps the profile; clear removes the stored record', () => {
    const storage = memoryStorage();
    const store = createLocalStore(storage);
    let state = reduce(emptyState(), { type: 'setProfile', profile: demoProfile });
    state = reduce(state, { type: 'recordAttempts', attempts: [wrongNoun] });
    state = reduce(state, { type: 'resetProgress' });
    expect(state.attempts).toHaveLength(0);
    expect(state.profile).toEqual(demoProfile);
    store.save(state);
    store.clear();
    expect(storage.data.size).toBe(0);
  });
});

describe('progress model', () => {
  it('numbers attempts per item and scores first attempts only', () => {
    let state = reduce(emptyState(), { type: 'recordAttempts', attempts: [wrongNoun, rightAdj], at: 1 });
    state = reduce(state, { type: 'recordAttempts', attempts: [{ ...wrongNoun, correct: true, errorCategory: undefined, response: 'dyrektorem' }], at: 2 });
    expect(state.attempts.map((a) => a.attemptNumber)).toEqual([1, 1, 2]);

    const cell = competencyMatrix(state).instrumental.production;
    expect(cell).toMatchObject({ firstTry: 2, firstTryCorrect: 1 });
    expect(competencyMatrix(state)['adjective-agreement'].production).toMatchObject({ firstTry: 1, firstTryCorrect: 1 });
    expect(competencyMatrix(state).instrumental.recognition.status).toBe('not-assessed');
  });

  it('keeps the four dimensions separate', () => {
    const state = reduce(emptyState(), {
      type: 'recordAttempts',
      attempts: [
        { ...rightAdj, itemId: 'r', dimension: 'recognition' },
        { ...rightAdj, itemId: 'u', dimension: 'understanding', correct: false },
        { ...rightAdj, itemId: 't', dimension: 'transfer', source: 'remediation', transfer: true },
      ],
    });
    const m = competencyMatrix(state).instrumental;
    expect([m.recognition.firstTryCorrect, m.production.firstTry, m.understanding.firstTryCorrect, m.transfer.firstTryCorrect]).toEqual([1, 0, 0, 1]);
    expect(totals(state)).toMatchObject({ transferFirstTry: 1, transferFirstTryCorrect: 1, reasoningAnswered: 1, reasoningCorrect: 0 });
  });

  it('uses the documented thresholds', () => {
    expect(statusFor(0, 0)).toBe('not-assessed');
    expect(statusFor(2, 2)).toBe('early');
    expect(statusFor(4, 1)).toBe('needs-work');
    expect(statusFor(4, 3)).toBe('developing');
    expect(statusFor(5, 4)).toBe('solid');
  });

  it('recommends targeted practice after an error, and stops once it is completed', () => {
    let state = reduce(emptyState(), { type: 'recordAttempts', attempts: [wrongNoun], at: 10 });
    expect(errorSummaries(state)[0]).toMatchObject({ categoryId: 'instr-noun-ending', count: 1, outstanding: true });
    expect(recommendNext(state)).toMatchObject({ kind: 'remediation', href: '#/lab/practice/instr-noun-ending' });

    state = reduce(state, { type: 'recordRemediation', record: { categoryId: 'instr-noun-ending', correct: 3, total: 3 }, at: 20 });
    expect(errorSummaries(state)[0].outstanding).toBe(false);
    expect(recommendNext(state).kind).toBe('exercise');
  });

  it('starts a new learner on the first exercise', () => {
    expect(recommendNext(emptyState())).toMatchObject({ kind: 'exercise', href: '#/lab/ci-1' });
  });

  it('builds the tutor briefing from the learner’s actual errors', () => {
    const state = reduce(emptyState(), { type: 'recordAttempts', attempts: [wrongNoun, rightAdj] });
    const briefing = tutorBriefing(state);
    expect(briefing.hasActivity).toBe(true);
    expect(briefing.weaknesses[0].examples[0]).toEqual({ response: 'dyrektorą', expected: 'dyrektorem' });
    expect(briefing.suggestedTopics[0]).toContain('Instrumental noun ending');
    expect(tutorBriefing(emptyState()).hasActivity).toBe(false);
  });
});

describe('learning plan', () => {
  it('flags the demo goal as needing more study time', () => {
    const plan = buildPlan(demoProfile);
    expect(plan.weeks).toBe(39);
    expect(plan.plannedHours).toBe(273);
    expect(plan.estimate).toEqual({ low: 600, high: 1050 });
    expect(plan.feasibility).toBe('needs-more-time');
    expect(plan.requiredPerWeek.low).toBeGreaterThan(demoProfile.hoursPerWeek);
  });

  it('accepts a modest goal with generous time', () => {
    const plan = buildPlan({ ...demoProfile, targetLevel: 'B1', deadlineMonths: 12, hoursPerWeek: 8 });
    expect(plan.feasibility).toBe('within');
  });

  it('allocates roughly the stated weekly hours', () => {
    const sum = buildPlan(demoProfile).allocation.reduce((s, a) => s + a.hours, 0);
    expect(Math.abs(sum - demoProfile.hoursPerWeek)).toBeLessThanOrEqual(1);
  });
});
