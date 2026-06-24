import { useState } from 'react'
import type { TranslationCheckQuestion } from '../../types/lesson'
import { TranslateByControl } from './TranslateByControl'
import { WhyExplanation, type FeedbackState } from './LessonUI'
import { XP_PER_QUESTION } from '../../lib/xp'
import './LessonUI.css'

export interface TranslationCheckFinishPayload {
  results: { questionId: string; correct: boolean }[]
  perfect: boolean
  /**
   * True only when the learner actually completed the check (got every
   * question right, including via review). Skipping out leaves this false, and
   * the lesson is NOT marked complete.
   */
  passed: boolean
}

interface TranslationCheckEngineProps {
  questions: TranslationCheckQuestion[]
  onFinish: (payload: TranslationCheckFinishPayload) => void
  onExit: () => void
  /** Called when a check question is solved correctly on the first try. */
  onXpEarned?: (id: string, amount: number) => void
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
    </header>
  )
}

/** One interactive translate question with check / why / reveal handling. */
function CheckQuestionView({
  question,
  label,
  onDone,
  onEarn,
}: {
  question: TranslationCheckQuestion
  label: string
  onDone: (correct: boolean) => void
  onEarn?: (id: string, amount: number) => void
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
    if (isCorrect) onEarn?.(question.id, XP_PER_QUESTION)
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
            Not quite. Here&rsquo;s how to solve it — the correct slide is ({question.targetDx},{' '}
            {question.targetDy}):
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
  onXpEarned,
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
        <CheckQuestionView
          key={q.id}
          question={q}
          label="Lesson check"
          onDone={recordAndAdvance}
          onEarn={onXpEarned}
        />
      </div>
    )
  }

  if (phase === 'summary') {
    const wrongCount = questions.length - correctCount
    return (
      <div className="lesson-engine">
        <CheckHeader questions={questions} results={results} currentId={null} onExit={onExit} />
        <div className="lesson-body">
          <h1 className="lesson-step-title">Lesson check complete</h1>
          <p className="lesson-prompt">
            You got <strong>{correctCount} right</strong> and <strong>{wrongCount} wrong</strong> out
            of {questions.length}.
          </p>
          {perfect ? (
            <>
              <div className="reward-callout">
                <span className="reward-callout-title">Perfect run! 🎉</span>
                <span>
                  You earned bonus XP and a streak saver 🛡️ for getting all {questions.length} right.
                </span>
              </div>
              <div className="action-bar">
                <button
                  type="button"
                  className="btn primary full"
                  onClick={() => onFinish({ results, perfect: true, passed: true })}
                >
                  Finish &amp; pass lesson
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="lesson-prompt muted">
                Review the ones you missed, or skip ahead — but you only pass the lesson once every
                question is correct.
              </p>
              <div className="action-bar">
                <button type="button" className="btn primary full" onClick={startReview}>
                  Review questions
                </button>
                <button
                  type="button"
                  className="btn secondary full"
                  onClick={() => setPhase('retry-prompt')}
                >
                  Skip
                </button>
              </div>
            </>
          )}
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
        {perfect ? (
          <>
            <p className="lesson-prompt">
              Nice — you fixed every question. You got all {questions.length} right!
            </p>
            <div className="action-bar">
              <button
                type="button"
                className="btn primary full"
                onClick={() => onFinish({ results, perfect: true, passed: true })}
              >
                Finish &amp; pass lesson
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="lesson-prompt">
              You got {correctCount} of {questions.length}. Redo the check to get them all and pass —
              skipping won&rsquo;t complete the lesson.
            </p>
            <div className="action-bar">
              <button type="button" className="btn primary full" onClick={retry}>
                Redo lesson check
              </button>
              <button
                type="button"
                className="btn secondary full"
                onClick={() => onFinish({ results, perfect: false, passed: false })}
              >
                Skip (don&rsquo;t pass)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
