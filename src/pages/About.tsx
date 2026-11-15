import { BRAND } from '../brand';
import { Card } from '../ui/common';

const WORKING = [
  'Onboarding and a learning plan calculated from your goal, deadline and weekly hours',
  'Click-to-inspect Polish sentences with word-by-word grammatical annotation',
  'Case identification with multiple-word selection and immediate feedback',
  'Typed noun and adjective forms, graded against a reviewed answer key',
  'Suspected issues: known wrong forms are mapped to a likely underlying rule, labelled as a guess',
  'Diagnostic questions on two topics: you say which rule you applied, and that choice selects the explanation and practice',
  'Targeted practice sequences that test the same rule on new words and genders',
  '“How do you know?” reasoning questions, graded through structured options',
  'Progress split into first attempts, remediation, transfer to unfamiliar sentences, and retention (not yet assessed)',
  'Grammar rules labelled as reliable, conditional, or learned word by word',
  'A tutor briefing assembled from your actual errors',
  'Storage in your browser: progress survives a refresh, and can be reset',
];

const NEEDS_AI = [
  'Assessing free-text explanations and open written answers',
  'Diagnosing errors the answer key did not anticipate (today these get a general explanation for the slot)',
  'Understanding a learner’s reasoning in their own words (today they choose from a prepared list)',
  'Generating new exercises and explanations on your own subjects',
  'Voice conversation, pronunciation practice and interview simulation',
  'A curriculum that adapts over months rather than within a session',
];

const PLANNED = [
  'Teacher-created assignments and a tutor view',
  'Lessons built from licensed podcasts and articles',
  'Learner groups organised by interest',
  'Accounts and progress synced across devices',
  'Measuring retention with spaced review',
  'More target languages',
];

export function About() {
  return (
    <div className="page narrow">
      <header className="page-head">
        <p className="eyebrow">About this prototype</p>
        <h1>What works today, and what does not</h1>
        <p className="lead">
          {BRAND.name} is an experiment to test a learning experience with real learners. There is no AI model behind it: every grade and
          explanation comes from a small hand-written dataset and fixed rules.
        </p>
      </header>
      <Card title="Working now">
        <ul className="checklist">{WORKING.map((s) => <li key={s}>{s}</li>)}</ul>
      </Card>
      <Card title="Would need an AI teaching service" aside={<span className="pill planned">Not implemented</span>}>
        <ul>{NEEDS_AI.map((s) => <li key={s}>{s}</li>)}</ul>
      </Card>
      <Card title="Planned" aside={<span className="pill planned">Not implemented</span>}>
        <ul>{PLANNED.map((s) => <li key={s}>{s}</li>)}</ul>
      </Card>
      <Card title="Accuracy and limits">
        <ul>
          <li>The Polish content covers regular patterns only and is awaiting review by a qualified teacher of Polish. Please report anything that looks wrong.</li>
          <li>What you say about your own reasoning is recorded as you gave it. It is not verified, and people do not always know why they made an error.</li>
          <li>Scores are simple counts of first attempts. They are not a validated measure of proficiency or of a CEFR level.</li>
          <li>Timeline figures in the plan are planning assumptions, not predictions.</li>
          <li>All data stays in this browser. Clearing site data, or using another device, starts from zero.</li>
        </ul>
      </Card>
    </div>
  );
}
