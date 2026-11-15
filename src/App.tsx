import { useEffect } from 'react';
import { BRAND } from './brand';
import { About } from './pages/About';
import { ExercisePage, LabIndex, PracticePage } from './pages/Lab';
import { LessonPage } from './pages/LessonPage';
import { Onboarding } from './pages/Onboarding';
import { Plan } from './pages/Plan';
import { Progress } from './pages/Progress';
import { Tutor } from './pages/Tutor';
import { useRoute } from './ui/router';

const NAV = [
  { href: '#/plan', key: 'plan', label: 'Plan' },
  { href: '#/lab', key: 'lab', label: 'Grammar lab' },
  { href: '#/lesson', key: 'lesson', label: 'Lesson' },
  { href: '#/progress', key: 'progress', label: 'Progress' },
  { href: '#/tutor', key: 'tutor', label: 'Tutor briefing' },
  { href: '#/about', key: 'about', label: 'About' },
];

function Page({ route }: { route: string[] }) {
  const [section, a, b] = route;
  switch (section) {
    case 'start':
      return <Onboarding />;
    case 'lab':
      if (a === 'practice' && b) return <PracticePage categoryId={b} />;
      return a ? <ExercisePage id={a} /> : <LabIndex />;
    case 'lesson':
      return <LessonPage />;
    case 'progress':
      return <Progress />;
    case 'tutor':
      return <Tutor />;
    case 'about':
      return <About />;
    default:
      return <Plan />;
  }
}

export function App() {
  const route = useRoute();
  const current = route[0] ?? 'plan';
  const path = route.join('/');

  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [path]);

  return (
    <>
      <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>Skip to content</a>
      <header className="site-header">
        <div className="site-header-inner">
          <a className="brand" href="#/plan">
            <span className="brand-mark" aria-hidden="true" />
            {BRAND.name}
            <span className="brand-tag">prototype</span>
          </a>
          <nav aria-label="Main">
            <ul>
              {NAV.map((n) => (
                <li key={n.key}>
                  <a href={n.href} aria-current={current === n.key || (current === 'start' && n.key === 'plan') ? 'page' : undefined}>{n.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        <Page route={route} />
      </main>
      <footer className="site-footer">
        <p>
          {BRAND.name} prototype. Deterministic grading from a hand-written dataset; no AI service is used. Polish content awaiting teacher review.{' '}
          <a href="#/about">What is implemented</a>
        </p>
      </footer>
    </>
  );
}
