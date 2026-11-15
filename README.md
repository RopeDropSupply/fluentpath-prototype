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
npm test           # grading, diagnosis, dataset, progress and persistence tests
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

## Demo route (about seven minutes)

1. Click **Load the demo profile**.
2. **Grammar lab → Instrumental, masculine singular** (`#/lab/fi-1`). Type
   `nowego` and `dyrektora`, then **Check answer**. The lab names a *suspected*
   issue and asks what you were thinking.
3. Choose **"I thought z takes the genitive"** and continue. Read the tailored
   explanation, do the three questions (the last is flagged as an unfamiliar
   sentence), then return to the original sentence and answer `nowym dyrektorem`.
4. Repeat step 2 after **Progress → Reset**, but choose **"I used the form for
   an object"**. The explanation and the practice questions are different.
5. **Accusative, masculine animate** (`#/lab/fi-4`). Type `dobry` and `lekarz`,
   choose **"It was a slip"**, and answer the single confirmation sentence
   wrongly (`dobry szef`) to see a claimed slip not being taken on trust.
6. **Lesson → Write a short work email.** Name the case each governing word
   requires, then type the forms.
7. Open **Progress** (the evidence ladder under each error), refresh to confirm
   it persists, then open **Tutor briefing**.

## What is genuinely functional

- Onboarding and a learning plan computed from level, target, deadline and hours
- Click-to-inspect sentences with token-level grammatical annotation
- Case identification with multi-word selection (5 sentences, 8 tasks)
- Typed noun and adjective forms with deterministic grading (10 core exercises)
- Suspected issues: anticipated wrong forms map to one of 11 error categories,
  presented as a guess rather than a diagnosis
- Diagnostic probes for two misconceptions (wrong case after *z*; masculine
  animacy, in both directions): the learner states which rule they applied, and
  that choice selects one of 11 prepared pathways, each ending in an unfamiliar
  transfer sentence. The mapping is a fixed lookup in
  `src/content/polish/diagnostics.ts`.
- Targeted practice: 10 categories each have their own 2–3 follow-up questions
  on new words, genders or contexts
- "How do you know?" reasoning questions graded through structured options
- A contextual lesson (renewable energy) with vocabulary recall, grammar in
  context, a model interview answer, and a work-email task that asks for the
  governing word's case before the forms are typed
- Progress that separates first attempts, remediation, transfer to unfamiliar
  sentences, and retention (not yet assessed), with an evidence trail per error
- Grammar reference rules labelled reliable, conditional, or learn word by word
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
  front of learners. Statements I could not settle are flagged in the app and
  listed under "Content for teacher review" below.
- Unanticipated wrong answers get the general explanation for that slot, not a
  specific diagnosis.
- The learner's stated reasoning is a choice from a prepared list and is
  recorded unverified. Learners do not always know why they erred, may pick the
  most flattering option, and may hold a belief that is not listed.
- Only two misconceptions (three probes, on `fi-1`, `fi-9`, `fi-4`, `fi-5`) have
  the probe step. Other errors keep the default explanation and practice.
- "Transfer" means one unfamiliar sentence minutes after practice, or a lesson
  task. It is weak evidence of transfer and none of retention.
- Missing diacritics prompt the learner to correct them without recording an
  error, unless the result is a real different form (`kultura` for `kulturą`).
- Repeating a practice set shows the same questions again.
- Scores are counts of first attempts with prototype thresholds. They are not
  validated measures of proficiency. Plan hour figures are planning
  assumptions (`src/learner/plan.ts`).
- Data lives in one browser. There is no analytics or event export, so
  observing test users needs screen-sharing or a session-recording tool.

## Content for teacher review

All Polish content keeps `reviewStatus: 'needs-native-review'`. Specific open
points, also flagged in the in-app grammar reference:

- **Inanimate nouns treated as animate in the accusative** (*grać w tenisa,
  palić papierosa, mieć pecha*): which examples to teach as standard and which
  as colloquial.
- **Genitive singular -u versus -a** for masculine nouns naming things: the
  stated tendencies and examples, and how much of this to present at A2.
- **Genitive plural table:** deliberately simplified; confirm it does not
  mislead.
- **Diagnostic probe options:** whether the listed beliefs are the ones real
  learners hold, and whether any common one is missing.
- **Email task:** register and naturalness of the model message.
- **Vocabulary key:** *zebranie* is now accepted alongside *spotkanie* for
  "meeting"; other valid synonyms may be missing.

Changes made in this iteration without flagging were corrections of
overgeneralised wording (for example "-a in the accusative only for people and
animals", "feminine nouns in -a take -e in the locative", "*być* + noun takes
the instrumental" without the *To jest…* exception), not changes to any answer
key.

## Architecture

```
src/
  domain/types.ts        Shared types: exercises, annotations, learner events
  content/polish/        Language pack: exercises, concepts and tables,
                         error categories with remediation, diagnostic
                         probes and pathways, the lesson
  content/index.ts       Language-pack registry
  grading/grade.ts       Pure grading functions (text, selection, choice)
  learner/state.ts       Learner model: append-only attempt log and reducers
  learner/storage.ts     LearnerStore interface and localStorage adapter
  learner/analytics.ts   Scoring, error summaries, recommendation, tutor briefing
  learner/plan.ts        Learning-plan assumptions and calculation
  services/teachingService.ts   The seam for a future AI teaching service
  ui/                    Exercise components (Diagnosis.tsx holds the probe
                         and case-plan steps), context, router
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
