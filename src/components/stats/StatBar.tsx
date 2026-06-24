import { levelForXp } from '../../lib/xp'
import type { UserProfile } from '../../types/lesson'
import './StatBar.css'

const MAX_ENERGY = 5

export function StatBar({ profile }: { profile: UserProfile }) {
  const { level, intoLevel, forNext, pct } = levelForXp(profile.totalXp)

  return (
    <div className="stat-bar">
      <div className="stat-item" title="Energy">
        <span className="stat-icon">❤️</span>
        <span className="stat-value">{MAX_ENERGY}</span>
      </div>
      <div className="stat-item" title="Day streak">
        <span className="stat-icon">🔥</span>
        <span className="stat-value">{profile.streak}</span>
      </div>
      <div className="stat-item" title="Total XP">
        <span className="stat-icon">⭐</span>
        <span className="stat-value">{profile.totalXp}</span>
      </div>
      <div className="stat-item level" title={`Level ${level} · ${intoLevel}/${forNext} XP`}>
        <span className="stat-icon">🏆</span>
        <span className="stat-value">Lv {level}</span>
        <span className="stat-level-bar">
          <span className="stat-level-fill" style={{ width: `${pct}%` }} />
        </span>
      </div>
    </div>
  )
}
