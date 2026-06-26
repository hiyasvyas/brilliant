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
  | 'drag-shape'
  | 'reflect-shape'
  | 'reflect-plot'
  | 'rotate-shape'
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

/**
 * A deeper "let's break this down" lesson shown inside a lesson (not a lesson
 * check) after a learner gets the same type of question wrong several times in
 * a row. It re-teaches the concept behind the questions they missed and gives
 * concrete tips for approaching that question type, before the learner retries
 * a fresh question of the same type to master the concept.
 */
export interface Remediation {
  /** Headline for the deeper lesson, e.g. "Let's master two-step equations". */
  title: string
  /** Main re-teaching explanation. Can span a few sentences. */
  body: string
  /** Short, actionable tips & tricks for tackling this question type. */
  tips: string[]
  /** Optional graph drawn above the tips to illustrate the concept. */
  graph?: GraphSpec
  /** Optional built-in demo visual (reuses the concept-step demos). */
  visual?: 'translation' | 'vertex'
}

/**
 * A "predict before you move" gate shown ahead of a hands-on problem. Strong
 * transformation instruction asks the learner to commit to what will happen and
 * why *before* they interact, so we pose a quick multiple-choice prediction
 * first, then reveal the manipulation. It never blocks progress — a wrong guess
 * just shows the reasoning before the learner tries it for real.
 */
export interface PredictionPrompt {
  question: string
  options: string[]
  correctIndex: number
  /** Short hand-written explanation shown after the learner predicts. */
  why: string
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
  /**
   * Optional "predict before you move" question shown before a hands-on problem
   * so the learner commits to an outcome and reasoning before manipulating.
   */
  prediction?: PredictionPrompt
  /**
   * Adaptive retry loop (lessons only — lesson checks are separate). When the
   * learner answers wrong, the engine serves one of these "similar" questions
   * of the same type (same skill, fresh numbers) instead of the identical
   * problem. They are cycled through as needed.
   */
  variants?: LessonStep[]
  /**
   * Deeper lesson shown after the learner gets this question type wrong
   * `REMEDIATION_THRESHOLD` (3) times in a row. After reading it, the learner
   * retries a fresh question of the same type. If they get it right they move
   * on; otherwise the wrong-counter resets and the loop repeats.
   */
  remediation?: Remediation
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

/**
 * Direct-manipulation translation: the learner grabs an entire shape (a point,
 * a segment, or a polygon) and drags it as one piece onto the translated
 * position. Unlike `translate-by`, there is no number palette — the learner
 * physically slides the figure and it snaps to the grid.
 */
export interface DragShapeStep extends BaseStep {
  type: 'drag-shape'
  prompt: string
  /** Shape to drag: a single point, a 2-point segment, or a 3+ point polygon. */
  shape: [number, number][]
  /** Translation the learner must achieve by dragging the whole shape. */
  targetDx: number
  targetDy: number
  /**
   * Whether to show the dashed target outline. Defaults to true (a "match the
   * outline" task). Set false for "draw the image yourself" tasks where the
   * learner must work out where the figure lands with no outline to copy.
   */
  showTarget?: boolean
  why: string
  hint: string
}

/**
 * Reflect-a-shape interaction: the learner taps an axis and the shape flips
 * across it, snapping to match the dashed target image. Teaches that a
 * reflection across the x-axis negates y and across the y-axis negates x.
 */
export interface ReflectShapeStep extends BaseStep {
  type: 'reflect-shape'
  prompt: string
  /** Pre-image shape: a point, a 2-point segment, or a 3+ point polygon. */
  shape: [number, number][]
  /** The axis the learner must reflect across to land on the target image. */
  axis: 'x' | 'y'
  why: string
  hint: string
}

/**
 * Reflect-by-plotting interaction (no target shown): the learner is given a
 * pre-image point and an axis, and must DRAG a point to where the reflected
 * image lands — working out the coordinates themselves instead of tapping an
 * axis to copy a dashed outline. A harder, fade-the-scaffold version of
 * `reflect-shape` used to make the end of the lesson actually teach.
 */
export interface ReflectPlotStep extends BaseStep {
  type: 'reflect-plot'
  prompt: string
  /** The pre-image point to reflect (a single point). */
  point: [number, number]
  /** The axis to reflect across; the image is the learner's drag target. */
  axis: 'x' | 'y'
  why: string
  hint: string
}

/**
 * Rotate-a-shape interaction: the learner taps a rotation amount and the shape
 * turns about the origin, snapping to match the dashed target image. Rotations
 * are counterclockwise about (0, 0).
 */
export interface RotateShapeStep extends BaseStep {
  type: 'rotate-shape'
  prompt: string
  /** Pre-image shape: a point, a 2-point segment, or a 3+ point polygon. */
  shape: [number, number][]
  /** Counterclockwise rotation (degrees) about the origin the learner must apply. */
  degrees: 90 | 180 | 270
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
  | DragShapeStep
  | ReflectShapeStep
  | ReflectPlotStep
  | RotateShapeStep
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
  /**
   * Whether the learner mastered the lesson or needs support, computed from the
   * content-step results when the lesson is finished. Drives the adaptive path's
   * choice of next lesson. Absent until the lesson has been completed.
   */
  outcome?: 'mastery' | 'support'
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
