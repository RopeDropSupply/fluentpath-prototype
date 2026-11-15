import { useState } from 'react';
import { getCategory, pack } from '../content';
import {
  COMPETENCIES, DIMENSIONS, MIN_EVIDENCE, RETENTION_NOTE, competencyMatrix, errorSummaries, notAssessed, recommendNext, strengths, totals,
} from '../learner/analytics';
import { Card, ConceptReference, Disclosure, StatusPill } from '../ui/common';
import { useLearner } from '../ui/LearnerContext';

export function Progress() {
  const { state, dispatch } = useLearner();
  const [confirming, setConfirming] = useState(false);
  const matrix = competencyMatrix(state);
  const t = totals(state);
  const errors = errorSummaries(state);
  const good = strengths(state);
  const gaps = notAssessed(state);
  const next = recommendNext(state);

  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow">Progress</p>
        <h1>What the evidence shows so far</h1>
        <p className="lead">Everything on this page is counted from your recorded answers. It describes this small sample, not your overall proficiency.</p>
      </header>

      <div className="grid two">
        <Card title="Next recommended activity" className="accent">
          <p className="next-title">{next.title}</p>
          <p><strong>Why this:</strong> {next.reason}</p>
          <a className="btn primary" href={next.href}>Start</a>
        </Card>
        <Card title="Four kinds of evidence">
          <dl className="evidence">
            <div>
              <dt>First attempts</dt>
              <dd>{t.firstTry ? `${t.firstTryCorrect} of ${t.firstTry} correct` : 'None yet'}</dd>
              <dd className="muted small">Answers given unaided in exercises and the lesson. {t.coreCompleted} of {t.coreTotal} core exercises completed.</dd>
            </div>
            <div>
              <dt>Remediation</dt>
              <dd>{t.remediationsCompleted ? `${t.remediationsCompleted} practice ${t.remediationsCompleted === 1 ? 'set' : 'sets'} completed, ${t.remediationsClean} without mistakes` : 'None yet'}</dd>
              <dd className="muted small">Guided practice straight after an error. It shows you can follow the rule once it has been explained.</dd>
            </div>
            <div>
              <dt>Transfer</dt>
              <dd>{t.transferFirstTry ? `${t.transferFirstTryCorrect} of ${t.transferFirstTry} unfamiliar sentences correct` : 'None yet'}</dd>
              <dd className="muted small">New sentences where the rule is not signposted: after practice, and in lesson tasks.</dd>
            </div>
            <div>
              <dt>Retention</dt>
              <dd>Not yet assessed</dd>
              <dd className="muted small">Whether any of this lasts needs a later session. This prototype does not schedule one.</dd>
            </div>
          </dl>
          <p className="muted small">
            {t.attempts} graded responses in total{t.reasoningAnswered > 0 && `; ${t.reasoningCorrect} of ${t.reasoningAnswered} reasoning questions correct`}. A few
            correct answers show what happened in this sitting, not a level of proficiency.
          </p>
        </Card>
      </div>

      <Card title="Competencies by kind of knowledge">
        <div className="table-scroll">
          <table className="matrix">
            <thead>
              <tr>
                <th scope="col">Competency</th>
                {DIMENSIONS.map((d) => (
                  <th key={d.id} scope="col">
                    {d.label}
                    <span className="th-note">{d.description}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPETENCIES.map((c) => (
                <tr key={c.id}>
                  <th scope="row">{c.label}</th>
                  {DIMENSIONS.map((d) => {
                    const cell = matrix[c.id][d.id];
                    return (
                      <td key={d.id} data-label={d.label}>
                        {cell.firstTry === 0 ? (
                          <span className="muted">Not assessed</span>
                        ) : (
                          <>
                            <span className="num">{cell.firstTryCorrect} / {cell.firstTry}</span>
                            <StatusPill status={cell.status} />
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Disclosure label="How this is scored">
          <ul>
            <li>Each figure is <em>first attempts correct / first attempts made</em> for that competency and kind of knowledge. Retries are recorded but never raise the figure.</li>
            <li>Recognition comes from case-identification tasks, production from typed forms, and understanding from “How do you know?” questions and case-planning steps.</li>
            <li>Transfer counts only unfamiliar sentences: the flagged question at the end of a practice set, and lesson tasks. Guided practice after an error is not transfer and is shown with the error below.</li>
            <li>A description appears only after {MIN_EVIDENCE} first attempts: below 50% “mostly incorrect so far”, 50–79% “mixed so far”, 80% or more “consistently correct so far”. Even the last describes a handful of answers, not mastery.</li>
            <li>One answer can count toward two competencies (for example an adjective in the genitive counts for both the genitive and adjective agreement).</li>
            <li>Retention over time is not measured: it needs repeated sessions days apart. These thresholds are prototype conventions, not validated measures.</li>
          </ul>
        </Disclosure>
      </Card>

      <div className="grid two">
        <Card title="Consistently correct so far">
          {good.length ? <ul>{good.map((s) => <li key={s}>{s}</li>)}</ul> : <p className="muted">Nothing is consistently correct yet. That needs at least {MIN_EVIDENCE} first attempts with 80% correct.</p>}
        </Card>
        <Card title="Not yet assessed">
          {gaps.competencies.length > 0 && (
            <>
              <p>No evidence at all:</p>
              <ul>{gaps.competencies.map((s) => <li key={s}>{s}{(s === 'Verb aspect' || s === 'Sentence construction') && <span className="muted"> (no exercises in this prototype)</span>}</li>)}</ul>
            </>
          )}
          {gaps.dimensions.length > 0 && (
            <>
              <p>Partly assessed, missing:</p>
              <ul>{gaps.dimensions.map((s) => <li key={s}>{s}</li>)}</ul>
            </>
          )}
          <p className="muted small">Retention, speaking and listening are outside this prototype.</p>
        </Card>
      </div>

      <Card title="Errors: what we suspect, what you told us, what the evidence shows">
        {errors.length === 0 ? (
          <p className="muted">No errors recorded yet.</p>
        ) : (
          <ul className="errors">
            {errors.map((e) => {
              const concept = pack.concepts[getCategory(e.categoryId)?.conceptId ?? ''];
              return (
                <li key={e.categoryId}>
                  <div className="allocation-head">
                    <strong>{e.label}</strong>
                    <span className="num">{e.count} {e.count === 1 ? 'error' : 'errors'}</span>
                  </div>
                  <p className="small">
                    {e.examples.map((x, i) => (
                      <span key={i} className="example">
                        you wrote <span lang="pl" className="typed">{x.response || '(blank)'}</span>, expected <span lang="pl" className="expected">{x.expected}</span>
                      </span>
                    ))}
                  </p>
                  {e.hasRemediation ? (
                    <ol className="ladder">
                      <li className="is-bad"><span>First attempt</span><span>Incorrect ({e.count}×). Suspected: {e.label.toLowerCase()}.</span></li>
                      <li className={e.statedReasons.length ? 'is-done' : ''}>
                        <span>Your reasoning</span>
                        <span>{e.statedReasons.length ? `${e.statedReasons.join('; ')}. (As you described it; not verified.)` : 'Not asked for this error.'}</span>
                      </li>
                      <li className={e.practice ? (e.practice.correct === e.practice.total ? 'is-done' : 'is-partial') : ''}>
                        <span>Remediation</span>
                        <span>{e.practice ? `Latest practice set: ${e.practice.correct} of ${e.practice.total} correct.` : 'Practice not yet done.'}</span>
                      </li>
                      <li className={e.transfer === 'correct' ? 'is-done' : e.transfer === 'incorrect' ? 'is-bad' : ''}>
                        <span>Transfer</span>
                        <span>
                          {e.transfer === 'correct' && 'Unfamiliar sentence answered correctly.'}
                          {e.transfer === 'incorrect' && 'Unfamiliar sentence not yet answered correctly.'}
                          {e.transfer === 'not-attempted' && 'Not yet attempted.'}
                          {e.transfer === 'none-in-set' && 'The practice set you did had no unfamiliar sentence.'}
                        </span>
                      </li>
                      <li><span>Retention</span><span>{RETENTION_NOTE}</span></li>
                    </ol>
                  ) : (
                    <p className="small muted">Review the lesson vocabulary list.</p>
                  )}
                  {concept && (
                    <Disclosure label={`Rule to revisit: ${concept.title.toLowerCase()}`}>
                      <ConceptReference concept={concept} />
                    </Disclosure>
                  )}
                  {e.hasRemediation && (
                    <a className={`btn small ${e.outstanding ? 'primary' : ''}`} href={`#/lab/practice/${e.categoryId}`}>
                      {e.outstanding ? 'Do the targeted practice' : 'Practise again'}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card title="Reset">
        <p className="muted">Progress is stored only in this browser and survives a page refresh.</p>
        {confirming ? (
          <div className="actions" role="alertdialog" aria-label="Confirm reset">
            <span>Delete all recorded answers?</span>
            <button type="button" className="btn danger" onClick={() => { dispatch({ type: 'resetProgress' }); setConfirming(false); }}>Yes, reset progress</button>
            <button type="button" className="btn danger" onClick={() => { dispatch({ type: 'resetAll' }); setConfirming(false); }}>Reset progress and profile</button>
            <button type="button" className="btn" onClick={() => setConfirming(false)}>Cancel</button>
          </div>
        ) : (
          <button type="button" className="btn" onClick={() => setConfirming(true)}>Reset progress…</button>
        )}
      </Card>
    </div>
  );
}
