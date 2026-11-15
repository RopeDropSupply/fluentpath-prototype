import { useMemo, useState } from 'react';
import type { CaseIdExercise, TokenAnnotation } from '../domain/types';
import { gradeSelection, type SelectionResult } from '../grading/grade';
import { REVEAL_AFTER } from '../learner/analytics';
import { teachingService } from '../services/teachingService';
import { CASE_LABEL, Feedback } from './common';
import { useLearner } from './LearnerContext';
import { Reasoning } from './Reasoning';
import { Remediation } from './Remediation';

interface TaskState {
  selected: number[];
  lastCheck: SelectionResult | null;
  /** Every word the learner has had graded in this task. */
  checkedTokens: number[];
  attempts: number;
  resolved: boolean;
  solved: boolean;
}

const freshTask = (): TaskState => ({ selected: [], lastCheck: null, checkedTokens: [], attempts: 0, resolved: false, solved: false });

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

export function CaseIdentify({ exercise }: { exercise: CaseIdExercise }) {
  const { record } = useLearner();
  const [taskIndex, setTaskIndex] = useState(0);
  const [tasks, setTasks] = useState<TaskState[]>(() => exercise.tasks.map(freshTask));
  const [focus, setFocus] = useState<number | null>(null);
  const [practising, setPractising] = useState(false);

  const task = exercise.tasks[taskIndex];
  const ts = tasks[taskIndex];
  const allResolved = tasks.every((t) => t.resolved);
  const anyRevealed = tasks.some((t) => t.resolved && !t.solved);

  /**
   * Case details are unlocked only for words the learner has had graded, and
   * for the answers of finished tasks, so inspecting cannot replace attempting.
   */
  const unlocked = useMemo(() => {
    const set = new Set<number>();
    tasks.forEach((t, i) => {
      t.checkedTokens.forEach((n) => set.add(n));
      if (t.resolved) exercise.tasks[i].targetTokenIndexes.forEach((n) => set.add(n));
    });
    return set;
  }, [tasks, exercise.tasks]);

  const update = (patch: Partial<TaskState>) => setTasks((all) => all.map((t, i) => (i === taskIndex ? { ...t, ...patch } : t)));

  function toggle(i: number) {
    setFocus(i);
    if (ts.resolved) return;
    const selected = ts.selected.includes(i) ? ts.selected.filter((n) => n !== i) : [...ts.selected, i];
    update({ selected, lastCheck: null });
  }

  function check() {
    const result = gradeSelection(ts.selected, task.targetTokenIndexes);
    const attempts = ts.attempts + 1;
    const words = (idx: number[]) => [...idx].sort((a, b) => a - b).map((n) => exercise.tokens[n].text).join(' ');
    record([
      {
        exerciseId: exercise.id,
        itemId: task.id,
        source: exercise.track,
        dimension: 'recognition',
        competencies: task.competencies,
        correct: result.correct,
        errorCategory: result.correct ? undefined : task.errorCategory,
        response: words(ts.selected) || '(nothing selected)',
        expected: words(task.targetTokenIndexes),
      },
    ]);
    update({
      lastCheck: result,
      attempts,
      checkedTokens: [...new Set([...ts.checkedTokens, ...ts.selected])],
      solved: result.correct,
      resolved: result.correct || attempts >= REVEAL_AFTER,
    });
  }

  function tokenClass(i: number): string {
    const classes = ['token'];
    const token = exercise.tokens[i];
    if (focus === i) classes.push('is-focus');
    if (ts.resolved) {
      if (task.targetTokenIndexes.includes(i)) classes.push('is-answer', `case-${task.targetCase}`);
      else if (ts.selected.includes(i) && !ts.solved) classes.push('is-wrong');
    } else {
      if (ts.selected.includes(i)) classes.push('is-selected');
      if (ts.lastCheck?.hits.includes(i)) classes.push('is-hit');
      if (ts.lastCheck?.falsePositives.includes(i)) classes.push('is-wrong');
    }
    if (allResolved && token.case) classes.push(`case-${token.case}`, 'is-answer');
    return classes.join(' ');
  }

  function tokenMark(i: number): string {
    if (ts.resolved) return task.targetTokenIndexes.includes(i) ? '✓' : ts.selected.includes(i) && !ts.solved ? '✕' : '';
    if (ts.lastCheck?.hits.includes(i)) return '✓';
    if (ts.lastCheck?.falsePositives.includes(i)) return '✕';
    return '';
  }

  const caseName = CASE_LABEL[task.targetCase].toLowerCase();
  const category = teachingService.remediationFor(task.errorCategory)?.category;

  return (
    <div className="exercise">
      {exercise.tasks.length > 1 && (
        <div className="task-tabs" role="tablist" aria-label="Tasks for this sentence">
          {exercise.tasks.map((t, i) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={i === taskIndex}
              className={`task-tab case-${t.targetCase} ${i === taskIndex ? 'is-active' : ''}`}
              onClick={() => setTaskIndex(i)}
            >
              {CASE_LABEL[t.targetCase]}
              {tasks[i].resolved && <span aria-label={tasks[i].solved ? 'solved' : 'answer shown'}> {tasks[i].solved ? '✓' : '•'}</span>}
            </button>
          ))}
        </div>
      )}

      <p className="instruction">
        Select <strong>every word</strong> in the <strong className={`case-text case-${task.targetCase}`}>{caseName}</strong> case, then check.
      </p>

      <p className="sentence tokens" lang="pl">
        {exercise.tokens.map((token, i) => (
          <span key={i} className="token-wrap">
            <button
              type="button"
              className={tokenClass(i)}
              aria-pressed={ts.resolved ? undefined : ts.selected.includes(i)}
              aria-label={`${token.text}${tokenMark(i) === '✓' ? ', correct' : tokenMark(i) === '✕' ? ', not in this case' : ''}`}
              onClick={() => toggle(i)}
            >
              {token.text}
              {tokenMark(i) && <span className="token-mark" aria-hidden="true">{tokenMark(i)}</span>}
            </button>
            {token.after}
          </span>
        ))}
      </p>
      <p className="muted">{exercise.translation}</p>

      {!ts.resolved && (
        <div className="actions">
          <button type="button" className="btn primary" onClick={check} disabled={ts.selected.length === 0 || ts.lastCheck !== null}>
            Check selection
          </button>
          <span className="muted small">{plural(ts.selected.length, 'word')} selected</span>
        </div>
      )}

      {ts.lastCheck && !ts.resolved && (
        <Feedback tone="bad" title="Not yet.">
          <p>
            {plural(ts.lastCheck.hits.length, 'selected word')} {ts.lastCheck.hits.length === 1 ? 'is' : 'are'} correct.
            {ts.lastCheck.falsePositives.length > 0 && ` ${plural(ts.lastCheck.falsePositives.length, 'selected word')} ${ts.lastCheck.falsePositives.length === 1 ? 'is' : 'are'} not in the ${caseName}.`}
            {ts.lastCheck.missedCount > 0 && ` ${plural(ts.lastCheck.missedCount, 'more word')} still to find.`}
          </p>
          <p>{category?.diagnosis} Click a marked word to see why, adjust your selection and check again.</p>
        </Feedback>
      )}

      {ts.resolved && (
        <Feedback
          tone={ts.solved ? 'good' : 'info'}
          title={ts.solved ? (ts.attempts === 1 ? 'Correct at the first attempt.' : 'Correct.') : `The ${caseName} words are now highlighted.`}
        >
          <p>
            {ts.solved
              ? 'Click any highlighted word to check that your reasoning matches the explanation.'
              : 'Click each highlighted word to see what governs it. This task is recorded as not yet mastered.'}
          </p>
          {taskIndex + 1 < exercise.tasks.length && !tasks[taskIndex + 1].resolved && (
            <button type="button" className="btn primary" onClick={() => { setTaskIndex(taskIndex + 1); setFocus(null); }}>
              Next task: {CASE_LABEL[exercise.tasks[taskIndex + 1].targetCase].toLowerCase()}
            </button>
          )}
        </Feedback>
      )}

      <Inspector token={focus === null ? null : exercise.tokens[focus]} unlocked={focus !== null && (unlocked.has(focus) || allResolved)} />

      {allResolved && (
        <>
          <div className="rule">
            <h3>The rule</h3>
            <p>{exercise.ruleExplanation}</p>
          </div>
          {anyRevealed && category && category.remediation.length > 0 && (
            practising ? (
              <Remediation categoryId={category.id} />
            ) : (
              <div className="actions">
                <button type="button" className="btn" onClick={() => setPractising(true)}>
                  Practise this skill ({category.remediation.length} short questions)
                </button>
              </div>
            )
          )}
          {exercise.reasoning && <Reasoning exerciseId={exercise.id} source={exercise.track} prompt={exercise.reasoning} />}
        </>
      )}
    </div>
  );
}

function Inspector({ token, unlocked }: { token: TokenAnnotation | null; unlocked: boolean }) {
  if (!token) {
    return (
      <aside className="inspector is-empty" aria-live="polite">
        <p className="muted">Click any word to inspect it. Full case details for a noun or adjective appear once you have checked it.</p>
      </aside>
    );
  }
  // Words that do not decline (verbs, prepositions...) are always fully shown:
  // reading what a preposition governs is exactly the reasoning being taught.
  const showAll = unlocked || !token.case;
  return (
    <aside className="inspector" aria-live="polite">
      <header>
        <span className="inspector-word" lang="pl">{token.text}</span>
        <span className="muted">“{token.gloss}”</span>
      </header>
      <dl>
        <div><dt>Part of speech</dt><dd>{token.pos}</dd></div>
        <div><dt>Dictionary form</dt><dd lang="pl">{token.lemma}</dd></div>
        {showAll && token.case && (
          <div>
            <dt>Case</dt>
            <dd><span className={`pill case-pill case-${token.case}`}>{CASE_LABEL[token.case]}</span></dd>
          </div>
        )}
        {showAll && token.number && <div><dt>Number, gender</dt><dd>{token.number}, {token.gender}</dd></div>}
        {showAll && token.governedBy && <div><dt>Governed by</dt><dd>{token.governedBy}</dd></div>}
        {showAll && <div><dt>Why this form</dt><dd>{token.why}</dd></div>}
        {showAll && token.relations && <div><dt>In this sentence</dt><dd>{token.relations}</dd></div>}
      </dl>
      {!showAll && <p className="muted small">Case, agreement and the reason for this form unlock once you have included this word in a checked selection, or finished the task.</p>}
    </aside>
  );
}
