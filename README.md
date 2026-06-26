# Brilliant Geometry

**Subject: Coordinate Geometry — graph transformations, taught by direct manipulation, not videos.**

A mobile-friendly web app that teaches **coordinate-geometry transformations** (translations,
reflections, rotations, and reading the coordinate plane) by **direct manipulation instead of
lectures**. Students work through an adaptive path of lessons by dragging points, sliding and
flipping shapes, spinning figures around the origin, plotting on a grid, and answering
questions — getting instant, hand-written feedback and tracking progress that persists across
sessions and devices.

The hand-built interactive content stands entirely on its own (Phase 1). A small, optional
layer of **AI** was added on top in Phase 2 (a grounded, verified "smart hint") — and the app
works **fully with AI turned off**. See [`docs/phase2-ai-brainlift.md`](docs/phase2-ai-brainlift.md).

Live app: **https://brilliant-algebra.web.app**

## User persona

The whole app is built for **middle/early-high-school students (≈grades 8–9) learning
coordinate geometry who understand things better visually than through lectures**, across
three flavors:

1. **Struggling student (C or below)** — can recite a rule like "reflect across the x-axis"
   but doesn't connect it to what actually happens on the grid; gets frustrated after mistakes
   and needs confidence-building practice. *Success:* correctly transforms figures and can
   explain *why* the image lands where it does.
2. **Average student (B's)** — knows the procedures but struggles to read and interpret the
   coordinate plane. *Success:* gains conceptual confidence and improves quiz/test performance.
3. **Motivated learner** — enjoys math and wants active practice beyond classwork. *Success:*
   progresses through the path quickly and keeps a learning streak.

Everything — draggable graphs, instant feedback, adaptive retries, "Why?"/"Get Help",
XP and streaks — is designed so a learner can get something wrong, recover from the
feedback, and build real understanding through hands-on interaction.

## The course

Lessons are laid out as an adventure-style **Learning Path**. Each one lives in a themed
region and can be replayed for review or practice after completion. The path is **adaptive**:
instead of a fixed order, the next lesson is chosen by whether the learner **passes** a
lesson (advance) or needs **support** (a gentler branch):

```
Translations ─pass▶ Reflections ─pass▶ Rotations
     │                   └support▶ Coordinate Plane (all four quadrants)
     └support▶ Number Line ─pass▶ Translations, Level 2
                            └support▶ Coordinate Plane: First Steps
```

| Lesson | Region | Role |
|--------|--------|------|
| Translations: How Things Slide | Graph City | Start |
| Reflections: Flip Across Axes | Mirror Marsh | Pass → advance |
| Rotations: Turn Around the Origin | Spin City | Pass branch |
| Coordinate Plane: All Four Quadrants | Quadrant Quarry | Support branch |
| Number Line: Coordinates & Direction | Number Line Outpost | Support branch |
| Translations, Level 2: New Challenges | Graph City | Support→pass branch |
| Coordinate Plane: First Steps | Quadrant Quarry | Support→support branch |

Each lesson is a sequence of interactive steps, followed by a **lesson check** (a short quiz
whose score decides pass vs. support), plus a separate **practice mode** with extra problems.

## How a lesson works

- **Interactive step types**, mixed per lesson: drag a point onto its image, move a point a
  set number of units, slide/drag a whole shape onto a target, enter a translation `(Δx, Δy)`
  from a number palette, **reflect** a figure across an axis, **rotate** a figure about the
  origin, plot points and move along a number line, plus multiple-choice, number-input,
  "predict first", and concept screens with live, responsive graphs.
- **Instant feedback** on every answer, with a short hand-written explanation.
- **Check Answer**, **Why?** (reasoning without giving away the answer), an **escalating hint
  ladder** (hand-written → grounded AI "smart hint" → live directional guidance while
  dragging), and **unlimited retries**.
- **Adaptive practice:** a wrong answer serves a *fresh variant* of the same skill (new
  numbers) rather than the identical question. After several misses of the same type, a
  deeper **remediation** / answer-reveal walkthrough re-teaches the concept before the
  learner retries on a fresh question to prove mastery.
- **Insights** turn correct answers into teaching moments ("notice that…").

## Progress, XP & streaks

- **Progress persists:** leave mid-lesson and resume on any device exactly where you left off.
- **XP & levels:** earn XP for correct first-try answers plus a lesson-completion bonus;
  leaving a lesson early costs XP. XP rolls up into levels and a weekly tally.
- **Daily streak** with **streak savers** that are earned by leveling up and auto-applied to
  cover a missed day, plus a weekly completion row.
- Completing a lesson updates XP, the streak, the learning path, and points to the next lesson.

## Tech stack

- **Frontend:** React 19 + TypeScript + Vite, React Router
- **Auth & data:** Firebase Authentication (email/password + Google) and Cloud Firestore
  (per-user progress + profile)
- **AI (Phase 2, optional):** Firebase AI Logic (Gemini) for the on-demand smart hint,
  grounded and verified with **math.js**; the app runs fully with AI disabled
- **Hosting:** Firebase Hosting
- **CI/CD:** GitHub Actions builds and deploys to Firebase Hosting on every push to `main`
- **Tooling:** ESLint; `npm test` runs a standalone correctness suite for the core logic
  (transforms, math grounding/verification, mastery, path, XP, streaks); lesson content
  authored as typed data in code (no seeding/CMS)

## Project structure

```
src/
  content/lessons/      # Each lesson authored as typed step data (one file per lesson)
  content/path.ts       # The adaptive pass/support path between lessons
  components/lesson/    # LessonEngine, lesson-check engines, complete screen, lesson UI
  components/graph/     # CoordinatePlane — draggable points, lines, shapes, animated transforms
  components/stats/     # StatBar (XP / level / streak HUD)
  components/streak/    # StreakCard (weekly streak + savers)
  pages/                # Home (learning path), Lesson, Login, Settings
  context/AuthContext   # Firebase auth + user profile
  services/             # Firestore progress + rewards; aiHint (Phase 2 Gemini client)
  lib/                  # graph math, transforms, mathEngine (grounding/verify),
                        #   mastery, XP/levels, streak logic, Firebase init
  types/                # Lesson / step / progress / profile types
scripts/test-core.ts    # Standalone correctness suite (npm test)
```

## Getting started

Prerequisites: Node `>=20 <25`.

```bash
npm install
```

Create a `.env` with your Firebase web config (see `.env.example`):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

Then in the Firebase Console, enable **Authentication → Sign-in method → Google** (and
Email/Password).

```bash
npm run dev        # start the dev server (http://localhost:5173)
npm run build      # type-check + production build to dist/
npm run deploy     # build, then deploy hosting + Firestore rules (local)
```

Pushing to `main` also builds and deploys automatically via GitHub Actions
(`.github/workflows/deploy.yml`).