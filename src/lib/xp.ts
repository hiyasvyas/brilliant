import { getWeekStartMonday } from './streak'

/** XP awarded for answering a question correctly on the first try with no help. */
export const XP_PER_QUESTION = 20
/** One-time bonus XP for completing (passing) a lesson. */
export const XP_LESSON_COMPLETE_BONUS = 40
/** XP removed from the weekly tally when a learner bails out mid-lesson. */
export const XP_LEAVE_PENALTY = 20

export function resetWeeklyXpIfNeeded(
  weeklyXp: number,
  xpWeekStart: string,
  today = new Date(),
): { weeklyXp: number; xpWeekStart: string } {
  const weekStart = getWeekStartMonday(today)
  if (xpWeekStart !== weekStart) {
    return { weeklyXp: 0, xpWeekStart: weekStart }
  }
  return { weeklyXp, xpWeekStart }
}

export function normalizeCheckAnswer(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '')
    .replace(/[()]/g, '')
}

export function checkTextAnswer(input: string, acceptable: string[]): boolean {
  const normalized = normalizeCheckAnswer(input)
  if (!normalized) return false
  return acceptable.some((a) => normalizeCheckAnswer(a) === normalized)
}

export const XP_PER_LEVEL = 100

export interface LevelInfo {
  level: number
  intoLevel: number
  forNext: number
  pct: number
}

export function levelForXp(totalXp: number): LevelInfo {
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1
  const intoLevel = totalXp % XP_PER_LEVEL
  return {
    level,
    intoLevel,
    forNext: XP_PER_LEVEL,
    pct: Math.round((intoLevel / XP_PER_LEVEL) * 100),
  }
}
