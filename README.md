# Brilliant Algebra

**A learn-by-doing Algebra I course — taught through interactive graphs, not videos.**

A mobile-friendly web app that teaches 9th-grade Algebra I by **direct manipulation
instead of lectures**. Students work through a path of lessons by dragging points, sliding
shapes, balancing scales, building lines, and answering questions — getting instant,
hand-written feedback and tracking progress that persists across sessions and devices.
There are **no AI features**; the interactive content stands on its own.

Live app: **https://brilliant-algebra.web.app**

## User persona

The whole app is built for **9th-grade Algebra I students who learn better visually than
through lectures**, across three flavors:

1. **Struggling student (C or below)** — memorizes formulas but doesn't connect algebra to
   graphs; gets frustrated after mistakes and needs confidence-building practice. *Success:*
   correctly solves problems and can explain *why* the answer is right.
2. **Average student (B's)** — knows the procedures but struggles with graph interpretation.
   *Success:* gains conceptual confidence and improves quiz/test performance.
3. **Motivated learner** — enjoys math and wants active practice beyond classwork. *Success:*
   progresses through the path quickly and keeps a learning streak.

Everything — draggable graphs, instant feedback, adaptive retries, "Why?"/"Get Help",
XP and streaks — is designed so a learner can get something wrong, recover from the
feedback, and build real understanding through hands-on interaction.

## The course

Lessons are laid out as an adventure-style **Learning Path**. Each one lives in a themed
region, unlocks after the previous lesson is completed, and can be replayed for review or
practice afterward:

| # | Lesson | Region |
|---|--------|--------|
| 1 | Translations: How Things Slide | Graph City |
| 2 | Linear Equations & Graphs | Linear Mountain |
| 3 | Functions: Notation, Domain & Range | Function Kingdom |
| 4 | Systems of Equations | System Caves |
| 5 | Quadratic Equations & Parabolas | Parabola Peaks |
| 6 | Polynomials | Polynomial Forest |
| 7 | Exponential Models | Exponential Heights |

Each lesson is a sequence of interactive steps, followed by a **lesson check** (a short quiz
that must be passed to complete the lesson), plus a separate **practice mode** with extra
problems.

## How a lesson works

- **Interactive step types**, mixed per lesson: drag a point, move a point a set number of
  units, slide/drag a whole shape, enter a translation `(Δx, Δy)`, find a translated vertex,
  balance a scale to solve `ax + b = c`, move along a number line, discover slope by dragging
  a line, build a line from slope & intercept, run a function machine, plus multiple-choice,
  number-input, "predict first", and concept screens with live graphs.
- **Instant feedback** on every answer, with a short hand-written explanation.
- **Check Answer**, **Why?** (reasoning without giving away the answer), **Get Help / hints**
  (step-by-step), and **unlimited retries**.
- **Adaptive practice:** a wrong answer serves a *fresh variant* of the same skill (new
  numbers) rather than the identical question. After several misses of the same type, a
  deeper **remediation** lesson re-teaches the concept before the learner retries.
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
- **Hosting:** Firebase Hosting
- **CI/CD:** GitHub Actions builds and deploys to Firebase Hosting on every push to `main`
- **Tooling:** ESLint; lesson content authored as typed data in code (no seeding/CMS)

## Project structure

```
src/
  content/lessons/      # Each lesson authored as typed step data (one file per lesson)
  components/lesson/    # LessonEngine, lesson-check engines, complete screen, lesson UI
  components/graph/     # CoordinatePlane — draggable points, lines, shapes, animated transforms
  components/stats/     # StatBar (XP / level / streak HUD)
  components/streak/    # StreakCard (weekly streak + savers)
  pages/                # Home (learning path), Lesson, Login, Settings
  context/AuthContext   # Firebase auth + user profile
  services/             # Firestore progress + lesson-completion rewards
  lib/                  # graph math, XP/levels, streak logic, Firebase init
  types/                # Lesson / step / progress / profile types
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