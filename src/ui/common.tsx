import type { ReactNode } from 'react';
import type { Concept, GrammaticalCase, Reliability } from '../domain/types';
import { STATUS_LABEL, type Status } from '../learner/analytics';

export const CASE_LABEL: Record<GrammaticalCase, string> = {
  nominative: 'Nominative',
  genitive: 'Genitive',
  dative: 'Dative',
  accusative: 'Accusative',
  instrumental: 'Instrumental',
  locative: 'Locative',
};

export const RELIABILITY_LABEL: Record<Reliability, string> = {
  reliable: 'Reliable pattern',
  conditional: 'Conditional pattern',
  lexical: 'Learn word by word',
};

export function Card({ title, children, className = '', aside }: { title?: string; children: ReactNode; className?: string; aside?: ReactNode }) {
  return (
    <section className={`card ${className}`}>
      {(title || aside) && (
        <header className="card-head">
          {title && <h2>{title}</h2>}
          {aside}
        </header>
      )}
      {children}
    </section>
  );
}

/** Progressive disclosure built on the native, keyboard-accessible <details>. */
export function Disclosure({ label, children, open }: { label: string; children: ReactNode; open?: boolean }) {
  return (
    <details className="disclosure" open={open}>
      <summary>{label}</summary>
      <div className="disclosure-body">{children}</div>
    </details>
  );
}

export function ConceptReference({ concept }: { concept: Concept }) {
  return (
    <div className="concept">
      <p>{concept.summary}</p>
      {concept.tables.map((table) => (
        <div className="table-scroll" key={table.caption}>
          <table className="grammar-table">
            <caption>{table.caption}</caption>
            <thead>
              <tr>{table.headers.map((h, i) => <th key={i} scope="col">{h}</th>)}</tr>
            </thead>
            <tbody>
              {table.rows.map((row, r) => (
                <tr key={r}>
                  {row.map((cell, c) => (c === 0 ? <th key={c} scope="row">{cell}</th> : <td key={c} lang="pl">{cell}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      {concept.rules.length > 0 && (
        <ul className="rules">
          {concept.rules.map((r) => (
            <li key={r.text}>
              <span className={`pill rule-${r.reliability}`}>{RELIABILITY_LABEL[r.reliability]}</span>
              <span>
                {r.text}
                {r.review && <span className="review-note"> ⚑ For teacher review: {r.review}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function StatusPill({ status }: { status: Status }) {
  return <span className={`pill status-${status}`}>{STATUS_LABEL[status]}</span>;
}

export function Feedback({ tone, title, children }: { tone: 'good' | 'bad' | 'info'; title: string; children?: ReactNode }) {
  const icon = tone === 'good' ? '✓' : tone === 'bad' ? '✕' : 'i';
  return (
    <div className={`feedback feedback-${tone}`} role="status">
      <span className="feedback-icon" aria-hidden="true">{icon}</span>
      <div>
        <strong>{title}</strong>
        {children}
      </div>
    </div>
  );
}

const POLISH_LETTERS = ['ą', 'ć', 'ę', 'ł', 'ń', 'ó', 'ś', 'ź', 'ż'];

/** On-screen Polish letters for learners without a Polish keyboard layout. */
export function PolishKeys({ onInsert }: { onInsert: (letter: string) => void }) {
  return (
    <div className="polish-keys" role="group" aria-label="Insert a Polish letter">
      {POLISH_LETTERS.map((l) => (
        <button
          key={l}
          type="button"
          lang="pl"
          aria-label={`Insert ${l}`}
          // Keep focus in the text field while clicking.
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onInsert(l)}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

/** Insert text at the caret of an input and return the new value. */
export function insertAtCaret(input: HTMLInputElement | null, current: string, text: string): string {
  if (!input) return current + text;
  const start = input.selectionStart ?? current.length;
  const end = input.selectionEnd ?? current.length;
  const next = current.slice(0, start) + text + current.slice(end);
  requestAnimationFrame(() => {
    input.focus();
    input.setSelectionRange(start + text.length, start + text.length);
  });
  return next;
}
