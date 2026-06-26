---
name: test-brilliant-algebra
description: >-
  Test the Brilliant Algebra learn-by-doing app for correctness and verify it
  meets the "Build Brilliant" requirements (Phase 1 MVP, Phase 2 AI, Phase 3
  learning science, performance, and submission gates). Use when asked to test
  the app, verify features, check requirement compliance, write or run unit
  tests for the math/mastery/XP/streak/path logic, or run the end-to-end lesson
  scenarios the graders use.
---

# Testing Brilliant Algebra

This skill verifies that the **Brilliant Algebra** app (React 19 + TypeScript +
Vite + Firebase) is correct and that it satisfies every requirement in the
"Build Brilliant" brief. It pairs **automated unit tests** of the pure logic
with **end-to-end scenarios** that mirror exactly how graders test the app.

Subject under test: a learn-by-doing **Algebra I** course taught through
draggable graphs, balance scales, number lines, and instant hand-written
feedback. The MVP must teach with **AI turned off**; AI is an additive Phase 2
layer.

## How to use this skill

Run these layers in order and stop at the first hard failure:

```
Test Progress:
- [ ] Step 1: Build & lint gate (must pass before anything else)
- [ ] Step 2: Unit tests for pure logic (see unit-tests.md)
- [ ] Step 3: Requirement traceability audit (see requirements-checklist.md)
- [ ] Step 4: End-to-end lesson scenarios (see e2e-scenarios.md)
- [ ] Step 5: Performance, mobile, AI-off, and deployment checks
- [ ] Step 6: Report findings (use the report template below)
```

Always read the linked reference file for the layer you are running. Keep the
findings report current as you go.

## Step 1: Build & lint gate

A broken build or type error fails everything downstream. Run first:

```bash
npm install
npm run build   # tsc -b && vite build — type-checks the whole app
npm run lint
```

- `npm run build` must exit 0 with no TypeScript errors. The lesson content is
  authored as typed data, so a type error usually means malformed lesson steps.
- Treat any new lint error introduced by changes as a failure.

If the build fails, stop and report the exact errors. Do not proceed.

## Step 2: Unit tests for pure logic

The correctness-critical logic is **pure and deterministic** and must be unit
tested. There is no test runner wired up yet, so the first run sets up Vitest.
Follow [unit-tests.md](unit-tests.md) for the full setup and case list. Targets:

- `src/lib/mathEngine.ts` — `computeGroundTruth` (ground-truth answers) and
  `verifyHintIsSafe` (must reject answer-leaks and false equations). This is the
  Phase 2 "AI never gives wrong math" guarantee.
- `src/lib/transforms.ts` — `reflectPoints`, `rotatePoints`.
- `src/lib/mastery.ts` — `computeOutcome` (mastery vs. support; the path's
  decision input).
- `src/lib/xp.ts` — `checkTextAnswer`, `normalizeCheckAnswer`, `levelForXp`,
  `resetWeeklyXpIfNeeded`.
- `src/lib/streak.ts` — `applyLessonCompletion` (streak increment, streak-saver
  spend, weekly grid), `getWeekStartMonday`, `daysBetween`.
- `src/content/path.ts` — `resolvePath`, `getNextOnPath` (adaptive next-step).

These functions encode the brief's hard rules (instant correct/incorrect
grading, mastery gating, adaptive path, streak persistence). A red unit test
here is a real product bug.

## Step 3: Requirement traceability audit

Walk every requirement in the brief and confirm it is implemented, citing the
file that satisfies it. Use the full mapping in
[requirements-checklist.md](requirements-checklist.md). The hard gates:

- **Phase 1 MVP** — chosen subject + persona stated, ≥1 interactive lesson, a
  direct-manipulation problem, a responsive visual, instant hand-written
  feedback on right/wrong, persistent progress, auth + names, mobile, deployed.
- **No-AI rule** — the MVP must teach fully with AI disabled.
- **Phase 2 AI** — features grounded in structured step state, verified against
  the math engine, and skippable (app works with AI off).
- **Phase 3 learning science** — retrieval practice, spaced/adaptive review,
  interleaving, mastery gating, scaffolding/fading hints, explanatory feedback.

Mark each item Pass / Fail / Partial with the file:line evidence.

## Step 4: End-to-end lesson scenarios

Run the five grader scenarios against `npm run dev` (local) and the deployed
URL. Full step-by-step scripts are in [e2e-scenarios.md](e2e-scenarios.md):

1. Complete one lesson end to end, get problems wrong, recover via feedback.
2. Manipulate the interactive element and watch the visual respond live.
3. Leave mid-lesson, return, and confirm progress + streak persisted.
4. Finish a lesson and confirm the path recommends a sensible next step.
5. Do all of the above on a phone-sized screen with touch input.

## Step 5: Performance, mobile, AI-off, deployment

- **Instant feedback (<100ms):** answer grading is synchronous in-app (`check()`
  closures in `LessonEngine.tsx`, no network). Confirm the correct/wrong banner
  appears on the same tap, with no spinner.
- **60 FPS visuals:** dragging points/shapes and the `translate-by` animation
  must stay smooth. The animation uses a `requestAnimationFrame` loop that
  mutates the SVG transform directly (no per-frame React re-render) — confirm
  via DevTools Performance while dragging.
- **<2s to first interaction:** measure load-to-interactive on the deployed app.
- **Mobile + touch:** verify drag, tap, and number-palette input work with touch
  at common phone widths (e.g. 390×844).
- **Multiple concurrent learners:** per-user Firestore docs (`users/{uid}` and
  `users/{uid}/progress/{lessonId}`) isolate state; spot-check two accounts in
  parallel sessions.
- **AI off still teaches:** unset the Firebase web config (or block the AI call)
  and confirm lessons, grading, hints (hand-written fallback), and progress all
  still work. `isAiHintAvailable()` should be false and hints fall back to the
  static `hint` text.

## Step 6: Findings report

Report results with this template:

```markdown
# Brilliant Algebra — Test Report

## Summary
<pass/fail per layer; overall verdict>

## Step 1 — Build & lint
<result>

## Step 2 — Unit tests
<pass/fail counts; any red tests with the failing case>

## Step 3 — Requirement traceability
| Requirement | Status | Evidence (file:line) |
|-------------|--------|----------------------|
| ...         | Pass   | ...                  |

## Step 4 — E2E scenarios
<per-scenario pass/fail + notes>

## Step 5 — Performance / mobile / AI-off / deploy
<measurements + observations>

## Bugs found
- 🔴 Critical: <blocks a requirement>
- 🟡 Major: <degrades experience>
- 🟢 Minor: <polish>

## Recommendation
<ship / fix-then-ship, with the must-fix list>
```

## Conventions while testing

- **Never weaken a test to make it pass.** A failing correctness test is a bug
  report, not something to silence.
- **Ground every requirement claim in code** — cite the file and line, don't
  assert from memory.
- Prefer fixing real bugs you find with the smallest change; flag anything that
  changes scope before doing it.
- Keep the MVP/no-AI separation intact: AI code paths must remain optional.

## Reference files

- [requirements-checklist.md](requirements-checklist.md) — full requirement →
  implementation → test mapping for Phases 1–3, performance, and submission.
- [unit-tests.md](unit-tests.md) — Vitest setup and the exact pure-logic cases
  to cover, with expected values derived from the real code.
- [e2e-scenarios.md](e2e-scenarios.md) — step-by-step scripts for the five
  grader scenarios plus the AI-off and mobile passes.
