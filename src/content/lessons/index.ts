import type { Lesson, LessonStep } from '../../types/lesson'
import { translationsLesson } from './translations'
import { reflectionsLesson } from './reflections'
import { numberLineLesson } from './numberLine'
import { rotationsLesson } from './rotations'
import { coordinatePlaneLesson } from './coordinatePlane'
import { translationsLevel2Lesson } from './translationsLevel2'
import { coordinatePlaneGuidedLesson } from './coordinatePlaneGuided'
import { expansionLessons } from './expansion'

/**
 * Every lesson on the adaptive path. The course always starts at Translations;
 * which lesson comes next is chosen by the learner's mastery/support outcome
 * (see `content/path.ts`), not by this array's order.
 */
export const allLessons: Lesson[] = [
  translationsLesson,
  reflectionsLesson,
  numberLineLesson,
  rotationsLesson,
  coordinatePlaneLesson,
  translationsLevel2Lesson,
  coordinatePlaneGuidedLesson,
  ...expansionLessons,
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
