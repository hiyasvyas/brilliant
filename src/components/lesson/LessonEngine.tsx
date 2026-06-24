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
  StepResult,
  Remediation,
} from '../../types/lesson'
import { toSvg, GRAPH_SIZE, GRAPH_RANGE } from '../../lib/graph'
import { getLessonFlowSteps } from '../../content/lessons'
import { pointsEqual } from '../../lib/graph'
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
  ConfidencePicker,
  HelpHint,
  ProgressBar,
  ResetLessonButton,
  StartOverButton,
  WhyExplanation,
  type FeedbackState,
} from './LessonUI'
import './LessonUI.css'
import { useAuth } from '../../context/AuthContext'
import { saveLessonProgress } from '../../services/progressService'

export type LessonEngineMode = 'normal' | 'review' | 'practice'

/**
 * How many times a learner may miss the same question type before the lesson
 * pauses to give them a deeper remediation lesson. Lessons only — lesson checks
 * have their own, separate flow.
 */
const REMEDIATION_THRESHOLD = 3

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

  return { ...step, id } as LessonStep
}

interface LessonEngineProps {
  lesson: Lesson
  mode: LessonEngineMode
  initialStepIndex: number
  initialResults: StepResult[]
  onLessonStepsComplete: () => void
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
  const [showHelpHint, setShowHelpHint] = useState(false)
  const [showWhy, setShowWhy] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [usedHelp, setUsedHelp] = useState(false)
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

  const baseStep = flowSteps[stepIndex]
  const variants: LessonStep[] = (baseStep?.variants as LessonStep[] | undefined) ?? []
  const remediation: Remediation | undefined = baseStep?.remediation
  // The adaptive loop only applies in normal/practice mode (not read-through review).
  const isAdaptive = !isReview && (variants.length > 0 || !!remediation)
  // The question currently on screen: a post-rescue mastery question, the
  // original, or a cycled "similar" variant.
  const activeStep: LessonStep | undefined = masteryStep
    ? masteryStep
    : baseStep && questionIndex > 0 && variants.length > 0
      ? ({
          ...variants[(questionIndex - 1) % variants.length],
          id: baseStep.id,
          type: baseStep.type,
        } as LessonStep)
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
    setShowHelpHint(false)
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
  }

  const goToStep = async (next: number, nextResults: StepResult[]) => {
    if (next >= flowSteps.length) {
      if (mode === 'normal') {
        await persist(flowSteps.length, nextResults)
        onLessonStepsComplete()
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
    setStuckActive(false)
    setMasteryStep(makeSimilarStep(baseStep))
    setWrongStreak(0)
    setHelpRow(0)
    setQuestionCounted(false)
    setStruggleCount(0)
    setBatchWrongIds([])
    setQuestionIndex(0)
    setShowRemediation(false)
    resetFeedback()
    setAttempts(0)
    setUsedHelp(false)
  }

  const recordResult = (correct: boolean, helpUsed: boolean) => {
    const entry: StepResult = {
      stepId: baseStep.id,
      correct,
      attempts: attempts + 1,
      usedHelp: helpUsed,
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

  // Move to the next similar question of the same type (wrong-streak preserved).
  const handleTrySimilar = () => {
    setQuestionIndex((i) => i + 1)
    setQuestionCounted(false)
    resetFeedback()
    setAttempts(0)
    setUsedHelp(false)
  }

  // After the deeper lesson, serve a fresh question and reset the wrong-streak,
  // so the learner gets a clean run at mastering the concept.
  const handleRemediationContinue = () => {
    setShowRemediation(false)
    setWrongStreak(0)
    setQuestionCounted(false)
    setQuestionIndex((i) => i + 1)
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

  const renderProblemActions = (check: () => boolean, resetProblem: () => void) => {
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

    // When adaptive, a wrong answer counts toward the wrong-streak; once it hits
    // the threshold the wrong banner offers the deeper remediation lesson.
    const nextWrongStreak = wrongStreak + 1
    const activeWhy = 'why' in activeStep ? (activeStep as { why: string }).why : ''

    const bar = (
      <ActionBar
        feedback={feedback}
        insight={activeStep.insight}
        adaptive={
          isAdaptive
            ? {
                why: activeWhy,
                atThreshold: wrongStreak >= REMEDIATION_THRESHOLD && !!remediation,
                onTrySimilar: handleTrySimilar,
                onSeeLesson: () => setShowRemediation(true),
              }
            : undefined
        }
        onCheck={() => {
          const ok = check()
          const firstTry = attempts === 0 && !usedHelp
          setAttempts((a) => a + 1)
          if (ok) {
            setFeedback('correct')
            setShowHelpHint(false)
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
            // 3 misses on this same question, or 3 questions that needed help in a
            // row, opens an answer-reveal rescue for this question. Authored
            // adaptive steps keep their own similar-question / remediation flow.
            if (!isAdaptive && isProblemStep(baseStep)) {
              if (nextWrongStreak >= STUCK_THRESHOLD) {
                setStuckReason('same')
                setStuckActive(true)
              } else if (nextRow >= STUCK_THRESHOLD) {
                setStuckReason('row')
                setStuckActive(true)
              }
            }
          }
        }}
        onTryAgain={resetFeedback}
        onGetHelp={() => {
          // First hint on a question counts as one struggle toward the review, and
          // — like a wrong answer — marks the question as one that needed help so a
          // run of hint-only questions also triggers the answer-reveal rescue.
          if (!usedHelp) {
            setStruggleCount((c) => c + 1)
            if (!questionCounted) {
              const nextRow = helpRow + 1
              setHelpRow(nextRow)
              setQuestionCounted(true)
              if (!isAdaptive && isProblemStep(baseStep) && nextRow >= STUCK_THRESHOLD) {
                setStuckReason('row')
                setStuckActive(true)
              }
            }
          }
          setShowHelpHint(true)
          setUsedHelp(true)
        }}
        onWhy={() => setShowWhy(true)}
        onContinue={async () => {
          const nextResults = recordResult(true, usedHelp)
          await advanceStep(nextResults)
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
              showHelpHint={showHelpHint}
              showWhy={showWhy}
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
  onConfidence: () => void
  renderProblemActions: (check: () => boolean, resetProblem: () => void) => {
    startOver: () => void
    bar: React.ReactNode
  }
}

function StepContent({
  step,
  isReview,
  showHelpHint,
  showWhy,
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
  renderProblemActions,
}: {
  step: DragShapeStep
  isReview: boolean
  showHelpHint: boolean
  showWhy: boolean
  renderProblemActions: StepContentProps['renderProblemActions']
}) {
  const solved: [number, number] = [step.targetDx, step.targetDy]
  const [offset, setOffset] = useState<[number, number]>(isReview ? solved : [0, 0])

  const reset = () => setOffset([0, 0])
  const check = () => offset[0] === step.targetDx && offset[1] === step.targetDy
  const { startOver, bar } = renderProblemActions(check, reset)

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
      {bar}
    </>
  )
}

function MovePointProblem({
  step,
  isReview,
  showHelpHint,
  showWhy,
  renderProblemActions,
}: {
  step: MovePointStep
  isReview: boolean
  showHelpHint: boolean
  showWhy: boolean
  renderProblemActions: StepContentProps['renderProblemActions']
}) {
  const initial: [number, number] = isReview ? step.target : step.start
  const [pos, setPos] = useState<[number, number]>(initial)

  const reset = () => setPos(step.start)
  const check = () => pointsEqual(pos, step.target)
  const { startOver, bar } = renderProblemActions(check, reset)

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
  renderProblemActions,
}: {
  step: TranslationInputStep
  isReview: boolean
  showHelpHint: boolean
  showWhy: boolean
  renderProblemActions: StepContentProps['renderProblemActions']
}) {
  const reviewDx = step.goalPoints[0]![0] - step.points[0]![0]
  const reviewDy = step.goalPoints[0]![1] - step.points[0]![1]

  const [inputDx, setInputDx] = useState(isReview ? String(reviewDx) : '')
  const [inputDy, setInputDy] = useState(isReview ? String(reviewDy) : '')

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

  const { startOver, bar } = renderProblemActions(check, reset)

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
  renderProblemActions,
}: {
  step: TranslateByStep
  isReview: boolean
  showHelpHint: boolean
  showWhy: boolean
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
    const startTime = performance.now()
    const duration = 650
    const tick = (now: number) => {
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

  const { startOver, bar } = renderProblemActions(check, reset)

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
