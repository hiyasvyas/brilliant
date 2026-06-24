export type ConfidenceLevel = 'no' | 'maybe' | 'yes'

export type StepType =
  | 'confidence'
  | 'concept'
  | 'multiple-choice'
  | 'number-input'
  | 'line-builder'
  | 'balance-scale'
  | 'number-line'
  | 'function-machine'
  | 'slope-discovery'
  | 'move-point'
  | 'find-vertex'
  | 'translation-input'
  | 'translate-by'
  | 'complete'

/** Declarative description of what to draw on a coordinate plane. */
export interface GraphSpec {
  /** Half-range of the visible grid (defaults to 6). */
  range?: number
  lines?: GraphLine[]
  parabolas?: GraphParabola[]
  exponentials?: GraphExponential[]
  polygons?: GraphPolygon[]
  points?: GraphPoint[]
}

export interface GraphLine {
  /** y = m·x + b */
  m: number
  b: number
  color?: string
  dashed?: boolean
  label?: string
}

export interface GraphParabola {
  /** y = a(x − h)² + k */
  h: number
  k: number
  a: number
  color?: string
  dashed?: boolean
}

export interface GraphExponential {
  /** y = a·b^x */
  a: number
  b: number
  color?: string
  dashed?: boolean
}

export interface GraphPolygon {
  points: [number, number][]
  color?: string
  dashed?: boolean
}

export interface GraphPoint {
  x: number
  y: number
  color?: string
  dashed?: boolean
  label?: string
}

export interface BaseStep {
  id: string
  type: StepType
  title: string
  /**
   * Short "notice something interesting" pattern shown automatically inside the
   * success banner when the learner answers correctly. Turns a correct answer
   * into a teaching moment, separate from the on-demand procedural `why`.
   */
  insight?: string
}

export interface ConfidenceStep extends BaseStep {
  type: 'confidence'
  question: string
}

export interface ConceptStep extends BaseStep {
  type: 'concept'
  body: string
  /** Built-in demos kept for the translations lesson. */
  visual?: 'translation' | 'vertex'
  /** Declarative graph shown above the body. */
  graph?: GraphSpec
}

export interface MultipleChoiceStep extends BaseStep {
  type: 'multiple-choice'
  prompt: string
  options: string[]
  correctIndex: number
  graph?: GraphSpec
  why: string
  hint: string
}

export interface NumberInputStep extends BaseStep {
  type: 'number-input'
  prompt: string
  /** Acceptable answers, normalized (e.g. "7", "-3", "(2, 5)"). */
  answers: string[]
  /** Optional label shown before the input, e.g. "x =". */
  inputLabel?: string
  graph?: GraphSpec
  why: string
  hint: string
}

export interface LineBuilderStep extends BaseStep {
  type: 'line-builder'
  prompt: string
  /** y = m·x + b target the learner must build with the buttons. */
  target: { m: number; b: number }
  start: { m: number; b: number }
  mStep?: number
  bStep?: number
  why: string
  hint: string
}

export interface BalanceScaleStep extends BaseStep {
  type: 'balance-scale'
  prompt: string
  /** Solve coeff·x + constant = total by removing/dividing equal amounts. */
  coeff: number
  constant: number
  total: number
  why: string
  hint: string
}

export interface NumberLineStep extends BaseStep {
  type: 'number-line'
  prompt: string
  start: number
  target: number
  min: number
  max: number
  why: string
  hint: string
}

export interface FunctionMachineStep extends BaseStep {
  type: 'function-machine'
  prompt: string
  /** Hidden rule: output = input · mult + add. */
  mult: number
  add: number
  examples: { input: number; output: number }[]
  why: string
  hint: string
}

export interface SlopeDiscoveryStep extends BaseStep {
  type: 'slope-discovery'
  prompt: string
  /** Fixed endpoint and starting position of the draggable endpoint. */
  fixed: [number, number]
  movable: [number, number]
  targetSlope: number
  why: string
  hint: string
}

export interface MovePointStep extends BaseStep {
  type: 'move-point'
  prompt: string
  start: [number, number]
  target: [number, number]
  tolerance?: number
  /** Optional reference line y = m·x + b drawn so the learner can plot onto it. */
  line?: { m: number; b: number }
  lineLabel?: string
  why: string
  hint: string
}

export interface FindVertexStep extends BaseStep {
  type: 'find-vertex'
  prompt: string
  /** y = a(x - h)² + k */
  h: number
  k: number
  a: number
  xMin: number
  xMax: number
  tolerance?: number
  why: string
  hint: string
}

export interface TranslationInputStep extends BaseStep {
  type: 'translation-input'
  prompt: string
  points: [number, number][]
  goalPoints: [number, number][]
  why: string
  hint: string
}

/**
 * Animated "translate by (Δx, Δy)" interaction. The learner fills the
 * translation expression from a number palette; the shape slides to the
 * translated position each time a value is chosen, and a Play button replays
 * the slide. Matches the goal outline to complete.
 */
export interface TranslateByStep extends BaseStep {
  type: 'translate-by'
  prompt: string
  /** Shape to translate: 1 point, a 2-point segment, or a 3+ point polygon. */
  shape: [number, number][]
  /** Translation the learner must enter to land on the goal outline. */
  targetDx: number
  targetDy: number
  /**
   * Which components are editable. 'x' locks Δy (shown as a fixed value),
   * 'y' locks Δx, 'both' lets the learner pick each. Defaults to 'both'.
   */
  axis?: 'x' | 'y' | 'both'
  /** Lowest / highest values offered in the number palette (defaults −5…5). */
  min?: number
  max?: number
  why: string
  hint: string
}

export interface CompleteStep extends BaseStep {
  type: 'complete'
  message: string
  /** One-line "what you discovered" insight shown on the completion screen. */
  discovery?: string
  nextLessonTitle?: string
}

export type LessonStep =
  | ConfidenceStep
  | ConceptStep
  | MultipleChoiceStep
  | NumberInputStep
  | LineBuilderStep
  | BalanceScaleStep
  | NumberLineStep
  | FunctionMachineStep
  | SlopeDiscoveryStep
  | MovePointStep
  | FindVertexStep
  | TranslationInputStep
  | TranslateByStep
  | CompleteStep

/**
 * A "similar but not identical" follow-up question. When a learner gets the
 * main question wrong, we explain why and then offer one of these to try, so
 * they practice the same skill on fresh numbers instead of memorising the
 * exact answer.
 */
export interface LessonCheckVariant {
  prompt: string
  /** Acceptable answer strings, e.g. "(6, 3)" or "3, 2" */
  answers: string[]
  hint: string
  why: string
}

export interface LessonCheckQuestion {
  id: string
  title: string
  prompt: string
  /** Acceptable answer strings, e.g. "(6, 3)" or "3, 2" */
  answers: string[]
  hint: string
  why: string
  /**
   * Similar follow-up questions shown one at a time when the learner answers
   * the main question incorrectly. They reuse the same skill with different
   * numbers so the learner must apply what they just reviewed, not recall the
   * original answer.
   */
  variants?: LessonCheckVariant[]
}

export interface LessonCheckResult {
  questionId: string
  correct: boolean
  answer: string
}

/**
 * An interactive lesson-check question: the learner builds a translation
 * (Δx, Δy) from a number palette and the shape animates onto the dashed
 * target outline. Used for the hands-on translations lesson check.
 */
export interface TranslationCheckQuestion {
  id: string
  title: string
  prompt: string
  /** Shape to translate: a single point, a 2-point segment, or a polygon. */
  shape: [number, number][]
  targetDx: number
  targetDy: number
  /** Which components are editable. Defaults to 'both'. */
  axis?: 'x' | 'y' | 'both'
  min?: number
  max?: number
  /** Hand-written explanation shown on the "Why?" page. */
  why: string
}

export interface Lesson {
  id: string
  title: string
  description: string
  subject: string
  /** Order within the course path. */
  order: number
  /** Adventure-map region name, e.g. "Linear Mountain". */
  region: string
  /** Emoji icon for the map node. */
  icon: string
  estimatedMinutes: number
  steps: LessonStep[]
  lessonCheck: LessonCheckQuestion[]
  /**
   * Optional hands-on lesson check. When present, the lesson uses interactive
   * graph questions (drag/animate a translation) instead of the text quiz.
   */
  interactiveCheck?: TranslationCheckQuestion[]
  /** Extra interactive problems for practice mode */
  practiceSteps: LessonStep[]
}

export interface StepResult {
  stepId: string
  correct: boolean
  attempts: number
  usedHelp: boolean
}

export interface LessonProgress {
  lessonId: string
  stepIndex: number
  stepResults: StepResult[]
  completed: boolean
  updatedAt: string
}

export interface UserProfile {
  displayName: string
  /** Consecutive days with at least one full lesson completed */
  streak: number
  /** Auto-applied when a day is missed (earned by completing lessons) */
  streakCharges: number
  /** Monday of the current week row (YYYY-MM-DD) */
  weekStartDate: string
  /** Mon–Sun; true = completed a lesson that day this week */
  weeklyCompleted: boolean[]
  /** Last calendar day a full lesson was completed */
  lastLessonCompleteDate: string
  lessonsCompleted: string[]
  /** XP earned this week (resets every Monday) */
  weeklyXp: number
  /** Monday of the week for weeklyXp (YYYY-MM-DD) */
  xpWeekStart: string
  /** Lifetime XP earned from lessons (never resets) */
  totalXp: number
}
