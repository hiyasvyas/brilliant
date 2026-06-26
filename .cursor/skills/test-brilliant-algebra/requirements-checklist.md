# Requirement Traceability

Map every "Build Brilliant" requirement to the code that implements it and the
test that proves it. For each row, record **Pass / Partial / Fail** with
`file:line` evidence. Verify by reading the cited file — never from memory.

## Phase 1 — MVP (hard gate)

| # | Requirement | Where it lives | How to verify |
|---|-------------|----------------|---------------|
| 1 | Chosen subject stated clearly | `README.md` title + intro ("Brilliant Algebra", Algebra I) | README states subject up front |
| 2 | Built for a specific user persona | `README.md` "User persona" (3 flavors of 9th-grade Algebra I learner) | Persona section present and design references it |
| 3 | ≥1 interactive lesson on a real concept | `src/content/lessons/*.ts`, assembled in `src/content/lessons/index.ts` | `allLessons` has ≥1 lesson with interactive `steps` |
| 4 | A directly-manipulated problem (drag/tap/slider/plot/reorder) | `move-point`, `drag-shape`, `translate-by`, `slope-discovery`, `balance-scale`, `number-line`, `line-builder`, `reflect-shape`, `rotate-shape` in `LessonEngine.tsx` | At least one such step renders and grades on interaction |
| 5 | A visual element that responds in real time | `src/components/graph/CoordinatePlane.tsx` (draggable points/shapes, animated transforms) | Dragging updates the graph live |
| 6 | Instant, specific, hand-written feedback (right & wrong) | `ActionBar` + `WhyExplanation`/`HelpHint`/`SignErrorNote` in `LessonUI.tsx`; per-step `why`/`hint` strings in lesson data | Correct → success banner + insight; wrong → explanation/hint, all authored strings |
| 7 | Progress persists; resume where you left off | `saveLessonProgress`/`getLessonProgress` in `services/progressService.ts`; `LessonEngine` persists `stepIndex`+`stepResults` on every step | Leave mid-lesson, reload, resume at same step |
| 8 | Accounts and names (auth) | `context/AuthContext.tsx`, `pages/LoginPage.tsx`; Firebase Auth (email/password + Google) | Sign up/in works; display name stored on profile |
| 9 | Works on mobile screen sizes | responsive CSS (`LessonUI.css`, `App.css`) | Renders/usable at phone widths with touch |
| 10 | Deployed and public | `firebase.json`, `.github/workflows/deploy.yml`; live URL in `README.md` | Public URL loads the app |
| 11 | **No AI in the MVP path** | AI isolated in `services/aiHint.ts`, gated by `isAiHintAvailable()` | With AI off, lessons still teach & grade |

### MVP architecture expectations

| Requirement | Where it lives |
|-------------|----------------|
| Content model = sequence of typed interactive steps (not HTML blob) | `src/types/lesson.ts` (`LessonStep` union, `Lesson`) |
| Frontend renders steps, captures interaction, gives instant feedback | `src/components/lesson/LessonEngine.tsx` |
| Progress + mastery layer (what's done, what's next) | `src/lib/mastery.ts`, `src/content/path.ts`, `progressService.ts` |
| Persistence across sessions/devices | Cloud Firestore via `progressService.ts`; rules in `firebase/firestore.rules` |

### Course path, mastery & habit loop (Phase 1)

| Requirement | Where it lives | How to verify |
|-------------|----------------|---------------|
| Lessons grouped into a course with a clear path | `src/content/path.ts` (`LESSON_PATH`), Home learning path in `pages/HomePage.tsx` | Path renders; next lesson unlocks after completion |
| Track mastery; unlock/recommend next | `computeOutcome` (mastery/support) → `getNextOnPath`/`resolvePath` | Outcome drives which lesson is recommended next |
| Remember where they stopped | `getLessonProgress` restores `stepIndex` | Resume mid-lesson |
| Repeated wrongs surface review/easier step | `LessonEngine.tsx`: every-3-struggle `ReviewInterlude`, `STUCK_THRESHOLD` answer-reveal `StuckRescue`, authored `remediation` | Miss the same type repeatedly → review/remediation appears |
| Streaks, milestones, daily progress | `src/lib/streak.ts`, `components/streak/StreakCard.tsx`, `components/stats/StatBar.tsx` (XP/level/streak) | Completing a lesson updates streak + XP + weekly grid |
| Finishing a lesson feels satisfying | `components/lesson/LessonCompleteScreen.tsx` (XP gained, level, discovery) | Completion screen shows rewards + next step |

## Phase 2 — AI features (additive)

| Requirement | Where it lives | How to verify |
|-------------|----------------|---------------|
| AI feature chosen & justified | `docs/phase2-ai-brainlift.md` | Document lists chosen/skipped features |
| Targeted hint when stuck (without the answer) | `services/aiHint.ts` `fetchTargetedHint`; escalating ladder in `LessonEngine.tsx` | Hint nudges, never reveals answer |
| Grounded in structured step state, not raw text | `HintContext.step` + `computeGroundTruth(step)` feeds the prompt | Prompt is built from the typed step, ground-truth answer injected |
| Verified against subject logic (math engine) | `verifyHintIsSafe` + `leaksAnswer` guard reject bad hints | Answer-leaking or false-equation hints are rejected |
| MVP keeps working with AI off | `isAiHintAvailable()` false → static `hint` fallback; `fetchTargetedHint` throws → caller falls back | Disable Firebase config; hints fall back, app unaffected |

**Critical Phase 2 invariant:** the AI can never present wrong math or the
answer. This is enforced twice — grounding (`computeGroundTruth`) and
verification (`verifyHintIsSafe`). Both must be unit-tested (see
[unit-tests.md](unit-tests.md)).

## Phase 3 — Learning science

| Principle | Implementation | Where |
|-----------|----------------|-------|
| Retrieval practice | Recall-style problems (plot/drag/solve) over passive review; `lessonCheck` requires producing answers | lesson data + `LessonCheckEngine.tsx` |
| Spaced / resurfacing | Wrong types resurface as fresh variants and review interludes; remediation re-teaches before retry | `makeSimilarStep`, `ReviewInterlude`, `remediation` in `LessonEngine.tsx` |
| Interleaving | Lessons mix step types within a session (drag, input, MC, balance, etc.) | per-lesson `steps` arrays |
| Mastery learning | `computeOutcome` requires ≥80% clean-solve AND ≤3 struggles before "mastery"; gates the path | `src/lib/mastery.ts`, `src/content/path.ts` |
| Scaffolding + desirable difficulty | Escalating hint ladder (static → guiding/AI → live directional), faded over attempts; fresh variants raise difficulty vs. repeating | `hintLevel`/`maxHintLevel`, `guidingFallback`, `LiveDirectionHint` |
| Immediate explanatory feedback | Per-answer `why`/`insight`, sign-error diagnosis, coordinate-change table | `LessonUI.tsx`, `lib/translationFeedback.ts` |
| Adaptive variants (not identical repeats) | Wrong answer serves a same-skill, fresh-number variant | `makeSimilarStep`, step `variants` |

Confirm each principle is **real**, not a label: trigger the behavior in the app
and cite the code path.

## Submission requirements

| Requirement | Where to check |
|-------------|----------------|
| GitHub repo with subject up front, setup guide, architecture overview, deployed link | `README.md` (subject, "Getting started", "Project structure", live URL) |
| Brainlift (1 page) | `docs/phase2-ai-brainlift.md` (and any Phase 3 notes) |
| Deployed, public, auth, mobile, multi-learner, teaches with AI off | live URL + Step 5 checks in `SKILL.md` |
| Deploy target (Vercel / Firebase Hosting / Render) | Firebase Hosting via `firebase.json` + GitHub Actions |

## Performance targets (verify on the deployed app)

| Target | Method |
|--------|--------|
| Feedback < 100ms | Grading is synchronous (`check()` closures, no network) — banner on same tap |
| 60 FPS visuals | DevTools Performance while dragging / during `translate-by` rAF animation |
| < 2s to first interaction | Lighthouse/Network timing on cold load of deployed URL |
| Touch on mobile | Manual on phone-sized viewport (drag, tap, palette) |
| Concurrent learners, no slowdown | Two accounts in parallel; per-user Firestore docs isolate state |
