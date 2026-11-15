import type { CefrLevel, CompetencyId, LearnerProfile } from '../domain/types';

/**
 * Learning-plan generator. Every number here is a PLANNING ASSUMPTION, shown
 * to the learner as such. Nothing is an evidence-backed guarantee.
 */

const ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
type Level = (typeof ORDER)[number];

/**
 * Assumed study hours to move up one level, for an English speaker learning
 * Polish. Rough figures: commonly cited guided-learning-hour ranges for CEFR
 * levels, raised because Polish is usually slow going for English speakers.
 */
export const HOURS_TO_NEXT: Record<Level, number> = { A1: 150, A2: 250, B1: 350, B2: 450, C1: 600, C2: 0 };

function hoursBetween(from: Level, to: Level): number {
  let sum = 0;
  for (let i = ORDER.indexOf(from); i < ORDER.indexOf(to); i++) sum += HOURS_TO_NEXT[ORDER[i]];
  return sum;
}

export function estimateHours(current: CefrLevel, target: CefrLevel): { low: number; high: number } {
  const from: Level = current === 'B2/C1' ? 'B2' : current;
  if (target === 'B2/C1') return { low: hoursBetween(from, 'B2'), high: hoursBetween(from, 'C1') };
  const mid = hoursBetween(from, target);
  return { low: Math.round(mid * 0.8), high: Math.round(mid * 1.2) };
}

export type Feasibility = 'within' | 'tight' | 'needs-more-time' | 'already-there';

export interface Allocation {
  label: string;
  hours: number;
  detail: string;
}

export interface LearningPlan {
  weeks: number;
  plannedHours: number;
  estimate: { low: number; high: number };
  feasibility: Feasibility;
  requiredPerWeek: { low: number; high: number };
  monthsAtCurrentPace: { low: number; high: number };
  allocation: Allocation[];
  priorities: { id: CompetencyId; why: string }[];
  sample: { week: string; focus: string; activities: string[] }[];
}

const WEEKS_PER_MONTH = 52 / 12;
const half = (n: number) => Math.round(n * 2) / 2;

export function buildPlan(profile: LearnerProfile): LearningPlan {
  const weeks = Math.max(1, Math.round(profile.deadlineMonths * WEEKS_PER_MONTH));
  const plannedHours = Math.round(weeks * profile.hoursPerWeek);
  const estimate = estimateHours(profile.currentLevel, profile.targetLevel);

  let feasibility: Feasibility;
  if (estimate.high === 0) feasibility = 'already-there';
  else if (plannedHours >= estimate.high) feasibility = 'within';
  else if (plannedHours >= estimate.low) feasibility = 'tight';
  else feasibility = 'needs-more-time';

  const h = profile.hoursPerWeek;
  const hasTutor = profile.tutor !== 'none';
  const allocation: Allocation[] = [
    { label: 'Grammar laboratory', hours: half(h * 0.3), detail: 'Case system and agreement: recognise, produce, explain.' },
    {
      label: 'Reading and listening in context',
      hours: half(h * 0.25),
      detail: profile.professionalInterests ? `Short texts on: ${profile.professionalInterests.toLowerCase()}.` : 'Short texts on your subjects.',
    },
    {
      label: 'Speaking and writing',
      hours: half(h * 0.2),
      detail: hasTutor
        ? profile.tutor === 'weekly'
          ? 'Includes your weekly tutor session, prepared with the tutor briefing.'
          : 'Includes occasional tutor sessions, prepared with the tutor briefing.'
        : 'Self-recorded answers and short written texts. A tutor or exchange partner would strengthen this block.',
    },
    { label: 'Vocabulary recall', hours: half(h * 0.15), detail: 'Typed recall of professional and everyday terms.' },
    { label: 'Review of earlier errors', hours: half(h * 0.1), detail: 'Targeted practice on the rules you got wrong.' },
  ];

  const work = /work|job|interview|career|profession|business|consult/i.test(`${profile.purpose} ${profile.professionalInterests}`);
  const priorities: LearningPlan['priorities'] = [
    { id: 'instrumental', why: 'Needed constantly for "with", "interested in", "work as" and professions.' },
    { id: 'genitive', why: 'Needed in many everyday structures: negation, quantities, "of", many prepositions.' },
    { id: 'accusative', why: 'Direct objects, and the animate/inanimate split that causes persistent errors.' },
    { id: 'adjective-agreement', why: 'Every adjective must match its noun; errors here are immediately audible.' },
    work
      ? { id: 'professional-vocabulary', why: 'Your goal is professional, so sector terms are learned alongside grammar, not after it.' }
      : { id: 'sentence-construction', why: 'Building longer sentences from the patterns you control.' },
    { id: 'verb-aspect', why: 'Central to B1 and above. Not yet covered by this prototype.' },
  ];

  const topic = profile.professionalInterests.split(',')[0]?.trim().toLowerCase() || 'your field';
  const sample: LearningPlan['sample'] = [
    { week: 'Week 1', focus: 'Instrumental case', activities: ['Grammar lab: identify and produce instrumental forms', `Lesson: ${topic} vocabulary, first 10 terms`] },
    { week: 'Week 2', focus: 'Accusative and animacy', activities: ['Grammar lab: animate versus inanimate objects', 'Write five sentences about your work and family'] },
    { week: 'Week 3', focus: 'Genitive: negation and quantity', activities: ['Grammar lab: accusative versus genitive', `Reading: a short text on ${topic}`] },
    { week: 'Week 4', focus: 'Consolidation', activities: ['Targeted practice on recorded errors', hasTutor ? 'Tutor session: interview question practice' : 'Record a one-minute answer to an interview question'] },
  ];

  return {
    weeks,
    plannedHours,
    estimate,
    feasibility,
    requiredPerWeek: { low: Math.ceil(estimate.low / weeks), high: Math.ceil(estimate.high / weeks) },
    monthsAtCurrentPace: {
      low: Math.ceil(estimate.low / profile.hoursPerWeek / WEEKS_PER_MONTH),
      high: Math.ceil(estimate.high / profile.hoursPerWeek / WEEKS_PER_MONTH),
    },
    allocation,
    priorities,
    sample,
  };
}
