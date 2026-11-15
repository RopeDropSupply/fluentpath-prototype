/**
 * Domain types shared by content, grading, learner state and UI.
 * Nothing in this file depends on React or on a specific language.
 */

export type GrammaticalCase =
  | 'nominative'
  | 'genitive'
  | 'dative'
  | 'accusative'
  | 'instrumental'
  | 'locative';

/** The four learning dimensions. They are tracked separately and never merged. */
export type Dimension = 'recognition' | 'production' | 'understanding' | 'transfer';

export type CompetencyId =
  | 'accusative'
  | 'genitive'
  | 'instrumental'
  | 'locative'
  | 'adjective-agreement'
  | 'verb-aspect'
  | 'professional-vocabulary'
  | 'sentence-construction';

export type Difficulty = 'A2' | 'A2+' | 'B1';

/** All prototype content is authored by hand and awaits review by a teacher of Polish. */
export type ReviewStatus = 'needs-native-review' | 'reviewed';

export interface TokenAnnotation {
  text: string;
  /** Punctuation printed after the word (not clickable). */
  after?: string;
  lemma: string;
  pos: string;
  gloss: string;
  case?: GrammaticalCase;
  number?: 'singular' | 'plural';
  gender?: string;
  /** What requires this case (a preposition, a verb, negation, agreement...). */
  governedBy?: string;
  /** Why this particular form is used. */
  why: string;
  /** How the word relates to other words in the sentence. */
  relations?: string;
}

export interface ChoiceOption {
  id: string;
  text: string;
  correct: boolean;
  feedback: string;
}

/** "How do you know?" — graded through structured options, never free text. */
export interface ReasoningPrompt {
  id: string;
  question: string;
  options: ChoiceOption[];
  /** A model explanation, shown after the learner answers. */
  modelExplanation: string;
  /** What an effective explanation contains. */
  checklist: string[];
  competencies: CompetencyId[];
}

interface ExerciseBase {
  id: string;
  title: string;
  track: 'core' | 'lesson';
  difficulty: Difficulty;
  translation: string;
  /** The governing rule, shown once the exercise is resolved. */
  ruleExplanation: string;
  prerequisites: string[];
  conceptIds: string[];
  reasoning?: ReasoningPrompt;
  reviewStatus: ReviewStatus;
}

export interface CaseTask {
  id: string;
  targetCase: GrammaticalCase;
  targetTokenIndexes: number[];
  competencies: CompetencyId[];
  errorCategory: string;
}

export interface CaseIdExercise extends ExerciseBase {
  type: 'case-id';
  tokens: TokenAnnotation[];
  tasks: CaseTask[];
}

export interface Misconception {
  /** A specific wrong form a learner is likely to type. */
  form: string;
  errorCategory: string;
  note: string;
}

export interface Blank {
  id: string;
  /** Dictionary form shown to the learner. */
  baseForm: string;
  /** e.g. "adjective", "noun, plural". */
  hint: string;
  answer: string;
  accepted?: string[];
  misconceptions?: Misconception[];
  /** Category used when the wrong answer matches no known misconception. */
  fallbackCategory: string;
  competencies: CompetencyId[];
  explanation: string;
}

export type Segment = string | { blank: string };

export interface FillInExercise extends ExerciseBase {
  type: 'fill-in';
  segments: Segment[];
  blanks: Blank[];
  /** Vocabulary recall items are production of words, not of endings. */
  dimension?: Dimension;
}

export type Exercise = CaseIdExercise | FillInExercise;

export interface RemediationFillItem {
  id: string;
  type: 'fill';
  /** What this item tests relative to the original error, e.g. "Same rule, neuter noun". */
  focus: string;
  before: string;
  after: string;
  baseForm: string;
  hint: string;
  answer: string;
  accepted?: string[];
  translation: string;
  explanation: string;
  competencies: CompetencyId[];
}

export interface RemediationChoiceItem {
  id: string;
  type: 'choice';
  focus: string;
  sentence: string;
  translation: string;
  question: string;
  options: ChoiceOption[];
  explanation: string;
  competencies: CompetencyId[];
}

export type RemediationItem = RemediationFillItem | RemediationChoiceItem;

export interface ErrorCategory {
  id: string;
  label: string;
  conceptId: string;
  /** Short targeted explanation shown when this error is detected. */
  diagnosis: string;
  competencies: CompetencyId[];
  remediation: RemediationItem[];
}

export interface GrammarTable {
  caption: string;
  headers: string[];
  rows: string[][];
}

export interface Concept {
  id: string;
  title: string;
  summary: string;
  tables: GrammarTable[];
  notes: string[];
}

export interface VocabEntry {
  polish: string;
  english: string;
  gender: string;
}

export interface Lesson {
  id: string;
  title: string;
  level: string;
  intro: string;
  text: { polish: string; english: string }[];
  vocabulary: VocabEntry[];
  exerciseIds: string[];
  interview: {
    question: string;
    questionTranslation: string;
    exerciseId: string;
  };
}

/** A language pack: everything language-specific lives behind this interface. */
export interface LanguagePack {
  code: string;
  name: string;
  exercises: Exercise[];
  errorCategories: Record<string, ErrorCategory>;
  concepts: Record<string, Concept>;
  lesson: Lesson;
}

// ---------- Learner ----------

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'B2/C1' | 'C1' | 'C2';

export interface LearnerProfile {
  nativeLanguage: string;
  targetLanguage: string;
  currentLevel: CefrLevel;
  targetLevel: CefrLevel;
  purpose: string;
  deadlineMonths: number;
  hoursPerWeek: number;
  professionalInterests: string;
  personalInterests: string;
  tutor: 'none' | 'weekly' | 'occasional';
}

/** One graded response. The learner record is an append-only log of these. */
export interface AttemptEvent {
  at: number;
  exerciseId: string;
  /** Blank id, case-task id, reasoning id or remediation item id. */
  itemId: string;
  source: 'core' | 'lesson' | 'remediation';
  dimension: Dimension;
  competencies: CompetencyId[];
  correct: boolean;
  /** 1 = first attempt at this item. */
  attemptNumber: number;
  errorCategory?: string;
  response: string;
  expected: string;
}

export interface RemediationRecord {
  at: number;
  categoryId: string;
  correct: number;
  total: number;
}

export interface ReasoningNote {
  at: number;
  promptId: string;
  text: string;
}

export interface LearnerState {
  version: 1;
  profile: LearnerProfile | null;
  attempts: AttemptEvent[];
  remediations: RemediationRecord[];
  notes: ReasoningNote[];
}
