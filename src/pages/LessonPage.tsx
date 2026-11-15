import { useState } from 'react';
import { getExercise, pack } from '../content';
import { Card } from '../ui/common';
import { ExerciseView, ReviewFlag } from './Lab';

export function LessonPage() {
  const lesson = pack.lesson;
  const [showEnglish, setShowEnglish] = useState(false);
  const [draft, setDraft] = useState('');
  const interview = getExercise(lesson.interview.exerciseId);

  return (
    <div className="page narrow">
      <header className="page-head">
        <p className="eyebrow">Professional context · {lesson.level}</p>
        <h1 lang="pl">{lesson.title}</h1>
        <p className="lead">{lesson.intro}</p>
      </header>

      <Card
        title="1. Read"
        aside={
          <button type="button" className="btn small" aria-pressed={showEnglish} onClick={() => setShowEnglish(!showEnglish)}>
            {showEnglish ? 'Hide English' : 'Show English'}
          </button>
        }
      >
        <ol className="reading">
          {lesson.text.map((line) => (
            <li key={line.polish}>
              <span lang="pl">{line.polish}</span>
              {showEnglish && <span className="muted small">{line.english}</span>}
            </li>
          ))}
        </ol>
      </Card>

      <Card title="2. Key vocabulary">
        <div className="table-scroll">
          <table className="grammar-table">
            <thead><tr><th scope="col">Polish</th><th scope="col">English</th><th scope="col">Gender</th></tr></thead>
            <tbody>
              {lesson.vocabulary.map((v) => (
                <tr key={v.polish}><td lang="pl">{v.polish}</td><td>{v.english}</td><td>{v.gender}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {lesson.exerciseIds.map((id, i) => {
        const exercise = getExercise(id);
        if (!exercise) return null;
        return (
          <Card key={id} title={`${i + 3}. ${exercise.title}`} aside={<span className="pill graded">Graded</span>}>
            <ExerciseView exercise={exercise} />
          </Card>
        );
      })}

      <Card title={`${lesson.exerciseIds.length + 3}. Interview question`} aside={<span className="pill graded">Graded</span>}>
        <blockquote className="interview" lang="pl">
          {lesson.interview.question}
          <footer lang="en" className="muted small">{lesson.interview.questionTranslation}</footer>
        </blockquote>
        <p>Complete this model answer. Each blank is graded against an answer key.</p>
        {interview && <ExerciseView exercise={interview} />}
      </Card>

      <Card title="Your own answer" aside={<span className="pill planned">Not graded · future AI capability</span>}>
        <p>
          Write two or three sentences of your own in reply to the interview question. In a full version, an AI teaching service would comment on
          grammar, vocabulary and register, and a voice mode would let you rehearse the interview aloud.
        </p>
        <p className="muted small">
          This prototype has no such service, so nothing you write here is assessed or stored. Take your draft to your tutor.
        </p>
        <label className="sr-only" htmlFor="own-answer">Your own answer in Polish</label>
        <textarea id="own-answer" lang="pl" rows={4} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Interesuję się…" />
      </Card>

      <nav className="pager" aria-label="Lesson navigation">
        <a className="btn" href="#/lab">Grammar lab</a>
        <a className="btn primary" href="#/progress">See my progress</a>
      </nav>
      <ReviewFlag />
    </div>
  );
}
