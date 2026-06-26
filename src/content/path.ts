import type { LessonOutcome } from '../lib/mastery'

/**
 * The adaptive lesson path. Every learner starts at Translations. When they
 * finish a lesson the engine records whether they mastered it or need support,
 * and that outcome chooses the next lesson:
 *
 *   Translations ─ mastery ▶ Reflections ─ mastery ▶ Rotations
 *                │                        └ support ▶ Coordinate plane (4 quadrants)
 *                └ support ▶ Number line ─ mastery ▶ Translations (more variants)
 *                                          └ support ▶ Coordinate plane (Q1, guided)
 *
 * The terminal leaves end the path. Only the next lesson + already-completed
 * lessons are ever shown to the learner — never the whole tree.
 */
export const START_LESSON_ID = 'translations-101'

export interface PathEdges {
  mastery?: string
  support?: string
}

export const LESSON_PATH: Record<string, PathEdges> = {
  'translations-101': { mastery: 'reflections-101', support: 'number-line-101' },
  'reflections-101': { mastery: 'rotations-101', support: 'coordinate-plane-101' },
  'number-line-101': {
    mastery: 'translations-201',
    support: 'coordinate-plane-guided-101',
  },
  // Terminal leaves.
  'rotations-101': {},
  'coordinate-plane-101': {},
  'translations-201': {},
  'coordinate-plane-guided-101': {},
}

/** Every lesson id that participates in the adaptive path. */
export const PATH_LESSON_IDS = Object.keys(LESSON_PATH)

export interface PathNodeState {
  completed: boolean
  outcome?: LessonOutcome
}

export interface PathResolution {
  /** Completed lessons in the order the learner reached them (review/practice). */
  completed: string[]
  /** The next lesson to do, or undefined when the path is finished. */
  nextLessonId?: string
  /** True once a terminal lesson has been completed. */
  finished: boolean
}

/** The next lesson id for a given lesson + outcome, or undefined at a leaf. */
export function getNextOnPath(
  lessonId: string,
  outcome: LessonOutcome,
): string | undefined {
  const edges = LESSON_PATH[lessonId]
  if (!edges) return undefined
  return outcome === 'mastery' ? edges.mastery : edges.support
}

/**
 * Walk the path from the start, following each completed lesson's recorded
 * outcome, until reaching the first lesson the learner has not finished (that's
 * "next") or a completed terminal leaf (path finished). Cycle-safe.
 */
export function resolvePath(state: Record<string, PathNodeState>): PathResolution {
  const completed: string[] = []
  const seen = new Set<string>()
  let node: string | undefined = START_LESSON_ID

  while (node && !seen.has(node)) {
    seen.add(node)
    const s = state[node]
    if (!s?.completed) {
      return { completed, nextLessonId: node, finished: false }
    }
    completed.push(node)
    const next = getNextOnPath(node, s.outcome ?? 'mastery')
    if (!next) {
      return { completed, nextLessonId: undefined, finished: true }
    }
    node = next
  }

  return { completed, nextLessonId: node, finished: false }
}
