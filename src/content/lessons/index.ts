import type { Lesson, LessonStep } from '../../types/lesson'
import { linearEquationsLesson } from './linearEquations'
import { functionsLesson } from './functions'
import { systemsLesson } from './systems'
import { quadraticsLesson } from './quadratics'
import { polynomialsLesson } from './polynomials'
import { exponentialsLesson } from './exponentials'
import { translationsLesson } from './translations'

export const allLessons: Lesson[] = [
  linearEquationsLesson,
  functionsLesson,
  systemsLesson,
  quadraticsLesson,
  polynomialsLesson,
  exponentialsLesson,
  translationsLesson,
].sort((a, b) => a.order - b.order)

export function getLessonById(id: string): Lesson | undefined {
  return allLessons.find((l) => l.id === id)
}

/** Steps shown during the main lesson (excludes the summary complete step). */
export function getLessonFlowSteps(lesson: Lesson): LessonStep[] {
  return lesson.steps.filter((s) => s.type !== 'complete')
}

export function getCompleteMessage(lesson: Lesson): string {
  const complete = lesson.steps.find((s) => s.type === 'complete')
  return complete?.type === 'complete'
    ? complete.message
    : 'You finished the lesson. Great work!'
}

export function getDiscovery(lesson: Lesson): string | undefined {
  const complete = lesson.steps.find((s) => s.type === 'complete')
  return complete?.type === 'complete' ? complete.discovery : undefined
}

/** The next lesson in the course path, or undefined if this is the last one. */
export function getNextLesson(lesson: Lesson): Lesson | undefined {
  const idx = allLessons.findIndex((l) => l.id === lesson.id)
  if (idx === -1 || idx + 1 >= allLessons.length) return undefined
  return allLessons[idx + 1]
}
