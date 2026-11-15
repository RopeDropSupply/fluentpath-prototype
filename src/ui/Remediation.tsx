import { useRef, useState } from 'react';
import type { RemediationItem } from '../domain/types';
import { gradeChoice, gradeText } from '../grading/grade';
import type { PracticePlan } from '../services/teachingService';
import { ConceptReference, Disclosure, Feedback, PolishKeys, insertAtCaret } from './common';
import { useLearner } from './LearnerContext';

type ItemResult = { correct: boolean; feedback?: string };

/**
 * Runs one practice plan: the default sequence for a suspected issue, or the
 * pathway chosen from the learner's stated reasoning. Each item is a new
 * sentence and is asked once: a wrong answer gets an explanation, not a repeat.
 * Items flagged as transfer are unfamiliar sentences and are recorded separately.
 */
export function Remediation({ plan, onDone, showIntro = true }: { plan: PracticePlan; onDone?: () => void; showIntro?: boolean }) {
  const { record, dispatch } = useLearner();
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState('');
  const [hint, setHint] = useState('');
  const [result, setResult] = useState<ItemResult | null>(null);
  const [score, setScore] = useState({ correct: 0, transferCorrect: 0 });
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = plan.items;
  if (items.length === 0) return null;
  const item: RemediationItem = items[index];
  const transferTotal = items.filter((i) => i.transfer).length;
  const practiceTotal = items.length - transferTotal;

  function log(correct: boolean, response: string, expected: string) {
    record([
      {
        exerciseId: `practice:${plan.categoryId}`,
        itemId: item.id,
        source: 'remediation',
        dimension: 'transfer',
        transfer: !!item.transfer,
        competencies: item.competencies,
        correct,
        errorCategory: correct ? undefined : plan.categoryId,
        response,
        expected,
      },
    ]);
    if (correct) setScore((s) => ({ correct: s.correct + 1, transferCorrect: s.transferCorrect + (item.transfer ? 1 : 0) }));
  }

  function check() {
    if (item.type === 'fill') {
      const verdict = gradeText(value, { answer: item.answer, accepted: item.accepted, fallbackCategory: plan.categoryId });
      if (verdict.verdict === 'empty') return setHint('Type your answer first.');
      if (verdict.verdict === 'diacritics') return setHint('Nearly: check the Polish letters (ą, ę, ó, ł …). They change the form.');
      setHint('');
      const correct = verdict.verdict === 'correct';
      log(correct, value.trim(), item.answer);
      setResult({ correct });
    } else {
      if (!value) return setHint('Choose an option first.');
      setHint('');
      const graded = gradeChoice(value, item.options);
      log(graded.correct, item.options.find((o) => o.id === value)?.text ?? '', item.options.find((o) => o.correct)?.text ?? '');
      setResult(graded);
    }
  }

  function next() {
    if (index + 1 < items.length) {
      setIndex(index + 1);
      setValue('');
      setResult(null);
      setHint('');
    } else {
      dispatch({
        type: 'recordRemediation',
        record: {
          categoryId: plan.categoryId,
          pathwayId: plan.pathwayId,
          correct: score.correct,
          total: items.length,
          transferCorrect: score.transferCorrect,
          transferTotal,
        },
      });
      setFinished(true);
    }
  }

  if (finished) {
    const practiceCorrect = score.correct - score.transferCorrect;
    const transferOk = transferTotal > 0 && score.transferCorrect === transferTotal;
    const clean = score.correct === items.length;
    return (
      <div className="remediation">
        <Feedback tone={clean ? 'good' : 'info'} title="Practice complete. Here is what it shows.">
          <ul className="evidence-list">
            {practiceTotal > 0 && (
              <li>
                <strong>Guided practice:</strong> {practiceCorrect} of {practiceTotal} correct.
              </li>
            )}
            <li>
              <strong>Unfamiliar sentence:</strong>{' '}
              {transferTotal === 0
                ? 'this set does not include one.'
                : transferOk
                  ? 'correct. You applied the rule where it was not signposted, which is stronger evidence than the practice items.'
                  : 'not correct yet. The rule works for you in familiar sentences but has not transferred.'}
            </li>
            <li>
              <strong>Retention:</strong> not assessed. One sitting cannot show whether this lasts.
            </li>
          </ul>
          {!clean && <p>This topic stays on your list to revisit and appears in your tutor briefing.</p>}
        </Feedback>
        {onDone && (
          <button type="button" className="btn primary" onClick={onDone}>
            Return to the original sentence
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="remediation">
      {showIntro && (
        <>
          <p className="eyebrow">Targeted practice · {plan.label}</p>
          <p>{plan.intro}</p>
          {plan.concept && (
            <Disclosure label={`Show the rule: ${plan.concept.title.toLowerCase()}`}>
              <ConceptReference concept={plan.concept} />
            </Disclosure>
          )}
        </>
      )}
      <div className={`remediation-item ${item.transfer ? 'is-transfer' : ''}`}>
        <p className="muted small">
          Question {index + 1} of {items.length} · {item.focus}
        </p>
        {item.transfer && (
          <p className="transfer-flag">
            <span className="pill transfer-pill">Unfamiliar sentence</span> No hint this time: decide which rule applies.
          </p>
        )}
        {item.type === 'fill' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!result) check();
            }}
          >
            <p className="sentence" lang="pl">
              {item.before}{' '}
              <span className="blank">
                <input
                  ref={inputRef}
                  aria-label={`Correct form of ${item.baseForm}`}
                  value={value}
                  disabled={!!result}
                  onChange={(e) => setValue(e.target.value)}
                  autoCapitalize="none"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  size={Math.max(8, item.answer.length + 2)}
                />
                <span className="blank-hint">
                  {item.baseForm} · <span lang="en">{item.hint}</span>
                </span>
              </span>{' '}
              {item.after}
            </p>
            <p className="muted">{item.translation}</p>
            {!result && <PolishKeys onInsert={(l) => setValue((v) => insertAtCaret(inputRef.current, v, l))} />}
            {!result && <button type="submit" className="btn primary">Check</button>}
          </form>
        ) : (
          <>
            <p className="sentence" lang="pl">{item.sentence}</p>
            <p className="muted">{item.translation}</p>
            <fieldset className="options" disabled={!!result}>
              <legend>{item.question}</legend>
              {item.options.map((o) => {
                const cls = result ? (o.correct ? 'is-correct' : o.id === value ? 'is-wrong' : '') : '';
                return (
                  <label key={o.id} className={`option ${cls}`}>
                    <input type="radio" name={item.id} checked={value === o.id} onChange={() => setValue(o.id)} />
                    <span>{o.text}</span>
                  </label>
                );
              })}
            </fieldset>
            {!result && <button type="button" className="btn primary" onClick={check}>Check</button>}
          </>
        )}
        {hint && <p className="hint" role="status">{hint}</p>}
        {result && (
          <>
            <Feedback tone={result.correct ? 'good' : 'bad'} title={result.correct ? 'Correct.' : item.type === 'fill' ? `Not quite. The form is “${item.answer}”.` : 'Not quite.'}>
              {result.feedback && <p>{result.feedback}</p>}
              <p>{item.explanation}</p>
            </Feedback>
            <button type="button" className="btn primary" onClick={next} autoFocus>
              {index + 1 < items.length ? 'Next question' : 'Finish practice'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
