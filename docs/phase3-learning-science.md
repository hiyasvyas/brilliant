# Phase 3 Brainlift — Learning Science in Brilliant Geometry

Phase 3 layers evidence-based learning techniques on top of the working app. The
subject is **coordinate-geometry transformations**, so the techniques were chosen
for how well they fit *spatial, rule-based* skills — not as buzzwords.

## Principles chosen (and why these fit the subject)

### 1. Mastery learning — advance only when the concept is mastered, with a clear signal

Transformations are strictly cumulative: you cannot reason about rotations if you
can't yet read a coordinate or flip across an axis. So the path **gates on
mastery** rather than letting everyone march in a fixed line.

- **Mastery signal.** Each lesson ends with a check; the score decides
  `mastery` (≥ 80% correct) vs `support`. This is computed deterministically
  (`lib/mastery.ts`, `MASTERY_RATIO`).
- **Gating.** The next lesson is chosen by that signal (`content/path.ts`):
  pass advances to the harder concept (e.g. Reflections → Rotations); falling
  short routes to a **supporting** lesson instead (Reflections → Coordinate
  Plane), so the advanced concept stays locked until its prerequisite is solid.
- **The signal is now visible** (Phase 3 change). Previously the outcome was
  stored but never shown, so a *non-mastered* lesson looked identical to a
  mastered one. Now:
  - the completion screen shows a **🏆 "Concept mastered"** banner or a
    **🌱 "Not quite mastered — routed to a supporting lesson, replay anytime"**
    banner;
  - the home screen tags each finished lesson with a **Mastered / Reviewed**
    pill, so the learner always knows what they've truly mastered.

### 2. Scaffolding & desirable difficulty — start supported, then fade

A good transformation problem should be hard enough to force recall, but never
leave a learner stranded. The app provides support that **fades in only as
needed**, and keeps the final step effortful:

- **Predict-before-you-move** gate: the learner commits to an outcome *before*
  manipulating, turning the interaction into a hypothesis test (`PredictionGate`).
- **Escalating hint ladder** (`LessonEngine` + `LessonUI`): nothing is shown up
  front. A wrong attempt unlocks level 1 (hand-written hint), then level 2 (a
  grounded AI / deterministic guiding hint), then level 3 (live directional
  guidance *while dragging*). Support escalates with need and disappears when not.
- **Desirable difficulty on recovery:** after the answer-reveal rescue, the
  learner must solve a **freshly generated** problem of the same type (new
  numbers) to prove mastery — recall, not recognition (`makeSimilarStep`).
- **Fading targets:** later problems hide the dashed target outline
  (`showTarget: false`), removing a visual crutch as competence grows.

### 3. Immediate, explanatory feedback — make wrong answers teach

Phase 1 already gave instant, hand-written feedback. Phase 3 **sharpened it for
the subject's core problems** — reflections and rotations — which previously only
showed a generic "Not quite."

- **Misconception-specific diagnosis** (`lib/transformFeedback.ts`):
  - Reflection: "Across the **y-axis** a shape flips left to right, but the
    dashed image is flipped top to bottom. Reflect across the **x-axis** — that
    negates each y."
  - Rotation: "90° is a quarter turn, but the image is a three-quarter turn away
    (270° counterclockwise). Follow one corner — each 90° swings it a quarter of
    the way around the origin."
- **Rule reinforcement on correct answers:** a correct flip/turn now shows the
  single coordinate rule applied to *every* point — `(x, y) → (x, −y)` plus each
  point mapped to its image — so the move reads as a rule, not a trick
  (`TransformRuleNote`).

## Verification (so the feedback is never wrong)

Every diagnosis and rule is **derived from the same pure transforms** used to
grade the problem (`lib/transforms.ts`), so feedback can never disagree with the
answer key. All of this is covered by the standalone suite (`npm test`,
95 assertions), including reflection/rotation diagnosis, rule strings, and
point-by-point maps.

## What was deliberately left out

- **Spaced repetition / interleaving across sessions** — valuable, but they need
  a review scheduler and cross-lesson item bank that would be half-built by the
  deadline. The adaptive *support* branches already resurface weak prerequisites,
  which is the highest-value slice of "bring it back," so a full SRS was skipped
  in favor of doing mastery + feedback well.
- **AI-driven feedback/grading** — kept deterministic. In a math subject a single
  wrong number erodes trust faster than a missing feature, so all correctness and
  diagnosis stay hand-authored/derived; AI remains the optional hint layer only.

## Files (Phase 3)

- `src/lib/transformFeedback.ts` — reflect/rotate diagnosis, rule strings, point maps.
- `src/components/lesson/LessonUI.tsx` — `TransformRuleNote`.
- `src/components/lesson/LessonEngine.tsx` — wires diagnosis + reinforcement into
  the reflect/rotate problems.
- `src/components/lesson/LessonCompleteScreen.tsx` + `LessonUI.css` — mastery banner.
- `src/pages/LessonPage.tsx` — passes the mastery outcome to the completion screen.
- `src/pages/HomePage.tsx` + `App.css` — Mastered / Reviewed pills.
- `scripts/test-core.ts` — Phase 3 feedback tests.
