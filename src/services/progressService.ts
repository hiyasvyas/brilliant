import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import type { LessonProgress, UserProfile } from '../types/lesson'
import { getFirestoreDb } from '../lib/firebase'
import { applyLessonCompletion, normalizeProfile } from '../lib/streak'
import {
  levelForXp,
  resetWeeklyXpIfNeeded,
  XP_LESSON_COMPLETE_BONUS,
} from '../lib/xp'

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(getFirestoreDb(), 'users', uid))
  if (!snap.exists()) return null
  const data = snap.data()
  return normalizeProfile(data as Partial<UserProfile>, data.displayName ?? 'Learner')
}

export async function upsertUserProfile(
  uid: string,
  displayName: string,
): Promise<UserProfile> {
  const ref = doc(getFirestoreDb(), 'users', uid)
  const existing = await getDoc(ref)
  const profile = existing.exists()
    ? normalizeProfile(existing.data() as Partial<UserProfile>, displayName)
    : normalizeProfile({}, displayName)

  await setDoc(ref, { ...profile, displayName }, { merge: true })
  return { ...profile, displayName }
}

export async function updateProfileDisplayName(
  uid: string,
  displayName: string,
): Promise<UserProfile> {
  const ref = doc(getFirestoreDb(), 'users', uid)
  const snap = await getDoc(ref)
  const profile = snap.exists()
    ? normalizeProfile(snap.data() as Partial<UserProfile>, displayName)
    : normalizeProfile({}, displayName)
  await setDoc(ref, { ...profile, displayName }, { merge: true })
  return { ...profile, displayName }
}

export async function getLessonProgress(
  uid: string,
  lessonId: string,
): Promise<LessonProgress | null> {
  const snap = await getDoc(doc(getFirestoreDb(), 'users', uid, 'progress', lessonId))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    lessonId,
    stepIndex: data.stepIndex ?? 0,
    stepResults: data.stepResults ?? [],
    completed: data.completed ?? false,
    outcome: data.outcome,
    updatedAt: data.updatedAt ?? new Date().toISOString(),
  }
}

export async function saveLessonProgress(
  uid: string,
  progress: LessonProgress,
): Promise<void> {
  const payload: Record<string, unknown> = {
    ...progress,
    updatedAt: new Date().toISOString(),
    serverUpdated: serverTimestamp(),
  }
  // Firestore rejects `undefined` field values — drop any absent optionals.
  for (const key of Object.keys(payload)) {
    if (payload[key] === undefined) delete payload[key]
  }
  await setDoc(
    doc(getFirestoreDb(), 'users', uid, 'progress', progress.lessonId),
    payload,
    { merge: true },
  )
}

export interface LessonFinishResult {
  profile: UserProfile
  /** Total XP gained this completion (questions + completion bonus). */
  xpGained: number
  /** XP from questions answered correctly first try with no help. */
  questionXp: number
  /** One-time lesson completion bonus included in xpGained. */
  completionBonus: number
  /** Total XP before this completion (for animating the level bar). */
  previousTotalXp: number
  streakUpdated: boolean
  previousStreak: number
  previousLevel: number
  newLevel: number
  /** Streak savers earned by leveling up during this completion. */
  streakSaversGained: number
}

/**
 * Award XP and streak on first full lesson completion. `questionXp` is the XP
 * the learner earned live from first-try-correct answers (content + check);
 * a completion bonus is added on top, and each level gained grants a streak
 * saver.
 */
export async function finishLessonWithRewards(
  uid: string,
  lessonId: string,
  questionXp: number,
  outcome?: 'mastery' | 'support',
): Promise<LessonFinishResult> {
  const ref = doc(getFirestoreDb(), 'users', uid)
  const snap = await getDoc(ref)
  const displayName = snap.exists()
    ? (snap.data().displayName as string) ?? 'Learner'
    : 'Learner'

  const current = snap.exists()
    ? normalizeProfile(snap.data() as Partial<UserProfile>, displayName)
    : normalizeProfile({}, displayName)

  const wasAlreadyDone = current.lessonsCompleted.includes(lessonId)
  const previousStreak = current.streak
  const previousTotalXp = current.totalXp
  const previousLevel = levelForXp(previousTotalXp).level

  let profile = current
  let xpGained = 0
  let completionBonus = 0
  let streakSaversGained = 0
  let newLevel = previousLevel

  if (!wasAlreadyDone) {
    completionBonus = XP_LESSON_COMPLETE_BONUS
    xpGained = Math.max(0, questionXp) + completionBonus
    const xpState = resetWeeklyXpIfNeeded(profile.weeklyXp, profile.xpWeekStart)
    const newTotalXp = profile.totalXp + xpGained
    profile = {
      ...profile,
      weeklyXp: xpState.weeklyXp + xpGained,
      xpWeekStart: xpState.xpWeekStart,
      totalXp: newTotalXp,
      lessonsCompleted: [...profile.lessonsCompleted, lessonId],
    }
    profile = applyLessonCompletion(profile)

    // Every level gained awards one streak saver.
    newLevel = levelForXp(newTotalXp).level
    streakSaversGained = Math.max(0, newLevel - previousLevel)
    if (streakSaversGained > 0) {
      profile = { ...profile, streakCharges: profile.streakCharges + streakSaversGained }
    }
  }

  await setDoc(
    ref,
    {
      ...profile,
      lessonsCompleted: profile.lessonsCompleted,
    },
    { merge: true },
  )

  await saveLessonProgress(uid, {
    lessonId,
    stepIndex: 0,
    stepResults: [],
    completed: true,
    // Preserve a previously-recorded outcome if this completion didn't supply one
    // (e.g. re-finishing an already-complete lesson) so the path stays stable.
    outcome: outcome ?? (wasAlreadyDone ? undefined : 'support'),
    updatedAt: new Date().toISOString(),
  })

  return {
    profile,
    xpGained,
    questionXp: wasAlreadyDone ? 0 : Math.max(0, questionXp),
    completionBonus,
    previousTotalXp,
    streakUpdated: !wasAlreadyDone && profile.streak !== previousStreak,
    previousStreak,
    previousLevel,
    newLevel,
    streakSaversGained,
  }
}

