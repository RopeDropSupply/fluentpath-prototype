import { useRef, useState } from 'react';
import { pack } from '../content';
import type { Blank, FillInExercise } from '../domain/types';
import { gradeText, type TextVerdict } from '../grading/grade';
import { REVEAL_AFTER } from '../learner/analytics';
import { teachingService } from '../services/teachingService';
import { ConceptReference, Disclosure, Feedback, PolishKeys, insertAtCaret } from './common';
import { CasePlan, SuspectedIssue } from './Diagnosis';
import { useLearner } from './LearnerContext';
import { Reasoning } from './Reasoning';

type Phase = 'answering' | 'wrong' | 'revealed' | 'correct';
type Wrong = Extract<TextVerdict, { verdict: 'incorrect' }>;

export function FillIn({ exercise }: { exercise: FillInExercise }) {
  const { record } = useLearner();
  const [values, setValues] = useState<Record<string, string>>({});
  const [verdicts, setVerdicts] = useState<Record<string, TextVerdict>>({});
  const [locked, setLocked] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [phase, setPhase] = useState<Phase>('answering');
  const [hint, setHint] = useState('');
  const [planDone, setPlanDone] = useState(!exercise.plan);
  const [active, setActive] = useState(exercise.blanks[0].id);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const blankById = (id: string) => exercise.blanks.find((b) => b.id === id) as Blank;
  const finished = phase === 'correct' || phase === 'revealed';
  const isVocab = exercise.conceptIds.length === 0;

  function check() {
    const graded: Record<string, TextVerdict> = {};
    for (const b of exercise.blanks) {
      graded[b.id] = locked.includes(b.id) ? { verdict: 'correct' } : gradeText(values[b.id] ?? '', b);
    }
    const all = Object.values(graded);
    if (all.some((v) => v.verdict === 'empty')) {
      setHint('Fill in every blank before checking.');
      return;
    }
    if (all.some((v) => v.verdict === 'diacritics')) {
      // Not recorded as an attempt: the learner is asked to fix the letters first.
      setVerdicts(graded);
      setHint('Nearly: check the Polish letters in the marked field (ą, ę, ó, ł …). In Polish they are different letters and often different endings.');
      return;
    }
    setHint('');
    const open = exercise.blanks.filter((b) => !locked.includes(b.id));
    record(
      open.map((b) => {
        const v = graded[b.id];
        return {
          exerciseId: exercise.id,
          itemId: b.id,
          source: exercise.track,
          dimension: exercise.dimension ?? 'production',
          competencies: b.competencies,
          correct: v.verdict === 'correct',
          errorCategory: v.verdict === 'incorrect' ? v.errorCategory : undefined,
          response: (values[b.id] ?? '').trim(),
          expected: b.answer,
        };
      }),
    );
    const n = attempts + 1;
    setAttempts(n);
    setVerdicts(graded);
    setLocked(exercise.blanks.filter((b) => graded[b.id].verdict === 'correct').map((b) => b.id));
    if (all.every((v) => v.verdict === 'correct')) setPhase('correct');
    else setPhase(n >= REVEAL_AFTER ? 'revealed' : 'wrong');
  }

  function retry() {
    setValues((v) => {
      const next = { ...v };
      for (const b of exercise.blanks) if (!locked.includes(b.id)) next[b.id] = '';
      return next;
    });
    setVerdicts({});
    setPhase('answering');
    const first = exercise.blanks.find((b) => !locked.includes(b.id));
    if (first) requestAnimationFrame(() => inputs.current[first.id]?.focus());
  }

  const wrong = exercise.blanks
    .map((b) => ({ blank: b, verdict: verdicts[b.id] }))
    .filter((x): x is { blank: Blank; verdict: Wrong } => x.verdict?.verdict === 'incorrect');
  const categories = [...new Set(wrong.map((w) => w.verdict.errorCategory))]
    .map((id) => teachingService.remediationFor(id))
    .filter((c) => c !== undefined);

  const completedSentence = exercise.segments
    .map((s) => (typeof s === 'string' ? s : blankById(s.blank).answer))
    .join(' ')
    .replace(/ ([.,])/g, '$1');

  return (
    <div className="exercise">
      <p className="instruction">
        {isVocab ? exercise.translation : <>Type the correct form of each word in brackets. <span className="muted">Sometimes the form does not change.</span></>}
      </p>
      {exercise.plan && !planDone && <CasePlan exercise={exercise} onDone={() => setPlanDone(true)} />}
      {exercise.plan && planDone && <p className="eyebrow">Step 2 · Write the forms</p>}
      <form
        hidden={!planDone}
        onSubmit={(e) => {
          e.preventDefault();
          if (phase === 'answering') check();
        }}
      >
        <p className={`sentence ${isVocab ? 'vocab-grid' : ''} ${exercise.layout === 'message' ? 'message' : ''}`} lang="pl">
          {exercise.segments.map((seg, i) => {
            if (typeof seg === 'string') return <span key={i}>{seg} </span>;
            const b = blankById(seg.blank);
            const v = verdicts[b.id]?.verdict;
            const cls = locked.includes(b.id) || v === 'correct' ? 'is-correct' : v === 'incorrect' ? 'is-wrong' : v === 'diacritics' ? 'is-near' : '';
            return (
              <span key={i} className={`blank ${cls}`}>
                <input
                  ref={(el) => { inputs.current[b.id] = el; }}
                  aria-label={isVocab ? `Polish for ${b.baseForm}` : `Correct form of ${b.baseForm} (${b.hint})`}
                  aria-invalid={v === 'incorrect' || undefined}
                  value={values[b.id] ?? ''}
                  disabled={phase !== 'answering' || locked.includes(b.id)}
                  onFocus={() => setActive(b.id)}
                  onChange={(e) => {
                    setValues({ ...values, [b.id]: e.target.value });
                    if (hint) setHint('');
                  }}
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  size={Math.max(8, b.answer.length + 2)}
                />
                <span className="blank-hint">
                  <span lang={isVocab ? 'en' : 'pl'}>{b.baseForm}</span> · <span lang="en">{b.hint}</span>
                </span>
              </span>
            );
          })}
        </p>
        {!isVocab && <p className="muted">{exercise.translation}</p>}
        {phase === 'answering' && (
          <>
            <PolishKeys
              onInsert={(l) => setValues((v) => ({ ...v, [active]: insertAtCaret(inputs.current[active], v[active] ?? '', l) }))}
            />
            <div className="actions">
              <button type="submit" className="btn primary">Check answer</button>
            </div>
          </>
        )}
      </form>
      {hint && <p className="hint" role="status">{hint}</p>}

      {(phase === 'wrong' || phase === 'revealed') && (
        <Feedback tone="bad" title={phase === 'wrong' ? 'Not quite. Here is what probably went wrong.' : 'Still not right. Here is the answer and the reason.'}>
          <ul className="diagnosis">
            {wrong.map(({ blank, verdict }) => (
              <li key={blank.id}>
                <span lang="pl" className="typed">{(values[blank.id] ?? '').trim()}</span>{' '}
                {verdict.note ?? (isVocab ? 'is not the expected word.' : 'is not the expected form.')}
                {phase === 'revealed' && <> <strong lang="pl">{blank.answer}</strong>: {blank.explanation}</>}
              </li>
            ))}
          </ul>
          {phase === 'revealed' && <p className={`sentence small ${exercise.layout === 'message' ? 'message' : ''}`} lang="pl">{completedSentence}</p>}
        </Feedback>
      )}

      {(phase === 'wrong' || phase === 'revealed') &&
        categories.map(({ category, concept }) => (
          <SuspectedIssue
            key={`${category.id}-${attempts}`}
            exerciseId={exercise.id}
            category={category}
            concept={concept}
            onPractised={phase === 'wrong' ? retry : undefined}
          />
        ))}

      {phase === 'wrong' && (
        <div className="actions">
          <button type="button" className="btn" onClick={retry}>Try the sentence again</button>
          <span className="muted small">One more attempt before the answer is shown.</span>
        </div>
      )}

      {phase === 'correct' && (
        <Feedback tone="good" title={attempts === 1 ? 'Correct at the first attempt.' : 'Correct.'}>
          <p className={`sentence small ${exercise.layout === 'message' ? 'message' : ''}`} lang="pl">{completedSentence}</p>
        </Feedback>
      )}

      {finished && (
        <>
          <div className="rule">
            <h3>{isVocab ? 'Why typed recall' : 'The rule'}</h3>
            <p>{exercise.ruleExplanation}</p>
            {!isVocab && phase === 'correct' && (
              <ul>
                {exercise.blanks.map((b) => <li key={b.id}>{b.explanation}</li>)}
              </ul>
            )}
            {exercise.conceptIds.map((id) => pack.concepts[id]).filter(Boolean).map((concept) => (
              <Disclosure key={concept.id} label={`Reference: ${concept.title.toLowerCase()}`}>
                <ConceptReference concept={concept} />
              </Disclosure>
            ))}
          </div>
          {exercise.reasoning && <Reasoning exerciseId={exercise.id} source={exercise.track} prompt={exercise.reasoning} />}
        </>
      )}
    </div>
  );
}
