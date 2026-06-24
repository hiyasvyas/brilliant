# Brilliant Algebra

**Subject: Algebra I — graph transformations & coordinate translations.**

A mobile-friendly, learn-by-doing web app that teaches 9th-grade Algebra I through
**interactive graph manipulation instead of videos or lectures**. Students complete a
lesson on graph transformations and coordinate translations by dragging points, sliding
graphs, getting instant feedback, viewing hand-written explanations, and tracking progress
that persists across sessions. There are **no AI features** — the core experience stands on
its own.

## User persona

The whole app is built for **9th-grade Algebra I students who learn better visually than
through lectures**, across three flavors:

1. **Struggling student (C or below)** — memorizes formulas but doesn't connect algebra to
   graphs; gets frustrated after mistakes and needs confidence-building practice. *Success:*
   correctly solves graph-transformation problems and can explain *why* the answer is right.
2. **Average student (B's)** — knows the procedures but struggles with graph interpretation.
   *Success:* gains conceptual confidence and improves quiz/test performance.
3. **Motivated learner** — enjoys math and wants active practice beyond classwork. *Success:*
   progresses quickly and keeps a learning streak.

Everything — the draggable coordinate plane, instant feedback, retries, "Why?"/"Get Help",
streaks — is designed so a learner can get something wrong, recover from the feedback, and
build real understanding through hands-on interaction.

## What the learner can do

- **Drag a point** on a coordinate plane to a target location.
- **Move a point** a set number of units left/right/up/down.
- **Slide a graph** (segment, triangle, parabola) to perform a translation.
- **Find a translated vertex** — drag a marker to where `y = x²` lands after a slide.
- **Enter a translation `(Δx, Δy)`** and watch the shape animate into place.
- Get **instant feedback** on every answer, with a short hand-written explanation.
- Use **Check Answer**, **Why?** (reasoning without the answer), and **Get Help** (full
  step-by-step solution), with **unlimited retries**.
- See **progress persist**: leave mid-lesson, come back on any device, resume where you left
  off. Completing a lesson updates **XP, a daily streak, and the course path**, then
  recommends the next lesson.

## Tech stack

- **Frontend:** React + TypeScript + Vite
- **Auth & data:** Firebase Authentication (email/password + Google) and Cloud Firestore
  (`users`, per-user `progress` subcollection)
- **Hosting:** Firebase Hosting
- **Tooling:** ESLint; lesson content authored as typed data in code (no seeding/CMS)

## Project structure

```
src/
  content/lessons/      # Lessons authored as typed step data (translations.ts, …)
  components/lesson/    # LessonEngine + interactive problem renderers
  components/graph/     # Coordinate plane, draggable points, animated transforms
  pages/                # Home (course map), Lesson, Login, Settings
  context/AuthContext   # Firebase auth + profile
  services/             # Firestore progress / mastery / streaks
  lib/                  # graph math, XP, streak logic
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
npm run deploy     # build, then deploy hosting + Firestore rules
```

## Phase 1 MVP checklist

- [x] One subject, built end-to-end for a specific persona (9th-grade Algebra I)
- [x] One interactive lesson teaching a real concept (translations & graph transformations)
- [x] Direct manipulation: drag points, drag a vertex, slide graphs, enter `(Δx, Δy)`
- [x] Interactive visual that responds in real time (animated coordinate plane)
- [x] Instant, specific, hand-written feedback (no AI)
- [x] Progress persists and resumes across sessions/devices
- [x] Accounts and names (Firebase Auth)
- [x] Works on mobile screen sizes
- [x] Deployed and public (Firebase Hosting)
