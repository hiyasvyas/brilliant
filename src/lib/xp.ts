import type { LessonStep } from '../types/lesson'
import { getWeekStartMonday } from './streak'

export const XP_PER_CONFIDENCE_STEP = 3
export const XP_PER_CONCEPT_STEP = 5
export const XP_PER_MULTIPLE_CHOICE = 10
export const XP_PER_PROBLEM = 12
export const XP_PER_CHECK_QUESTION = 15
export const XP_PERFECT_CHECK_BONUS = 15
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

export function xpForStep(step: LessonStep): number {
  switch (step.type) {
    case 'confidence':
      return XP_PER_CONFIDENCE_STEP
    case 'concept':
      return XP_PER_CONCEPT_STEP
    case 'multiple-choice':
      return XP_PER_MULTIPLE_CHOICE
    case 'number-input':
    case 'line-builder':
    case 'balance-scale':
    case 'number-line':
    case 'function-machine':
    case 'slope-discovery':
    case 'move-point':
    case 'find-vertex':
    case 'translation-input':
      return XP_PER_PROBLEM
    default:
      return 0
  }
}

export function countLessonContentXp(steps: LessonStep[]): number {
  return steps.reduce((sum, step) => sum + xpForStep(step), 0)
}

export function countCheckXp(
  questions: { id: string }[],
  results: { questionId: string; correct: boolean }[],
): number {
  const correctIds = new Set(results.filter((r) => r.correct).map((r) => r.questionId))
  return questions.filter((q) => correctIds.has(q.id)).length * XP_PER_CHECK_QUESTION
}

export function calculateFirstCompletionXp(
  steps: LessonStep[],
  checkQuestions: { id: string }[],
  checkResults: { questionId: string; correct: boolean }[],
): number {
  return countLessonContentXp(steps) + countCheckXp(checkQuestions, checkResults)
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
