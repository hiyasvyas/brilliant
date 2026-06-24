import { useState } from 'react'
import type { TranslationCheckQuestion } from '../../types/lesson'
import { TranslateByControl } from './TranslateByControl'
import { WhyExplanation, type FeedbackState } from './LessonUI'
import { XP_PER_CHECK_QUESTION } from '../../lib/xp'
import './LessonUI.css'

export interface TranslationCheckFinishPayload {
  results: { questionId: string; correct: boolean }[]
  perfect: boolean
}

interface TranslationCheckEngineProps {
  questions: TranslationCheckQuestion[]
  onFinish: (payload: TranslationCheckFinishPayload) => void
  onExit: () => void
}

type Result = { questionId: string; correct: boolean }
type Phase = 'quiz' | 'summary' | 'review' | 'retry-prompt'

function CheckHeader({
  questions,
  results,
  currentId,
  onExit,
}: {
  questions: TranslationCheckQuestion[]
  results: Result[]
  currentId: string | null
  onExit: () => void
}) {
  const xp = results.filter((r) => r.correct).length * XP_PER_CHECK_QUESTION
  return (
    <header className="lesson-header check-header">
      <button type="button" className="back-btn" onClick={onExit}>
        ←
      </button>
      <div className="check-dots">
        {questions.map((q) => {
          const r = results.find((x) => x.questionId === q.id)
          const cls = r
            ? r.correct
              ? 'check-dot correct'
              : 'check-dot wrong'
            : q.id === currentId
              ? 'check-dot current'
              : 'check-dot'
          return <span key={q.id} className={cls} />
        })}
      </div>
      <span className="check-xp">⚡ {xp} XP</span>
    </header>
  )
}

/** One interactive translate question with check / why / reveal handling. */
function CheckQuestionView({
  question,
  label,
  onDone,
}: {
  question: TranslationCheckQuestion
  label: string
  onDone: (correct: boolean) => void
}) {
  const [dx, setDx] = useState<number | null>(null)
  const [dy, setDy] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<FeedbackState>('idle')
  const [answeredCorrect, setAnsweredCorrect] = useState(false)
  const [showWhy, setShowWhy] = useState(false)

  const ready = dx !== null && dy !== null
  const isCorrect = dx === question.targetDx && dy === question.targetDy

  const handleCheck = () => {
    setAnsweredCorrect(isCorrect)
    setFeedback(isCorrect ? 'correct' : 'wrong')
  }

  if (showWhy) {
    return (
      <div className="lesson-body check-why">
        <p className="lesson-check-label">Explanation</p>
        <h1 className="lesson-step-title">{question.title}</h1>
        <TranslateByControl
          key={`why-${question.id}`}
          shape={question.shape}
          targetDx={question.targetDx}
          targetDy={question.targetDy}
          axis={question.axis}
          min={question.min}
          max={question.max}
          reveal
        />
        <WhyExplanation text={question.why} />
        <div className="action-bar">
          <button type="button" className="btn primary full" onClick={() => onDone(answeredCorrect)}>
            Continue
          </button>
          <button type="button" className="btn secondary full" onClick={() => setShowWhy(false)}>
            Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="lesson-body">
      <p className="lesson-check-label">{label}</p>
      <h1 className="lesson-step-title">{question.title}</h1>
      <p className="lesson-prompt">{question.prompt}</p>
      <TranslateByControl
        key={`${question.id}-${feedback === 'wrong' ? 'reveal' : 'live'}`}
        shape={question.shape}
        targetDx={question.targetDx}
        targetDy={question.targetDy}
        axis={question.axis}
        min={question.min}
        max={question.max}
        frozen={feedback === 'correct'}
        reveal={feedback === 'wrong'}
        onChange={(ndx, ndy) => {
          if (feedback === 'idle') {
            setDx(ndx)
            setDy(ndy)
          }
        }}
      />

      {feedback === 'idle' && (
        <div className="action-bar">
          <button
            type="button"
            className="btn primary full"
            onClick={handleCheck}
            disabled={!ready}
          >
            Check
          </button>
        </div>
      )}

      {feedback === 'correct' && (
        <div className="action-bar">
          <div className="feedback-banner correct">
            <span className="feedback-banner-title">Correct!</span>
          </div>
          <div className="action-bar-row">
            <button type="button" className="btn primary flex" onClick={() => onDone(true)}>
              Continue
            </button>
            <button type="button" className="btn secondary" onClick={() => setShowWhy(true)}>
              Why?
            </button>
          </div>
        </div>
      )}

      {feedback === 'wrong' && (
        <div className="action-bar">
          <div className="feedback-banner wrong">
            Not quite — here&rsquo;s the correct slide ({question.targetDx}, {question.targetDy}):
          </div>
          <WhyExplanation text={question.why} />
          <button type="button" className="btn primary full" onClick={() => onDone(false)}>
            Continue
          </button>
        </div>
      )}
    </div>
  )
}

export function TranslationCheckEngine({
  questions,
  onFinish,
  onExit,
}: TranslationCheckEngineProps) {
  const [phase, setPhase] = useState<Phase>('quiz')
  const [qIndex, setQIndex] = useState(0)
  const [results, setResults] = useState<Result[]>([])
  const [reviewQueue, setReviewQueue] = useState<TranslationCheckQuestion[]>([])
  const [reviewIndex, setReviewIndex] = useState(0)

  const correctCount = results.filter((r) => r.correct).length
  const allAnswered = results.length === questions.length
  const perfect = allAnswered && correctCount === questions.length
  const wrongQuestions = results
    .filter((r) => !r.correct)
    .map((r) => questions.find((q) => q.id === r.questionId))
    .filter((q): q is TranslationCheckQuestion => !!q)

  const recordAndAdvance = (correct: boolean) => {
    const q = questions[qIndex]
    if (!q) return
    setResults((prev) => [...prev.filter((r) => r.questionId !== q.id), { questionId: q.id, correct }])
    if (qIndex + 1 >= questions.length) {
      setPhase('summary')
    } else {
      setQIndex((i) => i + 1)
    }
  }

  const startReview = () => {
    setReviewQueue(wrongQuestions)
    setReviewIndex(0)
    setPhase('review')
  }

  const reviewDone = (questionId: string, correct: boolean) => {
    if (correct) {
      setResults((prev) =>
        prev.map((r) => (r.questionId === questionId ? { ...r, correct: true } : r)),
      )
    }
    if (reviewIndex + 1 >= reviewQueue.length) {
      setPhase('retry-prompt')
    } else {
      setReviewIndex((i) => i + 1)
    }
  }

  const retry = () => {
    setResults([])
    setQIndex(0)
    setReviewQueue([])
    setReviewIndex(0)
    setPhase('quiz')
  }

  if (phase === 'quiz') {
    const q = questions[qIndex]
    if (!q) return null
    return (
      <div className="lesson-engine">
        <CheckHeader questions={questions} results={results} currentId={q.id} onExit={onExit} />
        <CheckQuestionView key={q.id} question={q} label="Lesson check" onDone={recordAndAdvance} />
      </div>
    )
  }

  if (phase === 'summary') {
    return (
      <div className="lesson-engine">
        <CheckHeader questions={questions} results={results} currentId={null} onExit={onExit} />
        <div className="lesson-body">
          <h1 className="lesson-step-title">Lesson check complete</h1>
          <p className="lesson-prompt">
            You got {correctCount} of {questions.length} correct.
          </p>
          {perfect && (
            <div className="reward-callout">
              <span className="reward-callout-title">Perfect run! 🎉</span>
              <span>You earned bonus XP and a streak saver 🛡️ for getting all {questions.length} right.</span>
            </div>
          )}
          <div className="action-bar">
            {wrongQuestions.length > 0 ? (
              <>
                <button type="button" className="btn primary full" onClick={startReview}>
                  Review mistakes
                </button>
                <button
                  type="button"
                  className="btn secondary full"
                  onClick={() => setPhase('retry-prompt')}
                >
                  Skip review
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn primary full"
                onClick={() => onFinish({ results, perfect })}
              >
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'review') {
    const q = reviewQueue[reviewIndex]
    if (!q) {
      return (
        <div className="lesson-engine">
          <div className="lesson-body">
            <button
              type="button"
              className="btn primary full"
              onClick={() => setPhase('retry-prompt')}
            >
              Continue
            </button>
          </div>
        </div>
      )
    }
    return (
      <div className="lesson-engine">
        <CheckHeader questions={questions} results={results} currentId={q.id} onExit={onExit} />
        <CheckQuestionView
          key={`review-${q.id}-${reviewIndex}`}
          question={q}
          label={`Review mistake ${reviewIndex + 1} of ${reviewQueue.length}`}
          onDone={(correct) => reviewDone(q.id, correct)}
        />
      </div>
    )
  }

  // retry-prompt
  return (
    <div className="lesson-engine">
      <CheckHeader questions={questions} results={results} currentId={null} onExit={onExit} />
      <div className="lesson-body">
        <h1 className="lesson-step-title">Skill check finished</h1>
        <p className="lesson-prompt">
          You got {correctCount} of {questions.length}. Want to try the whole check again?
        </p>
        <div className="action-bar">
          <button type="button" className="btn primary full" onClick={retry}>
            Retry lesson check
          </button>
          <button
            type="button"
            className="btn secondary full"
            onClick={() => onFinish({ results, perfect })}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}
