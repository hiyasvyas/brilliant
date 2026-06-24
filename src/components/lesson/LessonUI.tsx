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

/**
 * Drives the adaptive wrong-answer flow inside a lesson. When present, a wrong
 * answer no longer just says "try again" — it explains why, then offers either
 * a similar question of the same type or (once the learner has missed this type
 * enough times) a deeper remediation lesson.
 */
export interface AdaptiveWrong {
  /** Explanation of the question the learner just missed. */
  why: string
  /** True when the wrong-streak has hit the remediation threshold. */
  atThreshold: boolean
  /** Serve another similar question of the same type. */
  onTrySimilar: () => void
  /** Open the deeper remediation lesson. */
  onSeeLesson: () => void
}

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
  /** When set, wrong answers drive the adaptive similar-question / remediation flow. */
  adaptive?: AdaptiveWrong
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
  adaptive,
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
    if (adaptive) {
      return (
        <div className="action-bar">
          <div className="feedback-banner wrong">Not quite — here&rsquo;s why:</div>
          <WhyExplanation text={adaptive.why} />
          {adaptive.atThreshold ? (
            <button type="button" className="btn primary full" onClick={adaptive.onSeeLesson}>
              Let&rsquo;s break this down
            </button>
          ) : (
            <button type="button" className="btn primary full" onClick={adaptive.onTrySimilar}>
              Try a similar question
            </button>
          )}
        </div>
      )
    }
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

/** Floating XP counter shown in the top-right corner during a lesson. */
export function XpHud({ total, bumpKey }: { total: number; bumpKey: number }) {
  return (
    <div className="xp-hud" aria-live="polite" aria-label={`${total} total XP`}>
      <span className="xp-hud-icon">⭐</span>
      <span className="xp-hud-value" key={bumpKey}>
        {total}
      </span>
      <span className="xp-hud-unit">XP</span>
    </div>
  )
}

/** Bursts of stars that fly toward the XP counter when a question earns XP. */
export function XpStarBurst({ bursts }: { bursts: number[] }) {
  if (bursts.length === 0) return null
  return (
    <div className="xp-burst-layer" aria-hidden="true">
      {bursts.map((id) => (
        <div className="xp-burst" key={id}>
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              className="xp-burst-star"
              key={i}
              style={{ left: `${(i - 2.5) * 16}px`, animationDelay: `${i * 55}ms` }}
            >
              ⭐
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}
