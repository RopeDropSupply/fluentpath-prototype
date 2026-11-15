import { useState } from 'react';
import { briefingToText, tutorBriefing } from '../learner/analytics';
import { Card } from '../ui/common';
import { useLearner } from '../ui/LearnerContext';

export function Tutor() {
  const { state } = useLearner();
  const [copied, setCopied] = useState(false);
  const b = tutorBriefing(state);
  const p = state.profile;
  const goal = p ? `${p.targetLanguage} ${p.currentLevel} → ${p.targetLevel} in ${p.deadlineMonths} months. ${p.purpose}` : '';

  async function copy() {
    try {
      await navigator.clipboard.writeText(briefingToText(b, goal));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="page narrow">
      <header className="page-head">
        <p className="eyebrow">Tutor briefing</p>
        <h1>For your next tutoring session</h1>
        <p className="lead">
          A summary a human tutor can read in two minutes. It is assembled by fixed rules from your recorded answers; no AI wrote or interpreted it.
        </p>
      </header>

      {!b.hasActivity ? (
        <Card>
          <p>There is nothing to brief a tutor on yet. Complete an exercise and this page fills in from your actual answers.</p>
          <a className="btn primary" href="#/lab/fi-1">Open an exercise</a>
        </Card>
      ) : (
        <article className="card briefing">
          {goal && (
            <section>
              <h2>Learner goal</h2>
              <p>{goal}</p>
            </section>
          )}
          <section>
            <h2>Activity</h2>
            <p>
              {b.totals.attempts} graded responses, {b.totals.errors} incorrect. {b.totals.coreCompleted} of {b.totals.coreTotal} core exercises completed.{' '}
              {b.totals.remediationsCompleted} targeted practice {b.totals.remediationsCompleted === 1 ? 'set' : 'sets'} completed.{' '}
              {b.totals.transferFirstTry > 0
                ? `${b.totals.transferFirstTryCorrect} of ${b.totals.transferFirstTry} unfamiliar transfer sentences correct.`
                : 'No unfamiliar transfer sentences attempted.'}{' '}
              Retention has not been assessed.
            </p>
          </section>
          <section>
            <h2>Consistently correct so far</h2>
            {b.strengths.length ? <ul>{b.strengths.map((s) => <li key={s}>{s}</li>)}</ul> : <p className="muted">Too few answers yet to say.</p>}
          </section>
          <section>
            <h2>Errors and suspected causes</h2>
            <p className="muted small">The suspected cause is inferred from the wrong form. The stated reasoning is the learner’s own choice from a short list. Neither is a confirmed diagnosis.</p>
            {b.weaknesses.length ? (
              <ul>
                {b.weaknesses.map((w) => (
                  <li key={w.categoryId}>
                    <strong>Suspected: {w.label.toLowerCase()}</strong> ({w.count}×).{' '}
                    {w.examples.map((e, i) => (
                      <span key={i}>
                        Wrote <span lang="pl" className="typed">{e.response || '(blank)'}</span> for <span lang="pl" className="expected">{e.expected}</span>.{' '}
                      </span>
                    ))}
{w.statedReasons.length > 0 && (
                      <span className="stated-inline">Learner’s stated reasoning: {w.statedReasons.join('; ')}. </span>
                    )}
                    {w.hasRemediation && (
                      <span className="muted">
                        Remediation: {w.practice ? `${w.practice.correct} of ${w.practice.total} correct` : 'not done'}. Transfer:{' '}
                        {{ correct: 'unfamiliar sentence correct', incorrect: 'unfamiliar sentence incorrect', 'not-attempted': 'not attempted', 'none-in-set': 'not tested' }[w.transfer]}.
                        Retention: not assessed.
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">No errors recorded.</p>
            )}
            {b.reasoningMisses.length > 0 && (
              <>
                <h3>Reasoning questions answered incorrectly</h3>
                <ul>{b.reasoningMisses.map((q) => <li key={q}>{q}</li>)}</ul>
              </>
            )}
          </section>
          <section>
            <h2>Suggested topics for the next session</h2>
            {b.suggestedTopics.length ? <ol>{b.suggestedTopics.map((s) => <li key={s}>{s}</li>)}</ol> : <p className="muted">Nothing specific yet.</p>}
          </section>
          {b.notes.length > 0 && (
            <section>
              <h2>The learner’s own explanations <span className="muted">(not graded)</span></h2>
              <ul>
                {b.notes.map((n) => (
                  <li key={n.question}>
                    <span className="muted">{n.question}</span>
                    <blockquote>{n.text}</blockquote>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section>
            <h2>Not assessed by the platform</h2>
            <ul>{b.notAssessed.map((s) => <li key={s}>{s}</li>)}</ul>
          </section>
          <div className="actions no-print">
            <button type="button" className="btn primary" onClick={copy}>Copy as text</button>
            <button type="button" className="btn" onClick={() => window.print()}>Print</button>
            {copied && <span className="muted small" role="status">Copied.</span>}
          </div>
        </article>
      )}
    </div>
  );
}
