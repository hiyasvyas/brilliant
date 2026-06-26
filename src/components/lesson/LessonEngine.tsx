import { useEffect, useRef, useState } from 'react'
import type {
  Lesson,
  LessonStep,
  MultipleChoiceStep,
  NumberInputStep,
  LineBuilderStep,
  BalanceScaleStep,
  NumberLineStep,
  FunctionMachineStep,
  SlopeDiscoveryStep,
  MovePointStep,
  FindVertexStep,
  TranslationInputStep,
  TranslateByStep,
  DragShapeStep,
  ReflectShapeStep,
  ReflectPlotStep,
  RotateShapeStep,
  StepResult,
  Remediation,
} from '../../types/lesson'
import { toSvg, GRAPH_SIZE, GRAPH_RANGE } from '../../lib/graph'
import { getLessonFlowSteps } from '../../content/lessons'
import { pointsEqual } from '../../lib/graph'
import { reflectPoints, rotatePoints } from '../../lib/transforms'
import { checkTextAnswer, XP_PER_QUESTION } from '../../lib/xp'
import {
  CoordinatePlane,
  DraggablePoint,
  DraggableShape,
  GraphView,
  LinePath,
  ParabolaPath,
  Polygon,
  ShapeGlyph,
  StaticPoint,
  TranslationDemo,
  VertexDemo,
} from '../graph/CoordinatePlane'
import {
  ActionBar,
  CoordinateChangeTable,
  ConfidencePicker,
  HelpHint,
  LiveDirectionHint,
  PredictionGate,
  ProgressBar,
  ResetLessonButton,
  SignErrorNote,
  StartOverButton,
  TransformRuleNote,
  WhyExplanation,
  type FeedbackState,
} from './LessonUI'
import {
  coordinateChanges,
  directionalGuidance,
  signErrorMessage,
} from '../../lib/translationFeedback'
import {
  reflectErrorMessage,
  reflectionMap,
  reflectionRule,
  reflectPlotMessage,
  rotateErrorMessage,
  rotationMap,
  rotationRule,
} from '../../lib/transformFeedback'
import { computeGroundTruth } from '../../lib/mathEngine'
import type { HintContext } from '../../services/aiHint'
import './LessonUI.css'

/**
 * Optional per-problem feedback extras a manipulation component can supply:
 * a coordinate-by-coordinate breakdown for the success banner, and a sign/
 * direction-error diagnosis for the wrong banner.
 */
interface ProblemExtras {
  correctDetail?: React.ReactNode
  diagnose?: () => string | null
}
import { useAuth } from '../../context/auth-context'
import { saveLessonProgress } from '../../services/progressService'

export type LessonEngineMode = 'normal' | 'review' | 'practice'

/**
 * How many times a learner may struggle (a wrong answer or a hint request),
 * counted across the whole lesson regardless of which question, before the
 * lesson pauses for a review interlude. The counter resets after each review,
 * so the interlude reappears every 3 struggles.
 */
const REVIEW_LESSON_THRESHOLD = 3

/**
 * Consecutive-miss rescue. When a learner misses the SAME question this many
 * times in a row, or misses this many questions in a row, the lesson reveals
 * the answer and shows a short animated walkthrough of that exact question.
 */
const STUCK_THRESHOLD = 3

function randInt(min: number, max: number): number {
  if (max < min) return min
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/** Pick a non-zero translation that keeps every point of `shape` on the grid. */
function pickTranslation(shape: [number, number][], range = GRAPH_RANGE): [number, number] {
  const xs = shape.map((p) => p[0])
  const ys = shape.map((p) => p[1])
  const dxMin = Math.max(-5, -range - Math.min(...xs))
  const dxMax = Math.min(5, range - Math.max(...xs))
  const dyMin = Math.max(-5, -range - Math.min(...ys))
  const dyMax = Math.min(5, range - Math.max(...ys))
  let dx = 0
  let dy = 0
  for (let i = 0; i < 12 && dx === 0 && dy === 0; i++) {
    dx = randInt(dxMin, dxMax)
    dy = randInt(dyMin, dyMax)
  }
  return [dx, dy]
}

function moveWords(dx: number, dy: number): string {
  const parts: string[] = []
  if (dx !== 0) parts.push(`${Math.abs(dx)} ${dx > 0 ? 'right' : 'left'}`)
  if (dy !== 0) parts.push(`${Math.abs(dy)} ${dy > 0 ? 'up' : 'down'}`)
  return parts.length ? parts.join(' and ') : 'nowhere'
}

let similarCounter = 0

/**
 * Build a fresh "similar" question of the same type with new numbers, so the
 * learner proves they understood the skill after a rescue rather than repeating
 * the exact problem. Falls back to a re-id'd clone for unsupported types.
 */
function makeSimilarStep(step: LessonStep): LessonStep {
  similarCounter += 1
  const id = `${step.id}-sim-${similarCounter}`
  const title = 'Try another one'

  if (step.type === 'move-point') {
    const sx = randInt(-4, 4)
    const sy = randInt(-4, 4)
    const [dx, dy] = pickTranslation([[sx, sy]])
    const tx = sx + dx
    const ty = sy + dy
    return {
      id,
      type: 'move-point',
      title,
      prompt: `Translate the point ${moveWords(dx, dy)}, then drag it to its image.`,
      start: [sx, sy],
      target: [tx, ty],
      why: `Sliding ${moveWords(dx, dy)} takes (${sx}, ${sy}) to (${tx}, ${ty}).`,
      hint: `From (${sx}, ${sy}), count ${moveWords(dx, dy)}.`,
    }
  }

  if (step.type === 'drag-shape') {
    const [dx, dy] = pickTranslation(step.shape)
    const showTarget = step.showTarget !== false
    const p0 = step.shape[0]!
    return {
      id,
      type: 'drag-shape',
      title,
      prompt: showTarget
        ? 'Grab the shape and drag the whole thing onto the dashed outline.'
        : `Translate the shape ${moveWords(dx, dy)}, then drag it to draw its image.`,
      shape: step.shape,
      targetDx: dx,
      targetDy: dy,
      showTarget,
      why: `Every point slides ${moveWords(dx, dy)}: for example (${p0[0]}, ${p0[1]}) → (${p0[0] + dx}, ${p0[1] + dy}).`,
      hint: `Slide the whole shape ${moveWords(dx, dy)}.`,
    }
  }

  if (step.type === 'translate-by') {
    const [dx, dy] = pickTranslation(step.shape)
    const p0 = step.shape[0]!
    return {
      id,
      type: 'translate-by',
      title,
      prompt: `Translate the shape by (${dx}, ${dy}). Drag the number boxes to slide it.`,
      shape: step.shape,
      targetDx: dx,
      targetDy: dy,
      axis: step.axis ?? 'both',
      min: step.min,
      max: step.max,
      why: `The first number, ${dx}, slides it ${Math.abs(dx)} ${dx >= 0 ? 'right' : 'left'}; the second, ${dy}, slides it ${Math.abs(dy)} ${dy >= 0 ? 'up' : 'down'}: (${p0[0]}, ${p0[1]}) → (${p0[0] + dx}, ${p0[1] + dy}).`,
      hint: `Set the first box to ${dx} and the second to ${dy}.`,
    }
  }

  if (step.type === 'translation-input') {
    const [dx, dy] = pickTranslation(step.points)
    const goalPoints = step.points.map(([x, y]) => [x + dx, y + dy] as [number, number])
    const p0 = step.points[0]!
    return {
      id,
      type: 'translation-input',
      title,
      prompt: `Translate the figure ${moveWords(dx, dy)} and plot its image.`,
      points: step.points,
      goalPoints,
      why: `Each point slides ${moveWords(dx, dy)}: (${p0[0]}, ${p0[1]}) → (${p0[0] + dx}, ${p0[1] + dy}).`,
      hint: `Move every point ${moveWords(dx, dy)}.`,
    }
  }

  if (step.type === 'reflect-shape') {
    // Flip to the other axis so the retry isn't a memorised button press.
    const axis: 'x' | 'y' = step.axis === 'x' ? 'y' : 'x'
    const p0 = step.shape[0]!
    const img = axis === 'x' ? [p0[0], -p0[1]] : [-p0[0], p0[1]]
    return {
      id,
      type: 'reflect-shape',
      title,
      prompt: `Reflect the shape across the ${axis}-axis to match the dashed image.`,
      shape: step.shape,
      axis,
      why: `Reflecting across the ${axis}-axis negates ${
        axis === 'x' ? 'each y' : 'each x'
      }-coordinate: (${p0[0]}, ${p0[1]}) → (${img[0]}, ${img[1]}).`,
      hint: `A reflection across the ${axis}-axis flips the shape ${
        axis === 'x' ? 'top-to-bottom' : 'left-to-right'
      }.`,
    }
  }

  if (step.type === 'reflect-plot') {
    // Fresh point in a random quadrant, and flip the axis so the retry isn't a
    // memorised drag. Keep both coordinates non-zero so the flip is meaningful.
    const axis: 'x' | 'y' = step.axis === 'x' ? 'y' : 'x'
    let nx = 0
    let ny = 0
    while (nx === 0) nx = randInt(-5, 5)
    while (ny === 0) ny = randInt(-5, 5)
    const img = axis === 'x' ? [nx, -ny] : [-nx, ny]
    return {
      id,
      type: 'reflect-plot',
      title,
      prompt: `Reflect (${nx}, ${ny}) across the ${axis}-axis. Drag the point to where its image lands.`,
      point: [nx, ny],
      axis,
      why: `Across the ${axis}-axis, ${
        axis === 'x' ? 'keep x and negate y' : 'keep y and negate x'
      }: (${nx}, ${ny}) → (${img[0]}, ${img[1]}).`,
      hint: `The mirror is the ${axis}-axis, so ${
        axis === 'x' ? 'x stays the same and y flips sign' : 'y stays the same and x flips sign'
      }.`,
    }
  }

  if (step.type === 'rotate-shape') {
    const options: (90 | 180 | 270)[] = [90, 180, 270]
    const degrees = options[randInt(0, options.length - 1)]!
    const p0 = step.shape[0]!
    const img = rotatePoints([p0], degrees)[0]!
    return {
      id,
      type: 'rotate-shape',
      title,
      prompt: `Rotate the shape ${degrees}° counterclockwise about the origin to match the image.`,
      shape: step.shape,
      degrees,
      why: `Rotating ${degrees}° counterclockwise about the origin takes (${p0[0]}, ${p0[1]}) → (${img[0]}, ${img[1]}).`,
      hint: `Turn the whole shape ${degrees}° counterclockwise, keeping the origin fixed.`,
    }
  }

  if (step.type === 'number-line') {
    const { min, max } = step
    // Pick a fresh start and a non-zero move that keeps the landing point on
    // the line, so the retry is the same skill with new numbers.
    const span = Math.max(1, Math.min(6, max - min))
    let start = randInt(min, max)
    let delta = 0
    for (let tries = 0; tries < 50; tries++) {
      start = randInt(min, max)
      delta = randInt(-span, span)
      if (delta !== 0 && start + delta >= min && start + delta <= max) break
    }
    if (delta === 0) delta = start + 1 <= max ? 1 : -1
    const target = start + delta
    const n = Math.abs(delta)
    const dir = delta > 0 ? 'right' : 'left'
    const unit = n === 1 ? 'unit' : 'units'
    const tick = n === 1 ? 'tick mark' : 'tick marks'
    return {
      id,
      type: 'number-line',
      title,
      prompt: `Start at ${start} and move ${n} ${unit} ${dir} — drag the marker to where you land.`,
      start,
      target,
      min,
      max,
      why: `${dir === 'right' ? 'Right means add' : 'Left means subtract'}: ${start} ${
        delta > 0 ? '+' : '−'
      } ${n} = ${target}. The marker lands on ${target}.`,
      hint: `Count ${n} ${tick} to the ${dir} of ${start}.`,
    }
  }

  return { ...step, id } as LessonStep
}

/**
 * Types where `makeSimilarStep` produces a genuinely different question (new
 * numbers / new transform), so a wrong-answer retry can serve a fresh variant
 * rather than repeating the identical problem. Recall-style steps that can't be
 * auto-varied (multiple-choice, number-input) are not listed and simply repeat.
 */
function canMakeFreshVariant(step: LessonStep): boolean {
  return (
    step.type === 'move-point' ||
    step.type === 'drag-shape' ||
    step.type === 'translate-by' ||
    step.type === 'translation-input' ||
    step.type === 'reflect-shape' ||
    step.type === 'reflect-plot' ||
    step.type === 'rotate-shape' ||
    step.type === 'number-line'
  )
}

/**
 * Best-effort string form of a step's correct answer. Sent to the AI hint
 * service ONLY so the model can avoid revealing it (and so the response can be
 * verified against it). Never shown to the learner.
 */
function answerTextFor(step: LessonStep): string {
  switch (step.type) {
    case 'multiple-choice':
      return step.options[step.correctIndex] ?? ''
    case 'number-input':
      return step.answers.join(' or ')
    case 'balance-scale':
      return `x = ${(step.total - step.constant) / step.coeff}`
    case 'move-point':
      return `(${step.target[0]}, ${step.target[1]})`
    case 'find-vertex':
      return `(${step.h}, ${step.k})`
    case 'translate-by':
    case 'drag-shape':
      return `(${step.targetDx}, ${step.targetDy})`
    case 'translation-input': {
      const dx = step.goalPoints[0]![0] - step.points[0]![0]
      const dy = step.goalPoints[0]![1] - step.points[0]![1]
      return `(${dx}, ${dy})`
    }
    case 'line-builder':
      return `y = ${step.target.m}x + ${step.target.b}`
    case 'slope-discovery':
      return `slope ${step.targetSlope}`
    case 'number-line':
      return String(step.target)
    case 'function-machine':
      return `× ${step.mult} then + ${step.add}`
    case 'reflect-shape':
      return `reflect across the ${step.axis}-axis`
    case 'reflect-plot': {
      const img = reflectPoints([step.point], step.axis)[0]!
      return `(${img[0]}, ${img[1]})`
    }
    case 'rotate-shape':
      return `rotate ${step.degrees}° counterclockwise`
    default:
      return ''
  }
}

/** Problem types where the learner drags something, so live (level-3) directional guidance applies. */
function isDraggableType(type: LessonStep['type']): boolean {
  return (
    type === 'move-point' ||
    type === 'drag-shape' ||
    type === 'translate-by' ||
    type === 'translation-input'
  )
}

/**
 * Deterministic level-2 ("more guiding") hint used when AI is off or fails, so
 * the escalating ladder always has something smarter than the first hint —
 * without ever revealing the answer.
 */
function guidingFallback(step: LessonStep): string {
  if (isDraggableType(step.type)) {
    return 'Take it one axis at a time: first get the left/right move right, then the up/down move. Check the sign of each.'
  }
  if (step.type === 'balance-scale') {
    return 'Undo the operations in reverse: deal with what is added or subtracted first, then with what multiplies x.'
  }
  if (step.type === 'reflect-shape') {
    return 'Watch one corner. A flip across the x-axis swaps top and bottom; a flip across the y-axis swaps left and right. Which one lands on the dashed image?'
  }
  if (step.type === 'rotate-shape') {
    return 'Counterclockwise turns go up-and-to-the-left. Track a single corner: 90° is a quarter turn, 180° is a half turn, 270° is three quarters.'
  }
  return 'Re-read the question and check each part of your answer separately before submitting.'
}

interface LessonEngineProps {
  lesson: Lesson
  mode: LessonEngineMode
  initialStepIndex: number
  initialResults: StepResult[]
  onLessonStepsComplete: (results: StepResult[]) => void
  onExit: () => void
  onResetFromReview: () => void
  /** Called when a question is answered correctly on the first try with no help. */
  onXpEarned?: (id: string, amount: number) => void
}

function clampIndex(index: number, length: number): number {
  if (length <= 0) return 0
  return Math.max(0, Math.min(index, length - 1))
}

export function LessonEngine({
  lesson,
  mode,
  initialStepIndex,
  initialResults,
  onLessonStepsComplete,
  onExit,
  onResetFromReview,
  onXpEarned,
}: LessonEngineProps) {
  const { user } = useAuth()
  const flowSteps = mode === 'practice' ? lesson.practiceSteps : getLessonFlowSteps(lesson)
  const isReview = mode === 'review'

  const [stepIndex, setStepIndex] = useState(() => clampIndex(initialStepIndex, flowSteps.length))
  const [results, setResults] = useState<StepResult[]>(initialResults)
  const [feedback, setFeedback] = useState<FeedbackState>('idle')
  const [showWhy, setShowWhy] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [usedHelp, setUsedHelp] = useState(false)
  /**
   * Escalating hint level for the current question (stays on the SAME question):
   *   0 = none, 1 = general hand-written hint, 2 = guiding AI hint,
   *   3 = live directional guidance while dragging. Each wrong attempt unlocks
   *   one more level; after 3 wrong attempts the answer reveal takes over.
   */
  const [hintLevel, setHintLevel] = useState(0)
  /**
   * Adaptive loop state for the current step.
   * - questionIndex: 0 = the original question, 1+ = the Nth similar question.
   * - wrongStreak: wrong answers of this type since the last remediation.
   * - showRemediation: whether the deeper "break this down" lesson is on screen.
   */
  const [questionIndex, setQuestionIndex] = useState(0)
  const [wrongStreak, setWrongStreak] = useState(0)
  const [showRemediation, setShowRemediation] = useState(false)
  /**
   * A fresh, same-skill question (new numbers) generated for a wrong-answer
   * retry when the step has no authored `variants`. Stored in state so it stays
   * stable across re-renders; cleared when we advance to the next step.
   */
  const [generatedVariant, setGeneratedVariant] = useState<LessonStep | null>(null)

  /**
   * Global "struggle" tracking for the every-3 review interlude. `struggleCount`
   * counts wrong answers + hint requests across the whole lesson; `batchWrongIds`
   * remembers which questions were missed since the last review so we can offer
   * similar practice. When the interlude is showing, `pendingNext` holds the step
   * to resume on afterwards.
   */
  const [struggleCount, setStruggleCount] = useState(0)
  const [batchWrongIds, setBatchWrongIds] = useState<string[]>([])
  const [reviewActive, setReviewActive] = useState(false)
  const [pendingNext, setPendingNext] = useState<{ index: number; results: StepResult[] } | null>(
    null,
  )

  /**
   * Consecutive "needs help" tracking for the answer-reveal rescue. `helpRow`
   * counts questions in a row that needed help — a wrong answer OR a hint —
   * broken by a clean solve. `questionCounted` guards a question from adding to
   * `helpRow` more than once. `wrongStreak` counts misses on the current
   * question. When `wrongStreak` or `helpRow` hits STUCK_THRESHOLD, `stuckActive`
   * shows the rescue for the current question.
   */
  const [helpRow, setHelpRow] = useState(0)
  const [questionCounted, setQuestionCounted] = useState(false)
  const [stuckActive, setStuckActive] = useState(false)
  const [stuckReason, setStuckReason] = useState<'same' | 'row'>('same')
  /**
   * After a rescue, the learner must pass a freshly generated similar question
   * before the lesson advances. While `masteryStep` is set, it replaces the
   * current step on screen; getting it right advances, missing it 3 times
   * re-opens the rescue and then serves another similar question.
   */
  const [masteryStep, setMasteryStep] = useState<LessonStep | null>(null)

  /**
   * Problem ids that needed a rescue or remediation (the worked answer was shown
   * before the learner solved it). Because results are keyed to the original
   * step id and the rescue resets the per-question counters, we use this to mark
   * the final result as "not a clean solve" so it never counts toward mastery.
   */
  const assistedIdsRef = useRef<Set<string>>(new Set())

  const baseStep = flowSteps[stepIndex]
  const variants: LessonStep[] = (baseStep?.variants as LessonStep[] | undefined) ?? []
  const remediation: Remediation | undefined = baseStep?.remediation
  // The question currently on screen: a post-rescue mastery question, the
  // original, or a cycled "similar" variant.
  const activeStep: LessonStep | undefined = masteryStep
    ? masteryStep
    : baseStep && questionIndex > 0
      ? variants.length > 0
        ? ({
            ...variants[(questionIndex - 1) % variants.length],
            id: baseStep.id,
            type: baseStep.type,
          } as LessonStep)
        : (generatedVariant ?? baseStep)
      : baseStep

  const problemSteps = flowSteps.filter((s) => s.type !== 'confidence')
  const completedProblems = isReview ? stepIndex : results.filter((r) => r.correct).length

  if (!baseStep || !activeStep) {
    return (
      <div className="lesson-engine">
        <div className="lesson-body">
          <p className="lesson-prompt">Could not load this lesson step.</p>
          <button type="button" className="btn primary full" onClick={onExit}>
            Back to home
          </button>
        </div>
      </div>
    )
  }

  const resetFeedback = () => {
    setFeedback('idle')
    setShowWhy(false)
  }

  const persist = async (nextIndex: number, nextResults: StepResult[]) => {
    if (!user || mode !== 'normal') return
    await saveLessonProgress(user.uid, {
      lessonId: lesson.id,
      stepIndex: nextIndex,
      stepResults: nextResults,
      completed: false,
      updatedAt: new Date().toISOString(),
    })
  }

  const handleExit = () => {
    // Leaving mid-lesson is non-punitive: progress is already saved on every
    // step, so the learner resumes exactly where they left off with no XP loss.
    onExit()
  }

  const resetAdaptive = () => {
    setQuestionIndex(0)
    setWrongStreak(0)
    setShowRemediation(false)
    setHintLevel(0)
    setGeneratedVariant(null)
  }

  // A normal wrong-answer retry: serve a fresh question of the SAME skill with
  // new numbers instead of repeating the identical problem. The escalating help
  // ladder (wrongStreak/hintLevel) and attempt counters are intentionally kept,
  // so a multi-try solve still won't count as a clean mastery solve. Recall-style
  // steps that can't be auto-varied just re-show the same question.
  const retryWithFreshQuestion = () => {
    if (
      isProblemStep(baseStep) &&
      (variants.length > 0 || canMakeFreshVariant(baseStep))
    ) {
      if (variants.length === 0) setGeneratedVariant(makeSimilarStep(baseStep))
      setQuestionIndex((i) => i + 1)
    }
    resetFeedback()
  }

  const goToStep = async (next: number, nextResults: StepResult[]) => {
    if (next >= flowSteps.length) {
      if (mode === 'normal') {
        await persist(flowSteps.length, nextResults)
        onLessonStepsComplete(nextResults)
      } else {
        onExit()
      }
      return
    }

    setStepIndex(next)
    await persist(next, nextResults)
  }

  const advanceStep = async (nextResults: StepResult[]) => {
    const next = stepIndex + 1
    resetFeedback()
    setAttempts(0)
    setUsedHelp(false)
    resetAdaptive()
    setMasteryStep(null)
    setHelpRow(0)
    setQuestionCounted(false)

    // Every REVIEW_LESSON_THRESHOLD struggles (wrong answers / hint requests),
    // pause before the next question for a review interlude.
    if (!isReview && struggleCount >= REVIEW_LESSON_THRESHOLD) {
      setPendingNext({ index: next, results: nextResults })
      setReviewActive(true)
      return
    }

    await goToStep(next, nextResults)
  }

  const resumeAfterReview = async () => {
    const pending = pendingNext
    setReviewActive(false)
    setStruggleCount(0)
    setBatchWrongIds([])
    setPendingNext(null)
    if (pending) await goToStep(pending.index, pending.results)
  }

  // After the answer-reveal rescue, the learner must pass a fresh similar
  // question before advancing. Generate one and reset the per-question counters
  // (also resetting the every-3 review counter so it doesn't pile on).
  const handleStuckContinue = () => {
    if (baseStep) assistedIdsRef.current.add(baseStep.id)
    setStuckActive(false)
    setMasteryStep(makeSimilarStep(baseStep))
    setWrongStreak(0)
    setHelpRow(0)
    setQuestionCounted(false)
    setStruggleCount(0)
    setBatchWrongIds([])
    setQuestionIndex(0)
    setGeneratedVariant(null)
    setShowRemediation(false)
    setHintLevel(0)
    resetFeedback()
    setAttempts(0)
    setUsedHelp(false)
  }

  const recordResult = (correct: boolean, helpUsed: boolean) => {
    // A problem that required a rescue/remediation can never be a clean solve,
    // even though the post-rescue retry resets the attempt + help counters.
    const wasAssisted = !!baseStep && assistedIdsRef.current.has(baseStep.id)
    const entry: StepResult = {
      stepId: baseStep.id,
      correct,
      attempts: wasAssisted ? Math.max(attempts + 1, STUCK_THRESHOLD + 1) : attempts + 1,
      usedHelp: helpUsed || wasAssisted,
    }
    const filtered = results.filter((r) => r.stepId !== baseStep.id)
    const nextResults = [...filtered, entry]
    setResults(nextResults)
    return nextResults
  }

  const handleConfidence = async () => {
    const nextResults = recordResult(true, false)
    await advanceStep(nextResults)
  }

  // After the deeper lesson, serve a fresh question and reset the wrong-streak,
  // so the learner gets a clean run at mastering the concept.
  const handleRemediationContinue = () => {
    if (baseStep) assistedIdsRef.current.add(baseStep.id)
    setShowRemediation(false)
    setWrongStreak(0)
    setQuestionCounted(false)
    // Serve a fresh same-skill question (new numbers) after the deeper lesson.
    if (isProblemStep(baseStep) && variants.length === 0 && canMakeFreshVariant(baseStep)) {
      setGeneratedVariant(makeSimilarStep(baseStep))
    }
    setQuestionIndex((i) => i + 1)
    setHintLevel(0)
    resetFeedback()
    setAttempts(0)
    setUsedHelp(false)
  }

  // Review-mode navigation: step back and forth without recording or advancing.
  const reviewGo = (delta: number) => {
    const next = stepIndex + delta
    if (next < 0) return
    if (next >= flowSteps.length) {
      onExit()
      return
    }
    setStepIndex(next)
    resetFeedback()
    setAttempts(0)
    setUsedHelp(false)
    resetAdaptive()
    setMasteryStep(null)
  }

  const renderProblemActions = (
    check: () => boolean,
    resetProblem: () => void,
    extras?: ProblemExtras,
  ) => {
    const startOver = () => {
      resetProblem()
      resetFeedback()
      setUsedHelp(false)
    }

    if (isReview) {
      // In review, the shared Back / Next bar handles navigation, so problem steps
      // render their solved graph with no per-step action bar.
      return { startOver, bar: null }
    }

    // A wrong answer counts toward the wrong-streak; after STUCK_THRESHOLD misses
    // on the SAME question the worked-answer reveal takes over.
    const nextWrongStreak = wrongStreak + 1

    // Targeted-feedback extras (coordinate breakdown + sign-error diagnosis).
    const diagnosis = extras?.diagnose?.() ?? null
    const wrongDetail = diagnosis ? <SignErrorNote message={diagnosis} /> : undefined
    const correctDetail = extras?.correctDetail

    // Grounded context for the level-2 AI hint (problem steps only).
    const aiHintContext: HintContext | undefined = isProblemStep(activeStep)
      ? {
          prompt: activeStep.prompt,
          concept: activeStep.type,
          answer: computeGroundTruth(activeStep).text || answerTextFor(activeStep),
          staticHint: activeStep.hint,
          step: activeStep,
        }
      : undefined

    // Escalating hint ladder: each wrong attempt unlocks one level higher, capped
    // at 3 (with live directional guidance) for draggable problems, 2 otherwise.
    const hintCap = isProblemStep(activeStep) ? (isDraggableType(activeStep.type) ? 3 : 2) : 0
    const maxHintLevel = Math.min(hintCap, wrongStreak + 1)

    const advanceHint = () => {
      // The first hint marks the question as one that needed help (counts toward
      // the review interlude and the help-in-a-row rescue), but only once.
      if (!usedHelp) {
        setStruggleCount((c) => c + 1)
        if (!questionCounted) {
          setHelpRow((r) => r + 1)
          setQuestionCounted(true)
        }
      }
      setUsedHelp(true)
      setHintLevel((l) => Math.min(maxHintLevel, l + 1))
    }

    const hints =
      hintCap > 0
        ? {
            level: hintLevel,
            maxLevel: maxHintLevel,
            onGetHint: advanceHint,
            aiHint: aiHintContext,
            aiFallback: isProblemStep(activeStep) ? guidingFallback(activeStep) : '',
          }
        : undefined

    const bar = (
      <ActionBar
        feedback={feedback}
        insight={activeStep.insight}
        correctDetail={correctDetail}
        wrongDetail={wrongDetail}
        hints={hints}
        onCheck={() => {
          const ok = check()
          const firstTry = attempts === 0 && !usedHelp
          setAttempts((a) => a + 1)
          if (ok) {
            setFeedback('correct')
            recordResult(true, usedHelp)
            // XP only on a clean first pass of the original question — not after
            // running through similar questions, a mastery retry, or a rescue.
            if (firstTry && questionIndex === 0 && !masteryStep)
              onXpEarned?.(baseStep.id, XP_PER_QUESTION)
            // A question solved with no help (no wrong attempts and no hint) breaks
            // the consecutive needs-help run.
            if (!questionCounted) setHelpRow(0)
          } else {
            setWrongStreak(nextWrongStreak)
            // The first time a question needs help (wrong or hint) extends the
            // consecutive needs-help run — but only once per question.
            let nextRow = helpRow
            if (!questionCounted) {
              nextRow = helpRow + 1
              setHelpRow(nextRow)
              setQuestionCounted(true)
            }
            // Count this miss toward the every-3 review interlude.
            setStruggleCount((c) => c + 1)
            setBatchWrongIds((ids) => (ids.includes(baseStep.id) ? ids : [...ids, baseStep.id]))
            setFeedback('wrong')
            setShowWhy(false)
            // After 3 wrong attempts on this question, reveal the worked answer:
            // the authored remediation lesson if one exists, otherwise the
            // animated answer-reveal rescue. A run of help-needing questions in a
            // row also opens the rescue.
            if (isProblemStep(baseStep)) {
              if (nextWrongStreak >= STUCK_THRESHOLD) {
                if (remediation) {
                  setShowRemediation(true)
                } else {
                  setStuckReason('same')
                  setStuckActive(true)
                }
              } else if (nextRow >= STUCK_THRESHOLD) {
                setStuckReason('row')
                setStuckActive(true)
              }
            }
          }
        }}
        onTryAgain={retryWithFreshQuestion}
        onWhy={() => setShowWhy(true)}
        onContinue={async () => {
          // The correct result (with its true attempt count) was already recorded
          // when the answer was checked. Re-recording here would double-count the
          // attempt and wrongly mark a clean first try as a struggle, so just
          // advance with the results we already have.
          await advanceStep(results)
        }}
      />
    )

    return { startOver, bar }
  }

  // Recap of every question attempted so far, in answer order.
  const reviewRecap = results
    .map((r) => {
      const s = flowSteps.find((fs) => fs.id === r.stepId)
      return isProblemStep(s) ? { step: s, correct: r.correct } : null
    })
    .filter((x): x is { step: ProblemStep; correct: boolean } => x !== null)

  // Fresh "similar" questions built from the ones missed since the last review.
  const reviewSimilar: LessonStep[] = batchWrongIds
    .map((id) => flowSteps.find((s) => s.id === id))
    .filter(isProblemStep)
    .map((s) => {
      const variant = s.variants?.[0]
      return variant
        ? ({ ...variant, id: `${s.id}-review`, type: s.type } as LessonStep)
        : ({ ...s, id: `${s.id}-review` } as LessonStep)
    })

  return (
    <div className="lesson-engine">
      <header className="lesson-header">
        <button type="button" className="back-btn" onClick={handleExit}>
          ←
        </button>
        <ProgressBar current={completedProblems} total={problemSteps.length} />
      </header>

      <div className="lesson-body">
        {mode === 'practice' && <p className="lesson-check-label">Practice</p>}
        {isReview && <p className="lesson-check-label">Review</p>}
        {stuckActive && isProblemStep(activeStep) ? (
          <StuckRescue
            step={activeStep}
            reason={stuckReason}
            onContinue={handleStuckContinue}
          />
        ) : reviewActive ? (
          <ReviewInterlude
            key={`review-${pendingNext?.index ?? 0}`}
            recap={reviewRecap}
            similar={reviewSimilar}
            onComplete={() => void resumeAfterReview()}
          />
        ) : showRemediation && remediation ? (
          <>
            <h1 className="lesson-step-title">{remediation.title}</h1>
            <RemediationScreen remediation={remediation} onContinue={handleRemediationContinue} />
          </>
        ) : (
          <>
            <h1 className="lesson-step-title">{activeStep.title}</h1>
            {masteryStep ? (
              <p className="similar-question-note">
                Your turn — get this one right to show you&rsquo;ve got it, then we&rsquo;ll move on.
              </p>
            ) : (
              questionIndex > 0 && (
                <p className="similar-question-note">
                  Here&rsquo;s another one of the same type — give it a go.
                </p>
              )
            )}
            <StepContent
              key={`${stepIndex}-${questionIndex}-${masteryStep ? masteryStep.id : 'base'}`}
              step={activeStep}
              isReview={isReview}
              showHelpHint={hintLevel >= 1}
              showWhy={showWhy}
              liveHint={hintLevel >= 3}
              onConfidence={() => void handleConfidence()}
              renderProblemActions={renderProblemActions}
            />
            {isReview && (
              <div className="review-nav">
                <button
                  type="button"
                  className="btn secondary flex"
                  onClick={() => reviewGo(-1)}
                  disabled={stepIndex === 0}
                >
                  ← Back
                </button>
                <button type="button" className="btn primary flex" onClick={() => reviewGo(1)}>
                  {stepIndex >= flowSteps.length - 1 ? 'Finish review' : 'Next →'}
                </button>
              </div>
            )}
            {isReview && <ResetLessonButton onClick={onResetFromReview} />}
          </>
        )}
      </div>
    </div>
  )
}

function RemediationScreen({
  remediation,
  onContinue,
}: {
  remediation: Remediation
  onContinue: () => void
}) {
  return (
    <>
      <p className="lesson-check-label">Let&rsquo;s break this down</p>
      <p className="lesson-prompt">{remediation.body}</p>
      {(remediation.graph || remediation.visual) && (
        <div className="concept-visual">
          {remediation.graph ? (
            <GraphView spec={remediation.graph} />
          ) : remediation.visual === 'vertex' ? (
            <VertexDemo />
          ) : remediation.visual === 'translation' ? (
            <TranslationDemo />
          ) : null}
        </div>
      )}
      {remediation.tips.length > 0 && (
        <div className="remediation-tips">
          <p className="remediation-tips-title">Tips &amp; tricks</p>
          <ul className="remediation-tips-list">
            {remediation.tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
      <button type="button" className="btn primary full" onClick={onContinue}>
        Try a question to master it
      </button>
    </>
  )
}

/** A lesson step that poses a question (has a prompt, explanation, and hint). */
type ProblemStep = Extract<LessonStep, { prompt: string; why: string; hint: string }>

function isProblemStep(step: LessonStep | undefined): step is ProblemStep {
  return !!step && 'prompt' in step && 'why' in step && 'hint' in step
}

/**
 * The every-3-struggles review interlude. First it recaps every question
 * answered so far (with the worked explanation) and consolidates tips for the
 * ones missed, then it serves fresh "similar" questions built from the missed
 * problems so the learner re-attempts the skill before resuming the lesson.
 */
function ReviewInterlude({
  recap,
  similar,
  onComplete,
}: {
  recap: { step: ProblemStep; correct: boolean }[]
  similar: LessonStep[]
  onComplete: () => void
}) {
  const [phase, setPhase] = useState<'recap' | 'practice'>('recap')
  const [qIndex, setQIndex] = useState(0)
  const [feedback, setFeedback] = useState<FeedbackState>('idle')
  const [showWhy, setShowWhy] = useState(false)
  const [showHelpHint, setShowHelpHint] = useState(false)

  const tips = Array.from(
    new Set(recap.filter((r) => !r.correct).map((r) => r.step.hint).filter(Boolean)),
  )

  const goNextQuestion = () => {
    if (qIndex + 1 >= similar.length) {
      onComplete()
      return
    }
    setQIndex((i) => i + 1)
    setFeedback('idle')
    setShowWhy(false)
    setShowHelpHint(false)
  }

  const renderInterludeActions = (check: () => boolean, resetProblem: () => void) => {
    const startOver = () => {
      resetProblem()
      setFeedback('idle')
      setShowWhy(false)
      setShowHelpHint(false)
    }
    const isLast = qIndex + 1 >= similar.length
    const bar =
      feedback === 'correct' ? (
        <div className="action-bar">
          <div className="feedback-banner correct">
            <span className="feedback-banner-title">Nice — you&rsquo;ve got it!</span>
          </div>
          <button type="button" className="btn primary full" onClick={goNextQuestion}>
            {isLast ? 'Back to the lesson' : 'Next question'}
          </button>
        </div>
      ) : feedback === 'wrong' ? (
        <div className="action-bar">
          <div className="feedback-banner wrong">Not quite — check the explanation above.</div>
          <div className="action-bar-row">
            <button type="button" className="btn primary flex" onClick={startOver}>
              Try again
            </button>
            <button type="button" className="btn secondary" onClick={goNextQuestion}>
              {isLast ? 'Finish review' : 'Skip'}
            </button>
          </div>
        </div>
      ) : (
        <div className="action-bar">
          <div className="action-bar-row">
            <button
              type="button"
              className="btn primary flex"
              onClick={() => {
                const ok = check()
                setFeedback(ok ? 'correct' : 'wrong')
                if (!ok) setShowWhy(true)
              }}
            >
              Check
            </button>
            <button
              type="button"
              className="btn secondary"
              onClick={() => setShowHelpHint(true)}
            >
              Get a hint
            </button>
          </div>
        </div>
      )
    return { startOver, bar }
  }

  if (phase === 'recap') {
    return (
      <>
        <p className="lesson-check-label">Quick review</p>
        <h1 className="lesson-step-title">Let&rsquo;s review what we&rsquo;ve covered</h1>
        <p className="lesson-prompt">
          You&rsquo;ve hit a few tricky ones — here&rsquo;s a look back at the questions so far with
          the worked-out reasoning, plus tips before you try a couple more.
        </p>

        <div className="review-recap">
          {recap.map(({ step, correct }, i) => (
            <div className={`review-recap-item ${correct ? 'ok' : 'miss'}`} key={i}>
              <div className="review-recap-head">
                <span className="review-recap-badge">{correct ? '✓' : '✗'}</span>
                <span className="review-recap-prompt">{step.prompt}</span>
              </div>
              <p className="review-recap-why">{step.why}</p>
            </div>
          ))}
        </div>

        {tips.length > 0 && (
          <div className="remediation-tips">
            <p className="remediation-tips-title">Tips &amp; tricks</p>
            <ul className="remediation-tips-list">
              {tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="button"
          className="btn primary full"
          onClick={() => (similar.length > 0 ? setPhase('practice') : onComplete())}
        >
          {similar.length > 0 ? 'Try similar questions' : 'Back to the lesson'}
        </button>
      </>
    )
  }

  const current = similar[qIndex]
  if (!current) {
    return (
      <>
        <p className="lesson-prompt">Great work reviewing — let&rsquo;s keep going.</p>
        <button type="button" className="btn primary full" onClick={onComplete}>
          Back to the lesson
        </button>
      </>
    )
  }

  return (
    <>
      <p className="lesson-check-label">
        Practice {qIndex + 1} of {similar.length}
      </p>
      <h1 className="lesson-step-title">Now try one like it</h1>
      <StepContent
        key={`review-q-${qIndex}`}
        step={current}
        isReview={false}
        showHelpHint={showHelpHint}
        showWhy={showWhy}
        onConfidence={goNextQuestion}
        renderProblemActions={renderInterludeActions}
      />
    </>
  )
}

/** The translation a step's answer represents, for the animated reveal. */
function revealFor(
  step: ProblemStep,
): { shape: [number, number][]; dx: number; dy: number } | null {
  if (step.type === 'move-point') {
    return {
      shape: [step.start],
      dx: step.target[0] - step.start[0],
      dy: step.target[1] - step.start[1],
    }
  }
  if (step.type === 'drag-shape' || step.type === 'translate-by') {
    return { shape: step.shape, dx: step.targetDx, dy: step.targetDy }
  }
  if (step.type === 'translation-input') {
    const a = step.points[0]
    const b = step.goalPoints[0]
    if (a && b) return { shape: step.points, dx: b[0] - a[0], dy: b[1] - a[1] }
  }
  return null
}

/** A short, plain-language statement of the correct answer. */
function answerText(step: ProblemStep): string {
  switch (step.type) {
    case 'move-point':
      return `The image lands at (${step.target[0]}, ${step.target[1]}).`
    case 'drag-shape':
    case 'translate-by':
      return `Slide every point by (${step.targetDx}, ${step.targetDy}).`
    case 'translation-input': {
      const a = step.points[0]
      const b = step.goalPoints[0]
      return a && b ? `Slide by (${b[0] - a[0]}, ${b[1] - a[1]}).` : ''
    }
    case 'number-input':
      return step.answers[0] ? `The answer is ${step.answers[0]}.` : ''
    case 'multiple-choice':
      return `The answer is “${step.options[step.correctIndex]}”.`
    case 'reflect-shape':
      return `Reflect the shape across the ${step.axis}-axis (negate ${
        step.axis === 'x' ? 'each y' : 'each x'
      }-coordinate).`
    case 'reflect-plot': {
      const img = reflectPoints([step.point], step.axis)[0]!
      return `Across the ${step.axis}-axis, (${step.point[0]}, ${step.point[1]}) reflects to (${img[0]}, ${img[1]}).`
    }
    case 'rotate-shape':
      return `Rotate the shape ${step.degrees}° counterclockwise about the origin.`
    default:
      return ''
  }
}

/** Looping reveal: the figure slides from its start onto the correct image. */
function AnswerSlideReveal({
  shape,
  dx,
  dy,
}: {
  shape: [number, number][]
  dx: number
  dy: number
}) {
  const scale = GRAPH_SIZE / (GRAPH_RANGE * 2)
  const moved = shape.map(([x, y]) => [x + dx, y + dy] as [number, number])
  return (
    <div className="concept-visual">
      <CoordinatePlane>
        <ShapeGlyph shape={shape} color="#475569" />
        <ShapeGlyph shape={moved} color="#38bdf8" dashed />
        <g
          className="reveal-mover"
          style={{ '--rx': `${dx * scale}px`, '--ry': `${-dy * scale}px` } as React.CSSProperties}
        >
          <ShapeGlyph shape={shape} color="#38bdf8" />
        </g>
      </CoordinatePlane>
    </div>
  )
}

/**
 * Answer-reveal rescue shown after 3 misses on a question (or 3 questions
 * missed in a row). It states the correct answer, animates the exact move on
 * that question, and walks through the reasoning before the learner continues.
 */
function StuckRescue({
  step,
  reason,
  onContinue,
}: {
  step: ProblemStep
  reason: 'same' | 'row'
  onContinue: () => void
}) {
  const reveal = revealFor(step)
  const answer = answerText(step)
  return (
    <>
      <p className="lesson-check-label">Let&rsquo;s break this down</p>
      <h1 className="lesson-step-title">No worries — here&rsquo;s how this one works</h1>
      <p className="lesson-prompt muted">
        {reason === 'same'
          ? 'That one was tricky. Let’s walk through the answer together.'
          : 'A few tough ones in a row — let’s slow down and work this one out.'}
      </p>
      <p className="lesson-prompt">{step.prompt}</p>

      {reveal && <AnswerSlideReveal shape={reveal.shape} dx={reveal.dx} dy={reveal.dy} />}

      {answer && (
        <div className="answer-reveal-callout">
          <span className="answer-reveal-label">The answer</span>
          <p className="answer-reveal-text">{answer}</p>
        </div>
      )}

      <div className="remediation-tips">
        <p className="remediation-tips-title">Why it works</p>
        <p className="lesson-prompt">{step.why}</p>
      </div>

      {step.hint && (
        <div className="remediation-tips">
          <p className="remediation-tips-title">Tip for next time</p>
          <ul className="remediation-tips-list">
            <li>{step.hint}</li>
          </ul>
        </div>
      )}

      <button type="button" className="btn primary full" onClick={onContinue}>
        Got it — keep going
      </button>
    </>
  )
}

interface StepContentProps {
  step: LessonStep
  isReview: boolean
  showHelpHint: boolean
  showWhy: boolean
  /** Level-3 live directional guidance is active (draggable problems only). */
  liveHint?: boolean
  onConfidence: () => void
  renderProblemActions: (
    check: () => boolean,
    resetProblem: () => void,
    extras?: ProblemExtras,
  ) => {
    startOver: () => void
    bar: React.ReactNode
  }
}

function StepContent({
  step,
  isReview,
  showHelpHint,
  showWhy,
  liveHint,
  onConfidence,
  renderProblemActions,
}: StepContentProps) {
  if (step.type === 'confidence') {
    return (
      <>
        <p className="lesson-prompt">{step.question}</p>
        {/* In review the shared Back / Next bar handles navigation. */}
        {!isReview && <ConfidencePicker onSelect={() => onConfidence()} />}
      </>
    )
  }

  if (step.type === 'concept') {
    return (
      <>
        <p className="lesson-prompt">{step.body}</p>
        <div className="concept-visual">
          {step.graph ? (
            <GraphView spec={step.graph} />
          ) : step.visual === 'vertex' ? (
            <VertexDemo />
          ) : step.visual === 'translation' ? (
            <TranslationDemo />
          ) : null}
        </div>
        {/* In review the shared Back / Next bar handles navigation. */}
        {!isReview && (
          <button type="button" className="btn primary full" onClick={onConfidence}>
            Got it — continue
          </button>
        )}
      </>
    )
  }

  if (step.type === 'complete') {
    return null
  }

  if (step.type === 'multiple-choice') {
    return (
      <MultipleChoiceProblem
        step={step}
        isReview={isReview}
        showHelpHint={showHelpHint}
        showWhy={showWhy}
        renderProblemActions={renderProblemActions}
      />
    )
  }

  if (step.type === 'number-input') {
    return (
      <NumberInputProblem
        step={step}
        isReview={isReview}
        showHelpHint={showHelpHint}
        showWhy={showWhy}
        renderProblemActions={renderProblemActions}
      />
    )
  }

  if (step.type === 'line-builder') {
    return (
      <LineBuilderProblem
        step={step}
        isReview={isReview}
        showHelpHint={showHelpHint}
        showWhy={showWhy}
        renderProblemActions={renderProblemActions}
      />
    )
  }

  if (step.type === 'balance-scale') {
    return (
      <BalanceScaleProblem
        step={step}
        isReview={isReview}
        showHelpHint={showHelpHint}
        showWhy={showWhy}
        renderProblemActions={renderProblemActions}
      />
    )
  }

  if (step.type === 'number-line') {
    return (
      <NumberLineProblem
        step={step}
        isReview={isReview}
        showHelpHint={showHelpHint}
        showWhy={showWhy}
        renderProblemActions={renderProblemActions}
      />
    )
  }

  if (step.type === 'function-machine') {
    return (
      <FunctionMachineProblem
        step={step}
        isReview={isReview}
        showHelpHint={showHelpHint}
        showWhy={showWhy}
        renderProblemActions={renderProblemActions}
      />
    )
  }

  if (step.type === 'slope-discovery') {
    return (
      <SlopeDiscoveryProblem
        step={step}
        isReview={isReview}
        showHelpHint={showHelpHint}
        showWhy={showWhy}
        renderProblemActions={renderProblemActions}
      />
    )
  }

  if (step.type === 'move-point') {
    return (
      <MovePointProblem
        step={step}
        isReview={isReview}
        showHelpHint={showHelpHint}
        showWhy={showWhy}
        liveHint={liveHint}
        renderProblemActions={renderProblemActions}
      />
    )
  }

  if (step.type === 'find-vertex') {
    return (
      <FindVertexProblem
        step={step}
        isReview={isReview}
        showHelpHint={showHelpHint}
        showWhy={showWhy}
        renderProblemActions={renderProblemActions}
      />
    )
  }

  if (step.type === 'translation-input') {
    return (
      <TranslationInputProblem
        step={step}
        isReview={isReview}
        showHelpHint={showHelpHint}
        showWhy={showWhy}
        liveHint={liveHint}
        renderProblemActions={renderProblemActions}
      />
    )
  }

  if (step.type === 'translate-by') {
    return (
      <TranslateByProblem
        step={step}
        isReview={isReview}
        showHelpHint={showHelpHint}
        showWhy={showWhy}
        liveHint={liveHint}
        renderProblemActions={renderProblemActions}
      />
    )
  }

  if (step.type === 'drag-shape') {
    return (
      <DragShapeProblem
        step={step}
        isReview={isReview}
        showHelpHint={showHelpHint}
        showWhy={showWhy}
        liveHint={liveHint}
        renderProblemActions={renderProblemActions}
      />
    )
  }

  if (step.type === 'reflect-shape') {
    return (
      <ReflectShapeProblem
        step={step}
        isReview={isReview}
        showHelpHint={showHelpHint}
        showWhy={showWhy}
        renderProblemActions={renderProblemActions}
      />
    )
  }

  if (step.type === 'reflect-plot') {
    return (
      <ReflectPlotProblem
        step={step}
        isReview={isReview}
        showHelpHint={showHelpHint}
        showWhy={showWhy}
        renderProblemActions={renderProblemActions}
      />
    )
  }

  if (step.type === 'rotate-shape') {
    return (
      <RotateShapeProblem
        step={step}
        isReview={isReview}
        showHelpHint={showHelpHint}
        showWhy={showWhy}
        renderProblemActions={renderProblemActions}
      />
    )
  }

  return null
}

function DragShapeProblem({
  step,
  isReview,
  showHelpHint,
  showWhy,
  liveHint,
  renderProblemActions,
}: {
  step: DragShapeStep
  isReview: boolean
  showHelpHint: boolean
  showWhy: boolean
  liveHint?: boolean
  renderProblemActions: StepContentProps['renderProblemActions']
}) {
  const solved: [number, number] = [step.targetDx, step.targetDy]
  const [offset, setOffset] = useState<[number, number]>(isReview ? solved : [0, 0])
  const [predicted, setPredicted] = useState(isReview)

  const reset = () => setOffset([0, 0])
  const check = () => offset[0] === step.targetDx && offset[1] === step.targetDy
  const extras: ProblemExtras = {
    diagnose: () => signErrorMessage(offset[0], offset[1], step.targetDx, step.targetDy),
    correctDetail: (
      <CoordinateChangeTable
        changes={coordinateChanges(step.shape, step.targetDx, step.targetDy)}
        dx={step.targetDx}
        dy={step.targetDy}
      />
    ),
  }

  if (!isReview && step.prediction && !predicted) {
    return <PredictionGate prediction={step.prediction} onContinue={() => setPredicted(true)} />
  }

  const { startOver, bar } = renderProblemActions(check, reset, extras)

  const showTarget = step.showTarget !== false
  const goal = step.shape.map(
    ([x, y]) => [x + step.targetDx, y + step.targetDy] as [number, number],
  )

  return (
    <>
      {!isReview && <StartOverButton onClick={startOver} />}
      <p className="lesson-prompt">{step.prompt}</p>
      {showHelpHint && <HelpHint text={step.hint} />}
      {showWhy && <WhyExplanation text={step.why} />}
      <CoordinatePlane>
        {showTarget && <ShapeGlyph shape={goal} color="#64748b" dashed />}
        <ShapeGlyph shape={step.shape} color="#1e3a5f" opacity={0.5} />
        <DraggableShape
          shape={step.shape}
          dx={offset[0]}
          dy={offset[1]}
          onMove={isReview ? () => {} : (dx, dy) => setOffset([dx, dy])}
        />
      </CoordinatePlane>
      {liveHint && (
        <LiveDirectionHint
          message={directionalGuidance(offset[0], offset[1], step.targetDx, step.targetDy)}
        />
      )}
      {bar}
    </>
  )
}

function ReflectShapeProblem({
  step,
  isReview,
  showHelpHint,
  showWhy,
  renderProblemActions,
}: {
  step: ReflectShapeStep
  isReview: boolean
  showHelpHint: boolean
  showWhy: boolean
  renderProblemActions: StepContentProps['renderProblemActions']
}) {
  const [picked, setPicked] = useState<'x' | 'y' | null>(isReview ? step.axis : null)
  const [predicted, setPredicted] = useState(isReview)

  const reset = () => setPicked(null)
  const check = () => picked === step.axis
  const extras: ProblemExtras = {
    diagnose: () => reflectErrorMessage(picked, step.axis),
    correctDetail: (
      <TransformRuleNote
        rule={reflectionRule(step.axis)}
        maps={reflectionMap(step.shape, step.axis)}
      />
    ),
  }

  if (!isReview && step.prediction && !predicted) {
    return <PredictionGate prediction={step.prediction} onContinue={() => setPredicted(true)} />
  }

  const { startOver, bar } = renderProblemActions(check, reset, extras)
  const target = reflectPoints(step.shape, step.axis)
  const current = picked ? reflectPoints(step.shape, picked) : step.shape

  return (
    <>
      {!isReview && <StartOverButton onClick={startOver} />}
      <p className="lesson-prompt">{step.prompt}</p>
      {showHelpHint && <HelpHint text={step.hint} />}
      {showWhy && <WhyExplanation text={step.why} />}
      <CoordinatePlane>
        <ShapeGlyph shape={target} color="#64748b" dashed />
        <ShapeGlyph shape={step.shape} color="#1e3a5f" opacity={0.5} />
        <g className="transform-pop" key={picked ?? 'start'}>
          <ShapeGlyph shape={current} color="#38bdf8" />
        </g>
      </CoordinatePlane>
      <div className="transform-choices" role="group" aria-label="Choose a reflection">
        <button
          type="button"
          className={`transform-choice ${picked === 'x' ? 'active' : ''}`}
          onClick={() => !isReview && setPicked('x')}
          disabled={isReview}
        >
          <span className="transform-choice-icon" aria-hidden="true">⇅</span>
          Across x-axis
        </button>
        <button
          type="button"
          className={`transform-choice ${picked === 'y' ? 'active' : ''}`}
          onClick={() => !isReview && setPicked('y')}
          disabled={isReview}
        >
          <span className="transform-choice-icon" aria-hidden="true">⇄</span>
          Across y-axis
        </button>
      </div>
      {bar}
    </>
  )
}

function ReflectPlotProblem({
  step,
  isReview,
  showHelpHint,
  showWhy,
  renderProblemActions,
}: {
  step: ReflectPlotStep
  isReview: boolean
  showHelpHint: boolean
  showWhy: boolean
  renderProblemActions: StepContentProps['renderProblemActions']
}) {
  const image = reflectPoints([step.point], step.axis)[0]!
  // Start the draggable point ON the pre-image so the learner must move it to
  // the reflected position. In review, show it already solved at the image.
  const [pos, setPos] = useState<[number, number]>(isReview ? image : step.point)

  const reset = () => setPos(step.point)
  const check = () => pointsEqual(pos, image)
  const extras: ProblemExtras = {
    diagnose: () => reflectPlotMessage(pos, step.point, step.axis),
    correctDetail: (
      <TransformRuleNote
        rule={reflectionRule(step.axis)}
        maps={reflectionMap([step.point], step.axis)}
      />
    ),
  }

  const { startOver, bar } = renderProblemActions(check, reset, extras)

  // Emphasise the mirror line so the learner can see what they're flipping over.
  const mirror =
    step.axis === 'x'
      ? { x1: 0, y1: GRAPH_SIZE / 2, x2: GRAPH_SIZE, y2: GRAPH_SIZE / 2 }
      : { x1: GRAPH_SIZE / 2, y1: 0, x2: GRAPH_SIZE / 2, y2: GRAPH_SIZE }

  return (
    <>
      {!isReview && <StartOverButton onClick={startOver} />}
      <p className="lesson-prompt">{step.prompt}</p>
      {showHelpHint && <HelpHint text={step.hint} />}
      {showWhy && <WhyExplanation text={step.why} />}
      <CoordinatePlane>
        <line
          x1={mirror.x1}
          y1={mirror.y1}
          x2={mirror.x2}
          y2={mirror.y2}
          stroke="#f472b6"
          strokeWidth={2}
          strokeDasharray="2 4"
          opacity={0.7}
        />
        <StaticPoint x={step.point[0]} y={step.point[1]} color="#64748b" label="original" />
        <DraggablePoint
          x={pos[0]}
          y={pos[1]}
          color="#f472b6"
          onMove={isReview ? () => {} : (x, y) => setPos([x, y])}
          label="image"
        />
      </CoordinatePlane>
      {bar}
    </>
  )
}

function RotateShapeProblem({
  step,
  isReview,
  showHelpHint,
  showWhy,
  renderProblemActions,
}: {
  step: RotateShapeStep
  isReview: boolean
  showHelpHint: boolean
  showWhy: boolean
  renderProblemActions: StepContentProps['renderProblemActions']
}) {
  const [picked, setPicked] = useState<90 | 180 | 270 | null>(isReview ? step.degrees : null)
  const [predicted, setPredicted] = useState(isReview)

  const reset = () => setPicked(null)
  const check = () => picked === step.degrees
  const extras: ProblemExtras = {
    diagnose: () => rotateErrorMessage(picked, step.degrees),
    correctDetail: (
      <TransformRuleNote
        rule={rotationRule(step.degrees)}
        maps={rotationMap(step.shape, step.degrees)}
      />
    ),
  }

  if (!isReview && step.prediction && !predicted) {
    return <PredictionGate prediction={step.prediction} onContinue={() => setPredicted(true)} />
  }

  const { startOver, bar } = renderProblemActions(check, reset, extras)
  const target = rotatePoints(step.shape, step.degrees)
  const current = picked ? rotatePoints(step.shape, picked) : step.shape
  const options: (90 | 180 | 270)[] = [90, 180, 270]

  return (
    <>
      {!isReview && <StartOverButton onClick={startOver} />}
      <p className="lesson-prompt">{step.prompt}</p>
      {showHelpHint && <HelpHint text={step.hint} />}
      {showWhy && <WhyExplanation text={step.why} />}
      <CoordinatePlane>
        <ShapeGlyph shape={target} color="#64748b" dashed />
        <ShapeGlyph shape={step.shape} color="#1e3a5f" opacity={0.5} />
        <g className="transform-pop" key={picked ?? 'start'}>
          <ShapeGlyph shape={current} color="#38bdf8" />
        </g>
      </CoordinatePlane>
      <div className="transform-choices" role="group" aria-label="Choose a rotation">
        {options.map((deg) => (
          <button
            key={deg}
            type="button"
            className={`transform-choice ${picked === deg ? 'active' : ''}`}
            onClick={() => !isReview && setPicked(deg)}
            disabled={isReview}
          >
            <span className="transform-choice-icon" aria-hidden="true">↺</span>
            {deg}°
          </button>
        ))}
      </div>
      {bar}
    </>
  )
}

function MovePointProblem({
  step,
  isReview,
  showHelpHint,
  showWhy,
  liveHint,
  renderProblemActions,
}: {
  step: MovePointStep
  isReview: boolean
  showHelpHint: boolean
  showWhy: boolean
  liveHint?: boolean
  renderProblemActions: StepContentProps['renderProblemActions']
}) {
  const initial: [number, number] = isReview ? step.target : step.start
  const [pos, setPos] = useState<[number, number]>(initial)
  const [predicted, setPredicted] = useState(isReview)

  const reset = () => setPos(step.start)
  const check = () => pointsEqual(pos, step.target)
  const extras: ProblemExtras = {
    diagnose: () =>
      signErrorMessage(
        pos[0] - step.start[0],
        pos[1] - step.start[1],
        step.target[0] - step.start[0],
        step.target[1] - step.start[1],
      ),
    correctDetail: (
      <CoordinateChangeTable
        changes={coordinateChanges(
          [step.start],
          step.target[0] - step.start[0],
          step.target[1] - step.start[1],
        )}
        dx={step.target[0] - step.start[0]}
        dy={step.target[1] - step.start[1]}
      />
    ),
  }

  if (!isReview && step.prediction && !predicted) {
    return <PredictionGate prediction={step.prediction} onContinue={() => setPredicted(true)} />
  }

  const { startOver, bar } = renderProblemActions(check, reset, extras)

  return (
    <>
      {!isReview && <StartOverButton onClick={startOver} />}
      <p className="lesson-prompt">{step.prompt}</p>
      {showHelpHint && <HelpHint text={step.hint} />}
      {showWhy && <WhyExplanation text={step.why} />}
      <CoordinatePlane>
        {step.line && (
          <LinePath
            m={step.line.m}
            b={step.line.b}
            color="#94a3b8"
            dashed
            label={step.lineLabel}
          />
        )}
        <StaticPoint x={step.start[0]} y={step.start[1]} color="#64748b" label="start" />
        <DraggablePoint
          x={pos[0]}
          y={pos[1]}
          onMove={isReview ? () => {} : (x, y) => setPos([x, y])}
          label="P"
        />
      </CoordinatePlane>
      {liveHint && (
        <LiveDirectionHint
          message={directionalGuidance(
            pos[0] - step.start[0],
            pos[1] - step.start[1],
            step.target[0] - step.start[0],
            step.target[1] - step.start[1],
          )}
        />
      )}
      {bar}
    </>
  )
}

function FindVertexProblem({
  step,
  isReview,
  showHelpHint,
  showWhy,
  renderProblemActions,
}: {
  step: FindVertexStep
  isReview: boolean
  showHelpHint: boolean
  showWhy: boolean
  renderProblemActions: StepContentProps['renderProblemActions']
}) {
  const solved: [number, number] = [step.h, step.k]
  const initial: [number, number] = isReview ? solved : [0, 4]
  const [pos, setPos] = useState<[number, number]>(initial)

  const reset = () => setPos([0, 4])
  const check = () => pointsEqual(pos, solved)
  const { startOver, bar } = renderProblemActions(check, reset)

  return (
    <>
      {!isReview && <StartOverButton onClick={startOver} />}
      <p className="lesson-prompt">{step.prompt}</p>
      {showHelpHint && <HelpHint text={step.hint} />}
      {showWhy && <WhyExplanation text={step.why} />}
      <CoordinatePlane>
        <ParabolaPath h={step.h} k={step.k} a={step.a} xMin={step.xMin} xMax={step.xMax} />
        <DraggablePoint
          x={pos[0]}
          y={pos[1]}
          color="#f97316"
          onMove={isReview ? () => {} : (x, y) => setPos([x, y])}
          label="V"
        />
      </CoordinatePlane>
      {bar}
    </>
  )
}

function TranslationInputProblem({
  step,
  isReview,
  showHelpHint,
  showWhy,
  liveHint,
  renderProblemActions,
}: {
  step: TranslationInputStep
  isReview: boolean
  showHelpHint: boolean
  showWhy: boolean
  liveHint?: boolean
  renderProblemActions: StepContentProps['renderProblemActions']
}) {
  const reviewDx = step.goalPoints[0]![0] - step.points[0]![0]
  const reviewDy = step.goalPoints[0]![1] - step.points[0]![1]

  const [inputDx, setInputDx] = useState(isReview ? String(reviewDx) : '')
  const [inputDy, setInputDy] = useState(isReview ? String(reviewDy) : '')
  const [predicted, setPredicted] = useState(isReview)

  const reset = () => {
    setInputDx('')
    setInputDy('')
  }

  const parsedDx = parseInt(inputDx, 10)
  const parsedDy = parseInt(inputDy, 10)
  const moved =
    !Number.isNaN(parsedDx) && !Number.isNaN(parsedDy)
      ? step.points.map(([x, y]) => [x + parsedDx, y + parsedDy] as [number, number])
      : step.points

  const check = () =>
    !Number.isNaN(parsedDx) &&
    !Number.isNaN(parsedDy) &&
    step.goalPoints.every((g, i) => pointsEqual(g, moved[i]!))

  const extras: ProblemExtras = {
    diagnose: () =>
      signErrorMessage(
        Number.isNaN(parsedDx) ? 0 : parsedDx,
        Number.isNaN(parsedDy) ? 0 : parsedDy,
        reviewDx,
        reviewDy,
      ),
    correctDetail: (
      <CoordinateChangeTable
        changes={coordinateChanges(step.points, reviewDx, reviewDy)}
        dx={reviewDx}
        dy={reviewDy}
      />
    ),
  }

  if (!isReview && step.prediction && !predicted) {
    return <PredictionGate prediction={step.prediction} onContinue={() => setPredicted(true)} />
  }

  const { startOver, bar } = renderProblemActions(check, reset, extras)

  return (
    <>
      {!isReview && <StartOverButton onClick={startOver} />}
      <p className="lesson-prompt">{step.prompt}</p>
      {showHelpHint && <HelpHint text={step.hint} />}
      {showWhy && <WhyExplanation text={step.why} />}
      <div className="translation-inputs">
        <label>
          Δx
          <input
            type="number"
            value={inputDx}
            onChange={(e) => setInputDx(e.target.value)}
            placeholder="0"
            readOnly={isReview}
          />
        </label>
        <label>
          Δy
          <input
            type="number"
            value={inputDy}
            onChange={(e) => setInputDy(e.target.value)}
            placeholder="0"
            readOnly={isReview}
          />
        </label>
      </div>
      <CoordinatePlane>
        <Polygon points={step.goalPoints} color="#94a3b8" dashed />
        <Polygon points={moved} color="#38bdf8" />
      </CoordinatePlane>
      {liveHint && (
        <LiveDirectionHint
          message={directionalGuidance(
            Number.isNaN(parsedDx) ? 0 : parsedDx,
            Number.isNaN(parsedDy) ? 0 : parsedDy,
            reviewDx,
            reviewDy,
          )}
        />
      )}
      {bar}
    </>
  )
}

const PX_PER_UNIT = GRAPH_SIZE / (GRAPH_RANGE * 2)

function TranslateByProblem({
  step,
  isReview,
  showHelpHint,
  showWhy,
  liveHint,
  renderProblemActions,
}: {
  step: TranslateByStep
  isReview: boolean
  showHelpHint: boolean
  showWhy: boolean
  liveHint?: boolean
  renderProblemActions: StepContentProps['renderProblemActions']
}) {
  const axis = step.axis ?? 'both'
  const min = step.min ?? -5
  const max = step.max ?? 5
  const lockedDx = axis === 'y' ? step.targetDx : 0
  const lockedDy = axis === 'x' ? step.targetDy : 0

  // null = box not yet filled. Locked axes start at their fixed value.
  const [dx, setDx] = useState<number | null>(
    isReview ? step.targetDx : axis === 'y' ? lockedDx : null,
  )
  const [dy, setDy] = useState<number | null>(
    isReview ? step.targetDy : axis === 'x' ? lockedDy : null,
  )
  const [active, setActive] = useState<'x' | 'y'>(axis === 'y' ? 'y' : 'x')

  // Slide the shape by mutating the node's transform inside the rAF loop, so
  // the animation runs at 60 FPS without a React re-render on every frame.
  const moverRef = useRef<SVGGElement>(null)
  const initialTransform = isReview
    ? `translate(${step.targetDx * PX_PER_UNIT}px, ${-step.targetDy * PX_PER_UNIT}px)`
    : 'translate(0px, 0px)'
  const rafRef = useRef<number | null>(null)

  const animateTo = (toDx: number, toDy: number) => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    const targetOx = toDx * PX_PER_UNIT
    const targetOy = -toDy * PX_PER_UNIT
    const duration = 650
    // Seed the start time from the first rAF timestamp (avoids an impure
    // `performance.now()` read while keeping the easing identical).
    let startTime: number | null = null
    const tick = (now: number) => {
      if (startTime === null) startTime = now
      const t = Math.min(1, (now - startTime) / duration)
      const e = 1 - Math.pow(1 - t, 3) // easeOutCubic
      const node = moverRef.current
      if (node) node.style.transform = `translate(${targetOx * e}px, ${targetOy * e}px)`
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
      else rafRef.current = null
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const pick = (n: number) => {
    if (isReview) return
    let nextDx = dx
    let nextDy = dy
    if (active === 'x') {
      nextDx = n
      setDx(n)
    } else {
      nextDy = n
      setDy(n)
    }
    animateTo(nextDx ?? lockedDx, nextDy ?? lockedDy)
  }

  const replay = () => animateTo(dx ?? lockedDx, dy ?? lockedDy)

  const reset = () => {
    setDx(axis === 'y' ? lockedDx : null)
    setDy(axis === 'x' ? lockedDy : null)
    setActive(axis === 'y' ? 'y' : 'x')
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    if (moverRef.current) moverRef.current.style.transform = 'translate(0px, 0px)'
  }

  const check = () => dx === step.targetDx && dy === step.targetDy

  const [predicted, setPredicted] = useState(isReview)
  const extras: ProblemExtras = {
    diagnose: () => signErrorMessage(dx ?? 0, dy ?? 0, step.targetDx, step.targetDy),
    correctDetail: (
      <CoordinateChangeTable
        changes={coordinateChanges(step.shape, step.targetDx, step.targetDy)}
        dx={step.targetDx}
        dy={step.targetDy}
      />
    ),
  }

  if (!isReview && step.prediction && !predicted) {
    return <PredictionGate prediction={step.prediction} onContinue={() => setPredicted(true)} />
  }

  // `reset` reads the animation/SVG refs, but it only ever runs from the
  // "Start Over" button (an event handler) — renderProblemActions stores it, it
  // is never invoked during render — so the ref access is safe here.
  // eslint-disable-next-line react-hooks/refs
  const { startOver, bar } = renderProblemActions(check, reset, extras)

  const goal = step.shape.map(
    ([x, y]) => [x + step.targetDx, y + step.targetDy] as [number, number],
  )

  const palette: number[] = []
  for (let n = min; n <= max; n++) palette.push(n)

  const fmt = (v: number | null) => (v === null ? '' : String(v))
  const xEditable = !isReview && axis !== 'y'
  const yEditable = !isReview && axis !== 'x'
  const ready = dx !== null && dy !== null

  return (
    <>
      {!isReview && <StartOverButton onClick={startOver} />}
      <p className="lesson-prompt">{step.prompt}</p>
      {showHelpHint && <HelpHint text={step.hint} />}
      {showWhy && <WhyExplanation text={step.why} />}

      <CoordinatePlane>
        <ShapeGlyph shape={goal} color="#64748b" dashed />
        <ShapeGlyph shape={step.shape} color="#1e3a5f" opacity={0.5} />
        <g
          ref={moverRef}
          className="translate-mover"
          style={{ transform: initialTransform }}
        >
          <ShapeGlyph shape={step.shape} color="#38bdf8" />
        </g>
      </CoordinatePlane>

      <div className="translate-expr">
        <span className="translate-expr-label">translate by</span>
        <span className="translate-paren">(</span>
        <button
          type="button"
          className={`translate-box ${active === 'x' && xEditable ? 'active' : ''} ${
            xEditable ? '' : 'locked'
          }`}
          onClick={() => xEditable && setActive('x')}
          disabled={!xEditable}
        >
          {fmt(dx)}
        </button>
        <span className="translate-comma">,</span>
        <button
          type="button"
          className={`translate-box ${active === 'y' && yEditable ? 'active' : ''} ${
            yEditable ? '' : 'locked'
          }`}
          onClick={() => yEditable && setActive('y')}
          disabled={!yEditable}
        >
          {fmt(dy)}
        </button>
        <span className="translate-paren">)</span>
      </div>

      {!isReview && (
        <div className="num-palette">
          {palette.map((n) => (
            <button key={n} type="button" className="num-chip" onClick={() => pick(n)}>
              {n}
            </button>
          ))}
        </div>
      )}

      {ready && (
        <button type="button" className="play-btn" onClick={replay}>
          <span className="play-icon">▶</span> Play
        </button>
      )}

      {liveHint && (
        <LiveDirectionHint
          message={directionalGuidance(dx ?? 0, dy ?? 0, step.targetDx, step.targetDy)}
        />
      )}

      {bar}
    </>
  )
}

function MultipleChoiceProblem({
  step,
  isReview,
  showHelpHint,
  showWhy,
  renderProblemActions,
}: {
  step: MultipleChoiceStep
  isReview: boolean
  showHelpHint: boolean
  showWhy: boolean
  renderProblemActions: StepContentProps['renderProblemActions']
}) {
  const [selected, setSelected] = useState<number | null>(isReview ? step.correctIndex : null)

  const reset = () => setSelected(null)
  const check = () => selected === step.correctIndex
  const { startOver, bar } = renderProblemActions(check, reset)

  return (
    <>
      {!isReview && <StartOverButton onClick={startOver} />}
      <p className="lesson-prompt">{step.prompt}</p>
      {step.graph && (
        <div className="concept-visual">
          <GraphView spec={step.graph} />
        </div>
      )}
      {showHelpHint && <HelpHint text={step.hint} />}
      {showWhy && <WhyExplanation text={step.why} />}
      <div className="choice-list">
        {step.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            className={`choice-btn ${selected === i ? 'selected' : ''} ${
              isReview && i === step.correctIndex ? 'correct' : ''
            }`}
            onClick={() => !isReview && setSelected(i)}
            disabled={isReview}
          >
            {opt}
          </button>
        ))}
      </div>
      {bar}
    </>
  )
}

function NumberInputProblem({
  step,
  isReview,
  showHelpHint,
  showWhy,
  renderProblemActions,
}: {
  step: NumberInputStep
  isReview: boolean
  showHelpHint: boolean
  showWhy: boolean
  renderProblemActions: StepContentProps['renderProblemActions']
}) {
  const [value, setValue] = useState(isReview ? (step.answers[0] ?? '') : '')

  const reset = () => setValue('')
  const check = () => checkTextAnswer(value, step.answers)
  const { startOver, bar } = renderProblemActions(check, reset)

  return (
    <>
      {!isReview && <StartOverButton onClick={startOver} />}
      <p className="lesson-prompt">{step.prompt}</p>
      {step.graph && (
        <div className="concept-visual">
          <GraphView spec={step.graph} />
        </div>
      )}
      {showHelpHint && <HelpHint text={step.hint} />}
      {showWhy && <WhyExplanation text={step.why} />}
      <div className="number-input-row">
        {step.inputLabel && <span className="number-input-label">{step.inputLabel}</span>}
        <input
          className="check-answer-input"
          type="text"
          inputMode="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Your answer"
          readOnly={isReview}
        />
      </div>
      {bar}
    </>
  )
}

function LineBuilderProblem({
  step,
  isReview,
  showHelpHint,
  showWhy,
  renderProblemActions,
}: {
  step: LineBuilderStep
  isReview: boolean
  showHelpHint: boolean
  showWhy: boolean
  renderProblemActions: StepContentProps['renderProblemActions']
}) {
  const mStep = step.mStep ?? 1
  const bStep = step.bStep ?? 1
  const [m, setM] = useState(isReview ? step.target.m : step.start.m)
  const [b, setB] = useState(isReview ? step.target.b : step.start.b)

  const reset = () => {
    setM(step.start.m)
    setB(step.start.b)
  }
  const check = () => m === step.target.m && b === step.target.b
  const { startOver, bar } = renderProblemActions(check, reset)

  const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1))

  return (
    <>
      {!isReview && <StartOverButton onClick={startOver} />}
      <p className="lesson-prompt">{step.prompt}</p>
      {showHelpHint && <HelpHint text={step.hint} />}
      {showWhy && <WhyExplanation text={step.why} />}
      <CoordinatePlane>
        <LinePath m={step.target.m} b={step.target.b} color="#94a3b8" dashed label="target" />
        <LinePath m={m} b={b} color="#38bdf8" />
      </CoordinatePlane>
      <p className="line-builder-eq">
        y = {fmt(m)}x {b >= 0 ? '+' : '−'} {fmt(Math.abs(b))}
      </p>
      {!isReview && (
        <div className="line-builder-controls">
          <div className="lb-group">
            <span className="lb-label">Slope</span>
            <div className="lb-buttons">
              <button type="button" className="lb-btn" onClick={() => setM((v) => v - mStep)}>
                −
              </button>
              <button type="button" className="lb-btn" onClick={() => setM((v) => v + mStep)}>
                +
              </button>
            </div>
          </div>
          <div className="lb-group">
            <span className="lb-label">Intercept</span>
            <div className="lb-buttons">
              <button type="button" className="lb-btn" onClick={() => setB((v) => v - bStep)}>
                −
              </button>
              <button type="button" className="lb-btn" onClick={() => setB((v) => v + bStep)}>
                +
              </button>
            </div>
          </div>
        </div>
      )}
      {bar}
    </>
  )
}

function Blocks({ count, kind }: { count: number; kind: 'x' | 'unit' }) {
  return (
    <div className="scale-blocks">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className={`scale-block ${kind}`}>
          {kind === 'x' ? 'x' : '1'}
        </span>
      ))}
    </div>
  )
}

function BalanceScaleProblem({
  step,
  isReview,
  showHelpHint,
  showWhy,
  renderProblemActions,
}: {
  step: BalanceScaleStep
  isReview: boolean
  showHelpHint: boolean
  showWhy: boolean
  renderProblemActions: StepContentProps['renderProblemActions']
}) {
  const solution = (step.total - step.constant) / step.coeff
  const [leftConst, setLeftConst] = useState(isReview ? 0 : step.constant)
  const [rightTotal, setRightTotal] = useState(isReview ? solution : step.total)
  const [divided, setDivided] = useState(isReview ? step.coeff > 1 : false)

  const reset = () => {
    setLeftConst(step.constant)
    setRightTotal(step.total)
    setDivided(false)
  }

  const solved = leftConst === 0 && (step.coeff === 1 || divided)
  const check = () => solved && rightTotal === solution
  const { startOver, bar } = renderProblemActions(check, reset)

  const xCount = divided ? 1 : step.coeff
  const canSubtract = !isReview && leftConst > 0
  const canDivide = !isReview && leftConst === 0 && step.coeff > 1 && !divided

  return (
    <>
      {!isReview && <StartOverButton onClick={startOver} />}
      <p className="lesson-prompt">{step.prompt}</p>
      {showHelpHint && <HelpHint text={step.hint} />}
      {showWhy && <WhyExplanation text={step.why} />}

      <div className="balance-scale">
        <div className="scale-pan">
          <div className="scale-pan-label">Left</div>
          <div className="scale-pan-contents">
            <Blocks count={xCount} kind="x" />
            {leftConst > 0 && <Blocks count={leftConst} kind="unit" />}
          </div>
        </div>
        <div className="scale-fulcrum">⚖️</div>
        <div className="scale-pan">
          <div className="scale-pan-label">Right</div>
          <div className="scale-pan-contents">
            <Blocks count={rightTotal} kind="unit" />
          </div>
        </div>
      </div>

      {solved && <p className="line-builder-eq">x = {rightTotal}</p>}

      {!isReview && (
        <div className="scale-controls">
          <button
            type="button"
            className="btn secondary flex"
            onClick={() => {
              setLeftConst((c) => c - 1)
              setRightTotal((t) => t - 1)
            }}
            disabled={!canSubtract}
          >
            Subtract 1 from both sides
          </button>
          <button
            type="button"
            className="btn secondary flex"
            onClick={() => {
              setDivided(true)
              setRightTotal((t) => t / step.coeff)
            }}
            disabled={!canDivide}
          >
            Divide both sides by {step.coeff}
          </button>
        </div>
      )}
      {bar}
    </>
  )
}

function NumberLineProblem({
  step,
  isReview,
  showHelpHint,
  showWhy,
  renderProblemActions,
}: {
  step: NumberLineStep
  isReview: boolean
  showHelpHint: boolean
  showWhy: boolean
  renderProblemActions: StepContentProps['renderProblemActions']
}) {
  const [pos, setPos] = useState(isReview ? step.target : step.start)

  const reset = () => setPos(step.start)
  const check = () => pos === step.target
  const { startOver, bar } = renderProblemActions(check, reset)

  const ticks: number[] = []
  for (let i = step.min; i <= step.max; i++) ticks.push(i)
  const pct = ((pos - step.min) / (step.max - step.min)) * 100

  return (
    <>
      {!isReview && <StartOverButton onClick={startOver} />}
      <p className="lesson-prompt">{step.prompt}</p>
      {showHelpHint && <HelpHint text={step.hint} />}
      {showWhy && <WhyExplanation text={step.why} />}

      <div className="number-line">
        <div className="number-line-track">
          <div className="number-line-character" style={{ left: `${pct}%` }}>
            🧍
          </div>
        </div>
        <div className="number-line-ticks">
          {ticks.map((t) => (
            <span key={t} className={`nl-tick ${t === pos ? 'current' : ''}`}>
              {t}
            </span>
          ))}
        </div>
      </div>
      <p className="line-builder-eq">Position: {pos}</p>

      {!isReview && (
        <div className="scale-controls">
          <button
            type="button"
            className="btn secondary flex"
            onClick={() => setPos((p) => Math.max(step.min, p - 1))}
          >
            ← Move left
          </button>
          <button
            type="button"
            className="btn secondary flex"
            onClick={() => setPos((p) => Math.min(step.max, p + 1))}
          >
            Move right →
          </button>
        </div>
      )}
      {bar}
    </>
  )
}

function FunctionMachineProblem({
  step,
  isReview,
  showHelpHint,
  showWhy,
  renderProblemActions,
}: {
  step: FunctionMachineStep
  isReview: boolean
  showHelpHint: boolean
  showWhy: boolean
  renderProblemActions: StepContentProps['renderProblemActions']
}) {
  const [mult, setMult] = useState(isReview ? step.mult : 1)
  const [add, setAdd] = useState(isReview ? step.add : 0)

  const reset = () => {
    setMult(1)
    setAdd(0)
  }
  const matches = (input: number) => input * mult + add
  const check = () => step.examples.every((e) => matches(e.input) === e.output)
  const { startOver, bar } = renderProblemActions(check, reset)

  return (
    <>
      {!isReview && <StartOverButton onClick={startOver} />}
      <p className="lesson-prompt">{step.prompt}</p>
      {showHelpHint && <HelpHint text={step.hint} />}
      {showWhy && <WhyExplanation text={step.why} />}

      <div className="machine">
        <div className="machine-rule">
          <span className="machine-op">× {mult}</span>
          <span className="machine-arrow">→</span>
          <span className="machine-op">+ {add}</span>
        </div>
        <div className="machine-examples">
          {step.examples.map((e, i) => {
            const out = matches(e.input)
            const ok = out === e.output
            return (
              <div key={i} className={`machine-row ${ok ? 'ok' : ''}`}>
                <span className="machine-in">{e.input}</span>
                <span className="machine-arrow">→</span>
                <span className="machine-out">{out}</span>
                <span className="machine-target">(want {e.output})</span>
                <span className="machine-check">{ok ? '✓' : '…'}</span>
              </div>
            )
          })}
        </div>
      </div>

      {!isReview && (
        <div className="line-builder-controls">
          <div className="lb-group">
            <span className="lb-label">Multiply</span>
            <div className="lb-buttons">
              <button type="button" className="lb-btn" onClick={() => setMult((v) => v - 1)}>
                −
              </button>
              <button type="button" className="lb-btn" onClick={() => setMult((v) => v + 1)}>
                +
              </button>
            </div>
          </div>
          <div className="lb-group">
            <span className="lb-label">Add</span>
            <div className="lb-buttons">
              <button type="button" className="lb-btn" onClick={() => setAdd((v) => v - 1)}>
                −
              </button>
              <button type="button" className="lb-btn" onClick={() => setAdd((v) => v + 1)}>
                +
              </button>
            </div>
          </div>
        </div>
      )}
      {bar}
    </>
  )
}

function SlopeDiscoveryProblem({
  step,
  isReview,
  showHelpHint,
  showWhy,
  renderProblemActions,
}: {
  step: SlopeDiscoveryStep
  isReview: boolean
  showHelpHint: boolean
  showWhy: boolean
  renderProblemActions: StepContentProps['renderProblemActions']
}) {
  const reviewMovable: [number, number] = [step.fixed[0] + 1, step.fixed[1] + step.targetSlope]
  const initial: [number, number] = isReview ? reviewMovable : step.movable
  const [pos, setPos] = useState<[number, number]>(initial)

  const reset = () => setPos(step.movable)

  const run = pos[0] - step.fixed[0]
  const rise = pos[1] - step.fixed[1]
  const slope = run !== 0 ? rise / run : null
  const slopeMatchesTarget = slope !== null && slope === step.targetSlope

  const check = () => slopeMatchesTarget
  const { startOver, bar } = renderProblemActions(check, reset)

  const size = GRAPH_SIZE
  const f = toSvg(step.fixed[0], step.fixed[1], size)
  const p = toSvg(pos[0], pos[1], size)

  return (
    <>
      {!isReview && <StartOverButton onClick={startOver} />}
      <p className="lesson-prompt">{step.prompt}</p>
      {showHelpHint && <HelpHint text={step.hint} />}
      {showWhy && <WhyExplanation text={step.why} />}

      <CoordinatePlane>
        <line
          x1={f.sx}
          y1={f.sy}
          x2={p.sx}
          y2={p.sy}
          stroke={slopeMatchesTarget ? '#22c55e' : '#38bdf8'}
          strokeWidth={3}
        />
        <StaticPoint x={step.fixed[0]} y={step.fixed[1]} color="#64748b" label="fixed" />
        <DraggablePoint
          x={pos[0]}
          y={pos[1]}
          color={slopeMatchesTarget ? '#22c55e' : '#38bdf8'}
          onMove={isReview ? () => {} : (x, y) => setPos([x, y])}
          label="drag"
        />
      </CoordinatePlane>

      <div className="slope-readout">
        <span>Rise = {rise}</span>
        <span>Run = {run}</span>
        <span className={slopeMatchesTarget ? 'slope-ok' : ''}>
          Rise ÷ Run = {slope === null ? '—' : Number.isInteger(slope) ? slope : slope.toFixed(2)}
        </span>
      </div>
      {bar}
    </>
  )
}
