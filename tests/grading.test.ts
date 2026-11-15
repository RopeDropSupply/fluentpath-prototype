import { describe, expect, it } from 'vitest';
import { getExercise, pack } from '../src/content';
import type { FillInExercise } from '../src/domain/types';
import { gradeChoice, gradeSelection, gradeText, normalizeAnswer, stripDiacritics } from '../src/grading/grade';

const fill = (id: string) => getExercise(id) as FillInExercise;
const blank = (exerciseId: string, blankId: string) => fill(exerciseId).blanks.find((b) => b.id === blankId)!;

describe('normalisation', () => {
  it('ignores case, surrounding space and trailing punctuation', () => {
    expect(normalizeAnswer('  Dyrektorem. ')).toBe('dyrektorem');
    expect(normalizeAnswer('nowym   dyrektorem')).toBe('nowym dyrektorem');
  });
  it('treats composed and decomposed diacritics as the same letter', () => {
    expect(normalizeAnswer('kulturą')).toBe('kulturą');
  });
  it('strips Polish diacritics only for the near-miss check', () => {
    expect(stripDiacritics('źródło książkę')).toBe('zrodlo ksiazke');
  });
});

describe('typed forms', () => {
  it('accepts the correct instrumental forms', () => {
    expect(gradeText('nowym', blank('fi-1', 'adj')).verdict).toBe('correct');
    expect(gradeText('Dyrektorem', blank('fi-1', 'noun')).verdict).toBe('correct');
  });

  it('diagnoses a wrong case differently from a wrong ending', () => {
    const wrongCase = gradeText('dyrektora', blank('fi-1', 'noun'));
    const wrongEnding = gradeText('dyrektorą', blank('fi-1', 'noun'));
    expect(wrongCase).toMatchObject({ verdict: 'incorrect', errorCategory: 'instr-trigger', recognised: true });
    expect(wrongEnding).toMatchObject({ verdict: 'incorrect', errorCategory: 'instr-noun-ending', recognised: true });
  });

  it('falls back to the slot category for an unanticipated answer', () => {
    expect(gradeText('dyrektorowi', blank('fi-1', 'noun'))).toMatchObject({
      verdict: 'incorrect', errorCategory: 'instr-noun-ending', recognised: false,
    });
  });

  it('flags missing diacritics without counting them as an error', () => {
    expect(gradeText('ksiazke', blank('fi-3', 'noun')).verdict).toBe('diacritics');
    expect(gradeText('slonce', blank('l-vocab', 'sun')).verdict).toBe('diacritics');
  });

  it('treats a missing ogonek as a case error when it produces a real form', () => {
    // "kultura" is the nominative, not a typo for "kulturą".
    expect(gradeText('kultura', blank('fi-2', 'noun'))).toMatchObject({ verdict: 'incorrect', errorCategory: 'instr-trigger' });
  });

  it('distinguishes -ą from -ę in the feminine accusative', () => {
    expect(gradeText('ciekawą', blank('fi-3', 'adj')).verdict).toBe('correct');
    expect(gradeText('ciekawę', blank('fi-3', 'adj'))).toMatchObject({ verdict: 'incorrect', errorCategory: 'acc-fem-ending' });
    expect(gradeText('książką', blank('fi-3', 'noun'))).toMatchObject({ verdict: 'incorrect', errorCategory: 'acc-fem-ending' });
  });

  it('applies masculine animacy in the accusative', () => {
    expect(gradeText('lekarza', blank('fi-4', 'noun')).verdict).toBe('correct');
    expect(gradeText('lekarz', blank('fi-4', 'noun'))).toMatchObject({ errorCategory: 'acc-animacy' });
    expect(gradeText('samochód', blank('fi-5', 'noun')).verdict).toBe('correct');
    expect(gradeText('samochodu', blank('fi-5', 'noun'))).toMatchObject({ errorCategory: 'acc-animacy' });
  });

  it('requires the genitive after negation', () => {
    expect(gradeText('czasu', blank('fi-6', 'noun')).verdict).toBe('correct');
    expect(gradeText('czas', blank('fi-6', 'noun'))).toMatchObject({ errorCategory: 'gen-negation' });
    expect(gradeText('czasa', blank('fi-6', 'noun'))).toMatchObject({ errorCategory: 'gen-ending' });
  });

  it('reports an empty answer as empty, not wrong', () => {
    expect(gradeText('   ', blank('fi-1', 'adj')).verdict).toBe('empty');
  });
});

describe('case selection', () => {
  const target = [2, 3];
  it('is correct only for the exact set, in any order', () => {
    expect(gradeSelection([3, 2], target).correct).toBe(true);
    expect(gradeSelection([2], target)).toMatchObject({ correct: false, missedCount: 1, falsePositives: [] });
    expect(gradeSelection([2, 3, 5], target)).toMatchObject({ correct: false, missedCount: 0, falsePositives: [5] });
  });
  it('reports how many were missed without listing them', () => {
    const result = gradeSelection([6], target);
    expect(result).toEqual({ correct: false, hits: [], falsePositives: [6], missedCount: 2 });
  });
});

describe('reasoning options', () => {
  it('grades a structured explanation', () => {
    const prompt = getExercise('ci-1')!.reasoning!;
    expect(gradeChoice('a', prompt.options).correct).toBe(true);
    expect(gradeChoice('b', prompt.options).correct).toBe(false);
  });
});

describe('dataset integrity', () => {
  it('has unique exercise and remediation identifiers', () => {
    const ids = pack.exercises.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    const remIds = Object.values(pack.errorCategories).flatMap((c) => c.remediation.map((r) => r.id));
    expect(new Set(remIds).size).toBe(remIds.length);
  });

  it('references only error categories and concepts that exist', () => {
    for (const e of pack.exercises) {
      for (const c of e.conceptIds) expect(pack.concepts[c], `${e.id} concept ${c}`).toBeDefined();
      const categories =
        e.type === 'case-id'
          ? e.tasks.map((t) => t.errorCategory)
          : e.blanks.flatMap((b) => [b.fallbackCategory, ...(b.misconceptions ?? []).map((m) => m.errorCategory)]);
      for (const c of categories) expect(pack.errorCategories[c], `${e.id} category ${c}`).toBeDefined();
    }
  });

  it('never lists the correct answer as a misconception, and every blank is used', () => {
    for (const e of pack.exercises) {
      if (e.type !== 'fill-in') continue;
      const used = e.segments.filter((s) => typeof s !== 'string').map((s) => (s as { blank: string }).blank);
      expect(used.sort()).toEqual(e.blanks.map((b) => b.id).sort());
      for (const b of e.blanks) {
        expect(gradeText(b.answer, b).verdict).toBe('correct');
        for (const m of b.misconceptions ?? []) expect(gradeText(m.form, b).verdict, `${e.id}/${b.id}/${m.form}`).toBe('incorrect');
      }
    }
  });

  it('marks exactly the annotated tokens as case-task targets', () => {
    for (const e of pack.exercises) {
      if (e.type !== 'case-id') continue;
      for (const t of e.tasks) {
        const annotated = e.tokens.map((tok, i) => (tok.case === t.targetCase ? i : -1)).filter((i) => i >= 0);
        expect(t.targetTokenIndexes, `${e.id}/${t.id}`).toEqual(annotated);
      }
    }
  });

  it('gives at least two follow-ups, with one correct option each, for categories with practice', () => {
    const withPractice = Object.values(pack.errorCategories).filter((c) => c.remediation.length > 0);
    expect(withPractice.length).toBeGreaterThanOrEqual(2);
    for (const c of withPractice) {
      expect(c.remediation.length, c.id).toBeGreaterThanOrEqual(2);
      for (const r of c.remediation) {
        if (r.type === 'choice') expect(r.options.filter((o) => o.correct).length, r.id).toBe(1);
      }
    }
    const instr = pack.errorCategories['instr-noun-ending'].remediation.map((r) => r.id);
    const anim = pack.errorCategories['acc-animacy'].remediation.map((r) => r.id);
    expect(instr.some((id) => anim.includes(id))).toBe(false);
  });
});
