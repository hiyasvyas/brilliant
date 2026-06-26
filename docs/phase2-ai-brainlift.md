# Phase 2 Brainlift — Adding AI to Brilliant Algebra

This document records the Phase 2 decision: **where** we introduced AI, **why** that
spot and not others, and the **guardrails** that keep the hand-built MVP intact.

## Context

Phase 1 was a hard gate with a hard rule: **no AI**. The MVP — one deep, interactive
lesson on graph transformations and coordinate translations — stands on its own with
hand-written feedback, hands-on manipulation, persistence, streaks, and an adaptive
wrong-answer loop. Phase 2 lifts the no-AI rule, so the question is not "can we add
AI" but "where does a model earn its place without hollowing out the learning."

## The decision

We shipped **two non-AI interaction upgrades** and **one narrowly-scoped AI feature**.

### Non-AI upgrades (highest-value, hand-built)

1. **Predict-before-you-move** — before a hands-on translation, the learner commits to
   an outcome and reasoning via a quick multiple-choice prediction, then sees the idea,
   then manipulates. Strong instruction asks for a prediction first; this makes the
   subsequent interaction a test of a hypothesis instead of trial-and-error dragging.
2. **Coordinate-by-coordinate explanation** — a correct translation now shows each point
   moving by the same rule (`x ± a`, `y ± b`), so the move reads as a rule applied
   independently to each coordinate rather than a visual trick.
3. **Sign-error-specific remediation** — a wrong translation is diagnosed for the most
   common mistake: direction/sign. "You moved left, but this asks you to move right — that
   flips the sign of Δx." This is deterministic, instant, and always correct.

These are **deterministic and hand-written** because correctness feedback in a math
lesson must never be wrong, slow, or vague. A model is the wrong tool for grading.

### The AI feature: an on-demand "smarter hint"

A single, optional **targeted hint** button appears only when a learner is **stuck on a
wrong answer**. It calls **Firebase AI Logic (Gemini, `gemini-2.5-flash-lite`)** and
returns one short nudge toward the next step.

**Why a hint, and why only here:**

- Hints are the one place where freeform, context-sensitive language genuinely beats a
  fixed string — a learner can be stuck for many different reasons.
- It is **additive and escapable**: the hand-written static hint and full "Get help"
  solution are always present. AI is an enhancement, never a dependency.

## Guardrails

- **Grounded in structured state, not raw text.** The model receives the step's
  structured fields (prompt, concept/type, the hand-written hint as a style reference)
  — not scraped page text.
- **Cannot reveal the answer.** The correct answer is sent *only* so the model can avoid
  it, and every response is verified against the normalized answer; a leak is rejected
  and we fall back to the static hint.
- **Bounded output.** One or two sentences, `maxOutputTokens: 120`, low temperature.
- **Fails safe.** No Firebase config, a network error, a timeout (8s), an empty
  response, or an answer leak → the AI panel quietly disappears and the learner still
  has the hand-written hint and full solution. The app works **fully with AI off**.
- **Never grades.** AI is hints only. All correctness, XP, mastery, and the adaptive
  remediation loop remain deterministic and hand-authored.

## Where AI was deliberately NOT used

- Grading / correctness checks — must be exact and instant.
- Lesson content and explanations — hand-written, the core of the MVP.
- The adaptive remediation lessons and "why" explanations — authored per concept.
- Recommendations / path unlocks — rule-based on mastery signals.

## Files

- `src/services/aiHint.ts` — Firebase AI Logic client, prompt, timeout, answer-leak guard.
- `src/components/lesson/LessonUI.tsx` — `AiHintPanel`, `PredictionGate`,
  `CoordinateChangeTable`, `SignErrorNote`, extended `ActionBar`.
- `src/lib/translationFeedback.ts` — coordinate-change + sign-error diagnostics.
- `src/types/lesson.ts` — `PredictionPrompt` type and `prediction` step field.
