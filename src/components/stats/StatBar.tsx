import { useState } from 'react'
import { levelForXp } from '../../lib/xp'
import type { UserProfile } from '../../types/lesson'
import './StatBar.css'

export function StatBar({ profile }: { profile: UserProfile }) {
  const { level, intoLevel, forNext, pct } = levelForXp(profile.totalXp)
  const [helpOpen, setHelpOpen] = useState(false)

  return (
    <div className="stat-bar">
      <div className="stat-item" title="Streak savers">
        <span className="stat-icon">⚡</span>
        <span className="stat-value">{profile.streakCharges}</span>
      </div>
      <div className="stat-item" title="Total XP">
        <span className="stat-icon">⭐</span>
        <span className="stat-value">{profile.totalXp}</span>
      </div>

      <div className="stat-help">
        <button
          type="button"
          className="stat-help-btn"
          aria-label="What do these mean?"
          aria-expanded={helpOpen}
          title="What is this?"
          onClick={() => setHelpOpen((o) => !o)}
        >
          ?
        </button>
        {helpOpen && (
          <>
            <div className="stat-help-backdrop" onClick={() => setHelpOpen(false)} aria-hidden="true" />
            <div className="stat-help-popover" role="dialog" aria-label="Icon guide">
              <div className="stat-help-row">
                <span className="stat-help-icon">⚡</span>
                <div>
                  <strong>Streak saver</strong>
                  <p>
                    A backup that automatically protects your daily streak if you miss a day, so it
                    won&apos;t reset to zero. Earn more streak savers by completing lessons.
                  </p>
                </div>
              </div>
              <div className="stat-help-row">
                <span className="stat-help-icon">⭐</span>
                <div>
                  <strong>XP</strong>
                  <p>
                    Experience points that track your learning and raise your level. You earn XP by
                    finishing lesson steps and answering check questions correctly.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
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
