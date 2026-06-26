import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLessonById } from '../content/lessons'
import { PATH_LESSON_IDS, resolvePath, type PathNodeState } from '../content/path'
import { StatBar } from '../components/stats/StatBar'
import { StreakCard } from '../components/streak/StreakCard'
import { useAuth } from '../context/auth-context'
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
        PATH_LESSON_IDS.map(async (id) => {
          const p = await getLessonProgress(user.uid, id)
          return [id, p] as const
        }),
      )
      const map: Record<string, LessonProgress> = {}
      for (const [id, p] of entries) {
        if (p) map[id] = p
      }
      setProgressMap(map)
    })()
  }, [user, refreshProfile])

  // Resolve the learner's position on the adaptive path: which lesson is next,
  // and which lessons they have already completed (and can review or practice).
  const pathState: Record<string, PathNodeState> = {}
  for (const id of PATH_LESSON_IDS) {
    const p = progressMap[id]
    pathState[id] = { completed: p?.completed ?? false, outcome: p?.outcome }
  }
  const { completed: completedIds, nextLessonId, finished } = resolvePath(pathState)

  const completedLessons = completedIds
    .map((id) => getLessonById(id))
    .filter((l): l is Lesson => !!l)
  const nextLesson = nextLessonId ? getLessonById(nextLessonId) : undefined
  const nextProgress = nextLesson ? progressMap[nextLesson.id] : undefined
  const nextInProgress = nextProgress && !nextProgress.completed

  const isFreshStart = completedLessons.length === 0 && !nextInProgress

  const heroTitle = finished
    ? 'Path complete! 🎉'
    : isFreshStart
      ? 'Begin your adventure'
      : nextInProgress
        ? 'Pick up where you left off'
        : 'Ready for your next lesson'

  const heroSub = finished
    ? 'You followed your path all the way through. Revisit any lesson below to keep your skills sharp.'
    : isFreshStart
      ? "Start with Translations. Your path adapts to how you do — master a lesson and you'll move on to something new."
      : nextInProgress
        ? `Continue your lesson and keep the momentum going.`
        : 'Your next lesson is picked for you based on how your last one went.'

  const ctaLabel = nextInProgress
    ? `Continue · step ${(nextProgress?.stepIndex ?? 0) + 1}`
    : 'Start lesson'

  return (
    <div className="app-shell home-page">
      <header className="home-header">
        <div className="home-brand">
          <span className="home-brand-mark" aria-hidden="true">
            📐
          </span>
          <span className="home-brand-name">Geometry Adventure</span>
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

          {nextLesson && (
            <button
              type="button"
              className="home-hero-cta"
              onClick={() => navigate(`/lesson/${nextLesson.id}`)}
            >
              <span className="home-hero-cta-icon" aria-hidden="true">
                {nextLesson.icon}
              </span>
              <span className="home-hero-cta-text">
                <span className="home-hero-cta-label">{ctaLabel}</span>
                <span className="home-hero-cta-lesson">{nextLesson.title}</span>
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

      {/* Up next — the single lesson the learner should do, with a little context. */}
      {nextLesson && (
        <section className="home-next-section">
          <div className="trail-heading">
            <h2 className="map-title">Up next</h2>
            <p className="trail-subtitle">One lesson at a time — your path adapts as you go.</p>
          </div>
          <button
            type="button"
            className="next-lesson-card"
            onClick={() => navigate(`/lesson/${nextLesson.id}`)}
          >
            <div className="next-lesson-icon">{nextLesson.icon}</div>
            <div className="next-lesson-body">
              <span className="next-lesson-region">{nextLesson.region}</span>
              <span className="next-lesson-title">{nextLesson.title}</span>
              <span className="next-lesson-desc">{nextLesson.description}</span>
            </div>
            <span className="next-lesson-go" aria-hidden="true">
              {nextInProgress ? 'Continue →' : 'Start →'}
            </span>
          </button>
        </section>
      )}

      {/* Completed lessons — review or practice, no scores shown. */}
      {completedLessons.length > 0 && (
        <section className="home-completed-section">
          <div className="trail-heading">
            <h2 className="map-title">Lessons you&rsquo;ve finished</h2>
            <p className="trail-subtitle">Revisit any of these to review or get extra practice.</p>
          </div>
          <div className="completed-grid">
            {completedLessons.map((lesson) => (
              <div className="completed-card" key={lesson.id}>
                <div className="completed-card-head">
                  <span className="completed-card-icon" aria-hidden="true">
                    {lesson.icon}
                  </span>
                  <div className="completed-card-titles">
                    <span className="completed-card-region">{lesson.region}</span>
                    <span className="completed-card-title">{lesson.title}</span>
                  </div>
                  {progressMap[lesson.id]?.outcome && (
                    <span
                      className={`mastery-pill ${
                        progressMap[lesson.id]?.outcome === 'mastery' ? 'mastered' : 'review'
                      }`}
                    >
                      {progressMap[lesson.id]?.outcome === 'mastery' ? '🏆 Mastered' : '🌱 Reviewed'}
                    </span>
                  )}
                  <span className="completed-card-check" aria-label="Completed">
                    ✓
                  </span>
                </div>
                <div className="completed-card-actions">
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => navigate(`/lesson/${lesson.id}?mode=review`)}
                  >
                    ↻ Review
                  </button>
                  <button
                    type="button"
                    className="btn primary"
                    onClick={() => navigate(`/lesson/${lesson.id}?mode=practice`)}
                  >
                    Practice
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
