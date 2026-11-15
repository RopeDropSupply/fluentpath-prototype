import { useState } from 'react';
import type { Concept, DiagnosticProbe, ErrorCategory, FillInExercise } from '../domain/types';
import { teachingService } from '../services/teachingService';
import { CASE_LABEL, ConceptReference, Disclosure, Feedback } from './common';
import { useLearner } from './LearnerContext';
import { Remediation } from './Remediation';

/**
 * Suspect, ask, then teach.
 *
 * A wrong form tells us what went wrong on the page. It does not tell us why
 * the learner wrote it. Where a probe exists, the learner is asked which rule
 * they believed applied, and that answer (a fixed lookup, not an inference)
 * selects the explanation and the practice sequence.
 */
export function SuspectedIssue({
  exerciseId,
  category,
  concept,
  onPractised,
}: {
  exerciseId: string;
  category: ErrorCategory;
  concept?: Concept;
  /** Called when a practice sequence has been completed; omitted once the answer is already shown. */
  onPractised?: () => void;
}) {
  const { dispatch } = useLearner();
  const probe: DiagnosticProbe | undefined = teachingService.probeFor(exerciseId, category.id);
  const [choice, setChoice] = useState('');
  const [pathwayId, setPathwayId] = useState<string | undefined>();
  const [practising, setPractising] = useState(false);
  const [done, setDone] = useState(false);

  const answered = !probe || pathwayId !== undefined;
  const pathway = pathwayId ? teachingService.pathway(pathwayId) : undefined;
  const plan = teachingService.practicePlan(category.id, pathwayId);
  const stated = probe?.options.find((o) => o.pathwayId === pathwayId)?.text;
  const shownConcept = plan?.concept ?? concept;

  function confirm() {
    const option = probe?.options.find((o) => o.id === choice);
    if (!probe || !option) return;
    dispatch({
      type: 'recordDiagnostic',
      record: { exerciseId, probeId: probe.id, suspectedCategory: category.id, optionId: option.id, pathwayId: option.pathwayId },
    });
    setPathwayId(option.pathwayId);
  }

  return (
    <div className="diagnosis-card">
      <p className="eyebrow">Suspected issue</p>
      <h3>{category.label}</h3>

      {probe && !answered && (
        <>
          <p className="muted">
            This is a guess based on the form you typed. The same wrong form can come from different ideas, so before explaining anything:
          </p>
          <fieldset className="options">
            <legend>{probe.question}</legend>
            {probe.options.map((o) => (
              <label key={o.id} className="option">
                <input type="radio" name={`${probe.id}-${exerciseId}`} checked={choice === o.id} onChange={() => setChoice(o.id)} />
                <span>{o.text}</span>
              </label>
            ))}
          </fieldset>
          <button type="button" className="btn primary" disabled={!choice} onClick={confirm}>
            Continue
          </button>
          <p className="muted small">Your answer selects one of {probe.options.length} prepared explanations. Nothing is interpreted by AI.</p>
        </>
      )}

      {answered && !practising && !done && (
        <>
          {stated && (
            <p className="stated">
              <span className="muted small">You said</span>
              <span>{stated}</span>
            </p>
          )}
          <p>{pathway ? pathway.explanation : category.diagnosis}</p>
          {shownConcept && (
            <Disclosure label="Explain this: show the rule table">
              <ConceptReference concept={shownConcept} />
            </Disclosure>
          )}
          {plan && (
            <button type="button" className="btn primary" onClick={() => setPractising(true)}>
              {plan.items.length === 1
                ? 'Confirm with one new sentence'
                : `Practise on new examples (${plan.items.length} questions${plan.items.some((i) => i.transfer) ? ', ending with an unfamiliar sentence' : ''})`}
            </button>
          )}
        </>
      )}

      {plan && practising && !done && (
        <Remediation
          plan={plan}
          showIntro={false}
          onDone={
            onPractised
              ? () => {
                  setDone(true);
                  onPractised();
                }
              : undefined
          }
        />
      )}
    </div>
  );
}

const PLAN_CASES = ['accusative', 'genitive', 'instrumental', 'locative'] as const;

/**
 * Step one of a writing task: for each gap, name the case its governing word
 * requires. Graded against the answer key; one attempt per row is recorded.
 */
export function CasePlan({ exercise, onDone }: { exercise: FillInExercise; onDone: () => void }) {
  const { record } = useLearner();
  const rows = exercise.plan ?? [];
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);

  const complete = rows.every((r) => picked[r.id]);

  function check() {
    record(
      rows.map((r) => ({
        exerciseId: exercise.id,
        itemId: r.id,
        source: exercise.track,
        dimension: 'understanding' as const,
        competencies: r.competencies,
        correct: picked[r.id] === r.case,
        response: `${r.governor} → ${picked[r.id]}`,
        expected: `${r.governor} → ${r.case}`,
      })),
    );
    setChecked(true);
  }

  const correctCount = rows.filter((r) => picked[r.id] === r.case).length;

  return (
    <div className="case-plan">
      <p className="eyebrow">Step 1 · Plan the grammar</p>
      <p>For each gap, find the word that governs it and choose the case that word requires.</p>
      <ul>
        {rows.map((r) => {
          const ok = picked[r.id] === r.case;
          return (
            <li key={r.id} className={checked ? (ok ? 'is-correct' : 'is-wrong') : ''}>
              <label htmlFor={`${exercise.id}-${r.id}`} lang="pl">{r.context}</label>
              <select
                id={`${exercise.id}-${r.id}`}
                value={picked[r.id] ?? ''}
                disabled={checked}
                onChange={(e) => setPicked({ ...picked, [r.id]: e.target.value })}
              >
                <option value="" disabled>Choose a case…</option>
                {PLAN_CASES.map((c) => <option key={c} value={c}>{CASE_LABEL[c]}</option>)}
              </select>
              {checked && (
                <p className="small">
                  <strong>{ok ? '✓' : '✕'} {CASE_LABEL[r.case]}.</strong> {r.why}
                </p>
              )}
            </li>
          );
        })}
      </ul>
      {!checked ? (
        <button type="button" className="btn primary" disabled={!complete} onClick={check}>Check my plan</button>
      ) : (
        <>
          <Feedback tone={correctCount === rows.length ? 'good' : 'info'} title={`${correctCount} of ${rows.length} governing words identified correctly.`}>
            <p>The cases are now confirmed above. Use them to choose the endings.</p>
          </Feedback>
          <button type="button" className="btn primary" onClick={onDone}>Step 2: write the forms</button>
        </>
      )}
    </div>
  );
}
