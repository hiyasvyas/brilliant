import './LessonUI.css'

interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0
  return (
    <div className="progress-bar-wrap" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="progress-bar-label">{current} / {total}</span>
    </div>
  )
}

export type FeedbackState = 'idle' | 'wrong' | 'correct'

interface ActionBarProps {
  feedback: FeedbackState
  onCheck: () => void
  onTryAgain: () => void
  onGetHelp: () => void
  onWhy: () => void
  onContinue: () => void
  checkDisabled?: boolean
  /** Teaching insight surfaced automatically when the answer is correct. */
  insight?: string
}

export function ActionBar({
  feedback,
  onCheck,
  onTryAgain,
  onGetHelp,
  onWhy,
  onContinue,
  checkDisabled,
  insight,
}: ActionBarProps) {
  if (feedback === 'correct') {
    return (
      <div className="action-bar">
        <div className="feedback-banner correct">
          <span className="feedback-banner-title">Correct!</span>
          {insight && <span className="feedback-insight">{insight}</span>}
        </div>
        <div className="action-bar-row">
          <button type="button" className="btn primary flex" onClick={onContinue}>
            Continue
          </button>
          <button type="button" className="btn secondary" onClick={onWhy}>
            Why?
          </button>
        </div>
      </div>
    )
  }

  if (feedback === 'wrong') {
    return (
      <div className="action-bar">
        <div className="feedback-banner wrong">
          Interesting — not yet. Take another look, or get a hint.
        </div>
        <div className="action-bar-row">
          <button type="button" className="btn primary flex" onClick={onTryAgain}>
            Try again
          </button>
          <button type="button" className="btn secondary" onClick={onGetHelp}>
            Get help
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="action-bar">
      <div className="action-bar-row">
        <button
          type="button"
          className="btn primary flex"
          onClick={onCheck}
          disabled={checkDisabled}
        >
          Check
        </button>
        <button type="button" className="btn secondary" onClick={onGetHelp}>
          Get a hint
        </button>
      </div>
    </div>
  )
}

export function StartOverButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="problem-toolbar">
      <button type="button" className="start-over-btn" onClick={onClick}>
        Start over
      </button>
    </div>
  )
}

interface ConfidencePickerProps {
  onSelect: (level: 'no' | 'maybe' | 'yes') => void
}

export function ConfidencePicker({ onSelect }: ConfidencePickerProps) {
  return (
    <div className="confidence-picker">
      <button type="button" className="conf-btn no" onClick={() => onSelect('no')}>
        No
      </button>
      <button type="button" className="conf-btn maybe" onClick={() => onSelect('maybe')}>
        Maybe
      </button>
      <button type="button" className="conf-btn yes" onClick={() => onSelect('yes')}>
        Yes
      </button>
    </div>
  )
}

export function HelpHint({ text }: { text: string }) {
  return <p className="help-text">{text}</p>
}

export function WhyExplanation({ text }: { text: string }) {
  return <p className="why-text visible">{text}</p>
}

interface QuizActionBarProps {
  feedback: FeedbackState
  onCheck: () => void
  onContinue: () => void
  checkDisabled?: boolean
}

/** Lesson check quiz: Check only, then correct/incorrect + Continue (no help). */
export function QuizActionBar({
  feedback,
  onCheck,
  onContinue,
  checkDisabled,
}: QuizActionBarProps) {
  if (feedback === 'correct') {
    return (
      <div className="action-bar">
        <div className="feedback-banner correct">Exactly! Nicely done.</div>
        <button type="button" className="btn primary full" onClick={onContinue}>
          Continue
        </button>
      </div>
    )
  }

  if (feedback === 'wrong') {
    return (
      <div className="action-bar">
        <div className="feedback-banner wrong">Incorrect.</div>
        <button type="button" className="btn primary full" onClick={onContinue}>
          Continue
        </button>
      </div>
    )
  }

  return (
    <div className="action-bar">
      <button type="button" className="btn primary full" onClick={onCheck} disabled={checkDisabled}>
        Check
      </button>
    </div>
  )
}

export function ResetLessonButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="action-bar">
      <button type="button" className="btn ghost full" onClick={onClick}>
        Reset lesson
      </button>
    </div>
  )
}
