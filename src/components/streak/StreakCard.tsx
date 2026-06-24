import { getWeekdayIndex, WEEKDAY_LABELS } from '../../lib/streak'
import type { UserProfile } from '../../types/lesson'
import './StreakCard.css'

interface StreakCardProps {
  profile: UserProfile
}

export function StreakCard({ profile }: StreakCardProps) {
  const todayIdx = getWeekdayIndex()

  return (
    <section className="streak-card" aria-label="Weekly streak">
      <div className="streak-card-header">
        <div className="streak-count">
          <span className="streak-flame" aria-hidden="true">
            🔥
          </span>
          <div>
            <strong>{profile.streak}</strong>
            <span className="streak-count-label">
              day{profile.streak === 1 ? '' : 's'} streak
            </span>
          </div>
        </div>
        {profile.streakCharges > 0 && (
          <div className="streak-charges" title="Streak charges protect your streak if you miss a day">
            <span className="charge-icon" aria-hidden="true">
              ⚡
            </span>
            <span>{profile.streakCharges}</span>
          </div>
        )}
      </div>

      <div className="streak-week" role="list" aria-label="Days of the week">
        {WEEKDAY_LABELS.map((label, i) => {
          const filled = profile.weeklyCompleted[i]
          const isToday = i === todayIdx
          return (
            <div
              key={`${label}-${i}`}
              className={`streak-day ${filled ? 'filled' : ''} ${isToday ? 'today' : ''}`}
              role="listitem"
              aria-label={`${label}${filled ? ', lesson completed' : ''}${isToday ? ', today' : ''}`}
            >
              <span className="streak-day-label">{label}</span>
              <span className="streak-day-dot" />
            </div>
          )
        })}
      </div>

      <p className="streak-hint">
        Complete a full lesson each day to fill your week. Level up to earn ⚡ streak savers that
        protect your streak if you miss a day.
      </p>
    </section>
  )
}
