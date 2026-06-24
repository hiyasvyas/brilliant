import { StreakCard } from '../streak/StreakCard'
import type { UserProfile } from '../../types/lesson'
import './LessonUI.css'

interface LessonCompleteScreenProps {
  message: string
  discovery?: string
  nextRegion?: string
  nextTitle?: string
  profile: UserProfile
  xpGained: number
  streakUpdated: boolean
  previousStreak: number
  streakSaverEarned?: boolean
  onHome: () => void
  onNext?: () => void
}

export function LessonCompleteScreen({
  message,
  discovery,
  nextRegion,
  nextTitle,
  profile,
  xpGained,
  streakUpdated,
  previousStreak,
  streakSaverEarned,
  onHome,
  onNext,
}: LessonCompleteScreenProps) {
  return (
    <div className="lesson-engine">
      <div className="lesson-body lesson-complete-body">
        <h1 className="lesson-step-title">Lesson complete!</h1>
        <p className="lesson-prompt">{message}</p>

        {discovery && (
          <div className="discovery-card">
            <span className="discovery-label">💡 You discovered</span>
            <p className="discovery-text">{discovery}</p>
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

        {xpGained > 0 && (
          <div className="xp-reward-card">
            <span className="xp-reward-label">XP earned</span>
            <span className="xp-reward-value">+{xpGained}</span>
            <span className="xp-reward-total">{profile.weeklyXp} XP this week</span>
          </div>
        )}

        {xpGained === 0 && (
          <p className="lesson-prompt muted">No new XP — you already completed this lesson.</p>
        )}

        {streakUpdated && (
          <div className="streak-update-banner">
            🔥 Streak updated: {previousStreak} → {profile.streak} days
          </div>
        )}

        {streakSaverEarned && (
          <div className="streak-saver-banner">
            🛡️ Perfect check! Streak saver earned — you now have {profile.streakCharges} saved.
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
