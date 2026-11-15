import { competencyLabel, competencyMatrix, DIMENSIONS, recommendNext, totals } from '../learner/analytics';
import { buildPlan } from '../learner/plan';
import { Card, StatusPill } from '../ui/common';
import { useLearner } from '../ui/LearnerContext';
import { Onboarding } from './Onboarding';

export function Plan() {
  const { state } = useLearner();
  if (!state.profile) return <Onboarding />;
  const profile = state.profile;
  const plan = buildPlan(profile);
  const matrix = competencyMatrix(state);
  const next = recommendNext(state);
  const t = totals(state);
  const maxHours = Math.max(...plan.allocation.map((a) => a.hours));

  const feasibilityText = {
    within: 'On these assumptions, your planned hours cover the estimated range.',
    tight: 'On these assumptions, your planned hours cover the lower estimate but not the upper one.',
    'needs-more-time': 'On these assumptions, this goal probably needs more study time than you have planned.',
    'already-there': 'Your target is not above your current level.',
  }[plan.feasibility];

  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow">Your learning plan</p>
        <h1>
          {profile.targetLanguage}: {profile.currentLevel} → {profile.targetLevel} in {profile.deadlineMonths} months
        </h1>
        {profile.purpose && <p className="lead">{profile.purpose}</p>}
        <p className="muted small">
          {profile.hoursPerWeek} hours a week ·{' '}
          {profile.tutor === 'none' ? 'no tutor' : profile.tutor === 'weekly' ? 'one tutor session a week' : 'occasional tutor sessions'}
          {profile.personalInterests && ` · personal interests: ${profile.personalInterests}`} · <a href="#/start">Edit goal</a>
        </p>
      </header>

      <div className="grid two">
        <Card title="Next recommended activity" className="accent">
          <p className="next-title">{next.title}</p>
          <p><strong>Why this:</strong> {next.reason}</p>
          <a className="btn primary" href={next.href}>Start</a>
        </Card>

        <Card title="Is the timeline realistic?">
          <div className={`feasibility feasibility-${plan.feasibility}`}>
            <strong>{feasibilityText}</strong>
          </div>
          <dl className="facts">
            <div><dt>Planned</dt><dd>{plan.plannedHours} h ({plan.weeks} weeks × {profile.hoursPerWeek} h)</dd></div>
            <div><dt>Assumed need</dt><dd>{plan.estimate.low}–{plan.estimate.high} h</dd></div>
            {plan.feasibility !== 'within' && plan.feasibility !== 'already-there' && (
              <>
                <div><dt>To keep the deadline</dt><dd>about {plan.requiredPerWeek.low}–{plan.requiredPerWeek.high} h a week</dd></div>
                <div><dt>At your current pace</dt><dd>about {plan.monthsAtCurrentPace.low}–{plan.monthsAtCurrentPace.high} months</dd></div>
              </>
            )}
          </dl>
          <p className="muted small">
            These are planning assumptions, not guarantees or research findings. The hour figures are rough estimates for an English speaker learning
            Polish and vary widely between learners. Use them to judge workload, not to predict a result.
          </p>
        </Card>
      </div>

      <Card title="Suggested weekly allocation">
        <ul className="allocation">
          {plan.allocation.map((a) => (
            <li key={a.label}>
              <div className="allocation-head">
                <span>{a.label}</span>
                <span className="num">{a.hours} h</span>
              </div>
              <div className="bar" aria-hidden="true"><span style={{ width: `${(a.hours / maxHours) * 100}%` }} /></div>
              <p className="muted small">{a.detail}</p>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid two">
        <Card title="Priority competencies">
          <ul className="priorities">
            {plan.priorities.map((p) => {
              const cells = DIMENSIONS.map((d) => matrix[p.id][d.id]);
              const assessed = cells.filter((c) => c.firstTry > 0);
              const worst = assessed.length
                ? assessed.reduce((a, b) => (a.firstTryCorrect / a.firstTry <= b.firstTryCorrect / b.firstTry ? a : b)).status
                : 'not-assessed';
              return (
                <li key={p.id}>
                  <div className="allocation-head">
                    <strong>{competencyLabel(p.id)}</strong>
                    <StatusPill status={worst} />
                  </div>
                  <p className="muted small">{p.why}</p>
                </li>
              );
            })}
          </ul>
          <p className="muted small card-note">Status shows your weakest measured dimension for each competency. <a href="#/progress">See the detail</a>.</p>
        </Card>

        <Card title="First four weeks (sample)">
          <ol className="weeks">
            {plan.sample.map((w) => (
              <li key={w.week}>
                <strong>{w.week}: {w.focus}</strong>
                <ul>{w.activities.map((a) => <li key={a}>{a}</li>)}</ul>
              </li>
            ))}
          </ol>
          <p className="muted small">A representative extract. The prototype does not generate a full curriculum.</p>
        </Card>
      </div>

      <Card title="Activity so far">
        {t.attempts === 0 ? (
          <p className="muted">Nothing recorded yet. Your progress appears here after your first exercise.</p>
        ) : (
          <dl className="stats">
            <div><dt>Core exercises completed</dt><dd>{t.coreCompleted} of {t.coreTotal}</dd></div>
            <div><dt>Graded responses</dt><dd>{t.attempts}</dd></div>
            <div><dt>Incorrect</dt><dd>{t.errors}</dd></div>
            <div><dt>Targeted practice sets</dt><dd>{t.remediationsCompleted}</dd></div>
          </dl>
        )}
      </Card>
    </div>
  );
}
