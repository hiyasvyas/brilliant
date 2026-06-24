import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import type { LessonProgress, LessonStep, UserProfile } from '../types/lesson'
import { getFirestoreDb } from '../lib/firebase'
import { applyLessonCompletion, normalizeProfile } from '../lib/streak'
import {
  calculateFirstCompletionXp,
  resetWeeklyXpIfNeeded,
  XP_LEAVE_PENALTY,
  XP_PERFECT_CHECK_BONUS,
} from '../lib/xp'
import { MAX_STREAK_CHARGES } from '../lib/streak'

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

export async function recordLessonCompletion(uid: string): Promise<UserProfile> {
  const ref = doc(getFirestoreDb(), 'users', uid)
  const snap = await getDoc(ref)
  const displayName = snap.exists()
    ? (snap.data().displayName as string) ?? 'Learner'
    : 'Learner'

  const current = snap.exists()
    ? normalizeProfile(snap.data() as Partial<UserProfile>, displayName)
    : normalizeProfile({}, displayName)

  const updated = applyLessonCompletion(current)
  await setDoc(ref, updated, { merge: true })
  return updated
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
    updatedAt: data.updatedAt ?? new Date().toISOString(),
  }
}

export async function saveLessonProgress(
  uid: string,
  progress: LessonProgress,
): Promise<void> {
  await setDoc(
    doc(getFirestoreDb(), 'users', uid, 'progress', progress.lessonId),
    {
      ...progress,
      updatedAt: new Date().toISOString(),
      serverUpdated: serverTimestamp(),
    },
    { merge: true },
  )
}

export async function markLessonComplete(uid: string, lessonId: string): Promise<UserProfile> {
  const ref = doc(getFirestoreDb(), 'users', uid)
  const snap = await getDoc(ref)
  const displayName = snap.exists()
    ? (snap.data().displayName as string) ?? 'Learner'
    : 'Learner'

  const completed = snap.exists()
    ? [...new Set([...(snap.data().lessonsCompleted ?? []), lessonId])]
    : [lessonId]

  await setDoc(ref, { lessonsCompleted: completed }, { merge: true })

  const wasAlreadyDone = snap.exists() && (snap.data().lessonsCompleted ?? []).includes(lessonId)
  if (wasAlreadyDone) {
    return snap.exists()
      ? normalizeProfile(snap.data() as Partial<UserProfile>, displayName)
      : normalizeProfile({}, displayName)
  }

  return recordLessonCompletion(uid)
}

export interface LessonFinishResult {
  profile: UserProfile
  xpGained: number
  streakUpdated: boolean
  previousStreak: number
  /** True when the learner aced the lesson check and earned a streak saver. */
  streakSaverEarned: boolean
}

/** Award XP and streak on first full lesson completion (content + lesson check). */
export async function finishLessonWithRewards(
  uid: string,
  lessonId: string,
  lessonSteps: LessonStep[],
  checkQuestions: { id: string }[],
  checkResults: { questionId: string; correct: boolean }[],
  opts: { perfectCheck?: boolean } = {},
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

  let profile = current
  let xpGained = 0
  let streakSaverEarned = false

  if (!wasAlreadyDone) {
    xpGained = calculateFirstCompletionXp(lessonSteps, checkQuestions, checkResults)
    if (opts.perfectCheck) xpGained += XP_PERFECT_CHECK_BONUS
    const xpState = resetWeeklyXpIfNeeded(profile.weeklyXp, profile.xpWeekStart)
    profile = {
      ...profile,
      weeklyXp: xpState.weeklyXp + xpGained,
      xpWeekStart: xpState.xpWeekStart,
      totalXp: profile.totalXp + xpGained,
      lessonsCompleted: [...profile.lessonsCompleted, lessonId],
    }
    profile = applyLessonCompletion(profile)

    if (opts.perfectCheck) {
      const boosted = Math.min(MAX_STREAK_CHARGES, profile.streakCharges + 1)
      streakSaverEarned = true
      profile = { ...profile, streakCharges: boosted }
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
    updatedAt: new Date().toISOString(),
  })

  return {
    profile,
    xpGained,
    streakUpdated: !wasAlreadyDone && profile.streak !== previousStreak,
    previousStreak,
    streakSaverEarned,
  }
}

/** Deduct XP when leaving a lesson before finishing. */
export async function applyLeaveLessonPenalty(uid: string): Promise<void> {
  const ref = doc(getFirestoreDb(), 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return

  const displayName = (snap.data().displayName as string) ?? 'Learner'
  const current = normalizeProfile(snap.data() as Partial<UserProfile>, displayName)
  const xpState = resetWeeklyXpIfNeeded(current.weeklyXp, current.xpWeekStart)
  const weeklyXp = Math.max(0, xpState.weeklyXp - XP_LEAVE_PENALTY)

  await setDoc(
    ref,
    {
      weeklyXp,
      xpWeekStart: xpState.xpWeekStart,
    },
    { merge: true },
  )
}
