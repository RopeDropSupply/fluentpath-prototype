import { useState } from 'react';
import { coreExerciseList, getExercise, pack } from '../content';
import type { Exercise } from '../domain/types';
import { CORE_SEQUENCE, exerciseStatus, type ExerciseStatus } from '../learner/analytics';
import { latestPathwayId, teachingService } from '../services/teachingService';
import { CaseIdentify } from '../ui/CaseIdentify';
import { Card, ConceptReference, Disclosure } from '../ui/common';
import { FillIn } from '../ui/FillIn';
import { useLearner } from '../ui/LearnerContext';
import { Remediation } from '../ui/Remediation';

const STATUS_TEXT: Record<ExerciseStatus, string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  completed: 'Completed',
};

export function ExerciseView({ exercise }: { exercise: Exercise }) {
  // The key resets all exercise state when the learner moves to another exercise.
  return exercise.type === 'case-id' ? <CaseIdentify key={exercise.id} exercise={exercise} /> : <FillIn key={exercise.id} exercise={exercise} />;
}

export function ReviewFlag() {
  return (
    <p className="review-flag">
      <span aria-hidden="true">⚑</span> Prototype content: written from standard grammar references and awaiting review by a qualified Polish teacher.
    </p>
  );
}

function ExerciseList({ title, description, items }: { title: string; description: string; items: Exercise[] }) {
  const { state } = useLearner();
  return (
    <Card title={title}>
      <p className="muted">{description}</p>
      <ul className="exercise-list">
        {items.map((e) => {
          const status = exerciseStatus(state, e);
          return (
            <li key={e.id}>
              <a href={`#/lab/${e.id}`}>
                <span className="exercise-title">{e.title}</span>
                <span className="exercise-meta">
                  <span className="pill">{e.difficulty}</span>
                  <span className={`pill progress-${status}`}>{STATUS_TEXT[status]}</span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

export function LabIndex() {
  const ordered = CORE_SEQUENCE.map((id) => coreExerciseList.find((e) => e.id === id)).filter((e): e is Exercise => !!e);
  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow">Grammar laboratory</p>
        <h1>Polish cases: recognise, produce, explain</h1>
        <p className="lead">
          Each exercise checks a different kind of knowledge. When you make an error, the lab names the likely rule behind it and tests that rule on
          new sentences instead of repeating the same question.
        </p>
      </header>
      <Card title="Five-minute route" className="accent">
        <ol className="route">
          <li><a href="#/lab/ci-1">Identify the instrumental and locative words</a> in one sentence, and click words to inspect them.</li>
          <li><a href="#/lab/fi-1">Type two instrumental endings</a>. Try a wrong answer such as <span lang="pl">nowego dyrektora</span> to see the diagnosis and targeted practice.</li>
          <li><a href="#/progress">Open your progress</a>, then the <a href="#/tutor">tutor briefing</a>.</li>
        </ol>
      </Card>
      <ExerciseList
        title="Recognise: identify cases in a sentence"
        description="Click the words that are in a given case. Every word can be inspected."
        items={ordered.filter((e) => e.type === 'case-id')}
      />
      <ExerciseList
        title="Produce: type the correct forms"
        description="No multiple choice. Type the noun and adjective forms yourself."
        items={ordered.filter((e) => e.type === 'fill-in')}
      />
      <Card title="Grammar reference">
        {Object.values(pack.concepts).map((c) => (
          <Disclosure key={c.id} label={c.title}>
            <ConceptReference concept={c} />
          </Disclosure>
        ))}
      </Card>
      <ReviewFlag />
    </div>
  );
}

export function ExercisePage({ id }: { id: string }) {
  const exercise = getExercise(id);
  if (!exercise) {
    return (
      <div className="page narrow">
        <h1>Exercise not found</h1>
        <a href="#/lab">Back to the grammar lab</a>
      </div>
    );
  }
  const position = CORE_SEQUENCE.indexOf(exercise.id);
  const nextId = position >= 0 ? CORE_SEQUENCE[position + 1] : undefined;
  const prevId = position > 0 ? CORE_SEQUENCE[position - 1] : undefined;
  return (
    <div className="page narrow">
      <header className="page-head">
        <p className="eyebrow">
          <a href="#/lab">Grammar lab</a> · {exercise.type === 'case-id' ? 'Recognition' : 'Production'} · {exercise.difficulty}
          {position >= 0 && ` · ${position + 1} of ${CORE_SEQUENCE.length}`}
        </p>
        <h1>{exercise.title}</h1>
      </header>
      <section className="card">
        <ExerciseView exercise={exercise} />
      </section>
      <Disclosure label="What you should already know">
        <ul>{exercise.prerequisites.map((p) => <li key={p}>{p}</li>)}</ul>
      </Disclosure>
      <nav className="pager" aria-label="Exercise navigation">
        {prevId ? <a className="btn" href={`#/lab/${prevId}`}>← Previous</a> : <span />}
        <a className="btn" href="#/progress">See my progress</a>
        {nextId ? <a className="btn primary" href={`#/lab/${nextId}`}>Next exercise →</a> : <a className="btn primary" href="#/lesson">Go to the lesson →</a>}
      </nav>
      <ReviewFlag />
    </div>
  );
}

export function PracticePage({ categoryId }: { categoryId: string }) {
  const { state } = useLearner();
  // If the learner has said what they were thinking, practise the matching pathway.
  const [pathwayId] = useState(() => latestPathwayId(state, categoryId));
  const plan = teachingService.practicePlan(categoryId, pathwayId);
  const belief = pathwayId ? teachingService.pathway(pathwayId)?.belief : undefined;
  if (!plan) {
    return (
      <div className="page narrow">
        <h1>No targeted practice for this topic</h1>
        <a href="#/progress">Back to progress</a>
      </div>
    );
  }
  return (
    <div className="page narrow">
      <header className="page-head">
        <p className="eyebrow"><a href="#/progress">Progress</a> · Targeted practice</p>
        <h1>{plan.label}</h1>
        {belief && <p className="muted">Chosen from what you told us earlier: “{belief.charAt(0).toLowerCase() + belief.slice(1)}”.</p>}
      </header>
      <section className="card">
        <Remediation key={categoryId} plan={plan} />
      </section>
      <nav className="pager" aria-label="Practice navigation">
        <a className="btn" href="#/lab">Grammar lab</a>
        <a className="btn primary" href="#/progress">See my progress</a>
      </nav>
      <ReviewFlag />
    </div>
  );
}
