import { useRef, useState } from 'react';
import type { RemediationItem } from '../domain/types';
import { gradeChoice, gradeText } from '../grading/grade';
import { teachingService } from '../services/teachingService';
import { ConceptReference, Disclosure, Feedback, PolishKeys, insertAtCaret } from './common';
import { useLearner } from './LearnerContext';

type ItemResult = { correct: boolean; feedback?: string };

/**
 * A targeted follow-up sequence for one error category. Each item is a new
 * sentence testing the same rule in a different gender, number or context,
 * and is asked once: a wrong answer gets an explanation, not a repeat.
 */
export function Remediation({ categoryId, onDone }: { categoryId: string; onDone?: () => void }) {
  const { record, dispatch } = useLearner();
  const found = teachingService.remediationFor(categoryId);
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState('');
  const [hint, setHint] = useState('');
  const [result, setResult] = useState<ItemResult | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!found || found.category.remediation.length === 0) return null;
  const { category, concept } = found;
  const items = category.remediation;
  const item: RemediationItem = items[index];

  function log(correct: boolean, response: string, expected: string) {
    record([
      {
        exerciseId: `practice:${categoryId}`,
        itemId: item.id,
        source: 'remediation',
        dimension: 'transfer',
        competencies: item.competencies,
        correct,
        errorCategory: correct ? undefined : categoryId,
        response,
        expected,
      },
    ]);
    if (correct) setScore((s) => s + 1);
  }

  function check() {
    if (item.type === 'fill') {
      const verdict = gradeText(value, { answer: item.answer, accepted: item.accepted, fallbackCategory: categoryId });
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
      dispatch({ type: 'recordRemediation', record: { categoryId, correct: score, total: items.length } });
      setFinished(true);
    }
  }

  if (finished) {
    return (
      <div className="remediation">
        <Feedback tone={score === items.length ? 'good' : 'info'} title={`Targeted practice complete: ${score} of ${items.length} correct.`}>
          <p>
            {score === items.length
              ? 'You applied the rule to new words and new sentences, which is better evidence than repeating the original answer.'
              : 'The rule has not fully transferred yet. It stays on your list to revisit, and it will appear in your tutor briefing.'}
          </p>
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
      <p className="eyebrow">Targeted practice · {category.label}</p>
      <p>{category.diagnosis}</p>
      {concept && (
        <Disclosure label={`Show the rule: ${concept.title.toLowerCase()}`}>
          <ConceptReference concept={concept} />
        </Disclosure>
      )}
      <div className="remediation-item">
        <p className="muted small">
          Question {index + 1} of {items.length} · {item.focus}
        </p>
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
