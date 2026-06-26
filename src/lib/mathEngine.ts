/**
 * Phase 2 math engine — grounds and verifies the AI hint feature.
 *
 * Two jobs, both pure and side-effect free:
 *
 *  1. `computeGroundTruth(step)` — derive the canonical correct answer for a
 *     lesson step using math.js wherever there is actual arithmetic to do
 *     (solving equations, computing translation deltas/image coordinates, etc.).
 *     This is the single source of truth handed to the AI service so the model
 *     is always anchored to the real solution rather than guessing.
 *
 *  2. `verifyHintIsSafe(hintText, step)` — a guard run AFTER the AI responds. It
 *     rejects any hint that (a) leaks the answer, or (b) asserts a mathematically
 *     FALSE equation/inequality. Combined with grounding, this means the AI can
 *     never present wrong math or reveal the solution; on rejection the caller
 *     falls back to the hand-written static hint.
 *
 * Deterministic GRADING of learner answers lives elsewhere (the `check()`
 * closures in LessonEngine) and is untouched by this module — this engine is a
 * pure addition layered on top of the AI hint path, never a replacement.
 *
 * Hard contract: every export is pure and must NEVER throw. Any risky math.js
 * call is wrapped in try/catch; a parse failure is treated as "not a checkable
 * claim" (i.e. safe), so a flaky parse can never block a legitimate hint.
 */
import { evaluate } from 'mathjs'
import type { LessonStep } from '../types/lesson'
import { reflectPoints, rotatePoints } from './transforms'

export interface GroundTruth {
  /** Human-readable canonical answer, e.g. "x = 4" or "(3, -2)". */
  text: string
  /** Every number that constitutes the solution (deltas, roots, m/b, …). */
  numbers: number[]
  /** Every coordinate that constitutes the solution (image points, vertex, …). */
  coords: [number, number][]
}

/** Safe numeric evaluation via math.js. Returns null on any failure. */
function safeEval(expr: string, scope?: Record<string, number>): number | null {
  try {
    const value = evaluate(expr, scope ?? {})
    return typeof value === 'number' && Number.isFinite(value) ? value : null
  } catch {
    return null
  }
}

/** Round to a sane number of decimals so float noise never leaks into text. */
function tidy(value: number): number {
  return Math.round(value * 1e6) / 1e6
}

/** Apply a translation (dx, dy) to a list of points using math.js arithmetic. */
function translatePoints(
  points: [number, number][],
  dx: number,
  dy: number,
): [number, number][] {
  return points.map(([x, y]) => {
    const nx = safeEval('x + dx', { x, dx })
    const ny = safeEval('y + dy', { y, dy })
    return [nx ?? x + dx, ny ?? y + dy] as [number, number]
  })
}

/**
 * Compute the canonical correct answer for a step. Uses math.js where there is
 * real math; otherwise returns sensible text with empty numbers/coords. Pure
 * and never throws.
 */
export function computeGroundTruth(step: LessonStep): GroundTruth {
  switch (step.type) {
    case 'balance-scale': {
      // Solve coeff·x + constant = total for x.
      const x = safeEval('(total - constant) / coeff', {
        total: step.total,
        constant: step.constant,
        coeff: step.coeff,
      })
      if (x === null) return { text: '', numbers: [], coords: [] }
      const value = tidy(x)
      return { text: `x = ${value}`, numbers: [value], coords: [] }
    }

    case 'function-machine': {
      // Hidden rule: output = input · mult + add.
      const outputs = step.examples.map((ex) => {
        const out = safeEval('input * mult + add', {
          input: ex.input,
          mult: step.mult,
          add: step.add,
        })
        return tidy(out ?? ex.input * step.mult + step.add)
      })
      return {
        text: `× ${step.mult} then + ${step.add}`,
        numbers: [step.mult, step.add, ...outputs],
        coords: [],
      }
    }

    case 'move-point': {
      const [x, y] = step.target
      return { text: `(${x}, ${y})`, numbers: [x, y], coords: [[x, y]] }
    }

    case 'find-vertex': {
      // y = a(x - h)² + k → vertex at (h, k).
      return { text: `(${step.h}, ${step.k})`, numbers: [step.h, step.k], coords: [[step.h, step.k]] }
    }

    case 'translate-by':
    case 'drag-shape': {
      const dx = tidy(step.targetDx)
      const dy = tidy(step.targetDy)
      const image = translatePoints(step.shape, dx, dy).map(
        ([x, y]) => [tidy(x), tidy(y)] as [number, number],
      )
      return { text: `(${dx}, ${dy})`, numbers: [dx, dy], coords: image }
    }

    case 'translation-input': {
      // Δ = goal − start, computed from the first corresponding point.
      const start = step.points[0]
      const goal = step.goalPoints[0]
      if (!start || !goal) return { text: '', numbers: [], coords: [] }
      const dx = safeEval('gx - sx', { gx: goal[0], sx: start[0] })
      const dy = safeEval('gy - sy', { gy: goal[1], sy: start[1] })
      const ddx = tidy(dx ?? goal[0] - start[0])
      const ddy = tidy(dy ?? goal[1] - start[1])
      const image = step.goalPoints.map(([x, y]) => [tidy(x), tidy(y)] as [number, number])
      return { text: `(${ddx}, ${ddy})`, numbers: [ddx, ddy], coords: image }
    }

    case 'line-builder': {
      const { m, b } = step.target
      return { text: `y = ${m}x + ${b}`, numbers: [m, b], coords: [] }
    }

    case 'slope-discovery': {
      return { text: `slope ${step.targetSlope}`, numbers: [step.targetSlope], coords: [] }
    }

    case 'number-line': {
      return { text: String(step.target), numbers: [step.target], coords: [] }
    }

    case 'number-input': {
      // Parse any numeric answers so they ground the leak/equation checks; keep
      // the original strings for the human-readable text.
      const numbers = step.answers
        .map((a) => safeEval(a))
        .filter((n): n is number => n !== null)
        .map(tidy)
      return { text: step.answers.join(' or '), numbers, coords: [] }
    }

    case 'multiple-choice': {
      // No numeric guarantee — text is the correct option.
      return { text: step.options[step.correctIndex] ?? '', numbers: [], coords: [] }
    }

    case 'reflect-shape': {
      const image = reflectPoints(step.shape, step.axis).map(
        ([x, y]) => [tidy(x), tidy(y)] as [number, number],
      )
      return { text: `reflect across the ${step.axis}-axis`, numbers: [], coords: image }
    }

    case 'reflect-plot': {
      const [ix, iy] = reflectPoints([step.point], step.axis)[0]!
      const image: [number, number] = [tidy(ix), tidy(iy)]
      return { text: `(${image[0]}, ${image[1]})`, numbers: image, coords: [image] }
    }

    case 'rotate-shape': {
      const image = rotatePoints(step.shape, step.degrees).map(
        ([x, y]) => [tidy(x), tidy(y)] as [number, number],
      )
      return {
        text: `rotate ${step.degrees}° counterclockwise`,
        numbers: [step.degrees],
        coords: image,
      }
    }

    default:
      // confidence / concept / complete and anything else: no math to ground.
      return { text: '', numbers: [], coords: [] }
  }
}

/** Lowercase and strip whitespace + parentheses for robust substring matching. */
function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, '').replace(/[()]/g, '')
}

/** True if the hint contains the full canonical answer text verbatim. */
function leaksAnswerText(hintText: string, answerText: string): boolean {
  const answer = normalize(answerText)
  // Require a couple of characters so trivial strings (e.g. "0") don't false-fire.
  return answer.length >= 2 && normalize(hintText).includes(answer)
}

/**
 * True if the hint reveals ALL of the solution coordinates. A single coordinate
 * mention is acceptable (could be a given point); leaking every solution point
 * is treated as handing over the answer.
 */
function leaksAllCoords(hintText: string, coords: [number, number][]): boolean {
  if (coords.length === 0) return false
  const normalized = normalize(hintText)
  return coords.every(([x, y]) => normalized.includes(normalize(`(${x},${y})`)))
}

/**
 * Pull out simple equations/inequalities of the form `<expr> <op> <expr>` where
 * both sides are made only of numbers, the basic operators, spaces and dots.
 * We deliberately keep this narrow: we only want claims we can confidently
 * evaluate with math.js, never algebraic statements containing variables.
 */
const NUMERIC_RELATION =
  // side: digits/operators/spaces/parens/dots, then an (in)equality op, then another side
  /([0-9.+\-*/() ]+?)\s*(<=|>=|!=|=|<|>)\s*([0-9.+\-*/() ]+)/g

/** A side must contain at least one digit and no stray letters to be checkable. */
function isCheckableSide(side: string): boolean {
  const trimmed = side.trim()
  if (!/[0-9]/.test(trimmed)) return false
  // Only digits, operators, dots, spaces and parens — anything else (a variable
  // like x, a unit, a word) makes this not a plain numeric claim.
  return /^[0-9.+\-*/() ]+$/.test(trimmed)
}

/**
 * Evaluate a single relation. Returns:
 *   true  → relation is mathematically TRUE (safe)
 *   false → relation is mathematically FALSE (unsafe)
 *   null  → not confidently checkable (treat as safe; do not reject)
 */
function evaluateRelation(left: string, op: string, right: string): boolean | null {
  if (!isCheckableSide(left) || !isCheckableSide(right)) return null
  const l = safeEval(left)
  const r = safeEval(right)
  if (l === null || r === null) return null
  const a = tidy(l)
  const b = tidy(r)
  switch (op) {
    case '=':
      return a === b
    case '!=':
      return a !== b
    case '<':
      return a < b
    case '>':
      return a > b
    case '<=':
      return a <= b
    case '>=':
      return a >= b
    default:
      return null
  }
}

/**
 * Verify an AI hint is safe to show. Returns false (unsafe) when the hint leaks
 * the answer or asserts a clearly-false numeric relation; true otherwise.
 *
 * Conservative by design: anything ambiguous or unparseable is treated as safe,
 * so we only reject on a clear answer leak or a clearly-false equation. Never
 * throws — every math.js call is guarded.
 */
export function verifyHintIsSafe(hintText: string, step: LessonStep): boolean {
  try {
    if (!hintText) return true
    const truth = computeGroundTruth(step)

    // (a) Answer-leak checks.
    if (leaksAnswerText(hintText, truth.text)) return false
    if (leaksAllCoords(hintText, truth.coords)) return false

    // (b) False-equation check: scan for plain numeric relations and reject only
    // when one is unambiguously false.
    NUMERIC_RELATION.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = NUMERIC_RELATION.exec(hintText)) !== null) {
      const verdict = evaluateRelation(match[1], match[2], match[3])
      if (verdict === false) return false
    }

    return true
  } catch {
    // A pure verifier must never throw; on any unexpected failure, do not block
    // a legitimate hint.
    return true
  }
}
