import { useEffect, useState } from 'react'
import { StreakCard } from '../streak/StreakCard'
import type { UserProfile } from '../../types/lesson'
import { levelForXp } from '../../lib/xp'
import './LessonUI.css'

interface LessonCompleteScreenProps {
  message: string
  discovery?: string
  /** Clear mastery signal: true = mastered, false = needs support, undefined = not graded. */
  mastered?: boolean
  nextRegion?: string
  nextTitle?: string
  profile: UserProfile
  xpGained: number
  questionXp: number
  completionBonus: number
  previousTotalXp: number
  streakUpdated: boolean
  previousStreak: number
  streakSaversGained: number
  onHome: () => void
  onNext?: () => void
}

export function LessonCompleteScreen({
  message,
  discovery,
  mastered,
  nextRegion,
  nextTitle,
  profile,
  xpGained,
  questionXp,
  completionBonus,
  previousTotalXp,
  streakUpdated,
  previousStreak,
  streakSaversGained,
  onHome,
  onNext,
}: LessonCompleteScreenProps) {
  const before = levelForXp(previousTotalXp)
  const after = levelForXp(profile.totalXp)
  const leveledUp = after.level > before.level
  const startPct = leveledUp ? 0 : before.pct

  const [fillPct, setFillPct] = useState(startPct)
  useEffect(() => {
    const t = window.setTimeout(() => setFillPct(after.pct), 250)
    return () => window.clearTimeout(t)
  }, [after.pct])

  return (
    <div className="lesson-engine">
      <div className="lesson-body lesson-complete-body">
        <h1 className="lesson-step-title">Lesson complete!</h1>

        {mastered !== undefined && (
          <div className={`mastery-banner ${mastered ? 'mastered' : 'support'}`}>
            <span className="mastery-banner-icon" aria-hidden="true">
              {mastered ? '🏆' : '🌱'}
            </span>
            <span className="mastery-banner-text">
              {mastered
                ? 'Concept mastered — you earned the next step on your path.'
                : "Not quite mastered yet — we've routed you to a supporting lesson to build this up first. You can also practice or review it anytime."}
            </span>
          </div>
        )}

        <p className="lesson-prompt">{message}</p>

        {discovery && (
          <div className="discovery-card">
            <span className="discovery-label">💡 You discovered</span>
            <p className="discovery-text">{discovery}</p>
          </div>
        )}

        {xpGained > 0 && (
          <div className="level-progress-card">
            <div className="level-progress-head">
              <span className="level-progress-title">
                Level {after.level}
                {leveledUp && <span className="level-up-badge">Level up! {before.level} → {after.level}</span>}
              </span>
              <span className="level-progress-xp">+{xpGained} XP</span>
            </div>
            <div className="level-bar-track">
              <div className="level-bar-fill" style={{ width: `${fillPct}%` }} />
            </div>
            <span className="level-progress-sub">
              {after.intoLevel} / {after.forNext} XP toward Level {after.level + 1}
            </span>
            <div className="xp-breakdown">
              <span>⭐ {questionXp} XP from correct answers</span>
              <span>🎉 {completionBonus} XP lesson complete bonus</span>
            </div>
          </div>
        )}

        {xpGained === 0 && (
          <p className="lesson-prompt muted">No new XP — you already completed this lesson.</p>
        )}

        {streakSaversGained > 0 && (
          <div className="streak-saver-banner">
            🛡️ Level up reward: +{streakSaversGained} streak saver{streakSaversGained > 1 ? 's' : ''} — you
            now have {profile.streakCharges}.
          </div>
        )}

        {streakUpdated && (
          <div className="streak-update-banner">
            🔥 Streak updated: {previousStreak} → {profile.streak} days
          </div>
        )}

        {nextTitle && (
          <div className="unlocked-card">
            <span className="unlocked-label">Unlocked next</span>
            <span className="unlocked-title">
              {nextRegion ? `${nextRegion} · ` : ''}
              {nextTitle}
            </span>
          </div>
        )}

        <StreakCard profile={profile} />

        {onNext && nextTitle && (
          <button type="button" className="btn primary full" onClick={onNext}>
            Start {nextRegion ?? nextTitle} →
          </button>
        )}
        <button
          type="button"
          className={onNext && nextTitle ? 'btn secondary full' : 'btn primary full'}
          onClick={onHome}
        >
          Back to map
        </button>
      </div>
    </div>
  )
}
