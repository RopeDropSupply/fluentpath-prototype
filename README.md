# FluentPath prototype

A functional prototype of a goal-directed, grammar-first language-learning
platform for adult English speakers learning Polish. It is an experiment to
test the learning experience with real learners, not a production application.

There is **no AI service** behind it. Every grade, diagnosis and explanation
comes from a small hand-written dataset and deterministic rules, and the
interface says so wherever it matters.

## Run, test, build

Requires Node 20 or later.

```bash
npm install
npm run dev        # local development server
npm test           # grading, dataset-integrity, progress and persistence tests
npm run build      # type-check and production build into dist/
npm run preview    # serve the production build locally
```

## Deploy to Netlify

`netlify.toml` is already configured (build command `npm run build`, publish
directory `dist`, Node 22).

- **From Git:** in Netlify choose *Add new site → Import an existing project*,
  pick this repository and branch, and deploy. No settings need changing.
- **Manually:** run `npm run build` and drag the `dist/` folder onto
  <https://app.netlify.com/drop>.

Routing uses the URL hash (`#/lab/fi-1`), so no redirect rules are needed and
the site works on any static host. No environment variables or API keys are
required.

## Five-minute demo route

1. Click **Load the demo profile**. The plan flags that A2 → B2/C1 in nine
   months at seven hours a week probably needs more time.
2. **Grammar lab → Talking with someone about something.** Select the
   instrumental words, check, and click words to inspect them.
3. **Instrumental, masculine singular.** Type `nowym` and `dyrektorą` to see an
   ending error diagnosed, or `nowego dyrektora` to see a different diagnosis
   (wrong case). Do the targeted practice, then return to the sentence.
4. Open **Progress**, refresh the page to confirm it persists, then open
   **Tutor briefing**.

## What is genuinely functional

- Onboarding and a learning plan computed from level, target, deadline and hours
- Click-to-inspect sentences with token-level grammatical annotation
- Case identification with multi-word selection (5 sentences, 8 tasks)
- Typed noun and adjective forms with deterministic grading (10 core exercises)
- Error diagnosis: anticipated wrong forms map to one of 11 error categories
- Targeted practice: 10 categories each have their own 2–3 follow-up questions
  on new words, genders or contexts
- "How do you know?" reasoning questions graded through structured options
- A contextual lesson (renewable energy) with vocabulary recall, grammar in
  context and a model interview answer
- Progress split by recognition, production, understanding and transfer
- A tutor briefing assembled from the learner's recorded errors
- Persistence in `localStorage`, with reset controls

## What is not implemented

Clearly labelled in the app (About page, and inline where relevant):

- Assessment of free-text explanations or open written answers. Free-text
  reasoning notes are stored and passed to the tutor briefing, ungraded.
- AI-generated exercises, voice, pronunciation, interview simulation
- Accounts, cloud sync, teacher assignments, communities, other languages
- Retention over time, verb aspect and sentence construction (shown as
  "not yet assessed")

## Known limitations

- **The Polish content has not been reviewed by a native speaker or teacher.**
  It uses regular textbook patterns only and every exercise carries
  `reviewStatus: 'needs-native-review'`. Have it checked before putting it in
  front of learners; the tables for genitive singular (-u/-a) and genitive
  plural are explicitly simplified.
- Unanticipated wrong answers get the general explanation for that slot, not a
  specific diagnosis.
- Missing diacritics prompt the learner to correct them without recording an
  error, unless the result is a real different form (`kultura` for `kulturą`).
- Repeating a practice set shows the same questions again.
- Scores are counts of first attempts with prototype thresholds. They are not
  validated measures of proficiency. Plan hour figures are planning
  assumptions (`src/learner/plan.ts`).
- Data lives in one browser. There is no analytics or event export, so
  observing test users needs screen-sharing or a session-recording tool.

## Architecture

```
src/
  domain/types.ts        Shared types: exercises, annotations, learner events
  content/polish/        Language pack: exercises, concepts and tables,
                         error categories with remediation, the lesson
  content/index.ts       Language-pack registry
  grading/grade.ts       Pure grading functions (text, selection, choice)
  learner/state.ts       Learner model: append-only attempt log and reducers
  learner/storage.ts     LearnerStore interface and localStorage adapter
  learner/analytics.ts   Scoring, error summaries, recommendation, tutor briefing
  learner/plan.ts        Learning-plan assumptions and calculation
  services/teachingService.ts   The seam for a future AI teaching service
  ui/                    Exercise components, context, router
  pages/                 Screens
tests/                   Vitest suites
```

Extension points:

- **AI teaching service:** implement `TeachingService` (for example
  `reviewExplanation`) against a Netlify Function so that no key reaches the
  browser, and swap the exported instance.
- **Database and authentication:** implement `LearnerStore` against an API and
  pass it to `LearnerProvider`. The state is a versioned event log, so it can
  be synced or migrated.
- **More languages or content:** add a `LanguagePack`. Exercises are plain
  data; teacher-authored or generated items use the same types.
- **Branding:** change `src/brand.ts` (and the fallback `<title>` in
  `index.html`).
