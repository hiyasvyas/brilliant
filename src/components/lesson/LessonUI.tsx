import { useEffect, useState, type ReactNode } from 'react'
import {
  fetchTargetedHint,
  isAiHintAvailable,
  type HintContext,
} from '../../services/aiHint'
import type { CoordChange } from '../../lib/translationFeedback'
import type { PointMap } from '../../lib/transformFeedback'
import type { PredictionPrompt } from '../../types/lesson'
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
 * Drives the escalating "get a hint" flow. Hints get progressively more guiding
 * with each level, and none ever reveal the answer:
 *   level 1 — a general hand-written hint (shown above the figure)
 *   level 2 — a smarter, more guiding AI hint (grounded + verified)
 *   level 3 — live directional guidance as the learner drags (rendered by the
 *             problem component itself, near the figure)
 * The "Get another hint" button only unlocks one level higher after each wrong
 * attempt, capped by `maxHintLevel` (lower for non-draggable problems).
 */
export interface HintLadder {
  /** Highest level the learner has unlocked so far (0 = none requested). */
  level: number
  /** Highest level available right now (grows with wrong attempts + problem type). */
  maxLevel: number
  /** Advance to the next hint level. */
  onGetHint: () => void
  /** Grounded context for the level-2 AI hint. */
  aiHint?: HintContext
  /** Deterministic fallback used for level 2 when AI is off or fails. */
  aiFallback: string
}

interface ActionBarProps {
  feedback: FeedbackState
  onCheck: () => void
  onTryAgain: () => void
  onWhy: () => void
  onContinue: () => void
  checkDisabled?: boolean
  /** Teaching insight surfaced automatically when the answer is correct. */
  insight?: string
  /** Escalating hint ladder (general → guiding AI → live directional). Lessons. */
  hints?: HintLadder
  /**
   * Legacy single-hint handler used by the separate lesson-check flow, where the
   * escalating ladder does not apply. Ignored when `hints` is provided.
   */
  onGetHelp?: () => void
  /** Extra content shown inside the correct banner, e.g. a coordinate breakdown. */
  correctDetail?: ReactNode
  /** Extra content shown inside the wrong banner, e.g. a sign-error diagnosis. */
  wrongDetail?: ReactNode
}

/** The escalating-hint content + "Get another hint" button shared by idle/wrong. */
function HintControls({ hints }: { hints: HintLadder }) {
  const { level, maxLevel, onGetHint, aiHint, aiFallback } = hints
  return (
    <>
      {level >= 2 && aiHint && (
        <AiSmartHint context={{ ...aiHint, escalation: 'guiding' }} fallback={aiFallback} />
      )}
      {level >= 3 && (
        <p className="live-hint-cue">
          Now drag it — the live guide above tells you if you&rsquo;re heading the right way.
        </p>
      )}
      {level < maxLevel && (
        <button type="button" className="btn secondary full" onClick={onGetHint}>
          {level === 0 ? 'Get a hint' : 'Get another hint'}
        </button>
      )}
    </>
  )
}

export function ActionBar({
  feedback,
  onCheck,
  onTryAgain,
  onWhy,
  onContinue,
  checkDisabled,
  insight,
  hints,
  onGetHelp,
  correctDetail,
  wrongDetail,
}: ActionBarProps) {
  if (feedback === 'correct') {
    return (
      <div className="action-bar">
        <div className="feedback-banner correct">
          <span className="feedback-banner-title">Correct!</span>
          {insight && <span className="feedback-insight">{insight}</span>}
        </div>
        {correctDetail}
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
          Not quite — take another look, or get a hint.
        </div>
        {wrongDetail}
        {hints ? (
          <>
            <HintControls hints={hints} />
            <button type="button" className="btn primary full" onClick={onTryAgain}>
              Try again
            </button>
          </>
        ) : (
          <div className="action-bar-row">
            <button type="button" className="btn primary flex" onClick={onTryAgain}>
              Try again
            </button>
            {onGetHelp && (
              <button type="button" className="btn secondary" onClick={onGetHelp}>
                Get help
              </button>
            )}
          </div>
        )}
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
        {!hints && onGetHelp && (
          <button type="button" className="btn secondary" onClick={onGetHelp}>
            Get a hint
          </button>
        )}
      </div>
      {hints && <HintControls hints={hints} />}
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

/**
 * Level-2 "smarter hint" (Phase 2). Auto-fetches a more guiding, AI-generated
 * nudge as soon as the learner unlocks it, grounded in the step's structured
 * state and verified by the math engine. It always shows something useful: when
 * AI is off or the call fails, it falls back to a deterministic guiding hint, so
 * the escalating-hint ladder works fully with AI turned off.
 */
export function AiSmartHint({ context, fallback }: { context: HintContext; fallback: string }) {
  const available = isAiHintAvailable()
  const [text, setText] = useState(fallback)
  const [loading, setLoading] = useState(available)

  useEffect(() => {
    if (!available) return
    let cancelled = false
    fetchTargetedHint(context)
      .then((t) => {
        if (!cancelled) {
          setText(t)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // Fetch once when the hint is unlocked; the context is stable for this step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="ai-hint">
      <span className="ai-hint-label">{available ? '✨ Smart hint' : 'Hint'}</span>
      <p className="ai-hint-text">{loading ? 'Thinking…' : text}</p>
    </div>
  )
}

/**
 * Level-3 live directional guidance. Renders next to the figure and updates as
 * the learner drags, reporting whether each axis is heading the right way —
 * never the target numbers, so it guides without giving the answer.
 */
export function LiveDirectionHint({ message }: { message: string }) {
  return (
    <div className="live-hint" aria-live="polite">
      <span className="live-hint-label">Live guide</span>
      <p className="live-hint-text">{message}</p>
    </div>
  )
}

/**
 * A coordinate-by-coordinate breakdown of a translation, so the move reads as a
 * rule applied to each point (x and y change independently) rather than a visual
 * trick. Shown in the success banner after a correct translation.
 */
export function CoordinateChangeTable({
  changes,
  dx,
  dy,
}: {
  changes: CoordChange[]
  dx: number
  dy: number
}) {
  const xRule = dx === 0 ? 'x stays' : `x ${dx > 0 ? '+' : '−'} ${Math.abs(dx)}`
  const yRule = dy === 0 ? 'y stays' : `y ${dy > 0 ? '+' : '−'} ${Math.abs(dy)}`
  return (
    <div className="coord-change">
      <p className="coord-change-rule">
        Each point follows the same rule: {xRule}, {yRule}.
      </p>
      <ul className="coord-change-list">
        {changes.map((c, i) => (
          <li key={i}>
            ({c.from[0]}, {c.from[1]}) <span className="coord-change-arrow">→</span> ({c.to[0]},{' '}
            {c.to[1]})
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * A correct-answer reinforcement for reflections/rotations: the single
 * coordinate rule plus each point mapped to its image, so the transformation
 * reads as one rule applied to every point rather than a visual trick.
 */
export function TransformRuleNote({
  rule,
  maps,
}: {
  rule: string
  maps: PointMap[]
}) {
  return (
    <div className="coord-change">
      <p className="coord-change-rule">Same rule for every point: {rule}.</p>
      <ul className="coord-change-list">
        {maps.map((m, i) => (
          <li key={i}>
            ({m.from[0]}, {m.from[1]}) <span className="coord-change-arrow">→</span> ({m.to[0]},{' '}
            {m.to[1]})
          </li>
        ))}
      </ul>
    </div>
  )
}

/** A targeted sign/direction-error note shown inside the wrong banner. */
export function SignErrorNote({ message }: { message: string }) {
  return (
    <p className="sign-error-note">
      <span className="sign-error-icon" aria-hidden="true">
        🧭
      </span>
      {message}
    </p>
  )
}

/**
 * "Predict before you move" gate. Asks the learner to commit to an outcome and
 * see the reasoning before they manipulate the figure. Never blocks progress —
 * after predicting (right or wrong) they continue to the hands-on problem.
 */
export function PredictionGate({
  prediction,
  onContinue,
}: {
  prediction: PredictionPrompt
  onContinue: () => void
}) {
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const correct = selected === prediction.correctIndex

  return (
    <div className="prediction-gate">
      <p className="lesson-check-label">Predict first</p>
      <p className="lesson-prompt">{prediction.question}</p>
      <div className="choice-list">
        {prediction.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            className={`choice-btn ${selected === i ? 'selected' : ''} ${
              revealed && i === prediction.correctIndex ? 'correct' : ''
            }`}
            onClick={() => !revealed && setSelected(i)}
            disabled={revealed}
          >
            {opt}
          </button>
        ))}
      </div>
      {revealed ? (
        <div className="action-bar">
          <div className={`feedback-banner ${correct ? 'correct' : 'wrong'}`}>
            {correct ? 'Good prediction!' : 'Good to think it through first — here&rsquo;s the idea:'}
          </div>
          <WhyExplanation text={prediction.why} />
          <button type="button" className="btn primary full" onClick={onContinue}>
            Now try it
          </button>
        </div>
      ) : (
        <div className="action-bar">
          <button
            type="button"
            className="btn primary full"
            onClick={() => setRevealed(true)}
            disabled={selected === null}
          >
            Lock in prediction
          </button>
        </div>
      )}
    </div>
  )
}

export function WhyExplanation({ text }: { text: string }) {
  return <p className="why-text visible">{text}</p>
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
