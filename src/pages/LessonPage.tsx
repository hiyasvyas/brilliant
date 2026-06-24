import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  getCompleteMessage,
  getDiscovery,
  getLessonById,
  getLessonFlowSteps,
  getNextLesson,
} from '../content/lessons'
import { LessonCheckEngine, type LessonCheckFinishPayload } from '../components/lesson/LessonCheckEngine'
import {
  TranslationCheckEngine,
  type TranslationCheckFinishPayload,
} from '../components/lesson/TranslationCheckEngine'
import { LessonCompleteScreen } from '../components/lesson/LessonCompleteScreen'
import { LessonEngine, type LessonEngineMode } from '../components/lesson/LessonEngine'
import { useAuth } from '../context/AuthContext'
import {
  applyLeaveLessonPenalty,
  finishLessonWithRewards,
  getLessonProgress,
  type LessonFinishResult,
} from '../services/progressService'
import type { StepResult } from '../types/lesson'
import '../components/lesson/LessonUI.css'

type PagePhase = 'menu' | 'lesson' | 'lesson-check' | 'complete'

function clampStepIndex(index: number, stepCount: number): number {
  if (stepCount <= 0) return 0
  return Math.max(0, Math.min(index, stepCount - 1))
}

export function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const lesson = lessonId ? getLessonById(lessonId) : undefined
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [ready, setReady] = useState(false)
  const [phase, setPhase] = useState<PagePhase>('lesson')
  const [engineMode, setEngineMode] = useState<LessonEngineMode>('normal')
  const [stepIndex, setStepIndex] = useState(0)
  const [results, setResults] = useState<StepResult[]>([])
  const [isCompleted, setIsCompleted] = useState(false)
  const [finishResult, setFinishResult] = useState<LessonFinishResult | null>(null)
  const [engineKey, setEngineKey] = useState(0)

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

  const handleCheckFinish = async (payload: LessonCheckFinishPayload) => {
    if (!user || !lesson) return

    const flowSteps = getLessonFlowSteps(lesson)
    const result = await finishLessonWithRewards(
      user.uid,
      lesson.id,
      flowSteps,
      lesson.lessonCheck,
      payload.results,
    )
    await refreshProfile()
    setFinishResult(result)
    setIsCompleted(true)
    setPhase('complete')
  }

  const handleInteractiveCheckFinish = async (payload: TranslationCheckFinishPayload) => {
    if (!user || !lesson) return

    const flowSteps = getLessonFlowSteps(lesson)
    const questions = lesson.interactiveCheck ?? []
    const result = await finishLessonWithRewards(
      user.uid,
      lesson.id,
      flowSteps,
      questions.map((q) => ({ id: q.id })),
      payload.results,
      { perfectCheck: payload.perfect },
    )
    await refreshProfile()
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
      if (user) void applyLeaveLessonPenalty(user.uid)
      navigate('/')
    }
    if (lesson.interactiveCheck && lesson.interactiveCheck.length > 0) {
      return (
        <TranslationCheckEngine
          questions={lesson.interactiveCheck}
          onFinish={(payload) => void handleInteractiveCheckFinish(payload)}
          onExit={exitToHome}
        />
      )
    }
    return (
      <LessonCheckEngine
        lesson={lesson}
        onFinish={(payload) => void handleCheckFinish(payload)}
        onExit={exitToHome}
      />
    )
  }

  if (phase === 'complete' && finishResult) {
    const next = getNextLesson(lesson)
    return (
      <LessonCompleteScreen
        message={getCompleteMessage(lesson)}
        discovery={getDiscovery(lesson)}
        nextRegion={next?.region}
        nextTitle={next?.title}
        profile={finishResult.profile}
        xpGained={finishResult.xpGained}
        streakUpdated={finishResult.streakUpdated}
        previousStreak={finishResult.previousStreak}
        streakSaverEarned={finishResult.streakSaverEarned}
        onHome={() => navigate('/')}
        onNext={next ? () => navigate(`/lesson/${next.id}`) : undefined}
      />
    )
  }

  return (
    <LessonEngine
      key={engineKey}
      lesson={lesson}
      mode={engineMode}
      initialStepIndex={stepIndex}
      initialResults={results}
      onLessonStepsComplete={() => {
        if (engineMode === 'normal' && !isCompleted) {
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
  )
}
