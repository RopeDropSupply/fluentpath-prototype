import { useState } from 'react';
import { getCategory, pack } from '../content';
import {
  COMPETENCIES, DIMENSIONS, MIN_EVIDENCE, competencyMatrix, errorSummaries, notAssessed, recommendNext, strengths, totals,
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
        <Card title="Activity">
          <dl className="stats">
            <div><dt>Core exercises completed</dt><dd>{t.coreCompleted} of {t.coreTotal}</dd></div>
            <div><dt>Graded responses</dt><dd>{t.attempts}</dd></div>
            <div><dt>Correct / incorrect</dt><dd>{t.correct} / {t.errors}</dd></div>
            <div><dt>Targeted practice sets completed</dt><dd>{t.remediationsCompleted}</dd></div>
            <div><dt>Transfer questions, first attempt</dt><dd>{t.transferFirstTry ? `${t.transferFirstTryCorrect} of ${t.transferFirstTry} correct` : 'None yet'}</dd></div>
            <div><dt>Reasoning questions</dt><dd>{t.reasoningAnswered ? `${t.reasoningCorrect} of ${t.reasoningAnswered} correct` : 'None yet'}</dd></div>
          </dl>
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
            <li>Recognition comes from case-identification tasks, production from typed forms, understanding from “How do you know?” questions, and transfer from targeted practice and lesson sentences.</li>
            <li>A label appears only after {MIN_EVIDENCE} first attempts: below 50% “needs work”, 50–79% “developing”, 80% or more “solid in this sample”.</li>
            <li>One answer can count toward two competencies (for example an adjective in the genitive counts for both the genitive and adjective agreement).</li>
            <li>Retention over time is not measured: it needs repeated sessions days apart. These thresholds are prototype conventions, not validated measures.</li>
          </ul>
        </Disclosure>
      </Card>

      <div className="grid two">
        <Card title="What you did well">
          {good.length ? <ul>{good.map((s) => <li key={s}>{s}</li>)}</ul> : <p className="muted">No area has reached “solid” yet. That needs at least {MIN_EVIDENCE} first attempts with 80% correct.</p>}
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

      <Card title="What you misunderstood, and what to revisit">
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
                  <p className="small muted">
                    {!e.hasRemediation
                      ? 'Review the lesson vocabulary list.'
                      : e.outstanding
                        ? 'Targeted practice not yet completed without mistakes.'
                        : `Targeted practice completed ${e.remediationsCompleted}×.`}
                  </p>
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
