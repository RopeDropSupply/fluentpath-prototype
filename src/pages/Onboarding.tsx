import { useState } from 'react';
import { PLANNED_LANGUAGES } from '../content';
import { BRAND } from '../brand';
import type { CefrLevel, LearnerProfile } from '../domain/types';
import { demoProfile } from '../learner/state';
import { useLearner } from '../ui/LearnerContext';
import { navigate } from '../ui/router';

const LEVELS: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'B2/C1', 'C1', 'C2'];

const blank: LearnerProfile = {
  nativeLanguage: 'English',
  targetLanguage: 'Polish',
  currentLevel: 'A2',
  targetLevel: 'B1',
  purpose: '',
  deadlineMonths: 6,
  hoursPerWeek: 5,
  professionalInterests: '',
  personalInterests: '',
  tutor: 'none',
};

export function Onboarding() {
  const { state, dispatch } = useLearner();
  const [form, setForm] = useState<LearnerProfile>(state.profile ?? blank);
  const set = <K extends keyof LearnerProfile>(key: K, value: LearnerProfile[K]) => setForm((f) => ({ ...f, [key]: value }));

  function save(profile: LearnerProfile) {
    dispatch({ type: 'setProfile', profile });
    navigate('#/plan');
  }

  return (
    <div className="page narrow">
      <header className="hero">
        <p className="eyebrow">{BRAND.name} · prototype</p>
        <h1>Learn Polish toward a goal, and understand why each form is correct.</h1>
        <p className="lead">
          Tell us where you are and where you need to be. You get a plan, a grammar laboratory that diagnoses your errors, and a briefing for your
          tutor. The full demonstration takes about five minutes.
        </p>
        <div className="actions">
          <button type="button" className="btn primary" onClick={() => save(demoProfile)}>
            Load the demo profile
          </button>
          <a className="btn" href="#/lab">Skip to the grammar lab</a>
        </div>
        <p className="muted small">
          Demo profile: English speaker, Polish A2 → B2/C1 in nine months, seven hours a week, renewable-energy career goal, weekly tutor.
        </p>
      </header>

      <form
        className="card form"
        onSubmit={(e) => {
          e.preventDefault();
          save(form);
        }}
      >
        <h2>Or describe your own goal</h2>
        <label>
          What language do you want to learn?
          <select value={form.targetLanguage} onChange={(e) => set('targetLanguage', e.target.value)}>
            <option value="Polish">Polish</option>
            {PLANNED_LANGUAGES.map((l) => <option key={l} disabled>{l} (planned, not available)</option>)}
          </select>
        </label>
        <div className="row">
          <label>
            Current level
            <select value={form.currentLevel} onChange={(e) => set('currentLevel', e.target.value as CefrLevel)}>
              {LEVELS.filter((l) => l !== 'B2/C1').map((l) => <option key={l}>{l}</option>)}
            </select>
          </label>
          <label>
            Target level
            <select value={form.targetLevel} onChange={(e) => set('targetLevel', e.target.value as CefrLevel)}>
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </label>
        </div>
        <label>
          Why are you learning?
          <textarea rows={2} value={form.purpose} onChange={(e) => set('purpose', e.target.value)} placeholder="e.g. To interview for a job in Warsaw" />
        </label>
        <div className="row">
          <label>
            Deadline (months from now)
            <input type="number" min={1} max={60} required value={form.deadlineMonths} onChange={(e) => set('deadlineMonths', Number(e.target.value))} />
          </label>
          <label>
            Study hours per week
            <input type="number" min={1} max={60} required value={form.hoursPerWeek} onChange={(e) => set('hoursPerWeek', Number(e.target.value))} />
          </label>
        </div>
        <label>
          Professional subjects that interest you
          <input value={form.professionalInterests} onChange={(e) => set('professionalInterests', e.target.value)} placeholder="e.g. Renewable energy, consulting" />
        </label>
        <label>
          Personal interests
          <input value={form.personalInterests} onChange={(e) => set('personalInterests', e.target.value)} placeholder="e.g. Family life, travel" />
        </label>
        <label>
          Are you working with a human tutor?
          <select value={form.tutor} onChange={(e) => set('tutor', e.target.value as LearnerProfile['tutor'])}>
            <option value="none">No</option>
            <option value="weekly">Yes, about one session a week</option>
            <option value="occasional">Yes, occasionally</option>
          </select>
        </label>
        <p className="muted small">
          The exercises in this prototype are written for A2 to B1 learners whatever level you enter. Your answers are stored only in this browser.
        </p>
        <button type="submit" className="btn primary">Build my plan</button>
      </form>
    </div>
  );
}
