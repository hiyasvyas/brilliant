import { useState } from 'react'
import type { Lesson, LessonCheckQuestion, LessonCheckResult } from '../../types/lesson'
import { checkTextAnswer } from '../../lib/xp'
import {
  ActionBar,
  HelpHint,
  ProgressBar,
  WhyExplanation,
  type FeedbackState,
} from './LessonUI'
import './LessonUI.css'

export interface LessonCheckFinishPayload {
  results: LessonCheckResult[]
}

interface LessonCheckEngineProps {
  lesson: Lesson
  onFinish: (payload: LessonCheckFinishPayload) => void
  onExit: () => void
}

type CheckPhase = 'quiz' | 'summary' | 'review' | 'retry-prompt'

export function LessonCheckEngine({ lesson, onFinish, onExit }: LessonCheckEngineProps) {
  const questions = lesson.lessonCheck
  const [phase, setPhase] = useState<CheckPhase>('quiz')
  const [questionIndex, setQuestionIndex] = useState(0)
  /** -1 = the main question; 0,1,… = the corresponding "similar" variant. */
  const [variantIndex, setVariantIndex] = useState(-1)
  const [results, setResults] = useState<LessonCheckResult[]>([])
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<FeedbackState>('idle')

  const [reviewIndex, setReviewIndex] = useState(0)
  const [reviewAnswer, setReviewAnswer] = useState('')
  const [reviewFeedback, setReviewFeedback] = useState<FeedbackState>('idle')
  const [showHelpHint, setShowHelpHint] = useState(false)
  const [showWhy, setShowWhy] = useState(false)

  const wrongResults = results.filter((r) => !r.correct)
  const wrongQuestions = wrongResults
    .map((r) => questions.find((q) => q.id === r.questionId))
    .filter((q): q is LessonCheckQuestion => !!q)

  const mainQuestion = questions[questionIndex]
  const variants = mainQuestion?.variants ?? []
  const onVariant = variantIndex >= 0
  /** The question currently on screen: the original or the active variant. */
  const activeQuestion: LessonCheckQuestion | undefined = mainQuestion
    ? onVariant
      ? { ...mainQuestion, ...variants[variantIndex]! }
      : mainQuestion
    : undefined
  const hasMoreVariants = variantIndex + 1 < variants.length

  const resetQuizQuestion = () => {
    setAnswer('')
    setFeedback('idle')
    setVariantIndex(-1)
  }

  const handleQuizCheck = () => {
    if (!activeQuestion) return
    const ok = checkTextAnswer(answer, activeQuestion.answers)
    setFeedback(ok ? 'correct' : 'wrong')
  }

  /** Record the outcome for the main question and move to the next one. */
  const recordAndAdvance = (correct: boolean) => {
    if (!mainQuestion) return
    setResults((prev) => {
      const filtered = prev.filter((r) => r.questionId !== mainQuestion.id)
      return [...filtered, { questionId: mainQuestion.id, correct, answer }]
    })
    if (questionIndex + 1 >= questions.length) {
      setPhase('summary')
      resetQuizQuestion()
      return
    }
    setQuestionIndex((i) => i + 1)
    resetQuizQuestion()
  }

  /** After getting the question right (original or a variant), continue on. */
  const handleQuizCorrectContinue = () => recordAndAdvance(true)

  /** Got it wrong with no more variants left: move on, marked for review. */
  const handleQuizGiveUp = () => recordAndAdvance(false)

  /** Got it wrong but a similar question is available: try that one next. */
  const handleTrySimilar = () => {
    setVariantIndex((i) => i + 1)
    setAnswer('')
    setFeedback('idle')
  }

  const startReview = () => {
    setReviewIndex(0)
    setReviewAnswer('')
    setReviewFeedback('idle')
    setShowHelpHint(false)
    setShowWhy(false)
    setPhase('review')
  }

  const currentReviewQuestion = wrongQuestions[reviewIndex]

  const handleReviewCheck = () => {
    if (!currentReviewQuestion) return
    const ok = checkTextAnswer(reviewAnswer, currentReviewQuestion.answers)
    setReviewFeedback(ok ? 'correct' : 'wrong')
    if (ok) {
      setResults((prev) =>
        prev.map((r) =>
          r.questionId === currentReviewQuestion.id ? { ...r, correct: true, answer: reviewAnswer } : r,
        ),
      )
    }
  }

  const handleReviewContinue = () => {
    if (reviewIndex + 1 >= wrongQuestions.length) {
      setPhase('retry-prompt')
      return
    }
    setReviewIndex((i) => i + 1)
    setReviewAnswer('')
    setReviewFeedback('idle')
    setShowHelpHint(false)
    setShowWhy(false)
  }

  const retrySkillCheck = () => {
    setPhase('quiz')
    setQuestionIndex(0)
    setResults([])
    resetQuizQuestion()
    setReviewIndex(0)
    setReviewAnswer('')
    setReviewFeedback('idle')
    setShowHelpHint(false)
    setShowWhy(false)
  }

  if (phase === 'quiz' && activeQuestion) {
    return (
      <div className="lesson-engine">
        <header className="lesson-header">
          <button type="button" className="back-btn" onClick={onExit}>
            ←
          </button>
          <ProgressBar current={questionIndex + (feedback === 'correct' ? 1 : 0)} total={questions.length} />
        </header>
        <div className="lesson-body">
          <p className="lesson-check-label">{onVariant ? 'Similar question' : 'Lesson check'}</p>
          <h1 className="lesson-step-title">{activeQuestion.title}</h1>
          {onVariant && (
            <p className="similar-question-note">
              Let&rsquo;s try one just like it with different numbers.
            </p>
          )}
          <p className="lesson-prompt">{activeQuestion.prompt}</p>
          <input
            className="check-answer-input"
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your answer"
            disabled={feedback !== 'idle'}
          />

          {feedback === 'correct' && (
            <div className="action-bar">
              <div className="feedback-banner correct">
                {onVariant ? 'Got it this time — nicely recovered!' : 'Exactly! Nicely done.'}
              </div>
              <button type="button" className="btn primary full" onClick={handleQuizCorrectContinue}>
                Continue
              </button>
            </div>
          )}

          {feedback === 'wrong' && (
            <div className="action-bar">
              <div className="feedback-banner wrong">Not quite — here&rsquo;s why:</div>
              <WhyExplanation text={activeQuestion.why} />
              {hasMoreVariants ? (
                <button type="button" className="btn primary full" onClick={handleTrySimilar}>
                  Try a similar question
                </button>
              ) : (
                <button type="button" className="btn primary full" onClick={handleQuizGiveUp}>
                  Continue
                </button>
              )}
            </div>
          )}

          {feedback === 'idle' && (
            <div className="action-bar">
              <button
                type="button"
                className="btn primary full"
                onClick={handleQuizCheck}
                disabled={!answer.trim()}
              >
                Check
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (phase === 'summary') {
    const correctCount = results.filter((r) => r.correct).length
    return (
      <div className="lesson-engine">
        <header className="lesson-header">
          <button type="button" className="back-btn" onClick={onExit}>
            ←
          </button>
        </header>
        <div className="lesson-body">
          <h1 className="lesson-step-title">Lesson check complete</h1>
          <p className="lesson-prompt">
            You got {correctCount} of {questions.length} correct.
          </p>
          <div className="action-bar">
            {wrongResults.length > 0 && (
              <button type="button" className="btn primary full" onClick={startReview}>
                Review mistakes
              </button>
            )}
            <button
              type="button"
              className={wrongResults.length > 0 ? 'btn secondary full' : 'btn primary full'}
              onClick={() => setPhase('retry-prompt')}
            >
              Skip review
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'review' && currentReviewQuestion) {
    return (
      <div className="lesson-engine">
        <header className="lesson-header">
          <button type="button" className="back-btn" onClick={onExit}>
            ←
          </button>
          <ProgressBar current={reviewIndex + 1} total={wrongQuestions.length} />
        </header>
        <div className="lesson-body">
          <p className="lesson-check-label">Review mistake</p>
          <h1 className="lesson-step-title">{currentReviewQuestion.title}</h1>
          <p className="lesson-prompt">{currentReviewQuestion.prompt}</p>
          {showHelpHint && <HelpHint text={currentReviewQuestion.hint} />}
          {showWhy && <WhyExplanation text={currentReviewQuestion.why} />}
          <input
            className="check-answer-input"
            type="text"
            value={reviewAnswer}
            onChange={(e) => setReviewAnswer(e.target.value)}
            placeholder="Your answer"
            disabled={reviewFeedback === 'correct'}
          />
          {reviewFeedback === 'correct' ? (
            <div className="action-bar">
              <div className="feedback-banner correct">Correct!</div>
              <button type="button" className="btn primary full" onClick={handleReviewContinue}>
                Continue
              </button>
            </div>
          ) : (
            <ActionBar
              feedback={reviewFeedback}
              onCheck={handleReviewCheck}
              onTryAgain={() => {
                setReviewFeedback('idle')
                setShowHelpHint(false)
                setShowWhy(false)
              }}
              onGetHelp={() => setShowHelpHint(true)}
              onWhy={() => setShowWhy(true)}
              onContinue={handleReviewContinue}
              checkDisabled={!reviewAnswer.trim()}
            />
          )}
        </div>
      </div>
    )
  }

  if (phase === 'retry-prompt') {
    return (
      <div className="lesson-engine">
        <header className="lesson-header">
          <button type="button" className="back-btn" onClick={onExit}>
            ←
          </button>
        </header>
        <div className="lesson-body">
          <h1 className="lesson-step-title">Skill check finished</h1>
          <p className="lesson-prompt">Want to try the lesson check again?</p>
          <div className="action-bar">
            <button type="button" className="btn primary full" onClick={retrySkillCheck}>
              Retry skill check
            </button>
            <button type="button" className="btn secondary full" onClick={() => onFinish({ results })}>
              Skip retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
