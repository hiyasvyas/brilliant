import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  getCompleteMessage,
  getDiscovery,
  getLessonById,
  getLessonFlowSteps,
} from '../content/lessons'
import { getNextOnPath } from '../content/path'
import { LessonCheckEngine } from '../components/lesson/LessonCheckEngine'
import {
  TranslationCheckEngine,
  type TranslationCheckFinishPayload,
} from '../components/lesson/TranslationCheckEngine'
import { LessonCompleteScreen } from '../components/lesson/LessonCompleteScreen'
import { LessonEngine, type LessonEngineMode } from '../components/lesson/LessonEngine'
import { XpHud, XpStarBurst } from '../components/lesson/LessonUI'
import { useAuth } from '../context/auth-context'
import {
  finishLessonWithRewards,
  getLessonProgress,
  type LessonFinishResult,
} from '../services/progressService'
import type { StepResult } from '../types/lesson'
import { computeOutcome } from '../lib/mastery'
import '../components/lesson/LessonUI.css'

type PagePhase = 'menu' | 'lesson' | 'lesson-check' | 'complete'

function clampStepIndex(index: number, stepCount: number): number {
  if (stepCount <= 0) return 0
  return Math.max(0, Math.min(index, stepCount - 1))
}

export function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const lesson = lessonId ? getLessonById(lessonId) : undefined
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [ready, setReady] = useState(false)
  const [phase, setPhase] = useState<PagePhase>('lesson')
  const [engineMode, setEngineMode] = useState<LessonEngineMode>('normal')
  const [stepIndex, setStepIndex] = useState(0)
  const [results, setResults] = useState<StepResult[]>([])
  // The final content-step results, used to compute mastery vs. support for the
  // adaptive path once the lesson is finished (lesson-check results never count).
  const [contentResults, setContentResults] = useState<StepResult[]>([])
  const [isCompleted, setIsCompleted] = useState(false)
  const [finishResult, setFinishResult] = useState<LessonFinishResult | null>(null)
  const [nextLessonId, setNextLessonId] = useState<string | undefined>(undefined)
  // Whether the learner mastered the lesson (vs. needs support) — surfaced as a
  // clear mastery signal on the completion screen.
  const [mastered, setMastered] = useState<boolean | undefined>(undefined)
  const [engineKey, setEngineKey] = useState(0)

  // Live XP tracking for the in-lesson HUD + star animation. Total XP only
  // changes when a lesson is finished (after which the HUD is hidden), so the
  // saved profile total is a stable base to add live earnings onto.
  const [earnedXp, setEarnedXp] = useState(0)
  const [bursts, setBursts] = useState<number[]>([])
  const earnedIdsRef = useRef<Set<string>>(new Set())

  const handleXpEarned = useCallback((id: string, amount: number) => {
    if (earnedIdsRef.current.has(id)) return
    earnedIdsRef.current.add(id)
    setEarnedXp((x) => x + amount)
    const burstId = Date.now() + Math.random()
    setBursts((b) => [...b, burstId])
    window.setTimeout(() => {
      setBursts((b) => b.filter((x) => x !== burstId))
    }, 1200)
  }, [])

  const hudTotal = (profile?.totalXp ?? 0) + earnedXp
  const xpOverlay = (
    <>
      <XpHud total={hudTotal} bumpKey={earnedXp} />
      <XpStarBurst bursts={bursts} />
    </>
  )

  // This is a one-shot initialization effect: it derives the lesson phase from
  // the route's `mode` param plus an async Firestore progress load. The
  // synchronous setState calls here are the intended initial sync of external
  // inputs into the phase state machine, not a reactive cascade.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!lesson) return

    const modeParam = searchParams.get('mode')
    const flowStepCount = getLessonFlowSteps(lesson).length

    const startLesson = (index: number, stepResults: StepResult[]) => {
      setEngineMode('normal')
      setPhase('lesson')
      setStepIndex(clampStepIndex(index, flowStepCount))
      setResults(stepResults)
    }

    if (!user) {
      if (modeParam === 'practice') {
        setEngineMode('practice')
        setPhase('lesson')
        setStepIndex(0)
        setResults([])
      } else if (modeParam === 'review') {
        setEngineMode('review')
        setPhase('lesson')
        setStepIndex(0)
        setResults([])
      } else {
        startLesson(0, [])
      }
      setReady(true)
      return
    }

    void getLessonProgress(user.uid, lesson.id)
      .then((p) => {
        const completed = p?.completed ?? false
        setIsCompleted(completed)

        if (modeParam === 'practice') {
          setEngineMode('practice')
          setPhase('lesson')
          setStepIndex(0)
          setResults([])
          return
        }

        if (modeParam === 'review') {
          setEngineMode('review')
          setPhase('lesson')
          setStepIndex(0)
          setResults([])
          return
        }

        if (completed) {
          setPhase('menu')
          return
        }

        if (p && !p.completed) {
          // Saved index past last step means main lesson content is done → lesson check
          if (p.stepIndex >= flowStepCount) {
            setContentResults(p.stepResults)
            setPhase('lesson-check')
            return
          }
          startLesson(p.stepIndex, p.stepResults)
          return
        }

        startLesson(0, [])
      })
      .catch(() => {
        startLesson(0, [])
      })
      .finally(() => {
        setReady(true)
      })
  }, [user, lesson, searchParams])
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleCheckFinish = async () => {
    if (!user || !lesson) return

    // Mastery vs. support is decided ONLY by the lesson's content problems, not
    // by the end-of-lesson check (retrieval practice): the learner moves on to
    // the mastery branch only when they solved at least 80% of the content
    // problems on the first try with no hints, and struggled on no more than the
    // allowed few. Anything less routes to the support branch. The lesson check
    // itself is for retrieval practice and never counts toward the branch.
    const { outcome } = computeOutcome(contentResults, getLessonFlowSteps(lesson))

    const result = await finishLessonWithRewards(user.uid, lesson.id, earnedXp, outcome)
    await refreshProfile()
    setNextLessonId(getNextOnPath(lesson.id, outcome))
    setMastered(outcome === 'mastery')
    setFinishResult(result)
    setIsCompleted(true)
    setPhase('complete')
  }

  const handleInteractiveCheckFinish = async (payload: TranslationCheckFinishPayload) => {
    if (!user || !lesson) return

    // Skipping the lesson check does not pass the lesson. Progress was already
    // saved past the content steps, so the learner returns straight to the
    // check next time — no XP, no streak, lesson stays incomplete.
    if (!payload.passed) {
      navigate('/')
      return
    }

    const { outcome } = computeOutcome(contentResults, getLessonFlowSteps(lesson))
    const result = await finishLessonWithRewards(user.uid, lesson.id, earnedXp, outcome)
    await refreshProfile()
    setNextLessonId(getNextOnPath(lesson.id, outcome))
    setMastered(outcome === 'mastery')
    setFinishResult(result)
    setIsCompleted(true)
    setPhase('complete')
  }

  if (!lesson) return <Navigate to="/" replace />

  if (!ready) {
    return (
      <div className="auth-page lesson-loading">
        <p>Loading lesson…</p>
      </div>
    )
  }

  if (phase === 'menu') {
    return (
      <div className="app-shell lesson-menu-page">
        <header className="lesson-menu-header">
          <button type="button" className="back-btn" onClick={() => navigate('/')}>
            ←
          </button>
          <h1>{lesson.title}</h1>
        </header>
        <p className="lesson-prompt">{lesson.description}</p>
        <p className="progress-pill completed-pill">Completed ✓</p>

        <div className="lesson-menu-actions">
          <button
            type="button"
            className="btn primary full"
            onClick={() => {
              setEngineMode('practice')
              setStepIndex(0)
              setResults([])
              setPhase('lesson')
            }}
          >
            Practice
          </button>
          <button
            type="button"
            className="btn secondary full review-btn"
            onClick={() => {
              setEngineMode('review')
              setStepIndex(0)
              setResults([])
              setPhase('lesson')
            }}
            aria-label="Review lesson"
          >
            <span className="review-icon" aria-hidden="true">
              ↻
            </span>
            Review lesson
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'lesson-check') {
    const exitToHome = () => {
      navigate('/')
    }
    if (lesson.interactiveCheck && lesson.interactiveCheck.length > 0) {
      return (
        <>
          {xpOverlay}
          <TranslationCheckEngine
            questions={lesson.interactiveCheck}
            onFinish={(payload) => void handleInteractiveCheckFinish(payload)}
            onExit={exitToHome}
            onXpEarned={handleXpEarned}
          />
        </>
      )
    }
    return (
      <>
        {xpOverlay}
        <LessonCheckEngine
          lesson={lesson}
          onFinish={() => void handleCheckFinish()}
          onExit={exitToHome}
          onXpEarned={handleXpEarned}
        />
      </>
    )
  }

  if (phase === 'complete' && finishResult) {
    const next = nextLessonId ? getLessonById(nextLessonId) : undefined
    return (
      <LessonCompleteScreen
        message={getCompleteMessage(lesson)}
        discovery={getDiscovery(lesson)}
        mastered={mastered}
        nextRegion={next?.region}
        nextTitle={next?.title}
        profile={finishResult.profile}
        xpGained={finishResult.xpGained}
        questionXp={finishResult.questionXp}
        completionBonus={finishResult.completionBonus}
        previousTotalXp={finishResult.previousTotalXp}
        streakUpdated={finishResult.streakUpdated}
        previousStreak={finishResult.previousStreak}
        streakSaversGained={finishResult.streakSaversGained}
        onHome={() => navigate('/')}
        onNext={next ? () => navigate(`/lesson/${next.id}`) : undefined}
      />
    )
  }

  return (
    <>
      {xpOverlay}
      <LessonEngine
        key={engineKey}
        lesson={lesson}
        mode={engineMode}
        initialStepIndex={stepIndex}
        initialResults={results}
        onXpEarned={handleXpEarned}
        onLessonStepsComplete={(res) => {
          if (engineMode === 'normal' && !isCompleted) {
            setContentResults(res)
            setPhase('lesson-check')
          } else if (isCompleted) {
            // Finished practice/review of a completed lesson → return to the lesson menu
            setEngineMode('normal')
            setPhase('menu')
          } else {
            navigate('/')
          }
        }}
        onExit={() => {
          if (isCompleted && engineMode !== 'normal') {
            // Leaving practice/review of a completed lesson → return to the lesson menu
            setEngineMode('normal')
            setPhase('menu')
          } else {
            navigate('/')
          }
        }}
        onResetFromReview={() => {
          setEngineMode('normal')
          setStepIndex(0)
          setResults([])
          setEngineKey((k) => k + 1)
        }}
      />
    </>
  )
}
