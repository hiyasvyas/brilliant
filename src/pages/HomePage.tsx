import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { allLessons } from '../content/lessons'
import { StatBar } from '../components/stats/StatBar'
import { StreakCard } from '../components/streak/StreakCard'
import { useAuth } from '../context/AuthContext'
import { getLessonProgress } from '../services/progressService'
import type { Lesson, LessonProgress } from '../types/lesson'

const FLOATING_ART = ['➕', '✖️', 'π', '√', '∑', '∞', '÷', '𝑥²']

export function HomePage() {
  const { user, profile, logOut, configured, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [progressMap, setProgressMap] = useState<Record<string, LessonProgress>>({})

  useEffect(() => {
    if (!user) return
    void refreshProfile()
    void (async () => {
      const entries = await Promise.all(
        allLessons.map(async (lesson) => {
          const p = await getLessonProgress(user.uid, lesson.id)
          return [lesson.id, p] as const
        }),
      )
      const map: Record<string, LessonProgress> = {}
      for (const [id, p] of entries) {
        if (p) map[id] = p
      }
      setProgressMap(map)
    })()
  }, [user, refreshProfile])

  const totalCount = allLessons.length
  const completedCount = allLessons.filter((l) => progressMap[l.id]?.completed).length
  const overallPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const allDone = completedCount === totalCount && totalCount > 0

  const inProgressLesson = allLessons.find((l) => {
    const p = progressMap[l.id]
    return p && !p.completed
  })
  const firstIncompleteLesson = allLessons.find((l) => !progressMap[l.id]?.completed)
  const resumeLesson: Lesson | undefined =
    inProgressLesson ?? firstIncompleteLesson ?? allLessons[0]

  const resumeProgress = resumeLesson ? progressMap[resumeLesson.id] : undefined
  const isFreshStart = !resumeProgress

  const heroTitle = allDone
    ? 'Every region mastered! 🎉'
    : isFreshStart
      ? 'Begin your adventure'
      : 'Pick up where you left off'

  const heroSub = allDone
    ? 'You can revisit any lesson below to keep your skills sharp.'
    : isFreshStart
      ? 'Follow the path one lesson at a time — each builds on the last.'
      : `You're ${completedCount} of ${totalCount} lessons in. Keep the momentum going!`

  const ctaLabel = allDone
    ? 'Review'
    : resumeProgress && !resumeProgress.completed
      ? `Continue · step ${resumeProgress.stepIndex + 1}`
      : 'Start lesson'

  return (
    <div className="app-shell home-page">
      <header className="home-header">
        <div className="home-brand">
          <span className="home-brand-mark" aria-hidden="true">
            📐
          </span>
          <span className="home-brand-name">Algebra Adventure</span>
        </div>
        <div className="home-header-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={() => navigate('/settings')}
            aria-label="Settings"
            title="Settings"
          >
            ⚙
          </button>
          <button type="button" className="logout-btn" onClick={() => void logOut()}>
            Log out
          </button>
        </div>
      </header>

      <section className="home-hero">
        <div className="home-hero-glow" aria-hidden="true" />
        <div className="home-hero-art" aria-hidden="true">
          {FLOATING_ART.map((sym, i) => (
            <span key={i} className={`hero-float hero-float-${i + 1}`}>
              {sym}
            </span>
          ))}
        </div>
        <div className="home-hero-content">
          <p className="home-hero-kicker">
            Hi, {profile?.displayName ?? user?.displayName ?? 'Learner'}! 👋
          </p>
          <h1 className="home-hero-title">{heroTitle}</h1>
          <p className="home-hero-sub">{heroSub}</p>

          <div className="home-hero-progress" aria-label={`${completedCount} of ${totalCount} lessons mastered`}>
            <div className="home-hero-progress-track">
              <div className="home-hero-progress-fill" style={{ width: `${overallPct}%` }} />
            </div>
            <span className="home-hero-progress-label">
              {completedCount} / {totalCount} mastered
            </span>
          </div>

          {resumeLesson && (
            <button
              type="button"
              className="home-hero-cta"
              onClick={() => navigate(`/lesson/${resumeLesson.id}`)}
            >
              <span className="home-hero-cta-icon" aria-hidden="true">
                {resumeLesson.icon}
              </span>
              <span className="home-hero-cta-text">
                <span className="home-hero-cta-label">{ctaLabel}</span>
                <span className="home-hero-cta-lesson">{resumeLesson.title}</span>
              </span>
              <span className="home-hero-cta-arrow" aria-hidden="true">
                →
              </span>
            </button>
          )}
        </div>
      </section>

      <div className="home-stats-grid">
        {profile && <StatBar profile={profile} />}
        {profile && <StreakCard profile={profile} />}
      </div>

      {!configured && (
        <div className="setup-notice">
          Firebase web config missing. Add <code>VITE_FIREBASE_*</code> variables to <code>.env</code> and
          enable Email/Password and Google auth in Firebase Console.
        </div>
      )}

      <section className="home-trail-section">
        <div className="trail-heading">
          <h2 className="map-title">Your Learning Path</h2>
          <p className="trail-subtitle">Lessons unlock in order — follow the trail down.</p>
        </div>

        <div className="adventure-trail">
          {allLessons.map((lesson, idx) => {
            const progress = progressMap[lesson.id]
            const completed = progress?.completed ?? false
            const inProgress = progress && !progress.completed
            // A lesson unlocks once the previous lesson on the path is mastered.
            // The first lesson is always open, and finishing the course reopens
            // every lesson for review.
            const prevCompleted = idx === 0 || (progressMap[allLessons[idx - 1]!.id]?.completed ?? false)
            const unlocked = allDone || completed || prevCompleted
            const isResume = !allDone && resumeLesson?.id === lesson.id
            const side = idx % 2 === 0 ? 'left' : 'right'
            const stateClass = !unlocked
              ? 'locked'
              : completed
                ? 'done'
                : isResume
                  ? 'resume'
                  : inProgress
                    ? 'active'
                    : ''
            return (
              <div
                className={`trail-row ${side} ${stateClass}`}
                key={lesson.id}
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <button
                  type="button"
                  className={`trail-node ${stateClass}`}
                  onClick={() => unlocked && navigate(`/lesson/${lesson.id}`)}
                  disabled={!unlocked}
                  aria-disabled={!unlocked}
                >
                  <span className="trail-node-index" aria-hidden="true">
                    {unlocked ? idx + 1 : '🔒'}
                  </span>
                  <div className="trail-node-icon">{lesson.icon}</div>
                  <div className="map-node-body">
                    <span className="map-region">{lesson.region}</span>
                    <span className="map-lesson-title">{lesson.title}</span>
                    <div className="map-node-meta">
                      <span className="map-stars">{completed ? '⭐' : '☆'}</span>
                      <span className="map-status">
                        {!unlocked
                          ? `Finish "${allLessons[idx - 1]!.title}" to unlock`
                          : completed
                            ? 'Mastered'
                            : inProgress
                              ? `In progress · step ${progress.stepIndex + 1}`
                              : 'Start'}
                      </span>
                    </div>
                  </div>
                  {isResume && <span className="trail-here-badge">You are here</span>}
                </button>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
