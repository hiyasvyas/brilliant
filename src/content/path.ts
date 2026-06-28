import type { LessonOutcome } from '../lib/mastery'

/**
 * The adaptive lesson path. Every learner starts at Translations. When they
 * finish a lesson the engine records whether they mastered it or need support
 * (mastery = ≥80% of the lesson's content problems solved first-try with no
 * hints; the end-of-lesson check is retrieval practice and never counts), and
 * that outcome chooses the next lesson. The course is a branching tree, not a
 * line — mastery keeps advancing into new concepts, while support reroutes to
 * targeted prerequisite practice that then rejoins the spine:
 *
 *   Translations ─m▶ Reflections ─m▶ Rotations ─m▶ Dilations ─m▶ Combining ─m▶ Congruence ─m▶ Linear equations ★
 *        │ s              │ s            │ s            │ s            │ s            │ s
 *        │           Coord.plane    Refl.guided   Rot.+ratio     Combining      Combining
 *        │              ⇧ s            │ s         warmup ⇧       w/scaffolds ⇧  revisit ⇧
 *        │           Number-line    Guided retry  (rejoins the concept track)
 *        │            repeat ★?     + teacher ★
 *        └─s▶ Number line ─m▶ Coordinate plane ─m▶ Translations (scaffolded) ─m▶ Reflections (rejoins spine)
 *                  │ s                  │ s                    │ s
 *             Coord.plane          Number-line           Coord.plane
 *             (Q1 guided)           repeat                review ⇧
 *                  │ s                  │ s
 *             Teacher check-in ★   Teacher check-in ★
 *
 * ★ = terminal endpoint (path complete / hands off to a future unit) or a
 * supportive teacher-flagged stop. Support lessons are NOT dead-ends: a
 * struggling learner drops to a gentler prerequisite, masters it, and climbs
 * back UP toward the concept they struggled with. The walk is cycle-safe; only
 * the next lesson + already-completed lessons are ever shown, never the tree.
 */
export const START_LESSON_ID = 'translations-101'

export interface PathEdges {
  mastery?: string
  support?: string
}

export const LESSON_PATH: Record<string, PathEdges> = {
  // ── Spine: the core transformations course ─────────────────────────────────
  'translations-101': { mastery: 'reflections-101', support: 'number-line-101' },
  'reflections-101': { mastery: 'rotations-101', support: 'coordinate-plane-101' },
  'rotations-101': { mastery: 'dilations-101', support: 'reflections-guided-101' },
  'dilations-101': {
    mastery: 'combining-transformations-101',
    support: 'rotations-ratiowarmup-101',
  },
  'combining-transformations-101': {
    mastery: 'congruence-similarity-101',
    support: 'combining-revisit-101',
  },
  'congruence-similarity-101': {
    mastery: 'linear-equations-101', // → the next major topic
    support: 'combining-revisit-101',
  },

  // ── Number-line support track (from Translations) ──────────────────────────
  // Struggle on Translations and rebuild on the number line, then climb the
  // coordinate plane and ease back toward the spine via scaffolded translations.
  'number-line-101': {
    mastery: 'coordinate-plane-101',
    support: 'coordinate-plane-guided-101',
  },
  'coordinate-plane-101': {
    mastery: 'translations-201', // plane rebuilt → scaffolded translations
    support: 'number-line-extra-101', // still stuck → repeat the number line
  },
  'coordinate-plane-guided-101': {
    mastery: 'translations-201', // gentlest rung mastered → scaffolded translations
    support: 'teacher-intervention-101', // still stuck → a supportive check-in
  },
  'translations-201': {
    mastery: 'reflections-101', // ready → rejoin the spine (no scaffolds)
    support: 'coordinate-plane-review-101',
  },
  'number-line-extra-101': {
    mastery: 'coordinate-plane-101', // climb back up the ladder
    support: 'teacher-intervention-101', // still stuck → a supportive check-in
  },
  'coordinate-plane-review-101': {
    mastery: 'translations-201', // back up to scaffolded translations
    support: 'coordinate-plane-guided-101',
  },

  // ── Reflections support track (from Rotations) ─────────────────────────────
  'reflections-guided-101': {
    mastery: 'rotations-101', // caught up → rejoin the main track
    support: 'reflections-guidedretry-101', // deeper struggle → guided retry + flag
  },
  'reflections-guidedretry-101': {
    mastery: 'rotations-101', // ready → rejoin the main track
    support: 'teacher-intervention-101', // still stuck → teacher-flagged check-in
  },

  // ── Concept-track remediation loops (from Dilations / Combining) ───────────
  'rotations-ratiowarmup-101': {
    mastery: 'dilations-101', // ratios + rotations solid → resume the concept track
    support: 'rotations-101', // still shaky → redo the core rotations lesson
  },
  'combining-revisit-101': {
    mastery: 'combining-transformations-101', // ready → retake combining
    support: 'dilations-101', // back up a step to dilations
  },

  // ── Terminal leaves: mastery endpoints / supportive stops ──────────────────
  'linear-equations-101': {}, // → the next unit (path complete)
  'teacher-intervention-101': {}, // supportive check-in, no forced next step
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
