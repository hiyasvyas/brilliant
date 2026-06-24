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
  StepResult,
} from '../../types/lesson'
import { toSvg, GRAPH_SIZE, GRAPH_RANGE } from '../../lib/graph'
import { getLessonFlowSteps } from '../../content/lessons'
import { pointsEqual } from '../../lib/graph'
import { checkTextAnswer } from '../../lib/xp'
import {
  CoordinatePlane,
  DraggablePoint,
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

interface LessonEngineProps {
  lesson: Lesson
  mode: LessonEngineMode
  initialStepIndex: number
  initialResults: StepResult[]
  onLessonStepsComplete: () => void
  onExit: () => void
  onResetFromReview: () => void
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

  const step = flowSteps[stepIndex]
  const problemSteps = flowSteps.filter((s) => s.type !== 'confidence')
  const completedProblems = isReview ? stepIndex : results.filter((r) => r.correct).length

  if (!step) {
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

  const advanceStep = async (nextResults: StepResult[]) => {
    const next = stepIndex + 1
    resetFeedback()
    setAttempts(0)
    setUsedHelp(false)

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

  const recordResult = (correct: boolean, helpUsed: boolean) => {
    const entry: StepResult = {
      stepId: step.id,
      correct,
      attempts: attempts + 1,
      usedHelp: helpUsed,
    }
    const filtered = results.filter((r) => r.stepId !== step.id)
    const nextResults = [...filtered, entry]
    setResults(nextResults)
    return nextResults
  }

  const handleConfidence = async () => {
    const nextResults = recordResult(true, false)
    await advanceStep(nextResults)
  }

  const renderProblemActions = (check: () => boolean, resetProblem: () => void) => {
    const startOver = () => {
      resetProblem()
      resetFeedback()
      setUsedHelp(false)
    }

    if (isReview) {
      return {
        startOver,
        bar: (
          <button type="button" className="btn primary full" onClick={() => void handleConfidence()}>
            Continue
          </button>
        ),
      }
    }

    const bar = (
      <ActionBar
        feedback={feedback}
        insight={step.insight}
        onCheck={() => {
          const ok = check()
          setAttempts((a) => a + 1)
          if (ok) {
            setFeedback('correct')
            setShowHelpHint(false)
            recordResult(true, usedHelp)
          } else {
            setFeedback('wrong')
            setShowWhy(false)
          }
        }}
        onTryAgain={resetFeedback}
        onGetHelp={() => {
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
        <h1 className="lesson-step-title">{step.title}</h1>
        <StepContent
          step={step}
          isReview={isReview}
          showHelpHint={showHelpHint}
          showWhy={showWhy}
          onConfidence={() => void handleConfidence()}
          renderProblemActions={renderProblemActions}
        />
        {isReview && <ResetLessonButton onClick={onResetFromReview} />}
      </div>
    </div>
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
        {isReview ? (
          <button type="button" className="btn primary full" onClick={onConfidence}>
            Continue
          </button>
        ) : (
          <ConfidencePicker onSelect={() => onConfidence()} />
        )}
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
        <button type="button" className="btn primary full" onClick={onConfidence}>
          {isReview ? 'Continue' : 'Got it — continue'}
        </button>
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

  return null
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
