import type { LessonStep, StepResult } from '../types/lesson'

/**
 * Whether a learner mastered a lesson or needs extra support, used to pick the
 * next lesson on the adaptive path.
 *
 * Rule (content steps only — lesson checks never count):
 *   • Mastery  → at least 80% of the problems were answered correctly on the
 *                first try WITHOUT using a hint, and the learner did not
 *                struggle (wrong or hinted) on more than 3 problems.
 *   • Support  → anything less.
 */
export type LessonOutcome = 'mastery' | 'support'

/** Step types that count as gradeable problems for the mastery calculation. */
const NON_PROBLEM_TYPES: ReadonlySet<LessonStep['type']> = new Set([
  'confidence',
  'concept',
  'complete',
])

/** How many problems a learner may get wrong / use hints on before they need support. */
export const STRUGGLE_LIMIT = 3

/** The clean-solve ratio required for mastery. */
export const MASTERY_RATIO = 0.8

export function isGradeableProblem(step: LessonStep): boolean {
  return !NON_PROBLEM_TYPES.has(step.type)
}

export interface OutcomeDetail {
  outcome: LessonOutcome
  /** Problems solved first-try with no hint. */
  cleanCorrect: number
  /** Problems answered wrong (any attempt) or with a hint. */
  struggled: number
  problemCount: number
  ratio: number
}

/**
 * Decide mastery vs. support from a lesson's content-step results.
 *
 * Pass the lesson's content (flow) steps so we count ONLY gradeable problems:
 * concept/confidence steps also record a "correct" result when the learner taps
 * "continue", and those must never inflate the score. Unattempted problems have
 * no result row, so they correctly count against the ratio via the denominator.
 *
 * Mastery requires ≥80% of problems solved first-try with no hint AND no more
 * than 3 problems struggled (wrong attempt or hint used). Pure; never throws.
 */
export function computeOutcome(
  results: StepResult[],
  contentSteps: LessonStep[],
): OutcomeDetail {
  const problemIds = new Set(
    contentSteps.filter(isGradeableProblem).map((s) => s.id),
  )
  const problemCount = problemIds.size

  // Keep only results that belong to a gradeable problem; dedupe by stepId,
  // keeping the last recorded attempt for each.
  const byStep = new Map<string, StepResult>()
  for (const r of results) {
    if (problemIds.has(r.stepId)) byStep.set(r.stepId, r)
  }
  const unique = [...byStep.values()]

  const cleanCorrect = unique.filter(
    (r) => r.correct && r.attempts <= 1 && !r.usedHelp,
  ).length
  const struggled = unique.filter(
    (r) => !r.correct || r.attempts > 1 || r.usedHelp,
  ).length

  const denom = Math.max(problemCount, 1)
  const ratio = cleanCorrect / denom

  const outcome: LessonOutcome =
    ratio >= MASTERY_RATIO && struggled <= STRUGGLE_LIMIT ? 'mastery' : 'support'

  return { outcome, cleanCorrect, struggled, problemCount: denom, ratio }
}
