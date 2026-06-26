# Unit Tests for Pure Logic

The correctness-critical logic is pure and deterministic, so it must be covered
by fast unit tests. Use **Vitest** (Vite-native, zero extra config for a Vite
project). The expected values below are derived directly from the current code —
if a test fails, treat it as a real bug, not a test to relax.

## Setup (first run only)

```bash
npm install -D vitest
```

Add a `test` script to `package.json`:

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

Vitest reads the existing `vite.config.ts`, so no separate config is needed.
Place tests next to the code under test as `*.test.ts` (e.g.
`src/lib/mastery.test.ts`). Run with `npm test`.

## What to cover and expected values

### `src/lib/transforms.ts`

```ts
import { describe, it, expect } from 'vitest'
import { reflectPoints, rotatePoints } from './transforms'

describe('reflectPoints', () => {
  it('reflects across x-axis (negate y)', () => {
    expect(reflectPoints([[2, 3]], 'x')).toEqual([[2, -3]])
  })
  it('reflects across y-axis (negate x)', () => {
    expect(reflectPoints([[2, 3]], 'y')).toEqual([[-2, 3]])
  })
})

describe('rotatePoints (CCW about origin)', () => {
  it('90° maps (1,0) -> (0,1)', () => {
    expect(rotatePoints([[1, 0]], 90)).toEqual([[0, 1]])
  })
  it('180° maps (1,2) -> (-1,-2)', () => {
    expect(rotatePoints([[1, 2]], 180)).toEqual([[-1, -2]])
  })
  it('270° maps (1,0) -> (0,-1)', () => {
    expect(rotatePoints([[1, 0]], 270)).toEqual([[0, -1]])
  })
})
```

### `src/lib/mathEngine.ts` — ground truth (Phase 2 anchor)

`computeGroundTruth(step)` is the single source of truth fed to the AI. Cover one
case per step type that does real math:

| Step (fields) | `text` | `numbers` | `coords` |
|---------------|--------|-----------|----------|
| `balance-scale` coeff 2, constant 3, total 11 | `x = 4` | `[4]` | `[]` |
| `move-point` target `[3,-2]` | `(3, -2)` | `[3,-2]` | `[[3,-2]]` |
| `find-vertex` h 1, k -3, a 1 | `(1, -3)` | `[1,-3]` | `[[1,-3]]` |
| `translate-by` shape `[[0,0]]`, dx 2, dy -1 | `(2, -1)` | `[2,-1]` | `[[2,-1]]` |
| `translation-input` points `[[0,0]]`, goal `[[2,3]]` | `(2, 3)` | `[2,3]` | `[[2,3]]` |
| `line-builder` target m 2, b 1 | `y = 2x + 1` | `[2,1]` | `[]` |
| `number-line` target 5 | `5` | `[5]` | `[]` |
| `number-input` answers `['7']` | `7` | `[7]` | `[]` |
| `reflect-shape` shape `[[2,3]]`, axis x | `reflect across the x-axis` | `[]` | `[[2,-3]]` |
| `rotate-shape` shape `[[1,0]]`, degrees 90 | `rotate 90° counterclockwise` | `[90]` | `[[0,1]]` |

Build minimal step objects (cast `as LessonStep`) with just the fields each case
reads. Assert `computeGroundTruth(step)` deep-equals the expected `GroundTruth`.

### `src/lib/mathEngine.ts` — `verifyHintIsSafe` (the safety guard)

These are the guarantees that stop the AI from ever showing wrong math or the
answer. Cover all four:

```ts
import { verifyHintIsSafe } from './mathEngine'

const balance = { type: 'balance-scale', coeff: 2, constant: 3, total: 11 } as any
// truth.text === 'x = 4'

it('empty hint is safe', () =>
  expect(verifyHintIsSafe('', balance)).toBe(true))

it('rejects a hint that leaks the answer text', () =>
  expect(verifyHintIsSafe('Easy — the answer is x = 4.', balance)).toBe(false))

it('rejects a hint asserting a false numeric equation', () =>
  expect(verifyHintIsSafe('Since 2 + 2 = 5, subtract from both sides.', balance))
    .toBe(false))

it('allows a nudge with only true math and no answer leak', () =>
  expect(verifyHintIsSafe('Notice 2 + 2 = 4; undo the +3 first.', balance))
    .toBe(true))
```

Also cover the coordinate-leak guard with a multi-point step (e.g. a
`translate-by` whose image is two points): mentioning **one** image coordinate is
safe, but a hint containing **every** solution coordinate must return `false`.

### `src/lib/mastery.ts` — `computeOutcome` (mastery gate)

Rule: **mastery** = clean-solve ratio ≥ 0.8 (`MASTERY_RATIO`) AND struggled ≤ 3
(`STRUGGLE_LIMIT`); otherwise **support**. Only gradeable steps count
(concept/confidence/complete excluded). A clean solve = `correct && attempts<=1
&& !usedHelp`.

Helper to build content steps:

```ts
const problems = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ id: `p${i}`, type: 'move-point' } as any))
const clean = (id: string) => ({ stepId: id, correct: true, attempts: 1, usedHelp: false })
const missed = (id: string) => ({ stepId: id, correct: false, attempts: 2, usedHelp: true })
```

| Scenario | Expected |
|----------|----------|
| 5 problems, 5 clean | `mastery`, ratio 1 |
| 5 problems, 4 clean + 1 missed | `mastery`, ratio 0.8, struggled 1 |
| 5 problems, 3 clean + 2 missed | `support`, ratio 0.6 |
| 5 problems, only 4 clean results (1 unattempted) | `mastery`, ratio 0.8 (denom is 5) |
| 20 problems, 16 clean + 4 missed | `support` (ratio 0.8 but struggled 4 > 3) |
| concept/confidence "correct" results don't count | their results ignored; ratio from problems only |

### `src/lib/xp.ts`

```ts
import { checkTextAnswer, normalizeCheckAnswer, levelForXp, resetWeeklyXpIfNeeded } from './xp'

expect(normalizeCheckAnswer('(2, 5)')).toBe('2,5')
expect(checkTextAnswer('2,5', ['(2, 5)'])).toBe(true)   // tolerant of spaces/parens
expect(checkTextAnswer(' -3 ', ['-3'])).toBe(true)
expect(checkTextAnswer('', ['7'])).toBe(false)          // empty never matches

expect(levelForXp(0)).toMatchObject({ level: 1, intoLevel: 0, pct: 0 })
expect(levelForXp(150)).toMatchObject({ level: 2, intoLevel: 50, pct: 50 })

// Different week resets the weekly tally.
expect(resetWeeklyXpIfNeeded(80, '1999-01-04')).toEqual({ weeklyXp: 0, xpWeekStart: expect.any(String) })
```

### `src/lib/streak.ts` — `applyLessonCompletion` (streak persistence)

Pass an explicit `today` (YYYY-MM-DD) for determinism. Start from
`normalizeProfile({}, 'Test')`.

| Scenario | Expected |
|----------|----------|
| First completion ever | `streak === 1`; today's weekday set true in `weeklyCompleted` |
| Completed yesterday, finish today (gap 1) | `streak` increments by 1 |
| Gap of 2 days, `streakCharges >= 1` | spends one charge, `streak` increments, `streakCharges` − 1 |
| Gap of 2 days, `streakCharges === 0` | `streak` resets to 1 |
| Second completion same day | streak unchanged (no double count) |
| Completion in a new week | `weeklyCompleted` resets, only today's day true |

Also unit test `getWeekStartMonday` (returns the Monday) and `daysBetween`
(`daysBetween('2024-01-01','2024-01-03') === 2`).

### `src/content/path.ts` — adaptive path

```ts
import { getNextOnPath, resolvePath, START_LESSON_ID } from './path'

expect(getNextOnPath('translations-101', 'mastery')).toBe('reflections-101')
expect(getNextOnPath('translations-101', 'support')).toBe('number-line-101')
expect(getNextOnPath('rotations-101', 'mastery')).toBeUndefined() // terminal leaf

// No progress -> next is the start lesson.
expect(resolvePath({})).toMatchObject({ nextLessonId: START_LESSON_ID, finished: false })

// Mastered translations -> next recommends reflections.
expect(resolvePath({ 'translations-101': { completed: true, outcome: 'mastery' } }))
  .toMatchObject({ completed: ['translations-101'], nextLessonId: 'reflections-101' })

// Mastered through a terminal leaf -> path finished.
expect(resolvePath({
  'translations-101': { completed: true, outcome: 'mastery' },
  'reflections-101': { completed: true, outcome: 'mastery' },
  'rotations-101': { completed: true, outcome: 'mastery' },
})).toMatchObject({ finished: true, nextLessonId: undefined })
```

### Lesson content integrity (data-driven guard)

Add a test that iterates `allLessons` and asserts each lesson is well-formed, so
malformed authored content fails CI rather than at runtime:

- unique `lesson.id`; `order` present; non-empty `steps`.
- exactly one `complete` step.
- every problem step has non-empty `prompt`, `why`, and `hint`.
- `multiple-choice`: `correctIndex` is a valid index into `options`.
- `number-input` / `lessonCheck`: `answers` non-empty.
- every `LESSON_PATH` id resolves via `getLessonById` (no dangling path edges),
  and every path target id exists.

## Running

```bash
npm test          # one-shot, CI-friendly
npm run test:watch
```

Report total/passing/failing. For any failure, show the case and the actual vs.
expected value — that is the bug report.
