import { useState } from 'react';
import type { ReasoningPrompt } from '../domain/types';
import { gradeChoice } from '../grading/grade';
import { Feedback } from './common';
import { useLearner } from './LearnerContext';

/**
 * "How do you know?" Graded through structured options. The optional
 * free-text explanation is stored for the tutor and is never auto-assessed.
 */
export function Reasoning({ exerciseId, source, prompt }: { exerciseId: string; source: 'core' | 'lesson'; prompt: ReasoningPrompt }) {
  const { state, record, dispatch } = useLearner();
  const [chosen, setChosen] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const savedNote = state.notes.find((n) => n.promptId === prompt.id)?.text ?? '';
  const [note, setNote] = useState(savedNote);
  const [noteSaved, setNoteSaved] = useState(false);

  const result = submitted ? gradeChoice(chosen, prompt.options) : null;
  const correctOption = prompt.options.find((o) => o.correct);

  function submit() {
    if (!chosen) return;
    const graded = gradeChoice(chosen, prompt.options);
    record([
      {
        exerciseId,
        itemId: prompt.id,
        source,
        dimension: 'understanding',
        competencies: prompt.competencies,
        correct: graded.correct,
        response: prompt.options.find((o) => o.id === chosen)?.text ?? '',
        expected: correctOption?.text ?? '',
      },
    ]);
    setSubmitted(true);
  }

  return (
    <section className="reasoning" aria-labelledby={`${prompt.id}-q`}>
      <p className="eyebrow">How do you know?</p>
      <h3 id={`${prompt.id}-q`}>{prompt.question}</h3>
      <fieldset disabled={submitted} className="options">
        <legend className="sr-only">Choose the best explanation</legend>
        {prompt.options.map((o) => {
          const state = submitted ? (o.correct ? 'is-correct' : o.id === chosen ? 'is-wrong' : '') : '';
          return (
            <label key={o.id} className={`option ${state}`}>
              <input type="radio" name={prompt.id} value={o.id} checked={chosen === o.id} onChange={() => setChosen(o.id)} />
              <span>{o.text}</span>
            </label>
          );
        })}
      </fieldset>
      {!submitted && (
        <button type="button" className="btn primary" disabled={!chosen} onClick={submit}>
          Check my reasoning
        </button>
      )}
      {result && (
        <>
          <Feedback tone={result.correct ? 'good' : 'bad'} title={result.correct ? 'Sound reasoning.' : 'That reasoning does not hold.'}>
            <p>{result.feedback}</p>
          </Feedback>
          <div className="model-explanation">
            <h4>A complete explanation</h4>
            <p>{prompt.modelExplanation}</p>
            <h4>What an effective explanation contains</h4>
            <ul>
              {prompt.checklist.map((c) => <li key={c}>{c}</li>)}
            </ul>
          </div>
          <div className="own-words">
            <label htmlFor={`${prompt.id}-note`}>In your own words (optional)</label>
            <p className="muted small">
              Not graded. Assessing free text needs an AI or human reviewer, which this prototype does not have. Your note is saved on this device and
              added to the tutor briefing.
            </p>
            <textarea
              id={`${prompt.id}-note`}
              rows={3}
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setNoteSaved(false);
              }}
            />
            <button
              type="button"
              className="btn"
              disabled={!note.trim()}
              onClick={() => {
                dispatch({ type: 'addNote', note: { promptId: prompt.id, text: note.trim() } });
                setNoteSaved(true);
              }}
            >
              Save for my tutor
            </button>
            {noteSaved && <span className="muted small" role="status"> Saved.</span>}
          </div>
        </>
      )}
    </section>
  );
}
