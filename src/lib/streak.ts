import type { UserProfile } from '../types/lesson'

export const MAX_STREAK_CHARGES = 2
export const CHARGE_PER_LESSON = 1

export const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const

export function dateKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Monday of the week containing `d`, as YYYY-MM-DD */
export function getWeekStartMonday(d = new Date()): string {
  const copy = new Date(d)
  const dow = copy.getDay()
  const diff = dow === 0 ? -6 : 1 - dow
  copy.setDate(copy.getDate() + diff)
  return dateKey(copy)
}

/** Monday = 0 … Sunday = 6 */
export function getWeekdayIndex(d = new Date()): number {
  return (d.getDay() + 6) % 7
}

export function daysBetween(earlier: string, later: string): number {
  const a = new Date(`${earlier}T12:00:00`)
  const b = new Date(`${later}T12:00:00`)
  return Math.round((b.getTime() - a.getTime()) / 86_400_000)
}

export function normalizeProfile(
  raw: Partial<UserProfile> | undefined,
  displayName: string,
): UserProfile {
  const weekly = raw?.weeklyCompleted
  return {
    displayName,
    streak: raw?.streak ?? 0,
    streakCharges: raw?.streakCharges ?? 0,
    weekStartDate: raw?.weekStartDate ?? getWeekStartMonday(),
    weeklyCompleted:
      weekly?.length === 7
        ? [...weekly]
        : [false, false, false, false, false, false, false],
    lastLessonCompleteDate: raw?.lastLessonCompleteDate ?? '',
    lessonsCompleted: raw?.lessonsCompleted ?? [],
    weeklyXp: raw?.weeklyXp ?? 0,
    xpWeekStart: raw?.xpWeekStart ?? getWeekStartMonday(),
    totalXp: raw?.totalXp ?? 0,
  }
}

/** Apply streak rules when the learner finishes a full lesson today. */
export function applyLessonCompletion(
  profile: UserProfile,
  today = dateKey(),
): UserProfile {
  const todayDate = new Date(`${today}T12:00:00`)
  const weekStart = getWeekStartMonday(todayDate)

  let weeklyCompleted = [...profile.weeklyCompleted]
  let weekStartDate = profile.weekStartDate

  if (weekStart !== weekStartDate) {
    weeklyCompleted = [false, false, false, false, false, false, false]
    weekStartDate = weekStart
  }

  weeklyCompleted[getWeekdayIndex(todayDate)] = true

  let { streak, streakCharges, lastLessonCompleteDate } = profile

  if (lastLessonCompleteDate !== today) {
    if (!lastLessonCompleteDate) {
      streak = 1
    } else {
      const gap = daysBetween(lastLessonCompleteDate, today)
      if (gap === 1) {
        streak += 1
      } else if (gap > 1) {
        const missedDays = gap - 1
        if (streakCharges >= missedDays) {
          streakCharges -= missedDays
          streak += 1
        } else {
          streak = 1
        }
      }
    }

    streakCharges = Math.min(MAX_STREAK_CHARGES, streakCharges + CHARGE_PER_LESSON)
    lastLessonCompleteDate = today
  }

  return {
    ...profile,
    streak,
    streakCharges,
    weekStartDate,
    weeklyCompleted,
    lastLessonCompleteDate,
  }
}
