# End-to-End Scenarios

These mirror exactly how the graders test the app. Run each against the local
dev server (`npm run dev`, http://localhost:5173) and again against the deployed
URL. Sign in with a real account first (email/password or Google).

Run them manually, or automate with Playwright if available. Either way, the
**pass criteria** below are what matters.

## Scenario 1 — Complete a lesson, get it wrong, recover

Goal: prove one lesson genuinely teaches, and that wrong answers help rather
than just mark you down.

1. From the Home learning path, open the first lesson (Translations).
2. Work through the steps. On at least one problem, **answer wrong on purpose**.
3. Verify the wrong answer produces:
   - an immediate "not quite" banner (no page reload, no spinner),
   - a **specific hand-written** explanation/hint (not just a red X),
   - for drag/translate problems, a sign/direction diagnosis (e.g. "you went the
     wrong way on x"),
   - the ability to **retry** the same skill.
4. Miss the **same problem type 3 times** and confirm a recovery surfaces: the
   answer-reveal `StuckRescue` (animated walkthrough) or an authored
   `remediation` lesson, followed by a fresh similar question to master.
5. Use the explanation to answer correctly. Confirm the success banner shows an
   `insight` ("notice that…") and lets you continue.
6. Finish the lesson check and reach the completion screen.

**Pass:** wrong answers always teach (explanation + retry + escalating help),
and the learner can recover and finish without ever seeing the bare answer
handed over on the first miss.

## Scenario 2 — Manipulate the interactive element, watch the visual respond

1. Open a problem with direct manipulation (e.g. `move-point`, `drag-shape`, or
   `translate-by`).
2. Drag the point/shape (or pick palette numbers for `translate-by`).
3. Confirm the graph updates **live** as you drag — the figure follows the
   pointer/touch and snaps to the grid; `translate-by` animates the slide and
   the Play button replays it.
4. For `slope-discovery`, confirm rise/run/slope readout updates as you drag.

**Pass:** the visual responds in real time to manipulation and stays smooth
(see the 60 FPS check in `SKILL.md` Step 5).

## Scenario 3 — Leave mid-lesson, return, confirm persistence

1. Start a lesson and answer the first 2–3 steps (do not finish).
2. Leave via the back arrow (or close the tab). Leaving mid-lesson is
   non-punitive — progress is saved on every step.
3. Reopen the app (ideally on a **different device/browser** to prove
   cross-device persistence via Firestore).
4. Reopen the same lesson.

**Pass:** the lesson resumes at the **same step** with prior answers intact, and
the streak/XP/weekly grid in the HUD match what was there before.

## Scenario 4 — Finish a lesson, confirm a sensible next step

1. Complete a lesson cleanly (aim for ≥80% first-try, no help) → outcome
   **mastery**; or complete it with several misses → outcome **support**.
2. On the completion screen, note the recommended next lesson.
3. Return to Home.

**Pass:** the recommended next lesson matches the adaptive path
(`src/content/path.ts`): mastery and support lead to **different** next lessons
(e.g. Translations → Reflections on mastery vs. Number line on support). The
next lesson is unlocked; un-reached lessons stay locked.

## Scenario 5 — Phone-sized screen with touch

Repeat Scenarios 1–4 at a phone viewport (e.g. 390×844) using **touch** events
(DevTools device mode or a real phone).

**Pass:** layout is usable (no overflow/clipping), dragging works with touch,
the number palette and buttons are tappable, and feedback/HUD remain readable.

## AI-off pass (no-AI MVP gate)

The MVP must teach with AI disabled.

1. Remove/blank the Firebase **AI** config (or block the model call) so
   `isAiHintAvailable()` returns false. Keep Auth + Firestore working.
2. Run Scenario 1 again.

**Pass:** lessons load, grade instantly, and give hints (the hand-written
`hint`/`guidingFallback` fallback) with **no error**; progress, streaks, and the
path all work. Nothing about the core experience depends on the AI being on.

## AI-on pass (Phase 2, when configured)

1. With Firebase configured, get a problem wrong and request a hint, then miss
   again to escalate to the **guiding** AI hint.
2. Confirm the hint nudges toward the next step and **never reveals** the answer
   or its exact numbers.
3. Sanity-check it states no false math. (The `verifyHintIsSafe` guard rejects
   leaks and false equations and falls back to the static hint — confirm a
   graceful fallback if the model is slow/unavailable, via the 8s timeout.)

**Pass:** AI hints are grounded, answer-safe, and degrade gracefully to the
hand-written hint.

## Concurrency spot-check

Open two different accounts in two browsers/profiles and progress through
lessons in parallel.

**Pass:** progress, XP, and streaks stay isolated per user (per-user Firestore
docs `users/{uid}` and `users/{uid}/progress/{lessonId}`); no cross-talk or
slowdown.

## Recording results

For each scenario record: Pass / Fail, the device/URL, and any defect with repro
steps. Roll these into the Step 4 section of the `SKILL.md` findings report.
